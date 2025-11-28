/**
 * Provider Login API
 * 
 * Simple login endpoint returning basic token
 * TODO: Replace with proper JWT/session management for production
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

interface LoginData {
  email: string
  password: string
}

export async function POST(req: NextRequest) {
  try {
    const data: LoginData = await req.json()

    if (!data.email || !data.password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find provider by email
    const provider = await prisma.provider.findUnique({
      where: { email: data.email },
    })

    if (!provider || !provider.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(data.password, provider.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // TODO: Replace with proper JWT/session management
    // For now, create a simple token (NOT production-ready)
    const secret = process.env.NEXTAUTH_SECRET || "your-secret-key-here-replace-in-production"
    const token = jwt.sign(
      { providerId: provider.id, email: provider.email },
      secret,
      { expiresIn: "7d" }
    )

    // Return sanitized provider data
    return NextResponse.json({
      success: true,
      token,
      provider: {
        id: provider.id,
        type: provider.type,
        fullName: provider.fullName,
        organizationName: provider.organizationName,
        email: provider.email,
        phone: provider.phone,
        specialties: provider.specialties,
        isVerified: provider.isVerified,
      },
    })
  } catch (error) {
    console.error("Provider login error:", error)
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    )
  }
}

