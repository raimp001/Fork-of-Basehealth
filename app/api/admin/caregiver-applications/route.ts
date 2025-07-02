import { NextRequest, NextResponse } from 'next/server'

interface CaregiverApplication {
  id?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  licenseNumber: string
  specialty: string
  yearsExperience: string
  education: string
  certifications: string
  workLocations: string
  languages: string
  about: string
  acceptsInsurance: boolean
  willingToTravel: boolean
  acceptsEmergency: boolean
  walletAddress: string
  applicationDate: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  reviewedBy?: string
  reviewedDate?: string
  reviewNotes?: string
}

// In-memory storage for demo purposes
let applications: CaregiverApplication[] = []

export async function POST(request: NextRequest) {
  try {
    const applicationData: CaregiverApplication = await request.json()
    
    // Generate unique ID
    const id = `CG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'licenseNumber', 'specialty', 'about']
    const missingFields = requiredFields.filter(field => !applicationData[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Create application object
    const application: CaregiverApplication = {
      id,
      ...applicationData,
      status: 'pending',
      applicationDate: new Date().toISOString()
    }

    // Store application
    applications.push(application)

    // Log for demo purposes
    console.log('New caregiver application received:', {
      id: application.id,
      name: `${application.firstName} ${application.lastName}`,
      specialty: application.specialty,
      email: application.email
    })

    return NextResponse.json({ 
      success: true, 
      applicationId: id,
      message: 'Application submitted successfully' 
    })

  } catch (error) {
    console.error('Error processing caregiver application:', error)
    return NextResponse.json(
      { error: 'Failed to process application' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let filteredApplications = applications
    
    if (status) {
      filteredApplications = applications.filter(app => app.status === status)
    }

    return NextResponse.json({
      applications: filteredApplications,
      total: filteredApplications.length
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

    const applicationIndex = applications.findIndex(app => app.id === applicationId)
    
    if (applicationIndex === -1) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Update application
    applications[applicationIndex] = {
      ...applications[applicationIndex],
      ...updateData,
      reviewedDate: new Date().toISOString()
    }

    console.log('Application updated:', {
      id: applicationId,
      status: updateData.status,
      reviewedBy: updateData.reviewedBy
    })

    return NextResponse.json({
      success: true,
      application: applications[applicationIndex]
    })

  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
} 