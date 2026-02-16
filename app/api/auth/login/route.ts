import { NextResponse } from "next/server"

/**
 * Legacy demo auth endpoint disabled.
 * Wallet-based auth is handled through NextAuth wallet credentials.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Legacy login endpoint is disabled. Use wallet sign-in.",
    },
    { status: 410 },
  )
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: "Legacy logout endpoint is disabled.",
    },
    { status: 410 },
  )
}

