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
  specialty?: string
  firstName?: string
  lastName?: string
  limit?: number
}): Promise<NpiResponse> {
  try {
    const { zip, specialty, firstName, lastName, limit = 10 } = params

    // Build query parameters
    const queryParams: Record<string, string> = {
      version: "2.1",
      limit: limit.toString(),
    }

    if (zip) queryParams.postal_code = zip
    if (firstName) queryParams.first_name = firstName
    if (lastName) queryParams.last_name = lastName
    if (specialty) queryParams.taxonomy_description = specialty

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
