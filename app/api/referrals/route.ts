/**
 * Referral Code API
 * 
 * POST /api/referrals — Generate a referral code
 * GET  /api/referrals — Look up a referral code
 * 
 * Supports provider referral codes, patient invite codes, and partner campaigns.
 */

import { NextRequest, NextResponse } from "next/server"
import { isDatabaseAvailable } from "@/lib/application-store"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { logger } from "@/lib/logger"

function generateCode(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${prefix}-${code}`
}

interface CreateReferralRequest {
  type: "provider" | "patient" | "partner" | "campaign"
  referrerId?: string // User ID or email
  referrerName?: string
  campaignName?: string
  maxUses?: number
  expiresInDays?: number
  metadata?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateReferralRequest = await request.json()
    const {
      type,
      referrerId,
      referrerName,
      campaignName,
      maxUses = 100,
      expiresInDays = 90,
      metadata = {},
    } = body

    if (!type) {
      return NextResponse.json(
        { success: false, error: "Referral type is required" },
        { status: 400 },
      )
    }

    const prefixMap = {
      provider: "PRV",
      patient: "PAT",
      partner: "PTR",
      campaign: "CMP",
    }

    const code = generateCode(prefixMap[type] || "REF")
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    const referralData = {
      code,
      type,
      referrerId,
      referrerName,
      campaignName: campaignName || undefined,
      maxUses,
      currentUses: 0,
      expiresAt: expiresAt.toISOString(),
      isActive: true,
      metadata,
      createdAt: new Date().toISOString(),
    }

    const dbAvailable = await isDatabaseAvailable()
    if (dbAvailable) {
      await prisma.auditLog.create({
        data: {
          actorId: referrerId || undefined,
          actorEmail: referrerName || undefined,
          action: "referral.created",
          entityType: "Referral",
          entityId: code,
          description: `Created ${type} referral code: ${code}`,
          metadata: referralData as Prisma.InputJsonValue,
        },
      })
    }

    return NextResponse.json({
      success: true,
      referral: {
        code,
        type,
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://basehealth.xyz"}/join?ref=${code}`,
        expiresAt: expiresAt.toISOString(),
        maxUses,
      },
    })
  } catch (error) {
    logger.error("Failed to create referral", error)
    return NextResponse.json(
      { success: false, error: "Failed to create referral code" },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const referrerId = searchParams.get("referrerId")

    const dbAvailable = await isDatabaseAvailable()
    if (!dbAvailable) {
      return NextResponse.json({
        success: true,
        referrals: [],
        note: "Database not available",
      })
    }

    if (code) {
      // Look up a specific referral code
      const log = await prisma.auditLog.findFirst({
        where: {
          action: "referral.created",
          entityType: "Referral",
          entityId: code,
        },
      })

      if (!log) {
        return NextResponse.json(
          { success: false, error: "Referral code not found" },
          { status: 404 },
        )
      }

      const meta = (log.metadata as Record<string, unknown>) || {}
      const isExpired = meta.expiresAt ? new Date(meta.expiresAt as string) < new Date() : false
      const isMaxed = (meta.currentUses as number) >= (meta.maxUses as number)

      return NextResponse.json({
        success: true,
        referral: {
          code: meta.code,
          type: meta.type,
          referrerName: meta.referrerName,
          campaignName: meta.campaignName,
          isValid: !isExpired && !isMaxed && meta.isActive,
          isExpired,
          isMaxed,
          currentUses: meta.currentUses,
          maxUses: meta.maxUses,
          expiresAt: meta.expiresAt,
        },
      })
    }

    if (referrerId) {
      // Get all referrals for a user
      const logs = await prisma.auditLog.findMany({
        where: {
          actorId: referrerId,
          action: "referral.created",
          entityType: "Referral",
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      })

      // Count redemptions for each
      const referrals = await Promise.all(
        logs.map(async (log) => {
          const meta = (log.metadata as Record<string, unknown>) || {}
          const redemptions = await prisma.auditLog.count({
            where: {
              action: "referral.redeemed",
              entityId: meta.code as string,
            },
          })
          return {
            code: meta.code,
            type: meta.type,
            campaignName: meta.campaignName,
            currentUses: redemptions,
            maxUses: meta.maxUses,
            expiresAt: meta.expiresAt,
            createdAt: log.createdAt.toISOString(),
          }
        }),
      )

      return NextResponse.json({
        success: true,
        referrals,
        count: referrals.length,
      })
    }

    return NextResponse.json(
      { success: false, error: "Provide 'code' or 'referrerId' parameter" },
      { status: 400 },
    )
  } catch (error) {
    logger.error("Failed to look up referral", error)
    return NextResponse.json(
      { success: false, error: "Failed to look up referral" },
      { status: 500 },
    )
  }
}
