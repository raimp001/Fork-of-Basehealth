import db from "@/lib/mock-db"
import type { Provider } from "@/types/user"
import { logger } from "./logger"
import npiService from "./npi-service"
import { searchProviders as searchProvidersFromAiService } from "@/lib/ai-service"

export async function getProviderById(providerId: string): Promise<Provider | null> {
  return await db.getProviderById(providerId)
}

export async function searchProviders(options: {
  zipCode?: string
  location?: string
  providerType?: "physician" | "np" | "pa" | "acupuncturist" | "dentist"
  specialty?: string
  useNPI?: boolean
  useAI?: boolean
}): Promise<Provider[]> {
  try {
    logger.info(`Searching providers with options: ${JSON.stringify(options)}`)

    if (options.useNPI) {
      logger.info("Searching providers via NPI API")
      const npiParams = {
        zip: options.zipCode,
        city: options.location,
        specialty: options.specialty,
      }

      const npiProviders = await npiService.searchProviders(npiParams)

      if (npiProviders && npiProviders.results.length > 0) {
        logger.info(`Found ${npiProviders.results.length} real providers from NPI API`)
        return npiProviders.results.map((p) => npiService.convertToAppProvider(p))
      }
    }

    if (options.useAI) {
      logger.info("Searching providers via AI Service")
      const aiProviders = await searchProvidersFromAiService(options.zipCode || "", options.specialty)
      return aiProviders
    }

    // If no NPI providers found, use mock data
    logger.info("No NPI providers found, using mock data")
    let mockProviders = await db.getAllProviders()

    // Filter by zipCode if provided
    if (options.zipCode) {
      mockProviders = mockProviders.filter((p) => p.address.zipCode.startsWith(options.zipCode!.substring(0, 1)))
    }

    // Filter by specialty if provided
    if (options.specialty) {
      mockProviders = mockProviders.filter((p) => p.specialty.toLowerCase().includes(options.specialty!.toLowerCase()))
    }

    return mockProviders
  } catch (error) {
    logger.error("Error searching providers:", error)
    return []
  }
}
