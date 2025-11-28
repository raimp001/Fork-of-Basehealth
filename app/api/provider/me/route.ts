/**
 * Provider "Me" API
 * 
 * Returns the currently logged-in provider
 * TODO: Replace mock auth with proper authentication middleware
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function GET(req: NextRequest) {
  try {
    // TODO: Replace with proper authentication middleware
    // For now, get token from Authorization header
    const authHeader = req.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const secret = process.env.NEXTAUTH_SECRET || "your-secret-key-here-replace-in-production"

    try {
      const decoded = jwt.verify(token, secret) as { providerId: string; email: string }

      // Find provider
      const provider = await prisma.provider.findUnique({
        where: { id: decoded.providerId },
      })

      if (!provider) {
        return NextResponse.json(
          { error: "Provider not found" },
          { status: 404 }
        )
      }

      // Return sanitized provider data
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
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("Provider me error:", error)
    return NextResponse.json(
      { error: "Failed to fetch provider data" },
      { status: 500 }
    )
  }
}

