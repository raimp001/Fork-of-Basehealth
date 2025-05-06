import { type NextRequest, NextResponse } from "next/server"
import { providerSearchService } from "@/lib/provider-search-service"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const providerId = params.id
    logger.info(`Getting provider details for ID: ${providerId}`)

    const provider = await providerSearchService.getProviderById(providerId)

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    return NextResponse.json({ provider })
  } catch (error) {
    logger.error(`Error getting provider details for ID: ${params.id}`, error)
    return NextResponse.json({ error: "Failed to get provider details" }, { status: 500 })
  }
}
