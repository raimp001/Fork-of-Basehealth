import { NextResponse } from "next/server"
import db from "@/lib/mock-db"
import { geocodeZipCode, calculateDistance } from "@/lib/geolocation-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const zipCode = searchParams.get("zipCode")
  const specialty = searchParams.get("specialty")
  const radius = searchParams.get("radius") ? Number.parseInt(searchParams.get("radius")!) : 25

  try {
    let providers = []

    // Search providers using the mock database
    if (zipCode) {
      // First try to search with exact parameters
      providers = await db.searchProviders({
        zipCode: zipCode,
        specialty: specialty === "all" ? undefined : specialty || undefined,
      })

      // If no results, try to find providers in nearby ZIP codes
      if (providers.length === 0) {
        console.log("No providers found with exact ZIP code, searching nearby areas")

        // Try with first 3 digits of ZIP code (same general area)
        if (zipCode.length >= 3) {
          const areaProviders = await db.searchProviders({
            zipCode: zipCode.substring(0, 3),
            specialty: specialty === "all" ? undefined : specialty || undefined,
          })

          if (areaProviders.length > 0) {
            providers = areaProviders
          }
        }

        // If still no results, try with first 2 digits (same region)
        if (providers.length === 0 && zipCode.length >= 2) {
          const regionProviders = await db.searchProviders({
            zipCode: zipCode.substring(0, 2),
            specialty: specialty === "all" ? undefined : specialty || undefined,
          })

          if (regionProviders.length > 0) {
            providers = regionProviders
          }
        }

        // If still no results, generate providers for that ZIP code
        if (providers.length === 0) {
          providers = await db.generateProvidersForZipCode(zipCode, 3)
        }

        // Add a note that these are providers from nearby areas
        providers = providers.map((provider) => ({
          ...provider,
          isNearby: true,
          distanceNote: `Within ${radius} miles of ${zipCode}`,
        }))
      }
    } else {
      // If no ZIP code provided, just search with specialty
      providers = await db.searchProviders({
        specialty: specialty === "all" ? undefined : specialty || undefined,
      })
    }

    // If we have coordinates for the search ZIP code, sort by distance
    if (zipCode) {
      try {
        const searchCoordinates = await geocodeZipCode(zipCode)

        if (searchCoordinates) {
          // Get coordinates for each provider
          const providersWithCoordinates = await Promise.all(
            providers.map(async (provider) => {
              const providerCoordinates = await geocodeZipCode(provider.address.zipCode)
              return {
                ...provider,
                coordinates: providerCoordinates,
              }
            }),
          )

          // Sort by estimated distance (if we have coordinates)
          providers = providersWithCoordinates
            .filter((p) => p.coordinates)
            .sort((a, b) => {
              if (!a.coordinates || !b.coordinates || !searchCoordinates) return 0

              const distA = calculateDistance(searchCoordinates, a.coordinates)
              const distB = calculateDistance(searchCoordinates, b.coordinates)
              return distA - distB
            })
        }
      } catch (error) {
        console.error("Error sorting providers by distance:", error)
      }
    }

    return NextResponse.json({ providers })
  } catch (error) {
    console.error("Error searching providers:", error)
    return NextResponse.json({ error: "Failed to search providers" }, { status: 500 })
  }
}
