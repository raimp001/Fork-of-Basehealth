import { NextRequest, NextResponse } from 'next/server'
import { addApprovedCaregiver } from '../search/route'
import { getApplicationById, updateApplicationStatus } from '../signup/route'

export async function POST(request: NextRequest) {
  try {
    const { applicationId } = await request.json()
    
    if (!applicationId) {
      return NextResponse.json({
        success: false,
        error: 'Application ID is required'
      }, { status: 400 })
    }
    
    // Get the application from shared storage
    const application = getApplicationById(applicationId)
    
    if (!application) {
      return NextResponse.json({
        success: false,
        error: 'Application not found'
      }, { status: 404 })
    }
    
    // Update application status to approved
    updateApplicationStatus(applicationId, 'approved', 'Application approved by admin', 'Admin')
    
    // Add to approved caregivers list (available in search)
    const caregiver = addApprovedCaregiver({
      ...application,
      status: 'approved',
      approvedAt: new Date().toISOString()
    })
    
    console.log(`Approved caregiver: ${caregiver.name} (ID: ${caregiver.id})`)
    
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

