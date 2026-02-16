import { NextResponse } from "next/server"

/**
 * Legacy multipart provider signup endpoint disabled.
 * Use the unified onboarding application APIs instead.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Provider signup is handled through the onboarding flow.",
      next: "/onboarding?role=provider",
    },
    { status: 410 },
  )
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Provider signup requirements moved to onboarding endpoints.",
      next: "/api/onboarding/requirements?role=provider",
    },
    { status: 410 },
  )
}

