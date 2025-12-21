/**
 * Provider Registration API
 * 
 * Handles registration for both physicians and health apps/clinics
 * Similar to "Uber driver" signup - simple and straightforward
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { logger } from "@/lib/logger"
import { rateLimit, getClientIdentifier } from "@/lib/rate-limiter"
import { sanitizeText, validateEmail, validateNPI } from "@/lib/sanitize"

interface ProviderRegistrationData {
  type: "PHYSICIAN" | "APP"
  // For physicians
  fullName?: string
  // For apps
  organizationName?: string
  email: string
  password: string
  phone?: string
  npi?: string // For physicians only - REQUIRED
  licenseNumber?: string // For physicians only - REQUIRED (State Medical Board Number)
  licenseState?: string // For physicians only - REQUIRED
  specialties?: string[]
  bio?: string
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(req)
    const rateLimitResult = rateLimit(`provider-register:${clientId}`, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3, // 3 registrations per hour
    })

    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded for provider registration', { clientId })
      return NextResponse.json(
        { 
          error: "Too many registration attempts. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const data: ProviderRegistrationData = await req.json()

    // Sanitize inputs
    const email = sanitizeText(data.email?.trim() || '')
    const password = data.password || ''
    const type = data.type

    // Validate required fields
    if (!email || !password || !type) {
      return NextResponse.json(
        { error: "Email, password, and type are required" },
        { status: 400 }
      )
    }

    // Validate type-specific fields and sanitize
    let npi: string | undefined
    let licenseNumber: string | undefined
    let licenseState: string | undefined
    
    if (data.type === "PHYSICIAN") {
      if (!data.fullName) {
        return NextResponse.json(
          { error: "Full name is required for physicians" },
          { status: 400 }
        )
      }
      
      if (!data.npi || data.npi.trim() === "") {
        return NextResponse.json(
          { error: "NPI number is required for physicians" },
          { status: 400 }
        )
      }
      
      // Sanitize and validate NPI
      npi = sanitizeText(data.npi)
      if (!validateNPI(npi)) {
        return NextResponse.json(
          { error: "NPI number must be exactly 10 digits" },
          { status: 400 }
        )
      }
      
      if (!data.licenseNumber || data.licenseNumber.trim() === "") {
        return NextResponse.json(
          { error: "State medical board number (license number) is required for physicians" },
          { status: 400 }
        )
      }
      
      licenseNumber = sanitizeText(data.licenseNumber)
      
      if (!data.licenseState || data.licenseState.trim() === "") {
        return NextResponse.json(
          { error: "License state is required for physicians" },
          { status: 400 }
        )
      }
      
      // Validate license state format (2 letters)
      const licenseStateRaw = sanitizeText(data.licenseState.toUpperCase())
      if (!/^[A-Z]{2}$/.test(licenseStateRaw)) {
        return NextResponse.json(
          { error: "License state must be a 2-letter state code (e.g., CA, NY, TX)" },
          { status: 400 }
        )
      }
      
      licenseState = licenseStateRaw
    }

    if (data.type === "APP" && !data.organizationName) {
      return NextResponse.json(
        { error: "Organization name is required for health apps" },
        { status: 400 }
      )
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingProvider = await prisma.provider.findUnique({
      where: { email },
    })

    if (existingProvider) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // For physicians, check if NPI already exists
    if (data.type === "PHYSICIAN" && npi) {
      const existingNPI = await prisma.provider.findUnique({
        where: { npiNumber: npi },
      })

      if (existingNPI) {
        logger.warn('Duplicate NPI registration attempt', { npi, email })
        return NextResponse.json(
          { error: "NPI number already registered" },
          { status: 409 }
        )
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10)

    // Create provider
    const provider = await prisma.provider.create({
      data: {
        type: data.type,
        fullName: data.fullName ? sanitizeText(data.fullName) : null,
        organizationName: data.organizationName ? sanitizeText(data.organizationName) : null,
        email,
        passwordHash,
        phone: data.phone ? sanitizeText(data.phone) : null,
        npiNumber: npi || null,
        licenseNumber: licenseNumber || null,
        licenseState: licenseState || null,
        specialties: (data.specialties || []).map(s => sanitizeText(s)),
        bio: data.bio ? sanitizeText(data.bio) : null,
        isVerified: false, // Requires admin approval
        acceptingPatients: true,
      },
    })

    logger.info('Provider registered successfully', { 
      providerId: provider.id, 
      type: provider.type,
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
    logger.error("Provider registration error", error)
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    )
  }
}

