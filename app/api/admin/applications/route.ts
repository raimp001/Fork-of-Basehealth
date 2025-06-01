import { NextRequest, NextResponse } from 'next/server'
import { notifyProviderApproved, notifyProviderRejected } from '@/lib/email-service'

interface ProviderApplication {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  specialty: string
  credentials: string
  npiNumber: string
  licenseNumber: string
  licenseState: string
  licenseExpiration: string
  practiceType: string
  practiceName: string
  practiceAddress: string
  consultationFee: number
  submittedDate: string
  status: "pending" | "under_review" | "approved" | "rejected"
  documents: {
    profilePhoto: boolean
    medicalLicense: boolean
    malpracticeInsurance: boolean
    cv: boolean
  }
  reviewNotes?: string
  reviewedBy?: string
  reviewedDate?: string
}

// Mock data for demo purposes
const mockApplications: ProviderApplication[] = [
  {
    id: "1",
    firstName: "Dr. Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    specialty: "Family Medicine",
    credentials: "MD",
    npiNumber: "1234567890",
    licenseNumber: "MD123456",
    licenseState: "CA",
    licenseExpiration: "2025-12-31",
    practiceType: "Solo Practice",
    practiceName: "Johnson Family Medicine",
    practiceAddress: "123 Main St, Los Angeles, CA 90210",
    consultationFee: 150,
    submittedDate: "2024-01-15",
    status: "pending",
    documents: {
      profilePhoto: true,
      medicalLicense: true,
      malpracticeInsurance: true,
      cv: true
    }
  },
  {
    id: "2",
    firstName: "Dr. Michael",
    lastName: "Chen",
    email: "michael.chen@email.com",
    phone: "(555) 987-6543",
    specialty: "Cardiology",
    credentials: "MD",
    npiNumber: "0987654321",
    licenseNumber: "MD789012",
    licenseState: "NY",
    licenseExpiration: "2025-06-30",
    practiceType: "Group Practice",
    practiceName: "Heart Specialists of NYC",
    practiceAddress: "456 Park Ave, New York, NY 10001",
    consultationFee: 250,
    submittedDate: "2024-01-12",
    status: "under_review",
    documents: {
      profilePhoto: true,
      medicalLicense: true,
      malpracticeInsurance: false,
      cv: true
    },
    reviewNotes: "Missing malpractice insurance documentation"
  },
  {
    id: "3",
    firstName: "Dr. Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@email.com",
    phone: "(555) 456-7890",
    specialty: "Pediatrics",
    credentials: "MD",
    npiNumber: "1122334455",
    licenseNumber: "MD345678",
    licenseState: "TX",
    licenseExpiration: "2025-09-15",
    practiceType: "Hospital Employed",
    practiceName: "Children's Hospital of Dallas",
    practiceAddress: "789 Medical Center Blvd, Dallas, TX 75201",
    consultationFee: 180,
    submittedDate: "2024-01-10",
    status: "approved",
    documents: {
      profilePhoto: true,
      medicalLicense: true,
      malpracticeInsurance: true,
      cv: true
    },
    reviewedBy: "Admin User",
    reviewedDate: "2024-01-14"
  },
  {
    id: "4",
    firstName: "Dr. Robert",
    lastName: "Smith",
    email: "robert.smith@email.com",
    phone: "(555) 333-7777",
    specialty: "Dermatology",
    credentials: "MD",
    npiNumber: "5566778899",
    licenseNumber: "MD901234",
    licenseState: "FL",
    licenseExpiration: "2025-03-20",
    practiceType: "Solo Practice",
    practiceName: "Smith Dermatology Clinic",
    practiceAddress: "321 Ocean Dr, Miami, FL 33139",
    consultationFee: 200,
    submittedDate: "2024-01-08",
    status: "rejected",
    documents: {
      profilePhoto: true,
      medicalLicense: false,
      malpracticeInsurance: true,
      cv: true
    },
    reviewNotes: "Medical license document is expired. Please resubmit with current license.",
    reviewedBy: "Admin User",
    reviewedDate: "2024-01-11"
  }
]

// Mock stats
const mockStats = {
  totalProviders: 127,
  pendingApplications: 8,
  approvedThisMonth: 12,
  rejectedThisMonth: 3,
  totalPatients: 2549,
  totalAppointments: 1876,
  monthlyRevenue: 125000
}

// Helper function to check admin authentication
function checkAdminAuth(request: NextRequest): boolean {
  // In a real app, you would verify JWT token or session
  // For demo purposes, we'll just check for a simple admin token
  const authHeader = request.headers.get('authorization')
  return authHeader === 'Bearer admin-token' || true // Allow all for demo
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let filteredApplications = [...mockApplications]

    // Filter by status
    if (status && status !== 'all') {
      filteredApplications = filteredApplications.filter(app => app.status === status)
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      filteredApplications = filteredApplications.filter(app =>
        app.firstName.toLowerCase().includes(searchLower) ||
        app.lastName.toLowerCase().includes(searchLower) ||
        app.email.toLowerCase().includes(searchLower) ||
        app.specialty.toLowerCase().includes(searchLower)
      )
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedApplications = filteredApplications.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        applications: paginatedApplications,
        stats: mockStats,
        pagination: {
          page,
          limit,
          total: filteredApplications.length,
          totalPages: Math.ceil(filteredApplications.length / limit)
        }
      }
    })

  } catch (error) {
    console.error('Admin applications GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check admin authentication
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { applicationId, action, reviewNotes, reviewedBy } = body

    if (!applicationId || !action) {
      return NextResponse.json(
        { error: 'Application ID and action are required' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject', 'under_review'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve, reject, or under_review' },
        { status: 400 }
      )
    }

    // Find the application
    const applicationIndex = mockApplications.findIndex(app => app.id === applicationId)
    if (applicationIndex === -1) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const application = mockApplications[applicationIndex]

    // Update application status
    const statusMap = {
      approve: 'approved' as const,
      reject: 'rejected' as const,
      under_review: 'under_review' as const
    }

    const updatedApplication: ProviderApplication = {
      ...application,
      status: statusMap[action as keyof typeof statusMap],
      reviewNotes: reviewNotes || application.reviewNotes,
      reviewedBy: reviewedBy || 'Admin User',
      reviewedDate: new Date().toISOString().split('T')[0]
    }

    // In a real app, you would:
    // 1. Update the database
    // 2. Send email notification to provider
    // 3. Create audit log entry
    // 4. If approved, create provider account and send onboarding information

    // For demo, just update the mock data
    mockApplications[applicationIndex] = updatedApplication

    // Log the action
    console.log(`Application ${action}ed:`, {
      applicationId,
      providerName: `${application.firstName} ${application.lastName}`,
      action,
      reviewedBy: reviewedBy || 'Admin User',
      reviewNotes
    })

    // Send email notifications
    try {
      if (action === 'approve') {
        await notifyProviderApproved({
          applicationId,
          firstName: application.firstName,
          lastName: application.lastName,
          email: application.email,
          specialty: application.specialty,
          submittedDate: application.submittedDate
        })
        console.log('📧 Provider approval notification sent')
      } else if (action === 'reject') {
        await notifyProviderRejected({
          applicationId,
          firstName: application.firstName,
          lastName: application.lastName,
          email: application.email,
          specialty: application.specialty,
          submittedDate: application.submittedDate
        }, reviewNotes || 'Application does not meet current requirements')
        console.log('📧 Provider rejection notification sent')
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Don't fail the update if email fails
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500))

    // Send different responses based on action
    let message = ''
    if (action === 'approve') {
      message = `Application approved successfully. Provider ${application.firstName} ${application.lastName} has been notified and their account will be activated within 24 hours.`
    } else if (action === 'reject') {
      message = `Application rejected. Provider ${application.firstName} ${application.lastName} has been notified with the reason for rejection.`
    } else {
      message = `Application moved to under review. Further documentation or verification may be required.`
    }

    return NextResponse.json({
      success: true,
      message,
      data: {
        application: updatedApplication,
        action,
        reviewedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Admin applications PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, applicationIds, reviewNotes, reviewedBy } = body

    if (!action || !applicationIds || !Array.isArray(applicationIds)) {
      return NextResponse.json(
        { error: 'Action and application IDs are required' },
        { status: 400 }
      )
    }

    if (!['bulk_approve', 'bulk_reject', 'bulk_under_review'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid bulk action' },
        { status: 400 }
      )
    }

    const statusMap = {
      bulk_approve: 'approved' as const,
      bulk_reject: 'rejected' as const,
      bulk_under_review: 'under_review' as const
    }

    const targetStatus = statusMap[action as keyof typeof statusMap]
    const updatedApplications: ProviderApplication[] = []

    // Process each application
    for (const applicationId of applicationIds) {
      const applicationIndex = mockApplications.findIndex(app => app.id === applicationId)
      if (applicationIndex !== -1) {
        const application = mockApplications[applicationIndex]
        const updatedApplication: ProviderApplication = {
          ...application,
          status: targetStatus,
          reviewNotes: reviewNotes || application.reviewNotes,
          reviewedBy: reviewedBy || 'Admin User',
          reviewedDate: new Date().toISOString().split('T')[0]
        }
        mockApplications[applicationIndex] = updatedApplication
        updatedApplications.push(updatedApplication)
      }
    }

    // Log the bulk action
    console.log(`Bulk ${action} performed:`, {
      action,
      applicationCount: updatedApplications.length,
      reviewedBy: reviewedBy || 'Admin User',
      reviewNotes
    })

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${updatedApplications.length} applications`,
      data: {
        updatedApplications,
        action,
        processedCount: updatedApplications.length,
        reviewedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Admin applications POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk action' },
      { status: 500 }
    )
  }
} 