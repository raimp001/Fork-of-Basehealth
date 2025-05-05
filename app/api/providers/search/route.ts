import { type NextRequest, NextResponse } from "next/server"
import { searchProviders } from "@/lib/provider-search-service"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const params = {
      zip: searchParams.get("zip") || undefined,
      city: searchParams.get("city") || undefined,
      state: searchParams.get("state") || undefined,
      specialty: searchParams.get("specialty") || undefined,
      firstName: searchParams.get("firstName") || undefined,
      lastName: searchParams.get("lastName") || undefined,
      distance: searchParams.has("distance") ? Number.parseInt(searchParams.get("distance") as string, 10) : undefined,
      limit: searchParams.has("limit") ? Number.parseInt(searchParams.get("limit") as string, 10) : undefined,
    }

    logger.info(`Provider search API called with params: ${JSON.stringify(params)}`)

    const providers = await searchProviders(params)

    return NextResponse.json({ providers })
  } catch (error) {
    logger.error("Error in provider search API:", error)
    return NextResponse.json({ error: "Failed to search providers" }, { status: 500 })
  }
}
