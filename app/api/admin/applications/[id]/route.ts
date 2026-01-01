/**
 * Admin API - Get single application
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { createAuditLog, AuditActions } from "@/lib/onboarding/audit-service"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        documents: true,
        verifications: {
          orderBy: { checkedAt: "desc" },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    // Log view
    await createAuditLog({
      action: AuditActions.ADMIN_VIEWED_APPLICATION,
      entityType: "Application",
      entityId: id,
      actorRole: "ADMIN",
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    })

    return NextResponse.json({
      success: true,
      application,
    })
  } catch (error) {
    logger.error("Failed to get application", error)
    return NextResponse.json(
      { error: "Failed to get application" },
      { status: 500 }
    )
  }
}
