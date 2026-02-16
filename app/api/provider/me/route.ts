import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const authUser = await getCurrentUser(req)

    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (authUser.role !== "provider" && authUser.role !== "admin") {
      return NextResponse.json({ error: "Provider access required" }, { status: 403 })
    }

    const providerSelect = {
      id: true,
      userId: true,
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
      location: true,
      isVerified: true,
      acceptingPatients: true,
      rating: true,
      reviewCount: true,
      createdAt: true,
      updatedAt: true,
    } as const

    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        provider: { select: providerSelect },
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let provider = dbUser.provider

    // Backward compatibility: some legacy provider records were created without userId linkage.
    if (!provider && dbUser.email) {
      provider = await prisma.provider.findUnique({
        where: { email: dbUser.email },
        select: providerSelect,
      })

      if (provider && !provider.userId) {
        provider = await prisma.provider.update({
          where: { id: provider.id },
          data: { userId: dbUser.id },
          select: providerSelect,
        })
      }
    }

    if (!provider) {
      return NextResponse.json(
        {
          error: "Provider profile not found. Complete provider onboarding or contact support for account linking.",
        },
        { status: 404 },
      )
    }

    logger.info("Provider data fetched", { providerId: provider.id, userId: dbUser.id })

    return NextResponse.json({
      success: true,
      provider: {
        id: provider.id,
        type: provider.type,
        fullName: provider.fullName,
        organizationName: provider.organizationName,
        email: provider.email,
        phone: provider.phone,
        npiNumber: provider.npiNumber,
        licenseNumber: provider.licenseNumber,
        licenseState: provider.licenseState,
        specialties: provider.specialties,
        bio: provider.bio,
        location: provider.location,
        isVerified: provider.isVerified,
        acceptingPatients: provider.acceptingPatients,
        rating: provider.rating,
        reviewCount: provider.reviewCount,
        createdAt: provider.createdAt,
        updatedAt: provider.updatedAt,
      },
    })
  } catch (error) {
    logger.error("Provider me error", error)
    return NextResponse.json({ error: "Failed to fetch provider data" }, { status: 500 })
  }
}
