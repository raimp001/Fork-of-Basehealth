import { NextRequest, NextResponse } from 'next/server'

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
    phone: application.phone
  }
  
  approvedCaregivers.push(caregiver)
  return caregiver
}

// Demo/seed caregivers - these should be removed once real caregivers sign up
const seedCaregivers = [
  {
    id: "1",
    name: "Maria Rodriguez",
    specialty: "Elder Care",
    location: "San Francisco, CA",
    coordinates: { lat: 37.7749, lng: -122.4194 },
    distance: 2.1,
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 35,
    availability: "Available now",
    isLicensed: true,
    isCPRCertified: true,
    isBackgroundChecked: true,
    experience: "8 years",
    languages: ["English", "Spanish"],
    image: "/placeholder.svg",
    bio: "Experienced caregiver specializing in elder care with a compassionate approach.",
    certifications: ["CNA", "CPR", "First Aid", "Dementia Care"],
    services: ["Personal Care", "Medication Management", "Companionship", "Light Housekeeping"]
  },
  {
    id: "2",
    name: "James Wilson",
    specialty: "Post-Surgery Care",
    location: "San Francisco, CA",
    coordinates: { lat: 37.7849, lng: -122.4094 },
    distance: 3.5,
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 30,
    availability: "Next week",
    isLicensed: true,
    isCPRCertified: true,
    isBackgroundChecked: true,
    experience: "12 years",
    languages: ["English"],
    image: "/placeholder.svg",
    bio: "Specialized in post-surgical recovery care with extensive medical knowledge.",
    certifications: ["LVN", "CPR", "Wound Care"],
    services: ["Post-Surgery Care", "Wound Management", "Physical Therapy Support", "Medical Equipment"]
  },
  {
    id: "3",
    name: "Sarah Chen",
    specialty: "Pediatric Care",
    location: "San Francisco, CA",
    coordinates: { lat: 37.7649, lng: -122.4294 },
    distance: 1.8,
    rating: 4.7,
    reviewCount: 203,
    hourlyRate: 28,
    availability: "Available immediately",
    isLicensed: true,
    isCPRCertified: true,
    isBackgroundChecked: true,
    experience: "6 years",
    languages: ["English", "Mandarin"],
    image: "/placeholder.svg",
    bio: "Caring pediatric specialist with a warm approach to child care.",
    certifications: ["Pediatric Care", "CPR", "Child Development"],
    services: ["Child Care", "Special Needs Support", "Educational Activities", "Meal Preparation"]
  },
  {
    id: "4",
    name: "David Thompson",
    specialty: "Dementia Care",
    location: "Oakland, CA",
    coordinates: { lat: 37.8044, lng: -122.2712 },
    distance: 8.3,
    rating: 4.9,
    reviewCount: 156,
    hourlyRate: 40,
    availability: "Available weekends",
    isLicensed: true,
    isCPRCertified: true,
    isBackgroundChecked: true,
    experience: "15 years",
    languages: ["English"],
    image: "/placeholder.svg",
    bio: "Dementia care specialist with extensive experience in memory care.",
    certifications: ["Dementia Care Specialist", "CPR", "Alzheimer's Care"],
    services: ["Memory Care", "Behavioral Management", "Daily Living Support", "Family Education"]
  },
  {
    id: "5",
    name: "Linda Garcia",
    specialty: "Hospice Care",
    location: "San Jose, CA",
    coordinates: { lat: 37.3382, lng: -121.8863 },
    distance: 45.2,
    rating: 5.0,
    reviewCount: 98,
    hourlyRate: 45,
    availability: "By appointment",
    isLicensed: true,
    isCPRCertified: true,
    isBackgroundChecked: true,
    experience: "20 years",
    languages: ["English", "Spanish"],
    image: "/placeholder.svg",
    bio: "Compassionate hospice care provider focused on comfort and dignity.",
    certifications: ["Hospice Care", "Pain Management", "Grief Counseling"],
    services: ["End-of-Life Care", "Pain Management", "Family Support", "Spiritual Care"]
  }
]

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
      maxDistance = 50
    } = body

    // Combine approved caregivers with seed data
    const allCaregivers = [...approvedCaregivers, ...seedCaregivers]
    
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
    console.error('Caregiver search error:', error)
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
    // Prioritize approved caregivers over seed data
    // In production, only use approved caregivers from database
    const allCaregivers = [...approvedCaregivers, ...seedCaregivers]
    
    // If no approved caregivers exist yet, show message
    if (approvedCaregivers.length === 0) {
      console.log('⚠️  No approved caregivers yet. Showing seed data for demo.')
    } else {
      console.log(`✅ Returning ${approvedCaregivers.length} approved caregiver(s) + ${seedCaregivers.length} seed caregivers`)
    }
    
    return NextResponse.json({
      success: true,
      results: allCaregivers,
      totalCount: allCaregivers.length,
      approvedCount: approvedCaregivers.length,
      seedCount: seedCaregivers.length,
      message: approvedCaregivers.length === 0 
        ? 'No caregivers have been approved yet. Showing demo data. Apply to become a caregiver!' 
        : `Showing ${approvedCaregivers.length} approved caregiver(s)`
    })
  } catch (error) {
    console.error('Error fetching caregivers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch caregivers' },
      { status: 500 }
    )
  }
}
