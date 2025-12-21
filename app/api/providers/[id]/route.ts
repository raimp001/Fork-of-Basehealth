import { NextResponse } from "next/server"
import { getProviderById } from "@/lib/provider-search-service"
import { getProviderReviews } from "@/lib/provider-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const providerId = params.id

    if (!providerId) {
      return NextResponse.json({ error: "Provider ID is required" }, { status: 400 })
    }

    const provider = await getProviderById(providerId)

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    // Get provider reviews
    const reviews = await getProviderReviews(providerId)

    return NextResponse.json({ provider, reviews })
  } catch (error) {
    logger.error("Error fetching provider", error)
    return NextResponse.json({ error: "An error occurred while fetching provider details" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const providerId = params.id

    if (!providerId) {
      return NextResponse.json({ error: "Provider ID is required" }, { status: 400 })
    }

    const data = await request.json()

    // In a real app, we would validate the data here

    // Update provider
    const provider = await getProviderById(providerId)

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    // In a real app, we would update the provider in the database
    // For this mock, we'll just return the updated provider
    const updatedProvider = {
      ...provider,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ provider: updatedProvider })
  } catch (error) {
    console.error("Error updating provider:", error)
    return NextResponse.json({ error: "An error occurred while updating provider" }, { status: 500 })
  }
}
