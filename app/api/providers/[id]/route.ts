import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import providerSearchService from "@/lib/provider-search-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    logger.info(`Provider details request for ID: ${id}`)

    const provider = await providerSearchService.getProviderById(id)

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    return NextResponse.json({ provider })
  } catch (error) {
    logger.error(`Error in provider details API for ID: ${params.id}`, error)
    return NextResponse.json({ error: "Failed to get provider details" }, { status: 500 })
  }
}
