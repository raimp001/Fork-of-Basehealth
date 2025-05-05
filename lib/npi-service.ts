import axios from "axios"
import { logger } from "@/lib/logger"

// Type definitions
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
    address_1: string
    address_2?: string
    city: string
    state: string
    postal_code: string
    country_code: string
    telephone_number?: string
    fax_number?: string
    address_type: string
  }>
  practice_locations?: Array<{
    address_1: string
    address_2?: string
    city: string
    state: string
    postal_code: string
    country_code: string
    telephone_number?: string
  }>
  identifiers?: Array<{
    identifier: string
    code: string
    desc: string
    state?: string
    issuer?: string
  }>
}

export interface NpiResponse {
  result_count: number
  results: NpiProvider[]
}

// Map taxonomy codes to specialties
const taxonomyToSpecialty: Record<string, string> = {
  "207R00000X": "Internal Medicine",
  "207Q00000X": "Family Medicine",
  "208000000X": "Pediatrics",
  "2084P0800X": "Psychiatry",
  "2085R0202X": "Radiology",
  "208600000X": "Surgery",
  "208C00000X": "Obstetrics & Gynecology",
}

// Main function to search NPI registry
export async function searchNPIProviders(params: {
  zip?: string
  taxonomy_description?: string
  first_name?: string
  last_name?: string
  limit?: number
  providerType?: string
  state?: string
}): Promise<NpiResponse> {
  try {
    const { zip, taxonomy_description, first_name, last_name, limit = 10, state } = params

    // Build query parameters
    const queryParams: Record<string, string> = {
      version: "2.1",
      limit: limit.toString(),
    }

    if (zip) queryParams.postal_code = zip
    if (first_name) queryParams.first_name = first_name
    if (last_name) queryParams.last_name = last_name
    if (taxonomy_description) queryParams.taxonomy_description = taxonomy_description
    if (state) queryParams.state = state

    // Make the API request
    logger.info(`Searching NPI registry with params: ${JSON.stringify(queryParams)}`)
    const response = await axios.get("https://npiregistry.cms.hhs.gov/api/", {
      params: queryParams,
      timeout: 5000, // 5 second timeout
    })

    return response.data as NpiResponse
  } catch (error: any) {
    logger.error("Error searching NPI registry:", error)
    throw new Error(`NPI search failed: ${error.message}`)
  }
}

// Helper function to map NPI taxonomy to specialty
export function mapNPITaxonomyToSpecialty(taxonomy: string): string {
  return taxonomyToSpecialty[taxonomy] || taxonomy
}

// Helper function to convert NPI provider to app provider
export function convertToAppProvider(npiProvider: NpiProvider): any {
  const primaryAddress = npiProvider.addresses.find((a) => a.address_purpose === "LOCATION") || npiProvider.addresses[0]
  const primaryTaxonomy = npiProvider.taxonomies.find((t) => t.primary) || npiProvider.taxonomies[0]

  return {
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
}

const npiService = {
  searchProviders: searchNPIProviders,
  convertToAppProvider,
  getProviderByNPI: async (npiNumber: string) => {
    try {
      const response = await searchNPIProviders({
        last_name: "",
        limit: 1,
      })
      return response.results[0]
    } catch (error) {
      console.error("Error getting provider from NPI registry:", error)
      return null
    }
  },
}

export default npiService
