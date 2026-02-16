/**
 * Referral Redemption API
 * 
 * POST /api/referrals/redeem — Record a referral code use
 */

import { NextRequest, NextResponse } from "next/server"
import { isDatabaseAvailable } from "@/lib/application-store"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { logger } from "@/lib/logger"

interface RedeemRequest {
  code: string
  redeemerEmail?: string
  redeemerType: "patient" | "provider" | "caregiver"
  applicationId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RedeemRequest = await request.json()
    const { code, redeemerEmail, redeemerType, applicationId } = body

    if (!code || !redeemerType) {
      return NextResponse.json(
        { success: false, error: "Code and redeemerType required" },
        { status: 400 },
      )
    }

    const dbAvailable = await isDatabaseAvailable()
    if (!dbAvailable) {
      return NextResponse.json({
        success: true,
        message: "Referral noted (database not available for tracking)",
      })
    }

    // Look up the referral
    const referralLog = await prisma.auditLog.findFirst({
      where: {
        action: "referral.created",
        entityType: "Referral",
        entityId: code.toUpperCase(),
      },
    })

    if (!referralLog) {
      return NextResponse.json(
        { success: false, error: "Invalid referral code" },
        { status: 404 },
      )
    }

    const meta = (referralLog.metadata as Record<string, unknown>) || {}
    const expiresAt = meta.expiresAt ? new Date(meta.expiresAt as string) : null
    if (expiresAt && expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "Referral code has expired" },
        { status: 410 },
      )
    }

    // Check max uses
    const currentUses = await prisma.auditLog.count({
      where: {
        action: "referral.redeemed",
        entityId: code.toUpperCase(),
      },
    })
    if (currentUses >= (meta.maxUses as number || 100)) {
      return NextResponse.json(
        { success: false, error: "Referral code has reached its usage limit" },
        { status: 410 },
      )
    }

    // Record redemption
    await prisma.auditLog.create({
      data: {
        actorEmail: redeemerEmail || undefined,
        action: "referral.redeemed",
        entityType: "Referral",
        entityId: code.toUpperCase(),
        description: `Referral ${code} redeemed by ${redeemerType}`,
        metadata: {
          code,
          redeemerEmail,
          redeemerType,
          applicationId,
          referrerName: meta.referrerName,
          referrerId: meta.referrerId,
          campaignName: meta.campaignName,
          type: meta.type,
        } as Prisma.InputJsonValue,
        ipAddress: request.headers.get("x-forwarded-for") || undefined,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Referral code applied successfully",
      referral: {
        code,
        type: meta.type,
        referrerName: meta.referrerName,
        campaignName: meta.campaignName,
      },
    })
  } catch (error) {
    logger.error("Failed to redeem referral", error)
    return NextResponse.json(
      { success: false, error: "Failed to redeem referral code" },
      { status: 500 },
    )
  }
}
