import { NextResponse } from "next/server"

/**
 * Coinbase SuperPay intent route disabled until a production payment
 * provider integration is configured.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Payment intents are not available yet.",
    },
    { status: 501 },
  )
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Payment intents are not available yet.",
    },
    { status: 501 },
  )
}

