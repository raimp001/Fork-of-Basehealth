import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  try {
    // Use the Google Maps Geocoding API on the server side
    if (process.env.GOOGLE_MAPS_API_KEY) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
        { cache: "force-cache" }, // Cache the results to reduce API calls
      )

      const data = await response.json()

      if (data.status === "OK" && data.results && data.results.length > 0) {
        // Extract ZIP code from address components
        let zipCode = null
        let city = null
        let state = null

        for (const result of data.results) {
          for (const component of result.address_components) {
            if (component.types.includes("postal_code")) {
              zipCode = component.short_name
            }
            if (component.types.includes("locality")) {
              city = component.long_name
            }
            if (component.types.includes("administrative_area_level_1")) {
              state = component.short_name
            }
          }
          if (zipCode && city && state) break
        }

        return NextResponse.json({
          zipCode,
          city,
          state,
          formattedAddress: data.results[0].formatted_address,
        })
      }
    }

    // Fallback to mock implementation
    logger.debug("Using mock reverse geocoding implementation")

    // Generate a mock ZIP code based on coordinates
    const latNum = Number.parseFloat(lat)
    const lngNum = Number.parseFloat(lng)

    // Simple algorithm to generate a ZIP code from coordinates
    const zipPrefix = Math.abs(Math.floor(latNum * 10) % 10)
    const zipSuffix = Math.abs(Math.floor(lngNum * 100) % 10000)
      .toString()
      .padStart(4, "0")
    const mockZipCode = `${zipPrefix}${zipSuffix}`

    return NextResponse.json({
      zipCode: mockZipCode,
      city: "Mock City",
      state: "MS",
      formattedAddress: `Mock Address, Mock City, MS ${mockZipCode}`,
    })
  } catch (error) {
    logger.error("Error reverse geocoding", error)
    return NextResponse.json({ error: "Failed to reverse geocode coordinates" }, { status: 500 })
  }
}
