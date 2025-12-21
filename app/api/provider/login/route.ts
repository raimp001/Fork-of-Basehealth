/**
 * Provider Login API
 * 
 * Provider authentication endpoint with rate limiting and proper error handling
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { logger } from "@/lib/logger"
import { rateLimit, getClientIdentifier } from "@/lib/rate-limiter"
import { sanitizeText, validateEmail } from "@/lib/sanitize"

interface LoginData {
  email: string
  password: string
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(req)
    const rateLimitResult = rateLimit(`provider-login:${clientId}`, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 login attempts per 15 minutes
    })

    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded for provider login', { clientId })
      return NextResponse.json(
        { 
          error: "Too many login attempts. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      )
    }

    const data: LoginData = await req.json()

    // Sanitize and validate input
    const email = sanitizeText(data.email?.trim() || '')
    const password = data.password || ''

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
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

    // Generate JWT token
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret || secret === "your-secret-key-here-replace-in-production") {
      logger.error('NEXTAUTH_SECRET not properly configured')
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    const token = jwt.sign(
      { 
        providerId: provider.id, 
        email: provider.email,
        type: 'provider',
        iat: Math.floor(Date.now() / 1000),
      },
      secret,
      { expiresIn: "7d" }
    )

    logger.info('Provider login successful', { 
      providerId: provider.id, 
      email: provider.email,
      remainingAttempts: rateLimitResult.remaining,
    })

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
    }, {
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      },
    })
  } catch (error) {
    logger.error("Provider login error", error)
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    )
  }
}

