import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || ""

    if (!apiKey) {
      logger.warn("Google Maps API key is not set")
      return NextResponse.json({ success: false, error: "API key not configured" }, { status: 500 })
    }

    // Return the API key
    return NextResponse.json({
      success: true,
      apiKey,
    })
  } catch (error) {
    logger.error("Error getting Maps API key:", error)
    return NextResponse.json({ success: false, error: "Failed to get API key" }, { status: 500 })
  }
}
