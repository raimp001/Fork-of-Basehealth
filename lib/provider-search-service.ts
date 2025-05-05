import { logger } from "./logger"
import type { Provider } from "@/types/user"
import npiService from "./npi-service"

export interface ProviderSearchParams {
  name?: string
  specialty?: string
  location?: string
  zipCode?: string
  state?: string
  city?: string
  distance?: number
  page?: number
  limit?: number
  coordinates?: {
    latitude: number
    longitude: number
  }
  radius?: number
  useNPI?: boolean
  useAI?: boolean
}

// Mock provider data
const mockProviders: Provider[] = [
  {
    id: "provider-1",
    name: "Dr. Jane Smith",
    specialty: "Cardiology",
    address: {
      full: "123 Medical Plaza, San Francisco, CA 94143",
      city: "San Francisco",
      state: "CA",
      zipCode: "94143",
    },
    phone: "(555) 123-4567",
    isVerified: true,
    rating: 4.8,
    reviewCount: 124,
    acceptedInsurance: ["Blue Cross", "Aetna", "UnitedHealthcare"],
    services: ["Preventive Care", "Chronic Disease Management", "Telehealth"],
  },
  {
    id: "provider-2",
    name: "Dr. Michael Johnson",
    specialty: "Family Medicine",
    address: {
      full: "456 Health Center Dr, San Francisco, CA 94143",
      city: "San Francisco",
      state: "CA",
      zipCode: "94143",
    },
    phone: "(555) 987-6543",
    isVerified: true,
    rating: 4.6,
    reviewCount: 98,
    acceptedInsurance: ["Blue Cross", "Aetna", "UnitedHealthcare"],
    services: ["Preventive Care", "Chronic Disease Management", "Telehealth"],
  },
]

// Provider search service
const providerSearchService = {
  // Search for providers based on various criteria
  searchProviders: async (params: ProviderSearchParams): Promise<Provider[]> => {
    logger.info("Searching providers with params:", params)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    let providers: Provider[] = []
    let usedMockData = false

    try {
      if (params.zipCode) {
        const npiResults = await npiService.searchProviders({
          zip: params.zipCode,
          specialty: params.specialty,
          limit: params.limit,
        })

        providers = npiResults.results.map((npiProvider) => npiService.convertToAppProvider(npiProvider))
      } else {
        providers = [...mockProviders]
        usedMockData = true
      }
    } catch (error) {
      logger.error("Error searching NPI registry:", error)
      providers = [...mockProviders]
      usedMockData = true
    }

    // Filter providers based on search parameters
    let filteredProviders = [...providers]

    // Filter by name
    if (params.name) {
      const nameLower = params.name.toLowerCase()
      filteredProviders = filteredProviders.filter((provider) => provider.name.toLowerCase().includes(nameLower))
    }

    // Filter by specialty
    if (params.specialty) {
      const specialtyLower = params.specialty.toLowerCase()
      filteredProviders = filteredProviders.filter((provider) =>
        provider.specialty.toLowerCase().includes(specialtyLower),
      )
    }

    // Apply distance filtering if coordinates and radius are provided
    if (params.coordinates && params.radius) {
      filteredProviders = filteredProviders.filter((provider) => {
        // Mock distance calculation for now
        const distance = Math.random() * 50 // Replace with actual distance calculation
        return distance <= params.radius!
      })
    }

    // Apply pagination
    const page = params.page || 1
    const limit = params.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    return filteredProviders.slice(startIndex, endIndex)
  },

  // Get a provider by ID
  getProviderById: async (id: string): Promise<Provider | null> => {
    logger.info(`Getting provider by ID: ${id}`)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const provider = mockProviders.find((p) => p.id === id)
    return provider || null
  },
}

export const searchProviders = providerSearchService.searchProviders
