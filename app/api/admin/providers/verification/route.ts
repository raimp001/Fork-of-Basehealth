import { NextResponse } from "next/server"
import { getPendingProviderVerifications, updateProviderVerificationStatus } from "@/lib/provider-service"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  try {
    // In a real app, we would check admin authentication here
    const pendingProviders = await getPendingProviderVerifications()
    return NextResponse.json({ providers: pendingProviders })
  } catch (error) {
    logger.error("Error fetching pending verifications", error)
    return NextResponse.json({ error: "An error occurred while fetching pending verifications" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // In a real app, we would check admin authentication here
    const { providerId, status } = await request.json()

    if (!providerId || !status) {
      return NextResponse.json({ error: "Provider ID and status are required" }, { status: 400 })
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Status must be 'approved' or 'rejected'" }, { status: 400 })
    }

    const provider = await updateProviderVerificationStatus(providerId, status as "approved" | "rejected")

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    return NextResponse.json({ provider })
  } catch (error) {
    logger.error("Error updating provider verification", error)
    return NextResponse.json({ error: "An error occurred while updating provider verification" }, { status: 500 })
  }
}
