import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter'
import { mockApplications, mockApplicationStats } from '@/lib/mock-admin-data'
import type { ApplicationFilters } from '@/types/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse filters from query parameters
    const filters: ApplicationFilters = {}
    
    const status = searchParams.get('status')
    if (status) {
      filters.status = status.split(',') as ApplicationFilters['status']
    }
    
    const type = searchParams.get('type')
    if (type) {
      filters.type = type.split(',') as ApplicationFilters['type']
    }
    
    const priority = searchParams.get('priority')
    if (priority) {
      filters.priority = priority.split(',') as ApplicationFilters['priority']
    }
    
    const search = searchParams.get('search')
    if (search) {
      filters.search = search
    }
    
    const reviewer = searchParams.get('reviewer')
    if (reviewer) {
      filters.reviewer = reviewer
    }
    
    const dateStart = searchParams.get('dateStart')
    const dateEnd = searchParams.get('dateEnd')
    if (dateStart && dateEnd) {
      filters.dateRange = { start: dateStart, end: dateEnd }
    }

    // Apply filters to mock data
    let filteredApplications = [...mockApplications]
    
    if (filters.status && filters.status.length > 0) {
      filteredApplications = filteredApplications.filter(app => 
        filters.status!.includes(app.status)
      )
    }
    
    if (filters.type && filters.type.length > 0) {
      filteredApplications = filteredApplications.filter(app => 
        filters.type!.includes(app.type)
      )
    }
    
    if (filters.priority && filters.priority.length > 0) {
      filteredApplications = filteredApplications.filter(app => 
        filters.priority!.includes(app.priority)
      )
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredApplications = filteredApplications.filter(app => 
        app.personalInfo.firstName.toLowerCase().includes(searchTerm) ||
        app.personalInfo.lastName.toLowerCase().includes(searchTerm) ||
        app.personalInfo.email.toLowerCase().includes(searchTerm)
      )
    }
    
    if (filters.reviewer) {
      filteredApplications = filteredApplications.filter(app => 
        app.reviewedBy === filters.reviewer
      )
    }
    
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)
      
      filteredApplications = filteredApplications.filter(app => {
        const submittedDate = new Date(app.submittedAt)
        return submittedDate >= startDate && submittedDate <= endDate
      })
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    
    const paginatedApplications = filteredApplications.slice(offset, offset + limit)
    
    // Calculate stats for filtered results
    const filteredStats = {
      total: filteredApplications.length,
      pending: filteredApplications.filter(app => app.status === 'pending').length,
      underReview: filteredApplications.filter(app => app.status === 'under_review').length,
      approved: filteredApplications.filter(app => app.status === 'approved').length,
      rejected: filteredApplications.filter(app => app.status === 'rejected').length,
      requiresInfo: filteredApplications.filter(app => app.status === 'requires_info').length,
      averageReviewTime: mockApplicationStats.averageReviewTime,
      approvalRate: mockApplicationStats.approvalRate
    }

    return NextResponse.json({
      applications: paginatedApplications,
      stats: filteredStats,
      pagination: {
        page,
        limit,
        total: filteredApplications.length,
        totalPages: Math.ceil(filteredApplications.length / limit)
      },
      filters: filters
    })

  } catch (error) {
    logger.error('Admin applications API error', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch applications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationId, action, notes, reviewer } = body

    // Validate required fields
    if (!applicationId || !action || !notes) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, action, notes' },
        { status: 400 }
      )
    }

    // Validate action type
    const validActions = ['approve', 'reject', 'request_info', 'schedule_interview']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action type' },
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Validate the reviewer's permissions
    // 2. Update the application in the database
    // 3. Send notifications to the applicant
    // 4. Log the review action
    // 5. Update relevant metrics

    // Mock response for demonstration
    const reviewResult = {
      id: `review_${Date.now()}`,
      applicationId,
      action,
      notes,
      reviewer: reviewer || 'admin@basehealth.com',
      reviewedAt: new Date().toISOString(),
      status: 'completed'
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      review: reviewResult,
      message: `Application ${action} completed successfully`
    })

  } catch (error) {
    logger.error('Admin review submission error', error)
    return NextResponse.json(
      { 
        error: 'Failed to submit review',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT endpoint for bulk actions
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationIds, action, notes, reviewer } = body

    // Validate required fields
    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { error: 'applicationIds must be a non-empty array' },
        { status: 400 }
      )
    }

    if (!action || !notes) {
      return NextResponse.json(
        { error: 'Missing required fields: action, notes' },
        { status: 400 }
      )
    }

    // Process bulk action
    const results = applicationIds.map(id => ({
      applicationId: id,
      action,
      notes,
      reviewer: reviewer || 'admin@basehealth.com',
      reviewedAt: new Date().toISOString(),
      status: 'completed'
    }))

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      results,
      message: `Bulk ${action} completed for ${applicationIds.length} applications`
    })

  } catch (error) {
    logger.error('Admin bulk action error', error)
    return NextResponse.json(
      { 
        error: 'Failed to process bulk action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}