import { NextResponse } from "next/server"

/**
 * Appointment creation endpoint is intentionally disabled until the
 * production booking/payment flow is fully integrated.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Appointment creation is not available yet.",
    },
    { status: 501 },
  )
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Appointment pricing is not available yet.",
    },
    { status: 501 },
  )
}

