// File: app/api/providers/search/route.ts
// Highlight: Uses process.env.Maps_API_KEY to securely access the key.

import { NextResponse } from "next/server"
import { Client, PlaceInputType } from "@googlemaps/google-maps-services-js"
import type { PlaceData } from "@googlemaps/google-maps-services-js/dist/common"

// Assuming Provider type might look something like this (adjust based on your actual types/user.ts)
interface Provider {
  id: string // Will use place_id from Google
  name: string
  specialty: string // Will use primary type or first type from Google
  rating?: number
  reviewCount?: number
  address: {
    full?: string // Using formatted_address
    city?: string
    state?: string
    zipCode?: string
  }
  isVerified?: boolean // Google doesn't provide this, default to false or omit
  isNearby?: boolean // Can potentially calculate distance if needed, omitting for now
  distanceNote?: string // Omitting for now
  website?: string // From Place Details
  phone?: string // From Place Details
  // Add other fields your Provider type might have, e.g., consultationFee (unavailable from Google)
}

const googleMapsClient = new Client({})
// *** ACCESS THE KEY SECURELY FROM ENVIRONMENT VARIABLES ***
const API_KEY = process.env.Maps_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const zipCode = searchParams.get("zipCode")
  const specialty = searchParams.get("specialty") // e.g., "Cardiology"
  // const radius = searchParams.get("radius") ? Number.parseInt(searchParams.get("radius")!) : 25 // Radius in miles, convert to meters for API

  if (!API_KEY) {
    console.error("Google Maps API key is missing from environment variables.")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  if (!zipCode) {
    return NextResponse.json({ error: "ZIP code is required" }, { status: 400 })
  }

  try {
    // Construct search query for Google Places API (Text Search is flexible)
    let query = `healthcare provider in ${zipCode}`
    if (specialty && specialty !== "all") {
      query = `${specialty} ${query}` // Add specialty to the query
    }

    // 1. Find places using Text Search
    const searchResponse = await googleMapsClient.textSearch({
      params: {
        query: query,
        key: API_KEY, // Use the key from process.env
        type: "doctor,hospital,clinic", // Broad types, query string refines
        // region: 'us', // Optional: bias results to a region
      },
    })

    if (searchResponse.data.status !== "OK" && searchResponse.data.status !== "ZERO_RESULTS") {
      console.error("Google Places Text Search Error:", searchResponse.data.status, searchResponse.data.error_message)
      throw new Error(`Failed to search places: ${searchResponse.data.status}`)
    }

    const searchResults = searchResponse.data.results || []

    // 2. Get details for each place found
    const providerPromises = searchResults.map(async (place): Promise<Provider | null> => {
      if (!place.place_id) return null

      try {
        const detailsResponse = await googleMapsClient.placeDetails({
          params: {
            place_id: place.place_id,
            key: API_KEY, // Use the key from process.env
            fields: [ // Specify fields needed to optimize cost and data
              "name",
              "formatted_address",
              "rating",
              "user_ratings_total",
              "website",
              "formatted_phone_number",
              "type", // Get place types
              "place_id",
              // "address_components", // If you need city/state/zip specifically
            ],
          },
        })

        if (detailsResponse.data.status !== "OK") {
          console.error(`Google Place Details Error for ${place.place_id}:`, detailsResponse.data.status, detailsResponse.data.error_message)
          return null // Skip this provider if details fail
        }

        const details = detailsResponse.data.result as PlaceData & { types?: string[] } // Cast to include types if needed

        // Map Google Place data to your Provider structure
        const provider: Provider = {
          id: details.place_id ?? `google-${Date.now()}`, // Use place_id as unique ID
          name: details.name ?? "N/A",
          // Use first type as specialty, or refine this logic
          specialty: details.types?.[0]?.replace(/_/g, " ") ?? "Healthcare Provider",
          rating: details.rating,
          reviewCount: details.user_ratings_total,
          address: {
            full: details.formatted_address,
            // You might need to parse city/state/zip from formatted_address or address_components if requested
          },
          website: details.website,
          phone: details.formatted_phone_number,
          // Default or omit fields not provided by Google
          isVerified: false,
        }
        return provider
      } catch (detailsError) {
        console.error(`Error fetching details for place ${place.place_id}:`, detailsError)
        return null
      }
    })

    // Wait for all details requests and filter out nulls (failed requests)
    const providers = (await Promise.all(providerPromises)).filter((p): p is Provider => p !== null)

    return NextResponse.json({ providers })

  } catch (error) {
    console.error("Error searching providers via Google Places:", error)
    // Provide a generic error response
    return NextResponse.json({ error: "Failed to search providers. Please try again later." }, { status: 500 })
  }
}