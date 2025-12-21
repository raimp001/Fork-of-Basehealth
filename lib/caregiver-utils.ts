/**
 * Caregiver Utility Functions
 * Shared functions for managing approved caregivers
 */

let approvedCaregivers: any[] = []

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

export function getApprovedCaregivers() {
  return approvedCaregivers.filter(caregiver => 
    !caregiver.isMock && // Exclude mock data
    caregiver.isVerified && // Only verified caregivers
    (caregiver.status === 'active' || caregiver.status === 'available') // Only active/available
  )
}
