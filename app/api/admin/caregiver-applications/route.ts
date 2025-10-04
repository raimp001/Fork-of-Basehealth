import { NextRequest, NextResponse } from 'next/server'
import { getAllApplications, getApplicationById, updateApplicationStatus } from '../../caregivers/signup/route'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const applicationId = searchParams.get('id')
    
    // Get single application by ID
    if (applicationId) {
      const application = getApplicationById(applicationId)
      
      if (!application) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        application
      })
    }
    
    // Get all applications (optionally filtered by status)
    let applications = getAllApplications()
    
    if (status) {
      applications = applications.filter(app => app.status === status)
    }

    return NextResponse.json({
      success: true,
      applications: applications,
      total: applications.length
    })

  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('id')
    const updateData = await request.json()

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

    // Update application status
    const updatedApplication = updateApplicationStatus(
      applicationId,
      updateData.status,
      updateData.reviewNotes,
      updateData.reviewedBy
    )
    
    if (!updatedApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    console.log('Application updated:', {
      id: applicationId,
      status: updateData.status,
      reviewedBy: updateData.reviewedBy
    })

    return NextResponse.json({
      success: true,
      application: updatedApplication
    })

  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
} 