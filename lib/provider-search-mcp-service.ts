import { MCPClient } from "@modelcontextprotocol/sdk"
import type { Provider } from "@/types/user"
import { searchProviders } from "@/lib/provider-search-service"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Initialize the MCP client
const mcpClient = new MCPClient({
  apiKey: process.env.MCP_API_KEY || "",
})

interface BlockchainProviderInfo {
  walletAddress: string
  transactionCount?: number
  acceptsCrypto: boolean
  verifiedOnChain: boolean
  recentTransactions?: any[]
  averageResponseTime?: number
  cryptoPaymentDiscount?: number
}

export interface EnhancedProvider extends Provider {
  blockchain?: BlockchainProviderInfo
}

export async function searchProvidersWithBlockchainContext(params: {
  zipCode?: string
  specialty?: string
  location?: string
  acceptsCrypto?: boolean
  hasVerifiedWallet?: boolean
  query?: string
}): Promise<EnhancedProvider[]> {
  try {
    // First, get regular providers using the existing service
    const providers = await searchProviders({
      zipCode: params.zipCode,
      specialty: params.specialty,
      location: params.location,
    })

    // If no providers found, return empty array
    if (!providers || providers.length === 0) {
      return []
    }

    // Enhance providers with blockchain data
    const enhancedProviders = await Promise.all(
      providers.map(async (provider) => {
        // Skip providers without wallet addresses
        if (!provider.walletAddress) {
          return {
            ...provider,
            blockchain: {
              walletAddress: "",
              acceptsCrypto: false,
              verifiedOnChain: false,
            },
          }
        }

        try {
          // Get blockchain context for the provider's wallet
          const blockchainContext = await mcpClient.getContext({
            type: "wallet",
            address: provider.walletAddress,
            chain: "base",
          })

          // Extract relevant blockchain data
          const blockchainInfo: BlockchainProviderInfo = {
            walletAddress: provider.walletAddress,
            transactionCount: blockchainContext?.transactionCount || 0,
            acceptsCrypto: true,
            verifiedOnChain: blockchainContext?.isVerified || false,
            recentTransactions: blockchainContext?.recentTransactions || [],
            averageResponseTime: Math.floor(Math.random() * 30) + 5, // Simulated for now
            cryptoPaymentDiscount: Math.floor(Math.random() * 10) + 5, // Simulated for now
          }

          return {
            ...provider,
            blockchain: blockchainInfo,
          }
        } catch (error) {
          console.error(`Error getting blockchain data for provider ${provider.id}:`, error)
          return {
            ...provider,
            blockchain: {
              walletAddress: provider.walletAddress || "",
              acceptsCrypto: provider.acceptedCryptocurrencies?.length > 0,
              verifiedOnChain: false,
            },
          }
        }
      }),
    )

    // If there's a search query, use AI to rank providers based on the query and blockchain data
    if (params.query) {
      return rankProvidersWithAI(enhancedProviders, params.query)
    }

    // Filter by blockchain criteria if specified
    let filteredProviders = enhancedProviders

    if (params.acceptsCrypto) {
      filteredProviders = filteredProviders.filter((p) => p.blockchain?.acceptsCrypto)
    }

    if (params.hasVerifiedWallet) {
      filteredProviders = filteredProviders.filter((p) => p.blockchain?.verifiedOnChain)
    }

    return filteredProviders
  } catch (error) {
    console.error("Error searching providers with blockchain context:", error)
    return []
  }
}

async function rankProvidersWithAI(providers: EnhancedProvider[], query: string): Promise<EnhancedProvider[]> {
  try {
    // Create a prompt for the AI to rank providers
    const prompt = `
      You are a healthcare provider search expert with blockchain knowledge.
      Rank the following providers based on how well they match this search query: "${query}"
      
      Consider both traditional healthcare criteria and blockchain/crypto factors.
      
      Providers:
      ${JSON.stringify(
        providers.map((p) => ({
          id: p.id,
          name: p.name,
          specialty: p.specialty,
          services: p.services,
          acceptsCrypto: p.blockchain?.acceptsCrypto,
          verifiedOnChain: p.blockchain?.verifiedOnChain,
          transactionCount: p.blockchain?.transactionCount,
          cryptoPaymentDiscount: p.blockchain?.cryptoPaymentDiscount,
        })),
      )}
      
      Return a JSON array of provider IDs in order of relevance (most relevant first).
      Format: ["provider-id-1", "provider-id-2", ...]
    `

    // Generate text with OpenAI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.2,
      response_format: { type: "json_object" },
    })

    // Parse the AI response
    const rankedIds = JSON.parse(text)

    // Sort providers based on the AI ranking
    const providerMap = new Map(providers.map((p) => [p.id, p]))
    const rankedProviders: EnhancedProvider[] = []

    // Add providers in the order specified by the AI
    for (const id of rankedIds) {
      const provider = providerMap.get(id)
      if (provider) {
        rankedProviders.push(provider)
        providerMap.delete(id)
      }
    }

    // Add any remaining providers that weren't ranked by the AI
    for (const provider of providerMap.values()) {
      rankedProviders.push(provider)
    }

    return rankedProviders
  } catch (error) {
    console.error("Error ranking providers with AI:", error)
    return providers
  }
}
