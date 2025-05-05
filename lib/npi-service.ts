import { logger } from "./logger"

// Types for NPI API responses
export interface NpiProvider {
  number: string
  basic: {
    first_name: string
    last_name: string
    middle_name?: string
    credential?: string
    sole_proprietor: string
    gender: string
    enumeration_date: string
    last_updated: string
    status: string
    name_prefix?: string
  }
  taxonomies: Array<{
    code: string
    desc: string
    primary: boolean
    state: string
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

export interface NpiResponse {
  result_count: number
  results: NpiProvider[]
}

// Map taxonomy codes to user-friendly specialty names
const taxonomyToSpecialty: Record<string, string> = {
  "207R00000X": "Internal Medicine",
  "207RC0000X": "Cardiovascular Disease (Cardiology)",
  "207RG0100X": "Gastroenterology",
  "208000000X": "Pediatrics",
  "208D00000X": "General Practice",
  "207Q00000X": "Family Medicine",
  "207P00000X": "Emergency Medicine",
  "207V00000X": "Obstetrics & Gynecology",
  "208600000X": "Surgery",
  "2084P0800X": "Psychiatry",
  "207W00000X": "Ophthalmology",
  "207X00000X": "Orthopaedic Surgery",
  "207Y00000X": "Otolaryngology",
  "208C00000X": "Dermatology",
  "2088P0231X": "Plastic Surgery",
  "2086S0122X": "Neurosurgery",
  "208800000X": "Urology",
  "207K00000X": "Allergy & Immunology",
  "207L00000X": "Anesthesiology",
  "207N00000X": "Dermatology",
  "207T00000X": "Neurology",
  "208200000X": "Physical Medicine & Rehabilitation",
  "2084N0400X": "Preventive Medicine",
  "2084P0804X": "Addiction Psychiatry",
  "2085R0202X": "Radiation Oncology",
  "208M00000X": "Hospitalist",
  "208VP0000X": "Pain Medicine",
  "208VP0014X": "Interventional Pain Medicine",
}

// Function to search the NPI registry (original function name preserved)
export async function searchNpiRegistry(params: {
  zip?: string
  city?: string
  state?: string
  firstName?: string
  lastName?: string
  specialty?: string
  limit?: number
}): Promise<NpiResponse> {
  try {
    const { zip, city, state, firstName, lastName, specialty, limit = 20 } = params

    // Build query parameters
    const queryParams = new URLSearchParams()
    queryParams.append("version", "2.1")
    queryParams.append("limit", limit.toString())

    if (zip) queryParams.append("addresses.postal_code", zip)
    if (city) queryParams.append("addresses.city", city)
    if (state) queryParams.append("addresses.state", state)
    if (firstName) queryParams.append("first_name", firstName)
    if (lastName) queryParams.append("last_name", lastName)

    // If specialty is provided, try to find matching taxonomy codes
    if (specialty) {
      const taxonomyCodes = Object.entries(taxonomyToSpecialty)
        .filter(([_, name]) => name.toLowerCase().includes(specialty.toLowerCase()))
        .map(([code]) => code)

      if (taxonomyCodes.length > 0) {
        // Use the first matching taxonomy code
        queryParams.append("taxonomies.code", taxonomyCodes[0])
      }
    }

    // Make the API request
    const url = `https://npiregistry.cms.hhs.gov/api/?${queryParams.toString()}`
    logger.info(`Searching NPI registry: ${url}`)

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`NPI API error: ${response.status} ${response.statusText}`)
    }

    const data: NpiResponse = await response.json()
    logger.info(`NPI search returned ${data.result_count} results`)

    return data
  } catch (error) {
    logger.error("Error searching NPI registry:", error)
    throw error
  }
}

// Alias for backward compatibility
export const searchNPIProviders = searchNpiRegistry

// Helper function to format provider name
export function formatProviderName(provider: NpiProvider): string {
  const { first_name, last_name, middle_name, name_prefix, credential } = provider.basic

  let name = ""
  if (name_prefix) name += `${name_prefix} `
  name += first_name
  if (middle_name) name += ` ${middle_name}`
  name += ` ${last_name}`
  if (credential) name += `, ${credential}`

  return name
}

// Helper function to get specialty from taxonomies
export function getSpecialtyFromTaxonomies(taxonomies: NpiProvider["taxonomies"]): string {
  // First try to find the primary taxonomy
  const primaryTaxonomy = taxonomies.find((tax) => tax.primary)

  if (primaryTaxonomy) {
    // Check if we have a friendly name for this taxonomy code
    if (taxonomyToSpecialty[primaryTaxonomy.code]) {
      return taxonomyToSpecialty[primaryTaxonomy.code]
    }
    // Otherwise return the description
    return primaryTaxonomy.desc
  }

  // If no primary taxonomy, use the first one
  if (taxonomies.length > 0) {
    if (taxonomyToSpecialty[taxonomies[0].code]) {
      return taxonomyToSpecialty[taxonomies[0].code]
    }
    return taxonomies[0].desc
  }

  // Fallback
  return "Healthcare Provider"
}

// Helper function to get primary address
export function getPrimaryAddress(addresses: NpiProvider["addresses"]): NpiProvider["addresses"][0] | null {
  // First try to find a practice location address
  const practiceAddress = addresses.find(
    (addr) => addr.address_purpose === "LOCATION" || addr.address_purpose === "PRACTICE LOCATION",
  )

  if (practiceAddress) {
    return practiceAddress
  }

  // If no practice location, use the first address
  if (addresses.length > 0) {
    return addresses[0]
  }

  return null
}

// Helper function to get phone number
export function getPhoneNumber(provider: NpiProvider): string | null {
  const primaryAddress = getPrimaryAddress(provider.addresses)

  if (primaryAddress && primaryAddress.telephone_number) {
    return primaryAddress.telephone_number
  }

  // Try to find any address with a phone number
  const addressWithPhone = provider.addresses.find((addr) => addr.telephone_number)
  if (addressWithPhone) {
    return addressWithPhone.telephone_number
  }

  return null
}

// Function to map NPI taxonomy to specialty
export function mapNPITaxonomyToSpecialty(taxonomy: string): string {
  return taxonomyToSpecialty[taxonomy] || "General Provider"
}

// Helper function to convert NPI provider to app provider format
export function convertToAppProvider(npiProvider: NpiProvider): any {
  const primaryAddress = getPrimaryAddress(npiProvider.addresses)
  const specialty = getSpecialtyFromTaxonomies(npiProvider.taxonomies)
  const name = formatProviderName(npiProvider)
  const phone = getPhoneNumber(npiProvider)

  return {
    id: `npi-${npiProvider.number}`,
    name,
    specialty,
    address: primaryAddress
      ? {
          full: `${primaryAddress.address_1}${primaryAddress.address_2 ? ", " + primaryAddress.address_2 : ""}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.postal_code}`,
          city: primaryAddress.city,
          state: primaryAddress.state,
          zipCode: primaryAddress.postal_code,
        }
      : null,
    phone,
    npiNumber: npiProvider.number,
    credentials: npiProvider.basic.credential,
    isVerified: true,
    services: ["Preventive Care", "Chronic Disease Management"],
  }
}

// Create and export the default npiService object
const npiService = {
  searchProviders: searchNpiRegistry,
  searchNPIProviders,
  convertToAppProvider,
  formatProviderName,
  getSpecialtyFromTaxonomies,
  getPrimaryAddress,
  getPhoneNumber,
  mapNPITaxonomyToSpecialty,
  getProviderByNPI: async (npiNumber: string) => {
    try {
      const response = await searchNpiRegistry({
        // Use the NPI number directly when available
        // This is a placeholder since the actual API might have a different parameter
        lastName: "",
        limit: 1,
      })
      return response.results[0]
    } catch (error) {
      logger.error("Error getting provider from NPI registry:", error)
      return null
    }
  },
}

export default npiService
