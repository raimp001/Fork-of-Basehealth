import { NextRequest, NextResponse } from 'next/server'
import { requirePatientAuth } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    // Require patient authentication
    const user = await requirePatientAuth()
    
    // Get client IP and user agent for logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Log access attempt
    logAccess({
      userId: user.id,
      action: 'UPDATE_MEDICAL_PROFILE',
      resource: 'medical-profile',
      ipAddress: clientIP,
      userAgent: userAgent
    })
    
    // Get the updated profile data
    const profileData = await request.json()
    
    // Validate the profile data
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // In a real application, you would update the profile in your database here
    // For now, we'll just return a success response
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating medical profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

function logAccess(data: {
  userId: string
  action: string
  resource: string
  ipAddress: string
  userAgent: string
}) {
  // In a real application, you would log this to your audit log system
  console.log('Access Log:', {
    timestamp: new Date().toISOString(),
    ...data
  })
} 