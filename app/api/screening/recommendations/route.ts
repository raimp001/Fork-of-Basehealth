import { NextResponse } from "next/server"
import {
  getScreeningRecommendations,
  prioritizeRecommendations,
} from "@/lib/screening-service"
import { healthDBService } from "@/lib/healthdb-service"

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

    // Enhance with HealthDB insights if available
    try {
      if (riskFactors.length > 0) {
        const healthDBResponse = await healthDBService.searchConditions(riskFactors.join(' '), {
          includeSymptoms: true,
          includeTreatments: true,
          limit: 5
        })
        
        if (healthDBResponse.success && healthDBResponse.data.length > 0) {
          // Add HealthDB insights to recommendations
          recommendations = recommendations.map(rec => ({
            ...rec,
            healthDBInsights: healthDBResponse.data.find(condition => 
              condition.name.toLowerCase().includes(rec.name.toLowerCase())
            ),
            enhanced: true
          }))
        }
      }
    } catch (healthDBError) {
      console.warn('HealthDB enhancement failed:', healthDBError)
      // Continue with original recommendations if HealthDB fails
    }

    logger.debug('USPSTF API returning', { count: recommendations.length });

    return NextResponse.json({ 
      recommendations,
      enhanced: true,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error("Error fetching screening recommendations", error)
    return NextResponse.json({ error: "An error occurred while fetching screening recommendations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { age, gender, smokingStatus, medicalHistory, familyHistory, bmiCategory } = body

    if (!age || !gender) {
      return NextResponse.json({ 
        success: false,
        error: "Age and gender are required" 
      }, { status: 400 })
    }

    // Combine risk factors
    const riskFactors = [
      ...(medicalHistory || []),
      ...(familyHistory || []),
      smokingStatus,
      bmiCategory
    ].filter(Boolean)

    let recommendations = await getScreeningRecommendations(Number(age), gender, riskFactors)
    recommendations = prioritizeRecommendations(recommendations)

    // Enhance with HealthDB insights if available
    try {
      if (riskFactors.length > 0) {
        const healthDBResponse = await healthDBService.searchConditions(riskFactors.join(' '), {
          includeSymptoms: true,
          includeTreatments: true,
          limit: 5
        })
        
        if (healthDBResponse.success && healthDBResponse.data.length > 0) {
          recommendations = recommendations.map(rec => ({
            ...rec,
            healthDBInsights: healthDBResponse.data.find(condition => 
              condition.name.toLowerCase().includes(rec.name.toLowerCase())
            ),
            enhanced: true
          }))
        }
      }
    } catch (healthDBError) {
      console.warn('HealthDB enhancement failed:', healthDBError)
    }

    return NextResponse.json({ 
      success: true,
      recommendations,
      enhanced: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error("Error processing screening assessment", error)
    return NextResponse.json({ 
      success: false,
      error: "An error occurred while processing your assessment" 
    }, { status: 500 })
  }
}
