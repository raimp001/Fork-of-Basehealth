/**
 * Provider "Me" API
 * 
 * Returns the currently logged-in provider
 * TODO: Replace mock auth with proper authentication middleware
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { logger } from "@/lib/logger"

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
    const secret = process.env.NEXTAUTH_SECRET
    
    if (!secret || secret === "your-secret-key-here-replace-in-production") {
      logger.error('NEXTAUTH_SECRET not properly configured')
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    try {
      const decoded = jwt.verify(token, secret) as { providerId: string; email: string; type?: string }
      
      // Verify token type
      if (decoded.type !== 'provider') {
        logger.warn('Invalid token type for provider endpoint', { type: decoded.type })
        return NextResponse.json(
          { error: "Invalid token type" },
          { status: 401 }
        )
      }

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

      logger.info('Provider data fetched', { providerId: provider.id })

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
    } catch (jwtError) {
      logger.warn('Invalid or expired JWT token', { error: jwtError })
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }
  } catch (error) {
    logger.error("Provider me error", error)
    return NextResponse.json(
      { error: "Failed to fetch provider data" },
      { status: 500 }
    )
  }
}

