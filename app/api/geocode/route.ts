import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// Mock geocoding data for common cities
const mockGeocodeData: Record<string, { lat: number; lng: number }> = {
  "new york": { lat: 40.7128, lng: -74.006 },
  "los angeles": { lat: 34.0522, lng: -118.2437 },
  chicago: { lat: 41.8781, lng: -87.6298 },
  houston: { lat: 29.7604, lng: -95.3698 },
  phoenix: { lat: 33.4484, lng: -112.074 },
  philadelphia: { lat: 39.9526, lng: -75.1652 },
  "san antonio": { lat: 29.4241, lng: -98.4936 },
  "san diego": { lat: 32.7157, lng: -117.1611 },
  dallas: { lat: 32.7767, lng: -96.797 },
  "san jose": { lat: 37.3382, lng: -121.8863 },
  austin: { lat: 30.2672, lng: -97.7431 },
  jacksonville: { lat: 30.3322, lng: -81.6557 },
  "fort worth": { lat: 32.7555, lng: -97.3308 },
  columbus: { lat: 39.9612, lng: -82.9988 },
  "san francisco": { lat: 37.7749, lng: -122.4194 },
  charlotte: { lat: 35.2271, lng: -80.8431 },
  indianapolis: { lat: 39.7684, lng: -86.1581 },
  seattle: { lat: 47.6062, lng: -122.3321 },
  denver: { lat: 39.7392, lng: -104.9903 },
  washington: { lat: 38.9072, lng: -77.0369 },
}

// Function to generate coordinates based on ZIP code
function generateCoordinatesFromZip(zip: string): { lat: number; lng: number } {
  // Use the ZIP code to seed a deterministic but seemingly random location
  const zipNum = Number.parseInt(zip) || 10001

  // Base coordinates (roughly center of continental US)
  const baseLat = 39.8283
  const baseLng = -98.5795

  // Use the ZIP to generate an offset
  const latOffset = (((zipNum * 13) % 1000) / 1000) * 10 - 5 // -5 to +5 degrees
  const lngOffset = (((zipNum * 17) % 1000) / 1000) * 10 - 5 // -5 to +5 degrees

  return {
    lat: baseLat + latOffset,
    lng: baseLng + lngOffset,
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address") || ""
    const zip = searchParams.get("zip") || ""

    logger.info(`Geocoding request: address=${address}, zip=${zip}`)

    // Try to use mock data for known cities
    const lowerAddress = address.toLowerCase()
    for (const [city, coords] of Object.entries(mockGeocodeData)) {
      if (lowerAddress.includes(city)) {
        logger.info(`Using mock geocode data for ${city}`)
        return NextResponse.json({
          success: true,
          location: coords,
          formattedAddress: address,
        })
      }
    }

    // If we have a ZIP code, generate coordinates based on that
    if (zip) {
      const coords = generateCoordinatesFromZip(zip)
      logger.info(`Generated coordinates for ZIP ${zip}: ${coords.lat}, ${coords.lng}`)
      return NextResponse.json({
        success: true,
        location: coords,
        formattedAddress: `ZIP Code ${zip}`,
      })
    }

    // If we don't have a match or ZIP, generate some random coordinates
    const randomLat = 37 + Math.random() * 8 - 4 // ~33-41 (covers much of US)
    const randomLng = -100 + Math.random() * 30 - 15 // ~-115 to -85 (covers much of US)

    logger.info(`Using random coordinates: ${randomLat}, ${randomLng}`)
    return NextResponse.json({
      success: true,
      location: { lat: randomLat, lng: randomLng },
      formattedAddress: address || "Unknown Location",
      isMockData: true,
    })
  } catch (error) {
    logger.error("Error in geocoding:", error)

    // Return mock data as fallback
    return NextResponse.json({
      success: true,
      location: { lat: 39.8283, lng: -98.5795 }, // Center of US
      formattedAddress: "United States",
      isMockData: true,
    })
  }
}
