// Create this file to handle Coinbase configuration requests properly

import { NextResponse } from "next/server"
import { NETWORK_ID } from "@/lib/constants"

export async function GET() {
  try {
    // Return a properly formatted configuration object
    return NextResponse.json({
      networkId: NETWORK_ID || "base-sepolia",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating Coinbase configuration:", error)
    return NextResponse.json({ error: "Failed to generate configuration" }, { status: 500 })
  }
}
