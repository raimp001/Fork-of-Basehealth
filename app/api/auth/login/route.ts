import { NextRequest, NextResponse } from 'next/server'
import { createMockSession, getMockPatient, logAccess } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password, patientId } = await request.json()
    
    // For demo purposes, we'll use simple authentication
    // In production, use proper password hashing and verification
    
    let user = null
    
    // If patientId is provided, use it directly (for demo)
    if (patientId) {
      user = getMockPatient(patientId)
    } else if (email) {
      // Find user by email
      if (email === 'john.doe@email.com') {
        user = getMockPatient('patient_001')
      } else if (email === 'jane.smith@email.com') {
        user = getMockPatient('patient_002')
      }
    }
    
    if (!user) {
      // Log failed login attempt
      logAccess({
        userId: 'unknown',
        action: 'FAILED_LOGIN',
        resource: 'auth',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Create session
    const sessionToken = createMockSession(user)
    
    // Set secure cookie
    const cookieStore = cookies()
    cookieStore.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    })
    
    // Log successful login
    logAccess({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      resource: 'auth',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // Logout - clear session cookie
    const cookieStore = cookies()
    cookieStore.delete('session-token')
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
} 