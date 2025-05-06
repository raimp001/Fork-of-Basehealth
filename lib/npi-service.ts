import { logger } from "./logger"

// Mock data for providers
const mockProviders = [
  {
    id: "1234567890",
    name: "Dr. Jane Smith",
    specialty: "Family Medicine",
    address: "123 Main St, Anytown, USA",
    phone: "555-123-4567",
    accepting: true,
  },
  {
    id: "0987654321",
    name: "Dr. John Doe",
    specialty: "Cardiology",
    address: "456 Oak Ave, Somewhere, USA",
    phone: "555-987-6543",
    accepting: true,
  },
]

// Define the NPIProvider interface
export interface NPIProvider {
  number: string
  basic: {
    first_name: string
    last_name: string
    middle_name?: string
    credential?: string
  }
  addresses: any[]
  taxonomies: any[]
}

// NPI Service implementation
export const searchNPIProviders = async (params: any) => {
  logger.info("Searching NPI providers with params:", params)

  // Return mock data instead of making actual API calls
  return {
    result_count: mockProviders.length,
    results: mockProviders,
  }
}

export const formatProviderName = (name: any) => {
  if (!name) return "Unknown Provider"
  return `${name.first_name || ""} ${name.last_name || ""}`.trim()
}

export const getSpecialtyFromTaxonomies = (taxonomies: any[]) => {
  if (!taxonomies || !taxonomies.length) return "General Practice"
  return taxonomies[0]?.desc || "General Practice"
}

export const mapNPITaxonomyToSpecialty = (taxonomy: string) => {
  const taxonomyMap: { [key: string]: string } = {
    "Family Medicine": "Family Medicine",
    Cardiology: "Cardiology",
    "Internal Medicine": "Internal Medicine",
    "General Practice": "General Practice",
    "Physician Assistant": "Physician Assistant",
  }

  return taxonomyMap[taxonomy] || "General Practice"
}

// Create the npiService object with all methods
const npiService = {
  searchNpiRegistry: async (params: any) => {
    logger.info("Searching NPI registry with params:", params)
    return searchNPIProviders(params)
  },

  getProviderByNPI: async (npi: string) => {
    logger.info(`Getting provider by NPI: ${npi}`)
    const provider = mockProviders.find((p) => p.id === npi)
    return provider || null
  },

  convertToAppProvider: (npiProvider: any) => {
    return {
      id: npiProvider.id || "unknown",
      name: npiProvider.name || "Unknown Provider",
      specialty: npiProvider.specialty || "General Practice",
      address: npiProvider.address || "No address provided",
      phone: npiProvider.phone || "No phone provided",
      accepting: npiProvider.accepting !== false,
    }
  },

  searchProviders: async (params: any) => {
    logger.info("Searching providers with params:", params)
    return {
      providers: mockProviders,
      count: mockProviders.length,
    }
  },
}

// Export both the default export and named exports
export default npiService
export { npiService }
