/**
 * Provider Registration API
 * 
 * Handles registration for both physicians and health apps/clinics
 * Similar to "Uber driver" signup - simple and straightforward
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

interface ProviderRegistrationData {
  type: "PHYSICIAN" | "APP"
  // For physicians
  fullName?: string
  // For apps
  organizationName?: string
  email: string
  password: string
  phone?: string
  npi?: string // For physicians only
  licenseState?: string
  specialties?: string[]
  bio?: string
}

export async function POST(req: NextRequest) {
  try {
    const data: ProviderRegistrationData = await req.json()

    // Validate required fields
    if (!data.email || !data.password || !data.type) {
      return NextResponse.json(
        { error: "Email, password, and type are required" },
        { status: 400 }
      )
    }

    // Validate type-specific fields
    if (data.type === "PHYSICIAN" && !data.fullName) {
      return NextResponse.json(
        { error: "Full name is required for physicians" },
        { status: 400 }
      )
    }

    if (data.type === "APP" && !data.organizationName) {
      return NextResponse.json(
        { error: "Organization name is required for health apps" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingProvider = await prisma.provider.findUnique({
      where: { email: data.email },
    })

    if (existingProvider) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10)

    // Create provider
    const provider = await prisma.provider.create({
      data: {
        type: data.type,
        fullName: data.fullName || null,
        organizationName: data.organizationName || null,
        email: data.email,
        passwordHash,
        phone: data.phone || null,
        npiNumber: data.npi || null,
        licenseState: data.licenseState || null,
        specialties: data.specialties || [],
        bio: data.bio || null,
        isVerified: false, // Requires admin approval
        acceptingPatients: true,
      },
    })

    // Return sanitized provider data (no password)
    return NextResponse.json({
      success: true,
      provider: {
        id: provider.id,
        type: provider.type,
        fullName: provider.fullName,
        organizationName: provider.organizationName,
        email: provider.email,
        phone: provider.phone,
        specialties: provider.specialties,
        isVerified: provider.isVerified,
        createdAt: provider.createdAt,
      },
      message: "Registration successful. Your account is pending verification.",
    })
  } catch (error) {
    console.error("Provider registration error:", error)
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    )
  }
}

