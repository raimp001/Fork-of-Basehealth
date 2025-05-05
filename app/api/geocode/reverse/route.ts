import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// Mock reverse geocoding data for common coordinates
const mockReverseGeocodeData: Record<string, string> = {
  "40.7128,-74.006": "New York, NY",
  "34.0522,-118.2437": "Los Angeles, CA",
  "41.8781,-87.6298": "Chicago, IL",
  "29.7604,-95.3698": "Houston, TX",
  "33.4484,-112.074": "Phoenix, AZ",
  "39.9526,-75.1652": "Philadelphia, PA",
  "29.4241,-98.4936": "San Antonio, TX",
  "32.7157,-117.1611": "San Diego, CA",
  "32.7767,-96.797": "Dallas, TX",
  "37.3382,-121.8863": "San Jose, CA",
}

// Function to generate a ZIP code based on coordinates
function generateZipFromCoordinates(lat: number, lng: number): string {
  // Use the coordinates to seed a deterministic but seemingly random ZIP code
  const latStr = Math.abs(Math.floor(lat * 100))
    .toString()
    .padStart(4, "0")
  const lngStr = Math.abs(Math.floor(lng * 100))
    .toString()
    .padStart(4, "0")

  // Combine parts of both to create a 5-digit ZIP
  const zip = (latStr.substring(0, 2) + lngStr.substring(0, 3)).padStart(5, "0")
  return zip
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ success: false, error: "Invalid coordinates" }, { status: 400 })
    }

    logger.info(`Reverse geocoding request: lat=${lat}, lng=${lng}`)

    // Round coordinates to 4 decimal places for lookup
    const roundedLat = Math.round(lat * 10000) / 10000
    const roundedLng = Math.round(lng * 10000) / 10000
    const coordKey = `${roundedLat},${roundedLng}`

    // Try to use mock data for known coordinates
    if (mockReverseGeocodeData[coordKey]) {
      const address = mockReverseGeocodeData[coordKey]
      logger.info(`Using mock reverse geocode data: ${address}`)

      return NextResponse.json({
        success: true,
        address: {
          formattedAddress: address,
          city: address.split(",")[0].trim(),
          state: address.split(",")[1].trim(),
          zip: generateZipFromCoordinates(lat, lng),
        },
      })
    }

    // Generate a mock address based on the coordinates
    const zip = generateZipFromCoordinates(lat, lng)

    // Generate a city name based on coordinates
    const cityNames = [
      "Springfield",
      "Riverside",
      "Fairview",
      "Georgetown",
      "Salem",
      "Madison",
      "Clinton",
      "Franklin",
      "Greenville",
      "Bristol",
      "Kingston",
      "Marion",
      "Oxford",
      "Ashland",
      "Burlington",
      "Manchester",
      "Milton",
      "Newport",
      "Auburn",
      "Dayton",
    ]

    // Use lat/lng to deterministically select a city name
    const cityIndex = Math.abs(Math.floor(lat * lng * 100)) % cityNames.length
    const city = cityNames[cityIndex]

    // Use lat to select a state abbreviation
    const stateAbbrs = [
      "AL",
      "AK",
      "AZ",
      "AR",
      "CA",
      "CO",
      "CT",
      "DE",
      "FL",
      "GA",
      "HI",
      "ID",
      "IL",
      "IN",
      "IA",
      "KS",
      "KY",
      "LA",
      "ME",
      "MD",
      "MA",
      "MI",
      "MN",
      "MS",
      "MO",
      "MT",
      "NE",
      "NV",
      "NH",
      "NJ",
      "NM",
      "NY",
      "NC",
      "ND",
      "OH",
      "OK",
      "OR",
      "PA",
      "RI",
      "SC",
      "SD",
      "TN",
      "TX",
      "UT",
      "VT",
      "VA",
      "WA",
      "WV",
      "WI",
      "WY",
    ]
    const stateIndex = Math.abs(Math.floor(lat * 100)) % stateAbbrs.length
    const state = stateAbbrs[stateIndex]

    const mockAddress = {
      formattedAddress: `${city}, ${state} ${zip}`,
      city,
      state,
      zip,
    }

    logger.info(`Generated mock address: ${mockAddress.formattedAddress}`)

    return NextResponse.json({
      success: true,
      address: mockAddress,
      isMockData: true,
    })
  } catch (error) {
    logger.error("Error in reverse geocoding:", error)

    // Return mock data as fallback
    return NextResponse.json({
      success: true,
      address: {
        formattedAddress: "Unknown Location",
        city: "Unknown",
        state: "XX",
        zip: "00000",
      },
      isMockData: true,
    })
  }
}
