import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { sanitizeInput } from "@/lib/phiScrubber"
import { logger } from "@/lib/logger"

type FeedbackCategory =
  | "ux"
  | "agents"
  | "billing"
  | "payments"
  | "bug"
  | "feature"
  | "compliance"
  | "other"

type FeedbackRequest = {
  message: string
  category?: FeedbackCategory | string
  rating?: number
  page?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    const body = (await request.json().catch(() => null)) as FeedbackRequest | null

    const rawMessage = typeof body?.message === "string" ? body.message.trim() : ""
    if (!rawMessage || rawMessage.length < 5) {
      return NextResponse.json({ success: false, error: "Message is required." }, { status: 400 })
    }

    if (rawMessage.length > 4000) {
      return NextResponse.json({ success: false, error: "Message is too long." }, { status: 400 })
    }

    const { cleanedText, mapping } = sanitizeInput(rawMessage)
    const phiCount = Object.keys(mapping || {}).length

    const ratingRaw = body?.rating
    const rating =
      typeof ratingRaw === "number" && Number.isFinite(ratingRaw) ? Math.max(1, Math.min(5, ratingRaw)) : undefined

    const category = typeof body?.category === "string" && body.category.trim() ? body.category.trim() : "other"
    const page = typeof body?.page === "string" && body.page.trim() ? body.page.trim() : undefined

    const actorId = (session?.user as any)?.id as string | undefined
    const actorEmail = session?.user?.email || undefined
    const actorRole = (session?.user as any)?.role as string | undefined

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")?.[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined

    const userAgent = request.headers.get("user-agent") || undefined

    await prisma.auditLog.create({
      data: {
        actorId,
        actorEmail,
        actorRole,
        action: "feedback.submitted",
        entityType: "Feedback",
        description: cleanedText,
        metadata: {
          category,
          rating,
          page,
          phiElementsDetected: phiCount,
        },
        ipAddress,
        userAgent,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Feedback submit failed", error)
    return NextResponse.json({ success: false, error: "Failed to submit feedback." }, { status: 500 })
  }
}

