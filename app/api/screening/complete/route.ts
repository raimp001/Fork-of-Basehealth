/**
 * Screening Completion API
 * 
 * POST /api/screening/complete — Mark a screening as completed
 * GET  /api/screening/complete — Get all completed screenings for user
 * 
 * This is the core of the preventive loop:
 * Recommendation → Book → Complete → Recalculate next due → Remind
 */

import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { isDatabaseAvailable } from "@/lib/application-store"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { logger } from "@/lib/logger"

const SCREENING_COMPLETED_ACTION = "screening.completed"
const SCREENING_RESULT_ACTION = "screening.result_recorded"

interface CompletionRequest {
  screeningId: string
  screeningName: string
  completedDate: string // ISO date
  providerId?: string
  providerName?: string
  result?: "normal" | "abnormal" | "inconclusive" | "pending"
  resultNotes?: string
  followUpNeeded?: boolean
  followUpDate?: string
  nextDueDate?: string // Computed or overridden by clinician
}

// Frequency string → interval in months
function frequencyToMonths(frequency: string): number {
  const f = (frequency || "").toLowerCase()
  if (f.includes("every 10 years")) return 120
  if (f.includes("every 5 years")) return 60
  if (f.includes("every 3 years")) return 36
  if (f.includes("every 2 years") || f.includes("biennial")) return 24
  if (f.includes("annual")) return 12
  if (f.includes("every 6 months")) return 6
  if (f.includes("once") || f.includes("one-time")) return 0 // no recurrence
  return 12 // default annual
}

// Calculate next due date from completion, considering results
function calculateNextDue(
  completedDate: string,
  frequency: string,
  result?: string,
  followUpDate?: string,
): string | null {
  // If abnormal result with follow-up, use that date
  if (result === "abnormal" && followUpDate) {
    return followUpDate
  }

  const intervalMonths = frequencyToMonths(frequency)
  if (intervalMonths === 0) return null // one-time screening

  const completed = new Date(completedDate)
  if (isNaN(completed.getTime())) return null

  // Abnormal results often shorten the interval
  const adjustedMonths = result === "abnormal"
    ? Math.max(Math.floor(intervalMonths / 2), 6) // halve interval, min 6 months
    : intervalMonths

  const nextDue = new Date(completed)
  nextDue.setMonth(nextDue.getMonth() + adjustedMonths)
  return nextDue.toISOString()
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      )
    }

    const body: CompletionRequest = await request.json()
    const {
      screeningId,
      screeningName,
      completedDate,
      providerId,
      providerName,
      result,
      resultNotes,
      followUpNeeded,
      followUpDate,
    } = body

    if (!screeningId || !screeningName || !completedDate) {
      return NextResponse.json(
        { success: false, error: "screeningId, screeningName, and completedDate are required" },
        { status: 400 },
      )
    }

    // Get frequency from guideline to calculate next due
    const guidelineRes = await fetch(
      `${request.nextUrl.origin}/api/screening/recommendations?age=50&gender=all`,
    ).catch(() => null)
    let frequency = "Annually"
    if (guidelineRes?.ok) {
      const guidelineData = await guidelineRes.json()
      const guideline = guidelineData.recommendations?.find(
        (r: { id: string }) => r.id === screeningId,
      )
      if (guideline) frequency = guideline.frequency
    }

    const nextDueDate = calculateNextDue(completedDate, frequency, result, followUpDate)

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable) {
      // Store completion event
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email || undefined,
          actorRole: user.role?.toUpperCase() || "PATIENT",
          action: SCREENING_COMPLETED_ACTION,
          entityType: "Screening",
          entityId: screeningId,
          description: `Completed screening: ${screeningName}`,
          metadata: {
            screeningId,
            screeningName,
            completedDate,
            providerId,
            providerName,
            result: result || "pending",
            resultNotes,
            followUpNeeded: followUpNeeded || false,
            followUpDate,
            nextDueDate,
            frequency,
          } as Prisma.InputJsonValue,
          ipAddress: request.headers.get("x-forwarded-for") || undefined,
          userAgent: request.headers.get("user-agent") || undefined,
        },
      })

      // If there's a result, store it separately for audit trail
      if (result && result !== "pending") {
        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            actorEmail: user.email || undefined,
            actorRole: user.role?.toUpperCase() || "PATIENT",
            action: SCREENING_RESULT_ACTION,
            entityType: "ScreeningResult",
            entityId: screeningId,
            description: `Result recorded for ${screeningName}: ${result}`,
            metadata: {
              screeningId,
              screeningName,
              result,
              resultNotes,
              followUpNeeded,
              followUpDate,
              nextDueDate,
            } as Prisma.InputJsonValue,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      completion: {
        screeningId,
        screeningName,
        completedDate,
        result: result || "pending",
        nextDueDate,
        followUpNeeded: followUpNeeded || false,
      },
      message: nextDueDate
        ? `Screening completed. Next due: ${new Date(nextDueDate).toLocaleDateString()}`
        : "Screening completed (one-time).",
    })
  } catch (error) {
    logger.error("Failed to record screening completion", error)
    return NextResponse.json(
      { success: false, error: "Failed to record completion" },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      )
    }

    const dbAvailable = await isDatabaseAvailable()
    if (!dbAvailable) {
      return NextResponse.json({
        success: true,
        completions: [],
        note: "Database not available. Completions are stored locally.",
      })
    }

    const completions = await prisma.auditLog.findMany({
      where: {
        actorId: user.id,
        action: SCREENING_COMPLETED_ACTION,
        entityType: "Screening",
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const parsed = completions.map((log) => {
      const meta = (log.metadata as Record<string, unknown>) || {}
      return {
        id: log.id,
        screeningId: meta.screeningId,
        screeningName: meta.screeningName,
        completedDate: meta.completedDate,
        result: meta.result || "pending",
        resultNotes: meta.resultNotes,
        nextDueDate: meta.nextDueDate,
        followUpNeeded: meta.followUpNeeded || false,
        followUpDate: meta.followUpDate,
        providerName: meta.providerName,
        recordedAt: log.createdAt.toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      completions: parsed,
      count: parsed.length,
    })
  } catch (error) {
    logger.error("Failed to load screening completions", error)
    return NextResponse.json(
      { success: false, error: "Failed to load completions" },
      { status: 500 },
    )
  }
}
