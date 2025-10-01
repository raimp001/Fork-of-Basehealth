import { NextRequest, NextResponse } from 'next/server'
import { addApprovedCaregiver } from '../search/route'

export async function POST(request: NextRequest) {
  try {
    const { applicationId } = await request.json()
    
    if (!applicationId) {
      return NextResponse.json({
        success: false,
        error: 'Application ID is required'
      }, { status: 400 })
    }
    
    // In production, fetch the application from database
    // For now, we'll fetch from the signup endpoint
    const signupResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/caregivers/signup?id=${applicationId}`
    )
    
    if (!signupResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Application not found'
      }, { status: 404 })
    }
    
    const { application } = await signupResponse.json()
    
    if (!application) {
      return NextResponse.json({
        success: false,
        error: 'Application not found'
      }, { status: 404 })
    }
    
    // Add to approved caregivers list
    const caregiver = addApprovedCaregiver({
      ...application,
      status: 'approved',
      approvedAt: new Date().toISOString()
    })
    
    console.log(`Approved caregiver: ${caregiver.name}`)
    
    return NextResponse.json({
      success: true,
      message: 'Caregiver application approved successfully',
      caregiver: {
        id: caregiver.id,
        name: caregiver.name,
        specialty: caregiver.specialty
      }
    })
    
  } catch (error) {
    console.error('Error approving caregiver:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to approve caregiver application',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

