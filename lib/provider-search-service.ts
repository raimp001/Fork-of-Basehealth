import { logger } from "./logger"
import npiService, {
  type NpiProvider,
  formatProviderName,
  getSpecialtyFromTaxonomies,
  getPrimaryAddress,
} from "./npi-service"

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
}

export interface Provider {
  id: string
  npi?: string
  name: string
  specialty: string
  address: string
  city: string
  state: string
  zipCode: string
  phoneNumber?: string
  acceptingNewPatients?: boolean
  distance?: number
  latitude?: number
  longitude?: number
  rating?: number
  reviewCount?: number
  imageUrl?: string
}

export const providerSearchService = {
  searchProviders: async (params: ProviderSearchParams): Promise<Provider[]> => {
    try {
      logger.info("Searching providers with params:", params)

      // Parse the name into first and last name (simple implementation)
      let firstName, lastName
      if (params.name) {
        const nameParts = params.name.split(" ")
        if (nameParts.length > 1) {
          firstName = nameParts[0]
          lastName = nameParts[nameParts.length - 1]
        } else {
          lastName = params.name
        }
      }

      // Search the NPI registry
      const npiResults = await npiService.searchNpiRegistry({
        first_name: firstName,
        last_name: lastName,
        city: params.city,
        state: params.state,
        postal_code: params.zipCode,
        taxonomy_description: params.specialty,
        limit: params.limit || 10,
        skip: ((params.page || 1) - 1) * (params.limit || 10),
      })

      // Convert NPI results to our Provider format
      const providers = npiResults.results.map(npiToProvider)

      return providers
    } catch (error) {
      logger.error("Error searching providers:", error)
      return []
    }
  },

  getProviderById: async (id: string): Promise<Provider | null> => {
    try {
      logger.info(`Getting provider by ID: ${id}`)

      // In a real implementation, this would fetch from a database or API
      // For now, we'll return mock data
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (id.startsWith("npi-")) {
        const npiNumber = id.replace("npi-", "")
        // This would be a real NPI lookup in production
        const mockNpiProvider: NpiProvider = {
          number: npiNumber,
          basic: {
            first_name: "John",
            last_name: "Doe",
            middle_name: "M",
            name_prefix: "Dr.",
            credential: "MD",
            gender: "M",
            enumeration_date: "2020-01-01",
            last_updated: "2023-01-01",
            status: "active",
          },
          taxonomies: [
            {
              code: "207R00000X",
              desc: "Internal Medicine",
              primary: true,
              state: "CA",
              license: "LIC1001",
            },
          ],
          addresses: [
            {
              address_purpose: "LOCATION",
              address_type: "DOM",
              address_1: "1000 Medical Center Dr",
              city: "San Francisco",
              state: "CA",
              postal_code: "94143",
              telephone_number: "(555) 100-1000",
            },
          ],
        }

        return npiToProvider(mockNpiProvider)
      }

      // Mock provider data
      return {
        id,
        name: "Dr. Jane Smith",
        specialty: "Cardiology",
        address: "123 Medical Plaza",
        city: "San Francisco",
        state: "CA",
        zipCode: "94143",
        phoneNumber: "(555) 123-4567",
        acceptingNewPatients: true,
        distance: 2.3,
        rating: 4.8,
        reviewCount: 124,
        imageUrl: "/caring-doctor.png",
      }
    } catch (error) {
      logger.error(`Error getting provider by ID: ${id}`, error)
      return null
    }
  },
}

// Helper function to convert NPI provider to our Provider format
function npiToProvider(npiProvider: NpiProvider): Provider {
  const name = formatProviderName(npiProvider)
  const specialty = getSpecialtyFromTaxonomies(npiProvider.taxonomies)
  const address = getPrimaryAddress(npiProvider.addresses)

  return {
    id: `npi-${npiProvider.number}`,
    npi: npiProvider.number,
    name,
    specialty,
    address: address ? address.address_1 : "",
    city: address ? address.city : "",
    state: address ? address.state : "",
    zipCode: address ? address.postal_code : "",
    phoneNumber: address?.telephone_number,
    acceptingNewPatients: Math.random() > 0.3, // Random for mock data
    rating: 3 + Math.random() * 2, // Random rating between 3-5
    reviewCount: Math.floor(Math.random() * 200), // Random review count
    imageUrl: "/caring-doctor.png",
  }
}

export default providerSearchService
