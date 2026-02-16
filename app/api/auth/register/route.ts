import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import bcrypt from 'bcryptjs'
import { findUserByEmail, addUser } from '@/lib/user-store'
import { isAdminEmail } from '@/lib/admin-access'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'patient' } = await request.json()
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const requestedRole = String(role || 'patient').trim().toLowerCase()
    const normalizedRole =
      requestedRole === 'admin'
        ? (isAdminEmail(normalizedEmail) ? 'admin' : 'patient')
        : (requestedRole === 'provider' || requestedRole === 'caregiver' ? requestedRole : 'patient')

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists using shared store
    const existingUser = findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user using shared store
    const newUser = addUser({
      email,
      password: hashedPassword,
      name,
      role: normalizedRole as 'patient' | 'provider' | 'caregiver' | 'admin',
      image: '/icon-192.png'
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error) {
    logger.error('Registration error', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}
