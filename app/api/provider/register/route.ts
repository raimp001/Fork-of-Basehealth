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

    // Validate request body exists
    if (!data) {
      return NextResponse.json(
        { error: "Request body is required", errorCode: "MISSING_BODY" },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const email = sanitizeText(data.email?.trim() || '')
    const password = data.password || ''
    const type = data.type

    // Validate required fields
    if (!email || !password || !type) {
      return NextResponse.json(
        { 
          error: "Email, password, and type are required",
          errorCode: "MISSING_REQUIRED_FIELDS",
          missingFields: [
            !email && "email",
            !password && "password",
            !type && "type"
          ].filter(Boolean)
        },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long", errorCode: "PASSWORD_TOO_SHORT" },
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
      
      // NPI is MANDATORY for physicians - cannot be empty or null
      if (!data.npi || typeof data.npi !== 'string' || data.npi.trim() === "") {
        return NextResponse.json(
          { error: "NPI number is required for physicians and cannot be empty" },
          { status: 400 }
        )
      }
      
      // Sanitize and validate NPI - remove any non-digits
      const npiClean = data.npi.replace(/\D/g, '')
      if (npiClean.length !== 10) {
        return NextResponse.json(
          { error: "NPI number must be exactly 10 digits" },
          { status: 400 }
        )
      }
      
      npi = sanitizeText(npiClean)
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
      
      // License state is MANDATORY for physicians - cannot be empty or null
      if (!data.licenseState || typeof data.licenseState !== 'string' || data.licenseState.trim() === "") {
        return NextResponse.json(
          { error: "License state is required for physicians and cannot be empty" },
          { status: 400 }
        )
      }
      
      // Validate license state format (exactly 2 uppercase letters)
      const licenseStateClean = data.licenseState.toUpperCase().trim().replace(/[^A-Z]/g, '')
      if (licenseStateClean.length !== 2) {
        return NextResponse.json(
          { error: "License state must be exactly 2 letters" },
          { status: 400 }
        )
      }
      
      if (!/^[A-Z]{2}$/.test(licenseStateClean)) {
        return NextResponse.json(
          { error: "License state must be a 2-letter state code (e.g., CA, NY, TX)" },
          { status: 400 }
        )
      }
      
      licenseState = sanitizeText(licenseStateClean)
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

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      logger.error('DATABASE_URL environment variable is not set')
      return NextResponse.json(
        { 
          error: "Database not configured. Please add DATABASE_URL to Vercel environment variables.",
          errorCode: "NO_DATABASE_URL",
          hint: "Go to Vercel Dashboard → Settings → Environment Variables → Add DATABASE_URL",
        },
        { status: 500 }
      )
    }

    // Check database connection
    try {
      await prisma.$connect()
    } catch (dbError) {
      logger.error('Database connection failed', dbError)
      const dbErrorMsg = dbError instanceof Error ? dbError.message : String(dbError)
      return NextResponse.json(
        { 
          error: "Database connection failed. Check DATABASE_URL format and database server status.",
          errorCode: "DATABASE_CONNECTION_ERROR",
          hint: "DATABASE_URL format: postgresql://user:password@host:port/database",
          details: dbErrorMsg
        },
        { status: 500 }
      )
    }

    // Check if email already exists
    let existingProvider
    try {
      existingProvider = await prisma.provider.findUnique({
        where: { email },
      })
    } catch (dbError) {
      logger.error('Error checking existing provider', dbError)
      return NextResponse.json(
        { 
          error: "Database error while checking existing provider. Please try again.",
          errorCode: "DATABASE_ERROR"
        },
        { status: 500 }
      )
    }

    if (existingProvider) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // For physicians, check if NPI already exists
    if (data.type === "PHYSICIAN" && npi) {
      let existingNPI
      try {
        existingNPI = await prisma.provider.findUnique({
          where: { npiNumber: npi },
        })
      } catch (dbError) {
        logger.error('Error checking existing NPI', dbError)
        return NextResponse.json(
          { 
            error: "Database error while checking NPI. Please try again.",
            errorCode: "DATABASE_ERROR"
          },
          { status: 500 }
        )
      }

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
    let provider
    try {
      // Log the data being created (without password)
      logger.info('Attempting to create provider', {
        type: data.type,
        email,
        hasNPI: !!npi,
        hasLicenseNumber: !!licenseNumber,
        hasLicenseState: !!licenseState,
      })

      const createData = {
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
      }

      provider = await prisma.provider.create({
        data: createData,
      })
    } catch (createError) {
      logger.error('Error creating provider', {
        error: createError,
        errorMessage: createError instanceof Error ? createError.message : String(createError),
        errorStack: createError instanceof Error ? createError.stack : undefined,
        type: data.type,
        email,
      })
      const createErrorMessage = createError instanceof Error ? createError.message : String(createError)
      
      // Check for specific Prisma errors
      if (createErrorMessage.includes("P2002")) {
        if (createErrorMessage.includes("email") || createErrorMessage.includes("email")) {
          return NextResponse.json(
            { error: "Email already registered", errorCode: "EMAIL_EXISTS" },
            { status: 409 }
          )
        }
        if (createErrorMessage.includes("npiNumber") || createErrorMessage.includes("npi")) {
          return NextResponse.json(
            { error: "NPI number already registered", errorCode: "NPI_EXISTS" },
            { status: 409 }
          )
        }
        return NextResponse.json(
          { error: "A provider with this information already exists", errorCode: "DUPLICATE" },
          { status: 409 }
        )
      }

      // Always include error details in production for debugging
      return NextResponse.json(
        { 
          error: "Failed to create provider account. Please check your database configuration.",
          errorCode: "CREATE_ERROR",
          details: createErrorMessage, // Include details even in production for now
          hint: createErrorMessage.includes("P1001") 
            ? "Database connection failed. Check DATABASE_URL in Vercel."
            : createErrorMessage.includes("P2002")
            ? "Duplicate entry. Email or NPI already exists."
            : createErrorMessage.includes("P2003")
            ? "Invalid reference. Check foreign key constraints."
            : "Check Vercel function logs for more details."
        },
        { status: 500 }
      )
    }

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
    
    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // Check for common database errors
    const isDatabaseError = 
      errorMessage.includes("prisma") || 
      errorMessage.includes("database") || 
      errorMessage.includes("connection") ||
      errorMessage.includes("P1001") || // Connection error
      errorMessage.includes("P2002") || // Unique constraint
      errorMessage.includes("P2003")    // Foreign key constraint
    
    // Check for unique constraint violations (email/NPI already exists)
    if (errorMessage.includes("P2002")) {
      if (errorMessage.includes("email") || errorMessage.includes("email")) {
        return NextResponse.json(
          { error: "Email already registered", errorCode: "EMAIL_EXISTS" },
          { status: 409 }
        )
      }
      if (errorMessage.includes("npiNumber") || errorMessage.includes("npi")) {
        return NextResponse.json(
          { error: "NPI number already registered", errorCode: "NPI_EXISTS" },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: "A provider with this information already exists", errorCode: "DUPLICATE" },
        { status: 409 }
      )
    }
    
    // Always return detailed error message to help diagnose issues
    const userFriendlyError = isDatabaseError
      ? "Database connection error. Please check your database configuration or contact support."
      : errorMessage.includes("P1001")
      ? "Cannot connect to database. Please check your DATABASE_URL environment variable."
      : errorMessage.includes("P2003")
      ? "Invalid data reference. Please check your input."
      : errorMessage.includes("prisma")
      ? "Database error occurred. Please try again or contact support."
      : "Registration failed. Please try again."
    
    return NextResponse.json(
      { 
        error: userFriendlyError,
        errorCode: isDatabaseError ? "DATABASE_ERROR" : "UNKNOWN_ERROR",
        // In development, include full details for debugging
        ...(process.env.NODE_ENV === 'development' && {
          details: errorMessage,
          stack: errorStack
        })
      },
      { status: 500 }
    )
  }
}

