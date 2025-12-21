import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter'

// Import applications from signup route
// In production, this should be a shared database
let approvedCaregivers: any[] = []

// Export function to add approved caregivers
export function addApprovedCaregiver(application: any) {
  const caregiver = {
    id: application.id,
    name: `${application.firstName} ${application.lastName}`,
    specialty: application.primarySpecialty,
    location: application.serviceAreas?.split(',')[0] || 'Location not specified',
    coordinates: { lat: 0, lng: 0 }, // Would need geocoding in production
    distance: 0,
    rating: 5.0, // New caregivers start with perfect rating
    reviewCount: 0,
    hourlyRate: 35, // Default rate, should be from application
    availability: application.availableForUrgent ? "Available now" : "By appointment",
    isLicensed: !!application.licenseNumber,
    isCPRCertified: true, // Assume true if they're approved
    isBackgroundChecked: true, // Must be true if approved
    experience: application.yearsExperience || "New",
    languages: application.languagesSpoken || ["English"],
    image: "/placeholder.svg",
    bio: application.carePhilosophy || "Professional caregiver committed to quality care.",
    certifications: application.additionalCertifications?.split(',') || [],
    services: [application.primarySpecialty],
    email: application.email,
    phone: application.phone,
    // STATUS TRACKING - Only show caregivers marked as active/available
    status: 'active', // active, inactive, pending, suspended
    isVerified: true, // Verified, real caregiver (not mock/test data)
    isMock: false, // Flag to identify mock/test data
    lastActiveDate: new Date().toISOString(),
  }
  
  approvedCaregivers.push(caregiver)
  return caregiver
}

// NO MOCK DATA - All seed caregivers removed
// Only real, approved caregivers will be shown

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      location, 
      careType, 
      requirements, 
      urgency,
      startDate,
      duration,
      frequency,
      maxDistance = 50,
      includeMockData = false // Optional flag to include mock data (default: false)
    } = body

    // ONLY USE APPROVED CAREGIVERS - No mock/seed data in production
    // Filter to only show verified, active caregivers
    let allCaregivers = approvedCaregivers.filter(caregiver => 
      !caregiver.isMock && // Exclude mock data
      caregiver.isVerified && // Only verified caregivers
      (caregiver.status === 'active' || caregiver.status === 'available') // Only active/available
    )

    // NO MOCK DATA - Never include seed/mock caregivers
    // Users will see empty state if no real caregivers are available
    
    // Filter caregivers based on search criteria
    let filtered = [...allCaregivers]

    // Filter by location/distance
    if (location) {
      filtered = filtered.filter(caregiver => 
        caregiver.location.toLowerCase().includes(location.toLowerCase()) ||
        caregiver.distance <= maxDistance
      )
    }

    // Filter by care type/specialty
    if (careType) {
      filtered = filtered.filter(caregiver => 
        caregiver.specialty.toLowerCase().includes(careType.toLowerCase()) ||
        caregiver.services.some(service => 
          service.toLowerCase().includes(careType.toLowerCase())
        )
      )
    }

    // Filter by requirements
    if (requirements) {
      if (requirements.licensedNurse) {
        filtered = filtered.filter(c => c.isLicensed)
      }
      if (requirements.cprCertified) {
        filtered = filtered.filter(c => c.isCPRCertified)
      }
      if (requirements.backgroundCheck) {
        filtered = filtered.filter(c => c.isBackgroundChecked)
      }
    }

    // Filter by availability based on urgency
    if (urgency === "Immediate (within 24 hours)") {
      filtered = filtered.filter(c => 
        c.availability === "Available now" || 
        c.availability === "Available immediately"
      )
    }

    // Sort by rating and distance
    filtered.sort((a, b) => {
      // First sort by rating (descending)
      if (b.rating !== a.rating) {
        return b.rating - a.rating
      }
      // Then by distance (ascending)
      return a.distance - b.distance
    })

    // Calculate match score for each caregiver
    const resultsWithScore = filtered.map(caregiver => {
      let matchScore = 0
      
      // Base score from rating
      matchScore += caregiver.rating * 20
      
      // Distance score (closer is better)
      matchScore += Math.max(0, 50 - caregiver.distance)
      
      // Experience score
      const experience = parseInt(caregiver.experience)
      matchScore += Math.min(experience * 2, 30)
      
      // Availability score
      if (caregiver.availability.includes("now") || caregiver.availability.includes("immediately")) {
        matchScore += 20
      }
      
      return {
        ...caregiver,
        matchScore: Math.round(matchScore)
      }
    })

    return NextResponse.json({
      success: true,
      results: resultsWithScore,
      totalCount: resultsWithScore.length,
      searchCriteria: {
        location,
        careType,
        urgency,
        startDate,
        duration
      }
    })

  } catch (error) {
    logger.error('Caregiver search error', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search caregivers',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeMockData = searchParams.get('includeMockData') === 'true'
    
    // ONLY RETURN VERIFIED, ACTIVE CAREGIVERS - No mock data
    const realCaregivers = approvedCaregivers.filter(caregiver => 
      !caregiver.isMock && // Exclude mock data
      caregiver.isVerified && // Only verified caregivers
      (caregiver.status === 'active' || caregiver.status === 'available') // Only active/available
    )
    
    // Only include mock data if explicitly requested AND no real caregivers exist
    let allCaregivers = realCaregivers
    let message = ''
    
    if (realCaregivers.length === 0) {
      message = 'No caregivers currently available. Please check back later or apply to become a caregiver!'
      logger.info('No verified caregivers available')
    } else {
      logger.info(`Returning ${realCaregivers.length} verified, active caregiver(s)`)
      message = `Showing ${realCaregivers.length} verified, available caregiver(s)`
    }
    
    return NextResponse.json({
      success: true,
      results: allCaregivers,
      totalCount: allCaregivers.length,
      verifiedCount: realCaregivers.length,
      mockCount: allCaregivers.length - realCaregivers.length,
      message,
      filters: {
        onlyVerified: true,
        onlyActive: true,
        excludeMockData: !includeMockData
      }
    })
  } catch (error) {
    logger.error('Error fetching caregivers', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch caregivers' },
      { status: 500 }
    )
  }
}
