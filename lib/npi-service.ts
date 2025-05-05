import { logger } from "./logger"

// Types for NPI Registry
export interface NpiProvider {
  number: string
  basic: {
    first_name: string
    last_name: string
    middle_name?: string
    name_prefix?: string
    credential?: string
    gender?: string
    sole_proprietor?: string
    enumeration_date?: string
    last_updated?: string
    status?: string
    name?: string
  }
  taxonomies: Array<{
    code: string
    desc: string
    primary: boolean
    state?: string
    license?: string
  }>
  addresses: Array<{
    country_code?: string
    country_name?: string
    address_purpose: string
    address_type: string
    address_1: string
    address_2?: string
    city: string
    state: string
    postal_code: string
    telephone_number?: string
    fax_number?: string
  }>
  practice_locations?: Array<{
    address_1: string
    address_2?: string
    city: string
    state: string
    postal_code: string
    country_code?: string
    country_name?: string
    telephone_number?: string
  }>
}

export interface NpiSearchParams {
  first_name?: string
  last_name?: string
  city?: string
  state?: string
  postal_code?: string
  taxonomy_description?: string
  limit?: number
  skip?: number
}

export interface NpiSearchResponse {
  result_count: number
  results: NpiProvider[]
}

// Helper functions for working with NPI data
export function formatProviderName(provider: NpiProvider): string {
  const { basic } = provider
  const prefix = basic.name_prefix ? `${basic.name_prefix} ` : ""
  const firstName = basic.first_name || ""
  const middleName = basic.middle_name ? ` ${basic.middle_name.charAt(0)}.` : ""
  const lastName = basic.last_name || ""
  const credential = basic.credential ? `, ${basic.credential}` : ""

  return `${prefix}${firstName}${middleName} ${lastName}${credential}`
}

export function getSpecialtyFromTaxonomies(taxonomies: NpiProvider["taxonomies"]): string {
  if (!taxonomies || taxonomies.length === 0) return "Unknown Specialty"

  // Try to find the primary taxonomy first
  const primaryTaxonomy = taxonomies.find((tax) => tax.primary)

  // If found, return its description
  if (primaryTaxonomy) return primaryTaxonomy.desc

  // Otherwise, return the first taxonomy's description
  return taxonomies[0].desc
}

export function getPrimaryAddress(addresses: NpiProvider["addresses"]): NpiProvider["addresses"][0] | null {
  if (!addresses || addresses.length === 0) return null

  // Try to find the practice location address
  const practiceAddress = addresses.find((addr) => addr.address_purpose === "LOCATION")

  // If found, return it
  if (practiceAddress) return practiceAddress

  // Otherwise, return the first address
  return addresses[0]
}

export function getPhoneNumber(provider: NpiProvider): string {
  const primaryAddress = getPrimaryAddress(provider.addresses)
  if (!primaryAddress || !primaryAddress.telephone_number) return "No phone number available"

  return primaryAddress.telephone_number
}

// Main NPI service
export const npiService = {
  searchNpiRegistry: async (params: NpiSearchParams): Promise<NpiSearchResponse> => {
    try {
      logger.info("Searching NPI Registry with params:", params)

      // In a real implementation, this would call the actual NPI Registry API
      // For now, we'll return mock data
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Generate some mock results based on the search parameters
      const mockResults: NpiProvider[] = Array(params.limit || 10)
        .fill(0)
        .map((_, index) => ({
          number: `${1000000000 + index}`,
          basic: {
            first_name: params.first_name || `Provider${index + 1}`,
            last_name: params.last_name || `LastName${index + 1}`,
            middle_name: "M",
            name_prefix: "Dr.",
            credential: "MD",
            gender: index % 2 === 0 ? "M" : "F",
            enumeration_date: "2020-01-01",
            last_updated: "2023-01-01",
            status: "active",
          },
          taxonomies: [
            {
              code: "207R00000X",
              desc: params.taxonomy_description || "Internal Medicine",
              primary: true,
              state: params.state || "CA",
              license: `LIC${1000 + index}`,
            },
          ],
          addresses: [
            {
              address_purpose: "LOCATION",
              address_type: "DOM",
              address_1: `${1000 + index} Medical Center Dr`,
              city: params.city || "San Francisco",
              state: params.state || "CA",
              postal_code: params.postal_code || "94143",
              telephone_number: `(555) ${100 + index}-${1000 + index}`,
            },
          ],
        }))

      return {
        result_count: mockResults.length,
        results: mockResults,
      }
    } catch (error) {
      logger.error("Error searching NPI Registry:", error)
      return {
        result_count: 0,
        results: [],
      }
    }
  },
}

// Export the service as default
export default npiService

// For backward compatibility
export const searchNpiRegistry = npiService.searchNpiRegistry
