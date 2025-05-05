import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import providerSearchService from "@/lib/provider-search-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get("name") || undefined
    const specialty = searchParams.get("specialty") || undefined
    const location = searchParams.get("location") || undefined
    const zipCode = searchParams.get("zipCode") || undefined
    const state = searchParams.get("state") || undefined
    const city = searchParams.get("city") || undefined
    const distance = searchParams.get("distance") ? Number.parseInt(searchParams.get("distance")!) : undefined
    const page = searchParams.get("page") ? Number.parseInt(searchParams.get("page")!) : 1
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 10

    logger.info("Provider search request", { name, specialty, location, zipCode, state, city, distance, page, limit })

    const providers = await providerSearchService.searchProviders({
      name,
      specialty,
      location,
      zipCode,
      state,
      city,
      distance,
      page,
      limit,
    })

    return NextResponse.json({ providers })
  } catch (error) {
    logger.error("Error in provider search API", error)
    return NextResponse.json({ error: "Failed to search providers" }, { status: 500 })
  }
}
