import { NextResponse } from "next/server"
import { searchNPIProviders, mapNPITaxonomyToSpecialty, type NPIProvider } from "@/lib/npi-service"
import db from "@/lib/mock-db"

// Provider interface
interface Provider {
  id: string
  name: string
  specialty: string
  rating?: number
  reviewCount?: number
  address: {
    full?: string
    city?: string
    state?: string
    zipCode?: string
  }
  isVerified?: boolean
  isNearby?: boolean
  distanceNote?: string
  website?: string
  phone?: string
  npiNumber?: string
  credentials?: string
  acceptsInsurance?: boolean
  services?: string[]
  coordinates?: {
    latitude: number
    longitude: number
  }
}

/**
 * Generate mock providers based on search criteria
 */
function generateMockProviders(zipCode: string, specialty?: string): Provider[] {
  const specialties = [
    "Family Medicine",
    "Internal Medicine",
    "Pediatrics",
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Psychiatry",
    "Orthopedics",
    "Obstetrics & Gynecology",
    // Dental specialties
    "Dentist",
    "General Dentist",
    "Pediatric Dentist",
    "Orthodontist",
    "Endodontist",
    "Periodontist",
    "Prosthodontist",
    "Oral Surgeon",
  ]

  const providerSpecialty =
    specialty && specialty !== "all" ? specialty : specialties[Math.floor(Math.random() * specialties.length)]

  // Define services based on specialty
  const getServices = (specialty: string) => {
    if (specialty.includes("Dentist") || specialty === "Dentist") {
      return ["Dental Cleanings", "Fillings", "Root Canals", "Crowns", "Bridges", "Dentures"]
    } else if (specialty === "Orthodontist") {
      return ["Braces", "Invisalign", "Retainers", "Orthodontic Consultations"]
    } else if (specialty === "Endodontist") {
      return ["Root Canal Therapy", "Endodontic Surgery", "Dental Trauma Treatment"]
    } else if (specialty === "Periodontist") {
      return ["Gum Disease Treatment", "Dental Implants", "Gum Surgery", "Bone Grafting"]
    } else if (specialty === "Prosthodontist") {
      return ["Dental Implants", "Crowns", "Bridges", "Dentures", "Veneers"]
    } else if (specialty === "Oral Surgeon") {
      return ["Wisdom Teeth Removal", "Dental Implants", "Jaw Surgery", "Facial Trauma"]
    } else if (specialty === "Pediatric Dentist") {
      return ["Children's Cleanings", "Sealants", "Fillings", "Space Maintainers"]
    } else {
      return ["Preventive Care", "Chronic Disease Management", "Telehealth"]
    }
  }

  const mockProviders: Provider[] = [
    {
      id: `mock-${zipCode}-1`,
      name: "Dr. Jane Smith",
      specialty: providerSpecialty,
      rating: 4.8,
      reviewCount: 124,
      address: {
        full: `123 Main St, ${zipCode}`,
        city: "",
        state: "",
        zipCode: zipCode,
      },
      phone: "(555) 123-4567",
      isVerified: true,
      credentials: providerSpecialty.includes("Dentist") ? "DDS" : "MD",
      acceptsInsurance: true,
      services: getServices(providerSpecialty),
    },
    {
      id: `mock-${zipCode}-2`,
      name: "Dr. Michael Johnson",
      specialty: providerSpecialty,
      rating: 4.6,
      reviewCount: 98,
      address: {
        full: `456 Oak Ave, ${zipCode}`,
        city: "",
        state: "",
        zipCode: zipCode,
      },
      phone: "(555) 987-6543",
      isVerified: true,
      credentials: providerSpecialty.includes("Dentist") ? "DDS" : "MD",
      acceptsInsurance: true,
      services: getServices(providerSpecialty),
    },
    {
      id: `mock-${zipCode}-3`,
      name: providerSpecialty.includes("Dentist") ? "Dental Center" : "Medical Center",
      specialty: providerSpecialty.includes("Dentist") ? "Multi-specialty Dental Practice" : "Multi-specialty Practice",
      rating: 4.4,
      reviewCount: 215,
      address: {
        full: `789 Hospital Way, ${zipCode}`,
        city: "",
        state: "",
        zipCode: zipCode,
      },
      phone: "(555) 789-0123",
      isVerified: false,
      acceptsInsurance: true,
      services: providerSpecialty.includes("Dentist") 
        ? ["General Dentistry", "Cosmetic Dentistry", "Emergency Dental Care", "Dental X-rays"]
        : ["Urgent Care", "Primary Care", "Specialty Care", "Imaging"],
    },
    {
      id: `mock-${zipCode}-4`,
      name: "Dr. Sarah Williams",
      specialty: providerSpecialty,
      rating: 4.9,
      reviewCount: 156,
      address: {
        full: `567 Pine St, ${zipCode}`,
        city: "",
        state: "",
        zipCode: zipCode,
      },
      phone: "(555) 234-5678",
      isVerified: true,
      credentials: providerSpecialty.includes("Dentist") ? "DDS, MS" : "MD, PhD",
      acceptsInsurance: true,
      services: getServices(providerSpecialty),
    },
    {
      id: `mock-${zipCode}-5`,
      name: providerSpecialty.includes("Dentist") ? "Community Dental Clinic" : "Community Health Clinic",
      specialty: providerSpecialty.includes("Dentist") ? "General Dentistry" : "Primary Care",
      rating: 4.2,
      reviewCount: 89,
      address: {
        full: `890 Community Blvd, ${zipCode}`,
        city: "",
        state: "",
        zipCode: zipCode,
      },
      phone: "(555) 345-6789",
      isVerified: true,
      acceptsInsurance: true,
      services: providerSpecialty.includes("Dentist")
        ? ["Preventive Care", "Basic Restorative", "Emergency Care", "Dental Education"]
        : ["Preventive Care", "Vaccinations", "Health Screenings", "Wellness Programs"],
    },
  ]

  // If specialty is specified, filter the mock providers
  if (specialty && specialty !== "all") {
    return mockProviders.filter(
      (provider) =>
        provider.specialty.toLowerCase() === specialty.toLowerCase() ||
        provider.specialty === "Multi-specialty Practice" ||
        provider.specialty === "Primary Care",
    )
  }

  return mockProviders
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const zipCode = searchParams.get("zipCode")
  const specialty = searchParams.get("specialty") // e.g., "Cardiology"
  const radius = searchParams.get("radius") ? Number.parseInt(searchParams.get("radius")!) : 25

  if (!zipCode) {
    return NextResponse.json({ error: "Location (ZIP code or city) is required" }, { status: 400 })
  }

  try {
    // Step 1: Search for providers in the NPI registry
    let npiProviders: NPIProvider[] = []
    let usedMockData = false
    const npiSearchStats = {
      attempted: false,
      successful: false,
      resultCount: 0,
      error: null as string | null,
    }

    try {
      console.log(`Searching NPI registry for providers in location: ${zipCode}, specialty: ${specialty || "any"}`)
      npiSearchStats.attempted = true

      // Determine if the input is a ZIP code or city name
      const isZipCode = /^\d{5}(-\d{4})?$/.test(zipCode)
      
      // For city names, also try state abbreviations
      let searchParams: any = {}
      if (isZipCode) {
        searchParams.zip = zipCode
      } else {
        // Try to parse city, state
        const parts = zipCode.split(',').map(p => p.trim())
        if (parts.length >= 2) {
          searchParams.city = parts[0]
          searchParams.state = parts[1]
        } else {
          searchParams.city = zipCode
        }
      }

      if (specialty && specialty !== "all") {
        searchParams.taxonomy_description = specialty
      }

      searchParams.limit = 50

      const npiResponse = await searchNPIProviders(searchParams)

      npiProviders = npiResponse.results
      npiSearchStats.successful = true
      npiSearchStats.resultCount = npiResponse.result_count

      console.log(`NPI search successful. Found ${npiResponse.result_count} providers.`)

      if (npiProviders.length > 0) {
        const firstProvider = npiProviders[0]
        console.log(`First provider: ${firstProvider.basic.first_name} ${firstProvider.basic.last_name}`)
        console.log(`Taxonomies: ${firstProvider.taxonomies.map((t) => t.desc).join(", ")}`)
      }
    } catch (npiError) {
      console.error("Error searching NPI providers:", npiError)
      npiSearchStats.successful = false
      npiSearchStats.error = npiError instanceof Error ? npiError.message : "Unknown error"
      usedMockData = true
    }

    // Step 2: Create providers from NPI data with enhanced location information
    let providers: Provider[] = []

    if (npiProviders.length > 0) {
      providers = await Promise.all(npiProviders.map(async npiProvider => {
        const primaryAddress = npiProvider.addresses.find((a) => a.address_purpose === "LOCATION") || npiProvider.addresses[0]
        const primaryTaxonomy = npiProvider.taxonomies.find((t) => t.primary) || npiProvider.taxonomies[0]

        // Create the full address string for geocoding
        const fullAddress = `${primaryAddress.address_1}${primaryAddress.address_2 ? ", " + primaryAddress.address_2 : ""}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.postal_code}`

        // Get coordinates using Google Maps Geocoding API (with fallback)
        let coordinates = null
        try {
          if (process.env.GOOGLE_MAPS_API_KEY) {
            const geocodeResponse = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
            )
            const geocodeData = await geocodeResponse.json()
            
            if (geocodeData.results && geocodeData.results[0]) {
              coordinates = {
                latitude: geocodeData.results[0].geometry.location.lat,
                longitude: geocodeData.results[0].geometry.location.lng,
              }
            }
          } else {
            // Fallback coordinates for demonstration (Beverly Hills area)
            coordinates = {
              latitude: 34.0736 + (Math.random() - 0.5) * 0.05,
              longitude: -118.4004 + (Math.random() - 0.5) * 0.05,
            }
          }
        } catch (error) {
          console.error(`Error geocoding address for provider ${npiProvider.number}:`, error)
          // Fallback coordinates
          coordinates = {
            latitude: 34.0736 + (Math.random() - 0.5) * 0.05,
            longitude: -118.4004 + (Math.random() - 0.5) * 0.05,
          }
        }

        return {
          id: `npi-${npiProvider.number}`,
          name: `${npiProvider.basic.first_name || ''} ${npiProvider.basic.middle_name ? npiProvider.basic.middle_name + ' ' : ''}${npiProvider.basic.last_name || ''}${npiProvider.basic.credential ? ', ' + npiProvider.basic.credential : ''}`.trim() || `${npiProvider.basic.organization_name || 'Healthcare Provider'}`,
          specialty: primaryTaxonomy ? mapNPITaxonomyToSpecialty(primaryTaxonomy.desc) : "Healthcare Provider",
          address: {
            full: fullAddress,
            city: primaryAddress.city,
            state: primaryAddress.state,
            zipCode: primaryAddress.postal_code,
          },
          coordinates,
          phone: primaryAddress.telephone_number,
          npiNumber: npiProvider.number,
          credentials: npiProvider.basic.credential,
          isVerified: true,
          services: ["Preventive Care", "Chronic Disease Management"],
          rating: Math.round((Math.random() * 2 + 3.5) * 10) / 10, // Random rating between 3.5-5.0
          reviewCount: Math.floor(Math.random() * 200) + 20, // Random review count 20-220
        }
      }))
    }

    // Sort providers: verified first, then by name
    providers.sort((a, b) => {
      if (a.isVerified && !b.isVerified) return -1
      if (!a.isVerified && b.isVerified) return 1
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({
      providers,
      usedMockData,
      npiSearchStats,
      message: usedMockData ? "Some or all results are mock data due to API restrictions" : undefined,
    })
  } catch (error) {
    console.error("Error searching providers:", error)
    return NextResponse.json({
      error: "An error occurred while searching for providers",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}
