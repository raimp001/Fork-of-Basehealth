import { NextResponse } from "next/server"
import {
  getScreeningRecommendations,
  prioritizeRecommendations,
} from "@/lib/screening-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ageParam = searchParams.get("age")
    const gender = searchParams.get("gender") || "all"
    const riskFactors = searchParams.get("riskFactors")?.split(",") || []

    if (!ageParam) {
      return NextResponse.json({ error: "Age parameter is required" }, { status: 400 })
    }

    const age = Number.parseInt(ageParam)
    if (isNaN(age)) {
      return NextResponse.json({ error: "Age must be a number" }, { status: 400 })
    }

    let recommendations = await getScreeningRecommendations(age, gender, riskFactors)

    // Only prioritize, do not filter again
    recommendations = prioritizeRecommendations(recommendations)

    console.log('USPSTF API returning:', recommendations);

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error("Error fetching screening recommendations:", error)
    return NextResponse.json({ error: "An error occurred while fetching screening recommendations" }, { status: 500 })
  }
}
