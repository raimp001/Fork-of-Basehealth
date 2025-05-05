import { logger } from "./logger"

// Define the NPI provider interface
export interface NpiProvider {
  number: string
  basic: {
    first_name: string
    last_name: string
    middle_name?: string
    name_prefix?: string
    credential?: string
    gender?: string
    enumeration_date?: string
    last_updated?: string
    status?: string
  }
  taxonomies: Array<{
    code: string
    desc: string
    primary?: boolean
    state?: string
    license?: string
  }>
  addresses: Array<{
    address_purpose: string
    address_type: string
    address_1: string
    address_2?: string
    city: string
    state: string
    postal_code: string
    telephone_number?: string
  }>
}

// Define the search parameters interface
export interface NpiSearchParams {
  first_name?: string
  last_name?: string
  organization_name?: string
  city?: string
  state?: string
  postal_code?: string
  zip?: string
  taxonomy_description?: string
  specialty?: string
  limit?: number
  skip?: number
}

// Mock NPI data for testing
const mockNpiData: NpiProvider[] = [
  {
    number: "1234567890",
    basic: {
      first_name: "John",
      last_name: "Smith",
      middle_name: "A",
      name_prefix: "Dr.",
      credential: "MD",
      gender: "M",
      enumeration_date: "2010-01-01",
      last_updated: "2022-01-01",
      status: "active",
    },
    taxonomies: [
      {
        code: "207R00000X",
        desc: "Internal Medicine",
        primary: true,
        state: "CA",
        license: "A12345",
      },
    ],
    addresses: [
      {
        address_purpose: "LOCATION",
        address_type: "DOM",
        address_1: "123 Medical Center Dr",
        address_2: "Suite 100",
        city: "San Francisco",
        state: "CA",
        postal_code: "94143",
        telephone_number: "(555) 123-4567",
      },
    ],
  },
  {
    number: "0987654321",
    basic: {
      first_name: "Sarah",
      last_name: "Johnson",
      credential: "MD",
      gender: "F",
      enumeration_date: "2012-05-15",
      last_updated: "2023-02-10",
      status: "active",
    },
    taxonomies: [
      {
        code: "207Q00000X",
        desc: "Family Medicine",
        primary: true,
        state: "CA",
        license: "B67890",
      },
    ],
    addresses: [
      {
        address_purpose: "LOCATION",
        address_type: "DOM",
        address_1: "456 Health Plaza",
        city: "San Francisco",
        state: "CA",
        postal_code: "94143",
        telephone_number: "(555) 987-6543",
      },
    ],
  },
]

// Helper functions
export function formatProviderName(provider: NpiProvider): string {
  const { first_name, middle_name, last_name, name_prefix, credential } = provider.basic
  let name = ""

  if (name_prefix) name += `${name_prefix} `
  name += `${first_name}`
  if (middle_name) name += ` ${middle_name}`
  name += ` ${last_name}`
  if (credential) name += `, ${credential}`

  return name
}

export function getSpecialtyFromTaxonomies(taxonomies: NpiProvider["taxonomies"]): string[] {
  if (!taxonomies || taxonomies.length === 0) return ["Healthcare Provider"]

  return taxonomies.map((taxonomy) => mapNPITaxonomyToSpecialty(taxonomy.desc))
}

export function getPrimaryAddress(addresses: NpiProvider["addresses"]): any {
  if (!addresses || addresses.length === 0) return null

  // Try to find a location address first
  const locationAddress = addresses.find((addr) => addr.address_purpose === "LOCATION")
  return locationAddress || addresses[0]
}

export function getPhoneNumber(provider: NpiProvider): string | undefined {
  const primaryAddress = getPrimaryAddress(provider.addresses)
  return primaryAddress?.telephone_number
}

export function mapNPITaxonomyToSpecialty(taxonomyDesc: string): string {
  // Map NPI taxonomy descriptions to more user-friendly specialty names
  const specialtyMap: Record<string, string> = {
    "Internal Medicine": "Internal Medicine",
    "Family Medicine": "Family Medicine",
    Pediatrics: "Pediatrics",
    "Obstetrics & Gynecology": "OB/GYN",
    Cardiology: "Cardiology",
    Dermatology: "Dermatology",
    "Psychiatry & Neurology": "Psychiatry",
    "Orthopedic Surgery": "Orthopedics",
    "General Surgery": "Surgery",
    Ophthalmology: "Ophthalmology",
    Urology: "Urology",
    Neurology: "Neurology",
    Gastroenterology: "Gastroenterology",
    "Allergy & Immunology": "Allergy & Immunology",
    Anesthesiology: "Anesthesiology",
    "Emergency Medicine": "Emergency Medicine",
    Endocrinology: "Endocrinology",
    "Hematology & Oncology": "Oncology",
    "Infectious Disease": "Infectious Disease",
    Nephrology: "Nephrology",
    "Pulmonary Disease": "Pulmonology",
    Rheumatology: "Rheumatology",
    "Physical Therapy": "Physical Therapy",
    "Occupational Therapy": "Occupational Therapy",
    Chiropractic: "Chiropractic",
    Podiatry: "Podiatry",
    Dentistry: "Dentistry",
  }

  return specialtyMap[taxonomyDesc] || taxonomyDesc
}

// NPI service
const npiService = {
  // Search for providers in the NPI registry
  searchNpiRegistry: async (params: NpiSearchParams): Promise<{ results: NpiProvider[]; result_count: number }> => {
    logger.info("Searching NPI registry with params:", params)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real implementation, this would call the NPPES API
    // For now, return mock data
    let filteredProviders = [...mockNpiData]

    // Filter by first name
    if (params.first_name) {
      const firstNameLower = params.first_name.toLowerCase()
      filteredProviders = filteredProviders.filter((provider) =>
        provider.basic.first_name.toLowerCase().includes(firstNameLower),
      )
    }

    // Filter by last name
    if (params.last_name) {
      const lastNameLower = params.last_name.toLowerCase()
      filteredProviders = filteredProviders.filter((provider) =>
        provider.basic.last_name.toLowerCase().includes(lastNameLower),
      )
    }

    // Filter by city
    if (params.city) {
      const cityLower = params.city.toLowerCase()
      filteredProviders = filteredProviders.filter((provider) =>
        provider.addresses.some((addr) => addr.city.toLowerCase().includes(cityLower)),
      )
    }

    // Filter by state
    if (params.state) {
      const stateLower = params.state.toLowerCase()
      filteredProviders = filteredProviders.filter((provider) =>
        provider.addresses.some((addr) => addr.state.toLowerCase() === stateLower),
      )
    }

    // Filter by ZIP code
    if (params.postal_code || params.zip) {
      const zipCode = params.postal_code || params.zip
      filteredProviders = filteredProviders.filter((provider) =>
        provider.addresses.some((addr) => addr.postal_code.startsWith(zipCode!)),
      )
    }

    // Filter by specialty or taxonomy description
    if (params.taxonomy_description || params.specialty) {
      const specialtyLower = (params.taxonomy_description || params.specialty)!.toLowerCase()
      filteredProviders = filteredProviders.filter((provider) =>
        provider.taxonomies.some((tax) => tax.desc.toLowerCase().includes(specialtyLower)),
      )
    }

    // Apply pagination
    const skip = params.skip || 0
    const limit = params.limit || 10
    const paginatedProviders = filteredProviders.slice(skip, skip + limit)

    return {
      results: paginatedProviders,
      result_count: filteredProviders.length,
    }
  },

  // Get a provider by NPI number
  getProviderByNPI: async (npiNumber: string): Promise<NpiProvider | null> => {
    logger.info(`Getting provider by NPI: ${npiNumber}`)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const provider = mockNpiData.find((p) => p.number === npiNumber)
    return provider || null
  },

  // Convert an NPI provider to the application's provider format
  convertToAppProvider: (npiProvider: NpiProvider): any => {
    const name = formatProviderName(npiProvider)
    const specialties = getSpecialtyFromTaxonomies(npiProvider.taxonomies)
    const primaryAddress = getPrimaryAddress(npiProvider.addresses)

    return {
      id: `npi-${npiProvider.number}`,
      name,
      specialty: specialties[0],
      address: {
        full: primaryAddress
          ? `${primaryAddress.address_1}${primaryAddress.address_2 ? `, ${primaryAddress.address_2}` : ""}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.postal_code}`
          : "",
        city: primaryAddress?.city || "",
        state: primaryAddress?.state || "",
        zipCode: primaryAddress?.postal_code || "",
      },
      phone: primaryAddress?.telephone_number,
      npiNumber: npiProvider.number,
      credentials: npiProvider.basic.credential,
      isVerified: true,
    }
  },

  // Search for providers with a simplified interface
  searchProviders: async (params: {
    zip?: string
    city?: string
    state?: string
    specialty?: string
    first_name?: string
    last_name?: string
    limit?: number
  }) => {
    return await npiService.searchNpiRegistry({
      postal_code: params.zip,
      city: params.city,
      state: params.state,
      taxonomy_description: params.specialty,
      first_name: params.first_name,
      last_name: params.last_name,
      limit: params.limit,
    })
  },
}

export default npiService
