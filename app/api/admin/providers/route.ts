/**
 * Admin API - Get all providers for review
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function GET(req: NextRequest) {
  try {
    // Get query params for filtering
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") // pending, verified, all
    const type = searchParams.get("type") // PHYSICIAN, APP

    // Build where clause
    const where: any = {}
    
    if (status === "pending") {
      where.isVerified = false
    } else if (status === "verified") {
      where.isVerified = true
    }
    
    if (type) {
      where.type = type
    }

    // Fetch providers from database
    const providers = await prisma.provider.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        type: true,
        fullName: true,
        organizationName: true,
        email: true,
        phone: true,
        npiNumber: true,
        licenseNumber: true,
        licenseState: true,
        specialties: true,
        bio: true,
        isVerified: true,
        acceptingPatients: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Get stats
    const stats = await prisma.provider.groupBy({
      by: ["isVerified"],
      _count: true
    })

    const totalProviders = providers.length
    const pendingCount = stats.find(s => s.isVerified === false)?._count || 0
    const verifiedCount = stats.find(s => s.isVerified === true)?._count || 0

    return NextResponse.json({
      success: true,
      providers,
      stats: {
        total: totalProviders,
        pending: pendingCount,
        verified: verifiedCount
      }
    })
  } catch (error) {
    logger.error("Error fetching providers for admin", error)
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { providerId, action, notes } = await req.json()

    if (!providerId || !action) {
      return NextResponse.json(
        { error: "Provider ID and action are required" },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case "approve":
        updateData.isVerified = true
        break
      case "reject":
        updateData.isVerified = false
        // Could add a "rejected" status field if needed
        break
      case "toggle_accepting":
        const provider = await prisma.provider.findUnique({
          where: { id: providerId }
        })
        updateData.acceptingPatients = !provider?.acceptingPatients
        break
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }

    const updatedProvider = await prisma.provider.update({
      where: { id: providerId },
      data: updateData
    })

    logger.info("Provider updated by admin", {
      providerId,
      action,
      isVerified: updatedProvider.isVerified
    })

    return NextResponse.json({
      success: true,
      provider: updatedProvider,
      message: action === "approve" 
        ? "Provider approved successfully" 
        : action === "reject"
        ? "Provider rejected"
        : "Provider updated"
    })
  } catch (error) {
    logger.error("Error updating provider", error)
    return NextResponse.json(
      { error: "Failed to update provider" },
      { status: 500 }
    )
  }
}
