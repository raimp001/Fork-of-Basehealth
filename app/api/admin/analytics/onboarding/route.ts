/**
 * Onboarding Analytics API
 * 
 * GET /api/admin/analytics/onboarding
 * 
 * Returns step-level conversion metrics for the provider/caregiver onboarding funnel.
 * Tracks: started → step completion → submitted → approved.
 */

import { NextRequest, NextResponse } from "next/server"
import { isDatabaseAvailable } from "@/lib/application-store"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

interface StepMetric {
  step: number
  label: string
  started: number
  completed: number
  dropoffRate: number
}

interface FunnelMetrics {
  role: string
  totalStarted: number
  totalSubmitted: number
  totalApproved: number
  totalRejected: number
  totalPending: number
  overallConversionRate: number
  averageCompletionTimeHours: number | null
  stepMetrics: StepMetric[]
}

const PROVIDER_STEPS = [
  { step: 0, label: "Account & Region" },
  { step: 1, label: "Personal Info" },
  { step: 2, label: "Credentials (NPI/License)" },
  { step: 3, label: "Practice Details" },
  { step: 4, label: "Attestations & Submit" },
]

const CAREGIVER_STEPS = [
  { step: 0, label: "Account & Region" },
  { step: 1, label: "Personal Info" },
  { step: 2, label: "Services & Experience" },
  { step: 3, label: "Attestations & Submit" },
]

function calculateStepMetrics(
  applications: Array<{
    currentStep: number
    stepsCompleted: unknown
    status: string
  }>,
  stepDefinitions: Array<{ step: number; label: string }>,
): StepMetric[] {
  const total = applications.length
  if (total === 0) return stepDefinitions.map((s) => ({ ...s, started: 0, completed: 0, dropoffRate: 0 }))

  return stepDefinitions.map((stepDef) => {
    // "Started" = reached this step
    const started = applications.filter((app) => app.currentStep >= stepDef.step).length
    // "Completed" = completed this step
    const completed = applications.filter((app) => {
      const sc = (app.stepsCompleted as Record<string, boolean>) || {}
      return sc[stepDef.step.toString()] === true
    }).length

    const dropoffRate = started > 0 ? Math.round(((started - completed) / started) * 100) : 0

    return {
      ...stepDef,
      started,
      completed,
      dropoffRate,
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const dbAvailable = await isDatabaseAvailable()
    if (!dbAvailable) {
      return NextResponse.json({
        success: false,
        error: "Database not available for analytics",
      }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const role = (searchParams.get("role") || "all").toUpperCase()
    const days = Math.min(Math.max(parseInt(searchParams.get("days") || "30", 10), 1), 365)
    const since = new Date()
    since.setDate(since.getDate() - days)

    // Fetch applications
    const whereClause: Record<string, unknown> = {
      createdAt: { gte: since },
    }
    if (role === "PROVIDER" || role === "CAREGIVER") {
      whereClause.role = role
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      select: {
        id: true,
        role: true,
        status: true,
        currentStep: true,
        stepsCompleted: true,
        createdAt: true,
        submittedAt: true,
        reviewedAt: true,
      },
    })

    // Split by role
    const providerApps = applications.filter((a) => a.role === "PROVIDER")
    const caregiverApps = applications.filter((a) => a.role === "CAREGIVER")

    // Calculate completion times
    function avgCompletionHours(
      apps: Array<{ createdAt: Date; submittedAt: Date | null }>,
    ): number | null {
      const submitted = apps.filter((a) => a.submittedAt)
      if (submitted.length === 0) return null
      const totalMs = submitted.reduce((sum, a) => {
        return sum + (a.submittedAt!.getTime() - a.createdAt.getTime())
      }, 0)
      return Math.round(totalMs / submitted.length / (1000 * 60 * 60))
    }

    function buildFunnel(
      apps: Array<{
        status: string
        currentStep: number
        stepsCompleted: unknown
        createdAt: Date
        submittedAt: Date | null
      }>,
      roleName: string,
      steps: Array<{ step: number; label: string }>,
    ): FunnelMetrics {
      const totalStarted = apps.length
      const totalSubmitted = apps.filter(
        (a) => !["DRAFT"].includes(a.status),
      ).length
      const totalApproved = apps.filter((a) => a.status === "APPROVED").length
      const totalRejected = apps.filter((a) => a.status === "REJECTED").length
      const totalPending = apps.filter(
        (a) => ["SUBMITTED", "UNDER_REVIEW", "PENDING_INFO"].includes(a.status),
      ).length

      return {
        role: roleName,
        totalStarted,
        totalSubmitted,
        totalApproved,
        totalRejected,
        totalPending,
        overallConversionRate: totalStarted > 0 ? Math.round((totalSubmitted / totalStarted) * 100) : 0,
        averageCompletionTimeHours: avgCompletionHours(apps),
        stepMetrics: calculateStepMetrics(apps, steps),
      }
    }

    const providerFunnel = buildFunnel(providerApps, "PROVIDER", PROVIDER_STEPS)
    const caregiverFunnel = buildFunnel(caregiverApps, "CAREGIVER", CAREGIVER_STEPS)

    // Aggregate
    const totalStarted = applications.length
    const totalSubmitted = applications.filter((a) => a.status !== "DRAFT").length
    const totalApproved = applications.filter((a) => a.status === "APPROVED").length

    // Daily trend (last 7 days)
    const dailyTrend = Array.from({ length: Math.min(days, 7) }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStr = date.toISOString().slice(0, 10)
      const dayApps = applications.filter(
        (a) => a.createdAt.toISOString().slice(0, 10) === dayStr,
      )
      return {
        date: dayStr,
        started: dayApps.length,
        submitted: dayApps.filter((a) => a.status !== "DRAFT").length,
      }
    }).reverse()

    return NextResponse.json({
      success: true,
      period: { days, since: since.toISOString() },
      aggregate: {
        totalStarted,
        totalSubmitted,
        totalApproved,
        overallConversionRate: totalStarted > 0 ? Math.round((totalSubmitted / totalStarted) * 100) : 0,
        approvalRate: totalSubmitted > 0 ? Math.round((totalApproved / totalSubmitted) * 100) : 0,
      },
      providerFunnel,
      caregiverFunnel,
      dailyTrend,
    })
  } catch (error) {
    logger.error("Failed to compute onboarding analytics", error)
    return NextResponse.json(
      { success: false, error: "Failed to compute analytics" },
      { status: 500 },
    )
  }
}
