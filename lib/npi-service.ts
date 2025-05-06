// File: lib/npi-service.ts

/**
 * Service for interacting with the National Provider Identifier (NPI) Registry API
 */

export interface NPIProvider {
  number: string
  basic: {
    first_name: string
    last_name: string
    middle_name?: string
    credential?: string
    gender?: string
    sole_proprietor?: string
    enumeration_date?: string
    last_updated?: string
  }
  taxonomies: Array<{
    code: string
    desc: string
    primary: boolean
    state?: string
    license?: string
  }>
  addresses: Array<{
    country_code: string
    country_name: string
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
  other_identifiers?: Array<{
    identifier: string
    code: string
    desc: string
    state?: string
    issuer?: string
  }>
  practice_locations?: Array<{
    address_1: string
    address_2?: string
    city: string
    state: string
    postal_code: string
    country_code: string
    country_name: string
    telephone_number?: string
  }>
}

/**
 * Search for providers in the NPI registry
 */
export async function searchNPIProviders(params: {
  name?: string
  first_name?: string
  last_name?: string
  city?: string
  state?: string
  zip?: string
  taxonomy_description?: string
  limit?: number
}): Promise<{
  result_count: number
  results: NPIProvider[]
}> {
  const baseUrl = "https://npiregistry.cms.hhs.gov/api/"

  // Create query parameters
  const queryParams = new URLSearchParams()

  // Required parameters
  queryParams.append("version", "2.1")
  queryParams.append("limit", params.limit?.toString() || "20")

  // Add optional parameters
  if (params.name) queryParams.append("name", params.name)
  if (params.first_name) queryParams.append("first_name", params.first_name)
  if (params.last_name) queryParams.append("last_name", params.last_name)
  if (params.city) queryParams.append("city", params.city)
  if (params.state) queryParams.append("state", params.state)
  if (params.zip) queryParams.append("postal_code", params.zip)
  if (params.taxonomy_description) queryParams.append("taxonomy_description", params.taxonomy_description)

  try {
    const response = await fetch(`${baseUrl}?${queryParams.toString()}`)

    if (!response.ok) {
      throw new Error(`NPI API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return {
      result_count: data.result_count || 0,
      results: data.results || [],
    }
  } catch (error) {
    console.error("Error searching NPI providers:", error)
    throw error
  }
}

/**
 * Map NPI provider specialty taxonomy to a readable specialty
 */
export function mapNPITaxonomyToSpecialty(taxonomyDescription: string): string {
  const specialtyMap: Record<string, string> = {
    "Internal Medicine": "Internal Medicine",
    "Family Medicine": "Family Medicine",
    Pediatrics: "Pediatrics",
    Cardiology: "Cardiology",
    Dermatology: "Dermatology",
    Gastroenterology: "Gastroenterology",
    Neurology: "Neurology",
    "Obstetrics & Gynecology": "Obstetrics & Gynecology",
    Oncology: "Oncology",
    Ophthalmology: "Ophthalmology",
    "Orthopedic Surgery": "Orthopedics",
    "Psychiatry & Neurology": "Psychiatry",
    Radiology: "Radiology",
    Surgery: "Surgery",
    Urology: "Urology",
    // Add more mappings as needed
  }

  // Try to find a match in our map
  for (const key in specialtyMap) {
    if (taxonomyDescription.includes(key)) {
      return specialtyMap[key]
    }
  }

  // If no match found, just return the taxonomy description
  return taxonomyDescription
}

// Add a default export that includes all named exports
const npiService = {
  searchNPIProviders,
  mapNPITaxonomyToSpecialty,
}

export default npiService
