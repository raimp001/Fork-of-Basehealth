/**
 * Ensure User API - Creates/maps application user from Privy identity
 * 
 * POST /api/auth/privy/ensure-user
 * 
 * Called on first login to create user record in database.
 * Uses privyUserId as the stable identity.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PrivyClient } from '@privy-io/server-auth'

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  process.env.PRIVY_APP_SECRET || ''
)

interface EnsureUserRequest {
  privyUserId: string
  walletAddress?: string
  email?: string
  phone?: string
}

export async function POST(request: NextRequest) {
  try {
    // Verify the Privy token from the request
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify token with Privy
    let verifiedClaims
    try {
      verifiedClaims = await privy.verifyAuthToken(token)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid auth token' },
        { status: 401 }
      )
    }

    const body: EnsureUserRequest = await request.json()
    const { privyUserId, walletAddress, email, phone } = body

    // Verify the privyUserId matches the token
    if (verifiedClaims.userId !== privyUserId) {
      return NextResponse.json(
        { success: false, error: 'User ID mismatch' },
        { status: 403 }
      )
    }

    // Check if user already exists by privyUserId
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { privyUserId },
          ...(email ? [{ email }] : []),
          ...(walletAddress ? [{ walletAddress }] : []),
        ],
      },
    })

    if (user) {
      // Update existing user with any new info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          privyUserId,
          ...(walletAddress && walletAddress !== user.walletAddress && { walletAddress }),
          ...(email && email !== user.email && { email }),
          lastLoginAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          privyUserId: user.privyUserId,
          email: user.email,
          walletAddress: user.walletAddress,
          role: user.role,
          isNew: false,
        },
      })
    }

    // Create new user
    user = await prisma.user.create({
      data: {
        privyUserId,
        email: email || null,
        walletAddress: walletAddress || null,
        role: 'PATIENT', // Default role
        lastLoginAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        privyUserId: user.privyUserId,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role,
        isNew: true,
      },
    })

  } catch (error) {
    console.error('Ensure user error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to ensure user' },
      { status: 500 }
    )
  }
}
