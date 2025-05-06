import { NextResponse } from "next/server"

export async function GET() {
  // Return the API key from server environment
  return NextResponse.json({
    apiKey: process.env.GOOGLE_MAPS_API_KEY || "",
  })
}
