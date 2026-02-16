import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { rateLimit, getClientIdentifier } from "@/lib/rate-limiter"
import { apiCache, generateKey } from "@/lib/api-cache"
import {
  formatProviderName,
  getProviderSpecialty,
  searchProviders,
  searchProvidersBySpecialty,
  type NPIProvider,
} from "@/lib/npi-api"
import { calculateTrialDistance, convertZipToLocation } from "@/lib/geocoding"
import { parseNaturalLanguageQuery } from "@/lib/ai-service"
import { prisma } from "@/lib/prisma"

type ProviderSource = "basehealth" | "npi_registry" | "google_places"

type ProviderSearchResult = {
  id: string
  npi: string
  name: string
  specialty: string
  address: string
  city: string
  state: string
  zip: string
  distance: number | null
  rating: number | null
  reviewCount: number | null
  acceptingPatients: boolean | null
  phone: string
  credentials: string
  source: ProviderSource
  isVerified?: boolean
  hasCalendar?: boolean
}

function formatPhone(raw?: string | null): string {
  const value = (raw || "").replace(/\D/g, "")
  if (value.length === 10) return `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`
  return raw?.trim() || "Contact for availability"
}

function getPrimaryAddress(provider: NPIProvider) {
  return provider.addresses?.find((addr) => addr.address_purpose === "LOCATION") || provider.addresses?.[0]
}

function computeDistanceMiles(queryLocation: string, city: string, state: string): number | null {
  const loc = (queryLocation || "").trim()
  if (!loc) return null
  if (!city || !state) return null
  try {
    return calculateTrialDistance(loc, { city, state, country: "United States" })
  } catch {
    return null
  }
}

async function searchBaseHealthProviders(params: {
  specialty?: string
  state?: string
  limit: number
}): Promise<ProviderSearchResult[]> {
  const { specialty, state, limit } = params

  try {
    const where: any = {
      isVerified: true,
      status: "APPROVED",
    }

    if (specialty) {
      where.specialties = { hasSome: [specialty] }
    }

    if (state) {
      where.licenseState = { equals: state, mode: "insensitive" as const }
    }

    const providers = await prisma.provider.findMany({
      where,
      include: { user: true },
      take: limit,
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
    })

    return providers.map((p) => {
      const npi = p.npiNumber || p.id
      const displayName = p.fullName || p.user?.name || "Provider"

      // Best-effort parse of "City, ST" from provider.location (if present).
      let city = ""
      let stateFromLocation = ""
      const location = (p.location || "").trim()
      if (location.includes(",")) {
        const [maybeCity, maybeState] = location.split(",").map((part) => part.trim())
        city = maybeCity || ""
        stateFromLocation = (maybeState || "").slice(0, 2).toUpperCase()
      }

      const resolvedState = (p.licenseState || stateFromLocation || "").toUpperCase()

      return {
        id: p.id,
        npi,
        name: displayName,
        specialty: p.specialties?.[0] || "General Practice",
        address: location,
        city,
        state: resolvedState,
        zip: "",
        distance: null,
        rating: p.rating !== null && p.rating !== undefined ? Number(p.rating) : null,
        reviewCount: typeof p.reviewCount === "number" ? p.reviewCount : null,
        acceptingPatients: typeof p.acceptingPatients === "boolean" ? p.acceptingPatients : null,
        phone: p.phone || "Schedule through BaseHealth",
        credentials: p.professionType || "",
        source: "basehealth",
        isVerified: true,
        hasCalendar: false,
      }
    })
  } catch (error) {
    logger.warn("BaseHealth provider search failed", error)
    return []
  }
}

function mapNpiProvider(params: { provider: NPIProvider; queryLocation: string }): ProviderSearchResult {
  const { provider, queryLocation } = params

  const primaryAddress = getPrimaryAddress(provider)
  const city = primaryAddress?.city || ""
  const state = primaryAddress?.state || ""
  const zip = primaryAddress?.postal_code?.substring(0, 5) || ""
  const specialty = getProviderSpecialty(provider)

  return {
    id: provider.number,
    npi: provider.number,
    name: formatProviderName(provider),
    specialty,
    address: primaryAddress?.address_1 || "Address not available",
    city,
    state,
    zip,
    distance: computeDistanceMiles(queryLocation, city, state),
    rating: null, // NPI does not provide rating/reviews.
    reviewCount: null,
    acceptingPatients: null, // Unknown without additional data sources.
    phone: formatPhone(primaryAddress?.telephone_number),
    credentials: provider.basic?.credential || "",
    source: "npi_registry",
    isVerified: false,
    hasCalendar: false,
  }
}

async function searchNpi(params: {
  specialty?: string
  location: string
  limit: number
}): Promise<NPIProvider[]> {
  const { specialty, location, limit } = params
  const trimmedLocation = location.trim()
  const isZip = /^\d{5}(-\d{4})?$/.test(trimmedLocation)
  const { city, state } = convertZipToLocation(trimmedLocation)

  if (specialty) {
    if (isZip) {
      const response = await searchProviders({
        enumeration_type: "NPI-1",
        postal_code: trimmedLocation.slice(0, 5),
        taxonomy_description: specialty,
        limit,
      })
      return Array.isArray((response as any)?.results) ? (response as any).results : []
    }

    return await searchProvidersBySpecialty(specialty, city, state, limit)
  }

  const response = await searchProviders({
    enumeration_type: "NPI-1",
    ...(city ? { city } : {}),
    ...(state ? { state } : {}),
    ...(isZip ? { postal_code: trimmedLocation.slice(0, 5) } : {}),
    limit,
  })

  return Array.isArray((response as any)?.results) ? (response as any).results : []
}

export async function GET(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request)
    const rateLimitResult = rateLimit(`provider-search:${clientId}`, {
      windowMs: 60 * 1000,
      maxRequests: 30,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many search requests. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        },
      )
    }

    const { searchParams } = new URL(request.url)

    const cacheParams = {
      location: searchParams.get("location") || searchParams.get("zipCode") || "",
      specialty: searchParams.get("specialty") || "",
      query: searchParams.get("query") || "",
      limit: searchParams.get("limit") || "20",
    }
    const cacheKey = generateKey("provider-search", cacheParams)
    const cached = apiCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "X-Cache": "HIT",
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        },
      })
    }

    const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") || "20", 10)))
    const rawQuery = (searchParams.get("query") || "").trim()
    const rawLocation = (searchParams.get("location") || searchParams.get("zipCode") || "").trim()
    const rawSpecialty = (searchParams.get("specialty") || "").trim()

    if (!rawQuery && !rawLocation && !rawSpecialty) {
      return NextResponse.json(
        { success: false, error: "Provide at least one of: query, location/zipCode, specialty", providers: [], total: 0 },
        { status: 400 },
      )
    }

    const parsed = rawQuery ? parseNaturalLanguageQuery(rawQuery) : {}
    const effectiveLocation = (parsed.location || rawLocation || "").trim()
    const effectiveSpecialty = (parsed.specialty || rawSpecialty || "").trim()

    const locationParts = effectiveLocation ? convertZipToLocation(effectiveLocation) : {}

    const baseHealthProviders = await searchBaseHealthProviders({
      specialty: effectiveSpecialty || undefined,
      state: locationParts.state || undefined,
      limit: Math.min(10, limit),
    })

    const npiProviders = effectiveLocation
      ? await searchNpi({ specialty: effectiveSpecialty || undefined, location: effectiveLocation, limit })
      : effectiveSpecialty
        ? await searchNpi({ specialty: effectiveSpecialty, location: locationParts.state || "", limit })
        : []

    const mappedNpi = npiProviders.map((provider) => mapNpiProvider({ provider, queryLocation: effectiveLocation }))

    // Combine, preferring BaseHealth entries by NPI when present.
    const byNpi = new Map<string, ProviderSearchResult>()
    for (const p of baseHealthProviders) byNpi.set(p.npi, p)
    for (const p of mappedNpi) if (!byNpi.has(p.npi)) byNpi.set(p.npi, p)

    const combined = Array.from(byNpi.values())

    // Sort: BaseHealth first, then distance (if any), then name.
    combined.sort((a, b) => {
      if (a.source !== b.source) {
        if (a.source === "basehealth") return -1
        if (b.source === "basehealth") return 1
      }

      if (a.distance !== null && b.distance !== null && a.distance !== b.distance) {
        return a.distance - b.distance
      }
      if (a.distance !== null && b.distance === null) return -1
      if (a.distance === null && b.distance !== null) return 1

      return a.name.localeCompare(b.name)
    })

    const providers = combined.slice(0, limit)

    const responseData = {
      success: true,
      providers,
      total: providers.length,
      location: {
        searched: effectiveLocation || rawLocation,
        city: locationParts.city,
        state: locationParts.state,
      },
      specialty: effectiveSpecialty || undefined,
      usedAI: false,
      usedMockData: false,
      timestamp: new Date().toISOString(),
    }

    apiCache.set(cacheKey, responseData, 5 * 60 * 1000)

    return NextResponse.json(responseData, {
      headers: {
        "X-Cache": "MISS",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
      },
    })
  } catch (error) {
    logger.error("Provider search error", error)
    return NextResponse.json({
      success: false,
      error: "Provider search temporarily unavailable. Please try again later.",
      providers: [],
      total: 0,
    })
  }
}

