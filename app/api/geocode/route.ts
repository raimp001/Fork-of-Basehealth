import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const zipCode = searchParams.get("zipCode")
  const city = searchParams.get("city")
  const state = searchParams.get("state")

  if (!zipCode && !city) {
    return NextResponse.json({ error: "ZIP code or city is required" }, { status: 400 })
  }

  try {
    // Use the Google Maps Geocoding API on the server side
    if (process.env.GOOGLE_MAPS_API_KEY) {
      // Build the address string
      let address = zipCode || ""
      if (city) {
        address = city
        if (state) {
          address += `, ${state}`
        }
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
        { cache: "force-cache" }, // Cache the results to reduce API calls
      )

      const data = await response.json()

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location

        // Extract ZIP code from address components if we searched by city
        let extractedZipCode = zipCode
        let extractedCity = city
        let extractedState = state

        for (const component of data.results[0].address_components) {
          if (component.types.includes("postal_code") && !extractedZipCode) {
            extractedZipCode = component.short_name
          }
          if (component.types.includes("locality") && !extractedCity) {
            extractedCity = component.long_name
          }
          if (component.types.includes("administrative_area_level_1") && !extractedState) {
            extractedState = component.short_name
          }
        }

        return NextResponse.json({
          coordinates: {
            latitude: location.lat,
            longitude: location.lng,
          },
          zipCode: extractedZipCode,
          city: extractedCity,
          state: extractedState,
          formattedAddress: data.results[0].formatted_address,
        })
      }
    }

    // Fallback to mock implementation
    console.log("Using mock geocoding implementation for:", zipCode || `${city}, ${state}`)

    if (zipCode) {
      const firstDigit = Number.parseInt(zipCode.charAt(0))

      // Generate deterministic but different coordinates based on ZIP code
      const latitude = 37.0 + firstDigit * 0.5 + Number.parseInt(zipCode.substring(1, 3)) * 0.01
      const longitude = -122.0 - firstDigit * 0.5 - Number.parseInt(zipCode.substring(3, 5)) * 0.01

      return NextResponse.json({
        coordinates: { latitude, longitude },
        zipCode,
        city: "Mock City",
        state: "MS",
        formattedAddress: `Mock Address, Mock City, MS ${zipCode}`,
      })
    } else if (city) {
      // Generate mock coordinates based on city name
      const citySum = city.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
      const latitude = 37.0 + (citySum % 10) * 0.5
      const longitude = -122.0 - (citySum % 10) * 0.5

      const mockZipCode = `${citySum % 10}${(citySum * 83) % 10000}`.padStart(5, "0")

      return NextResponse.json({
        coordinates: { latitude, longitude },
        zipCode: mockZipCode,
        city,
        state: state || "MS",
        formattedAddress: `${city}, ${state || "MS"} ${mockZipCode}`,
      })
    }

    return NextResponse.json({ error: "Could not geocode the provided location" }, { status: 400 })
  } catch (error) {
    console.error("Error geocoding:", error)
    return NextResponse.json({ error: "Failed to geocode location" }, { status: 500 })
  }
}
