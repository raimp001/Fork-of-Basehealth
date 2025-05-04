import { NextResponse } from "next/server"

export async function GET() {
  // Get the Google Maps API key from environment variables
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.error("Google Maps API key is not defined in environment variables")
    return new NextResponse("Google Maps API key is not configured", { status: 500 })
  }

  // Redirect to the Google Maps API with the API key
  const url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`

  // Return a redirect response
  return NextResponse.redirect(url)
}
