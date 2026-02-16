import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import bcrypt from 'bcryptjs'
import { isAdminEmail } from '@/lib/admin-access'
import { prisma } from '@/lib/prisma'

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

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true }
    })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const roleEnum =
      normalizedRole === 'admin'
        ? 'ADMIN'
        : normalizedRole === 'provider'
          ? 'PROVIDER'
          : normalizedRole === 'caregiver'
            ? 'CAREGIVER'
            : 'PATIENT'

    const userName = String(name).trim()

    // Create new user in database
    const newUser = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: userName,
          role: roleEnum as any,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          walletAddress: true,
          createdAt: true,
        }
      })

      if (roleEnum === 'PATIENT') {
        await tx.patient.create({
          data: {
            userId: created.id,
            allergies: [],
            conditions: [],
            medications: [],
          },
        })
      }

      return created
    })

    return NextResponse.json({
      success: true,
      user: newUser
    })

  } catch (error: any) {
    logger.error('Registration error', error)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}
