/**
 * Admin API - Get all caregivers for review
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function GET(req: NextRequest) {
  try {
    // Get query params for filtering
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") // PENDING, AVAILABLE, etc.

    // Build where clause
    const where: any = {
      isMock: false // Only real caregivers
    }
    
    if (status) {
      where.status = status
    }

    // Fetch caregivers from database
    const caregivers = await prisma.caregiver.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        licenseNumber: true,
        licenseType: true,
        specialties: true,
        yearsExperience: true,
        education: true,
        certifications: true,
        location: true,
        serviceAreas: true,
        languagesSpoken: true,
        hourlyRate: true,
        status: true,
        verified: true,
        isLicensed: true,
        isCPRCertified: true,
        isBackgroundChecked: true,
        rating: true,
        reviewCount: true,
        bio: true,
        applicationStatus: true,
        submittedAt: true,
        reviewedAt: true,
        reviewedBy: true,
        reviewNotes: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Get stats
    const stats = await prisma.caregiver.groupBy({
      by: ["status"],
      where: { isMock: false },
      _count: true
    })

    const totalCaregivers = caregivers.length
    const pendingCount = stats.find(s => s.status === "PENDING")?._count || 0
    const availableCount = stats.find(s => s.status === "AVAILABLE")?._count || 0

    return NextResponse.json({
      success: true,
      caregivers,
      stats: {
        total: totalCaregivers,
        pending: pendingCount,
        available: availableCount
      }
    })
  } catch (error) {
    logger.error("Error fetching caregivers for admin", error)
    return NextResponse.json(
      { error: "Failed to fetch caregivers" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { caregiverId, action, notes } = await req.json()

    if (!caregiverId || !action) {
      return NextResponse.json(
        { error: "Caregiver ID and action are required" },
        { status: 400 }
      )
    }

    let updateData: any = {
      reviewedAt: new Date(),
      reviewedBy: "Admin", // In real app, get from auth context
      reviewNotes: notes || null
    }

    switch (action) {
      case "approve":
        updateData.status = "AVAILABLE"
        updateData.verified = true
        updateData.applicationStatus = "approved"
        break
      case "reject":
        updateData.status = "INACTIVE"
        updateData.verified = false
        updateData.applicationStatus = "rejected"
        break
      case "request_info":
        updateData.applicationStatus = "requires_info"
        break
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }

    const updatedCaregiver = await prisma.caregiver.update({
      where: { id: caregiverId },
      data: updateData
    })

    logger.info("Caregiver updated by admin", {
      caregiverId,
      action,
      status: updatedCaregiver.status
    })

    return NextResponse.json({
      success: true,
      caregiver: updatedCaregiver,
      message: action === "approve" 
        ? "Caregiver approved successfully" 
        : action === "reject"
        ? "Caregiver rejected"
        : "Additional information requested"
    })
  } catch (error) {
    logger.error("Error updating caregiver", error)
    return NextResponse.json(
      { error: "Failed to update caregiver" },
      { status: 500 }
    )
  }
}
