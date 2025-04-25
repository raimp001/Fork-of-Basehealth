import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const zipCode = searchParams.get("zipCode")

  if (!zipCode) {
    return NextResponse.json({ error: "ZIP code is required" }, { status: 400 })
  }

  try {
    // Use the Google Maps Geocoding API on the server side
    if (process.env.GOOGLE_MAPS_API_KEY) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
        { cache: "force-cache" }, // Cache the results to reduce API calls
      )

      const data = await response.json()

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location
        return NextResponse.json({
          coordinates: {
            latitude: location.lat,
            longitude: location.lng,
          },
        })
      }
    }

    // Fallback to mock implementation
    console.log("Using mock geocoding implementation for ZIP code:", zipCode)
    const firstDigit = Number.parseInt(zipCode.charAt(0))

    // Generate deterministic but different coordinates based on ZIP code
    const latitude = 37.0 + firstDigit * 0.5 + Number.parseInt(zipCode.substring(1, 3)) * 0.01
    const longitude = -122.0 - firstDigit * 0.5 - Number.parseInt(zipCode.substring(3, 5)) * 0.01

    return NextResponse.json({
      coordinates: { latitude, longitude },
    })
  } catch (error) {
    console.error("Error geocoding ZIP code:", error)
    return NextResponse.json({ error: "Failed to geocode ZIP code" }, { status: 500 })
  }
}
