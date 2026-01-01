/**
 * Admin API - List all applications
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { ApplicationStatus, ApplicationRole } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") as ApplicationStatus | null
    const role = searchParams.get("role") as ApplicationRole | null
    const search = searchParams.get("search")

    // Build where clause
    const where: any = {
      status: { not: "DRAFT" }, // Don't show incomplete drafts
    }

    if (status) {
      where.status = status
    }

    if (role) {
      where.role = role
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { npiNumber: { contains: search } },
      ]
    }

    // Fetch applications
    const applications = await prisma.application.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      include: {
        verifications: {
          orderBy: { checkedAt: "desc" },
          take: 3, // Just latest verifications
        },
        _count: {
          select: { documents: true },
        },
      },
    })

    // Get stats
    const stats = await prisma.application.groupBy({
      by: ["status"],
      where: { status: { not: "DRAFT" } },
      _count: true,
    })

    const statsMap: Record<string, number> = {}
    stats.forEach((s) => {
      statsMap[s.status] = s._count
    })

    return NextResponse.json({
      success: true,
      applications,
      stats: {
        total: applications.length,
        submitted: statsMap["SUBMITTED"] || 0,
        underReview: statsMap["UNDER_REVIEW"] || 0,
        approved: statsMap["APPROVED"] || 0,
        rejected: statsMap["REJECTED"] || 0,
        pendingInfo: statsMap["PENDING_INFO"] || 0,
      },
    })
  } catch (error) {
    logger.error("Failed to list applications", error)
    return NextResponse.json(
      { error: "Failed to list applications" },
      { status: 500 }
    )
  }
}
