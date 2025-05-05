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
  ]

  const providerSpecialty =
    specialty && specialty !== "all" ? specialty : specialties[Math.floor(Math.random() * specialties.length)]

  const mockProviders: Provider[] = [
    {
      id: `mock-${zipCode}-1`,
      name: "Dr. Jane Smith",
      specialty: providerSpecialty,
      rating: 4.8,
      reviewCount: 124,
      address: {
        full: `123 Main St, Anytown, NY ${zipCode}`,
        city: "Anytown",
        state: "NY",
        zipCode: zipCode,
      },
      phone: "(555) 123-4567",
      isVerified: true,
      credentials: "MD",
      acceptsInsurance: true,
      services: ["Preventive Care", "Chronic Disease Management", "Telehealth"],
    },
    {
      id: `mock-${zipCode}-2`,
      name: "Dr. Michael Johnson",
      specialty: providerSpecialty,
      rating: 4.6,
      reviewCount: 98,
      address: {
        full: `456 Oak Ave, Anytown, NY ${zipCode}`,
        city: "Anytown",
        state: "NY",
        zipCode: zipCode,
      },
      phone: "(555) 987-6543",
      isVerified: true,
      credentials: "MD",
      acceptsInsurance: true,
      services: ["Preventive Care", "Chronic Disease Management", "Telehealth"],
    },
    {
      id: `mock-${zipCode}-3`,
      name: "Anytown Medical Center",
      specialty: "Multi-specialty Practice",
      rating: 4.4,
      reviewCount: 215,
      address: {
        full: `789 Hospital Way, Anytown, NY ${zipCode}`,
        city: "Anytown",
        state: "NY",
        zipCode: zipCode,
      },
      phone: "(555) 789-0123",
      isVerified: false,
      acceptsInsurance: true,
      services: ["Urgent Care", "Primary Care", "Specialty Care", "Imaging"],
    },
    {
      id: `mock-${zipCode}-4`,
      name: "Dr. Sarah Williams",
      specialty: providerSpecialty,
      rating: 4.9,
      reviewCount: 156,
      address: {
        full: `567 Pine St, Anytown, NY ${zipCode}`,
        city: "Anytown",
        state: "NY",
        zipCode: zipCode,
      },
      phone: "(555) 234-5678",
      isVerified: true,
      credentials: "MD, PhD",
      acceptsInsurance: true,
      services: ["Preventive Care", "Chronic Disease Management", "Telehealth"],
    },
    {
      id: `mock-${zipCode}-5`,
      name: "Community Health Clinic",
      specialty: "Primary Care",
      rating: 4.2,
      reviewCount: 89,
      address: {
        full: `890 Community Blvd, Anytown, NY ${zipCode}`,
        city: "Anytown",
        state: "NY",
        zipCode: zipCode,
      },
      phone: "(555) 345-6789",
      isVerified: true,
      acceptsInsurance: true,
      services: ["Preventive Care", "Vaccinations", "Health Screenings", "Wellness Programs"],
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
    return NextResponse.json({ error: "ZIP code is required" }, { status: 400 })
  }

  try {
    // Skip Google Maps API calls due to referer restrictions
    console.log("Skipping Google Maps API calls due to referer restrictions")

    // Step 1: Search for providers in the NPI registry using the ZIP code
    let npiProviders: NPIProvider[] = []
    let usedMockData = false
    const npiSearchStats = {
      attempted: false,
      successful: false,
      resultCount: 0,
      error: null as string | null,
    }

    try {
      console.log(`Searching NPI registry for providers in ZIP: ${zipCode}, specialty: ${specialty || "any"}`)
      npiSearchStats.attempted = true

      const npiResponse = await searchNPIProviders({
        zip: zipCode,
        taxonomy_description: specialty || undefined,
        limit: 50,
      })

      npiProviders = npiResponse.results
      npiSearchStats.successful = true
      npiSearchStats.resultCount = npiResponse.result_count

      console.log(`NPI search successful. Found ${npiResponse.result_count} providers.`)

      if (npiProviders.length > 0) {
        console.log(`First provider: ${npiProviders[0].basic.first_name} ${npiProviders[0].basic.last_name}`)
        console.log(`Taxonomies: ${npiProviders[0].taxonomies.map((t) => t.desc).join(", ")}`)
      }
    } catch (npiError) {
      console.error("Error searching NPI providers:", npiError)
      npiSearchStats.successful = false
      npiSearchStats.error = npiError instanceof Error ? npiError.message : "Unknown error"
      // Continue with mock data only
      usedMockData = true
    }

    // Step 2: Create providers from NPI data
    let providers: Provider[] = []

    if (npiProviders.length > 0) {
      // Create providers from NPI data
      for (const npiProvider of npiProviders) {
        const primaryAddress =
          npiProvider.addresses.find((a) => a.address_purpose === "LOCATION") || npiProvider.addresses[0]
        const primaryTaxonomy = npiProvider.taxonomies.find((t) => t.primary) || npiProvider.taxonomies[0]

        const provider: Provider = {
          id: `npi-${npiProvider.number}`,
          name: `${npiProvider.basic.first_name} ${npiProvider.basic.middle_name ? npiProvider.basic.middle_name + " " : ""}${npiProvider.basic.last_name}${npiProvider.basic.credential ? ", " + npiProvider.basic.credential : ""}`,
          specialty: primaryTaxonomy ? mapNPITaxonomyToSpecialty(primaryTaxonomy.desc) : "Healthcare Provider",
          address: {
            full: `${primaryAddress.address_1}${primaryAddress.address_2 ? ", " + primaryAddress.address_2 : ""}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.postal_code}`,
            city: primaryAddress.city,
            state: primaryAddress.state,
            zipCode: primaryAddress.postal_code,
          },
          phone: primaryAddress.telephone_number,
          npiNumber: npiProvider.number,
          credentials: npiProvider.basic.credential,
          isVerified: true,
          services: ["Preventive Care", "Chronic Disease Management"],
        }

        providers.push(provider)
      }
    }

    // Step 3: If no providers found or very few, add mock data
    if (providers.length < 3) {
      usedMockData = true

      // Try to get providers from mock DB first
      try {
        let mockDbProviders = await db.getAllProviders()

        // Filter by zipCode if provided
        if (zipCode) {
          mockDbProviders = mockDbProviders.filter((p) => p.address.zipCode.startsWith(zipCode.substring(0, 1)))
        }

        // Filter by specialty if provided
        if (specialty && specialty !== "all") {
          mockDbProviders = mockDbProviders.filter((p) => p.specialty.toLowerCase().includes(specialty.toLowerCase()))
        }

        if (mockDbProviders.length > 0) {
          providers = [...providers, ...mockDbProviders]
        } else {
          // Generate mock providers if mock DB doesn't have enough
          const generatedMockProviders = generateMockProviders(zipCode, specialty || undefined)
          providers = [...providers, ...generatedMockProviders]
        }
      } catch (mockDbError) {
        console.error("Error getting mock providers:", mockDbError)

        // Generate mock providers as last resort
        const generatedMockProviders = generateMockProviders(zipCode, specialty || undefined)
        providers = [...providers, ...generatedMockProviders]
      }
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

    // Return mock data on error
    const mockProviders = generateMockProviders(zipCode, specialty || undefined)

    return NextResponse.json({
      providers: mockProviders,
      usedMockData: true,
      message: "An error occurred while searching for providers. Showing mock data instead.",
      errorDetails: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
