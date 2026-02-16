import { NextResponse } from "next/server"

/**
 * Caregiver booking creation endpoint is disabled for launch.
 * This prevents returning incomplete or simulated booking/payment states.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Caregiver booking is not available yet.",
    },
    { status: 501 },
  )
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Caregiver booking pricing is not available yet.",
    },
    { status: 501 },
  )
}

