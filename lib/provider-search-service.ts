import type { Provider } from "@/types/user"
import db from "@/lib/mock-db"
import npiService from "@/lib/npi-service"
import { searchProviders as searchProvidersNpi } from "@/lib/ai-service"

/**
 * Get provider by ID
 * @param providerId Provider ID
 * @returns Promise resolving to the provider or null if not found
 */
export async function getProviderById(providerId: string): Promise<Provider | null> {
  // First, try to get the provider from the mock database
  const mockProvider = await db.getProviderById(providerId)
  if (mockProvider) {
    return mockProvider
  }

  try {
    // If not found in mock database, try to get the provider from the NPI database
    if (providerId.startsWith("npi-")) {
      const npiNumber = providerId.substring(4)
      const npiProvider = await npiService.getProviderByNPI(npiNumber)
      if (npiProvider) {
        return npiService.convertToAppProvider(npiProvider)
      }
    }
  } catch (error) {
    console.error("Error getting provider from NPI database:", error)
  }

  return null
}

export async function searchProviders(options: {
  zipCode?: string
  specialty?: string
  coordinates?: { latitude: number; longitude: number }
  radius?: number
}): Promise<Provider[]> {
  return await searchProvidersNpi(options.zipCode || "", options.specialty)
}
