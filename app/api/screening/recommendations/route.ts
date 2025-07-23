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
    const familyHistoryDetailsParam = searchParams.get("familyHistoryDetails")

    if (!ageParam) {
      return NextResponse.json({ error: "Age parameter is required" }, { status: 400 })
    }

    const age = Number.parseInt(ageParam)
    if (isNaN(age)) {
      return NextResponse.json({ error: "Age must be a number" }, { status: 400 })
    }

    // Parse family history details if provided
    let familyHistoryDetails = null
    if (familyHistoryDetailsParam) {
      try {
        familyHistoryDetails = JSON.parse(familyHistoryDetailsParam)
      } catch (error) {
        console.warn("Failed to parse family history details:", error)
      }
    }

    // Enhanced risk factors processing using detailed family history
    let enhancedRiskFactors = [...riskFactors]
    
    if (familyHistoryDetails) {
      // Process colorectal cancer family history with age-specific rules
      if (familyHistoryDetails.colorectalCancer?.hasHistory) {
        enhancedRiskFactors.push("family history of colorectal cancer")
        
        const relatives = familyHistoryDetails.colorectalCancer.relatives || []
        const firstDegreeRelatives = relatives.filter(
          (rel: any) => rel.relationship === "parent" || rel.relationship === "sibling"
        )
        
        // High risk: First-degree relative diagnosed <50 years or multiple first-degree relatives
        const earlyOnsetFirstDegree = firstDegreeRelatives.filter((rel: any) => rel.ageAtDiagnosis && rel.ageAtDiagnosis < 50)
        if (earlyOnsetFirstDegree.length > 0) {
          enhancedRiskFactors.push("family history colorectal cancer age < 50")
          enhancedRiskFactors.push("high risk colorectal cancer family history")
          const earliestAge = Math.min(...earlyOnsetFirstDegree.map((rel: any) => rel.ageAtDiagnosis))
          enhancedRiskFactors.push(`earliest family diagnosis age ${earliestAge}`)
        }
        
        // Moderate risk: First-degree relative diagnosed 50-59 years
        const moderateOnsetFirstDegree = firstDegreeRelatives.filter((rel: any) => rel.ageAtDiagnosis && rel.ageAtDiagnosis >= 50 && rel.ageAtDiagnosis < 60)
        if (moderateOnsetFirstDegree.length > 0 && earlyOnsetFirstDegree.length === 0) {
          enhancedRiskFactors.push("family history colorectal cancer age 50-59")
          enhancedRiskFactors.push("moderate risk colorectal cancer family history")
        }
        
        // Multiple first-degree relatives
        if (firstDegreeRelatives.length >= 2) {
          enhancedRiskFactors.push("multiple first degree relatives colorectal cancer")
          enhancedRiskFactors.push("high risk colorectal cancer family history")
        }
        
        // Standard risk: First-degree relative diagnosed ≥60 years
        const lateOnsetFirstDegree = firstDegreeRelatives.filter((rel: any) => rel.ageAtDiagnosis && rel.ageAtDiagnosis >= 60)
        if (lateOnsetFirstDegree.length > 0 && earlyOnsetFirstDegree.length === 0 && moderateOnsetFirstDegree.length === 0) {
          enhancedRiskFactors.push("family history colorectal cancer age >= 60")
        }
      }

      // Process Lynch syndrome indicators
      if (familyHistoryDetails.lynch) {
        if (familyHistoryDetails.lynch.multipleRelativesWithCRC) {
          enhancedRiskFactors.push("suspected lynch syndrome", "3+ relatives colorectal cancer")
        }
        if (familyHistoryDetails.lynch.earlyOnsetCancers) {
          enhancedRiskFactors.push("suspected lynch syndrome", "family colorectal cancer age < 45")
        }
        if (familyHistoryDetails.lynch.endometrialCancer) {
          enhancedRiskFactors.push("suspected lynch syndrome", "family endometrial cancer age < 50")
        }
      }

      // Process breast/ovarian cancer family history
      if (familyHistoryDetails.breastOvarianCancer?.hasHistory) {
        enhancedRiskFactors.push("family history of breast cancer", "family history of ovarian cancer")
        
        const relatives = familyHistoryDetails.breastOvarianCancer.relatives || []
        const earlyOnsetBreast = relatives.filter((rel: any) => 
          rel.cancerType?.includes("breast") && rel.ageAtDiagnosis && rel.ageAtDiagnosis < 50
        )
        
        if (earlyOnsetBreast.length > 0) {
          enhancedRiskFactors.push("family history breast cancer age < 50")
          enhancedRiskFactors.push("high risk breast cancer family history")
        }
        
        // Multiple relatives with breast/ovarian cancer
        if (relatives.length >= 2) {
          enhancedRiskFactors.push("multiple relatives breast ovarian cancer")
          enhancedRiskFactors.push("high risk breast cancer family history")
        }
      }
    }

    let recommendations = await getScreeningRecommendations(age, gender, enhancedRiskFactors)

    // Prioritize recommendations
    recommendations = prioritizeRecommendations(recommendations)

    // Add personalized messaging based on family history
    recommendations = recommendations.map(rec => {
      if (familyHistoryDetails && rec.name.includes("Colorectal Cancer")) {
        const colorectalHistory = familyHistoryDetails.colorectalCancer
        if (colorectalHistory?.hasHistory) {
          const firstDegreeRelatives = colorectalHistory.relatives?.filter(
            (rel: any) => rel.relationship === "parent" || rel.relationship === "sibling"
          ) || []
          
          const earlyOnset = firstDegreeRelatives.filter((rel: any) => rel.ageAtDiagnosis && rel.ageAtDiagnosis < 50)
          if (earlyOnset.length > 0) {
            const earliestAge = Math.min(...earlyOnset.map((rel: any) => rel.ageAtDiagnosis))
            const recommendedStartAge = Math.max(25, earliestAge - 10, 40)
            
            return {
              ...rec,
              description: `${rec.description} IMPORTANT: Due to your family history of colorectal cancer diagnosed at age ${earliestAge}, you should begin screening at age ${recommendedStartAge} (10 years before the earliest family diagnosis). This is earlier than the standard screening age.`,
              ageRange: { ...rec.ageRange, min: recommendedStartAge },
              importance: "essential" as const
            }
          }
        }
      }
      
      return rec
    })

    return NextResponse.json({ 
      recommendations,
      debug: {
        age,
        gender,
        originalRiskFactors: riskFactors,
        enhancedRiskFactors,
        familyHistoryProvided: !!familyHistoryDetails,
        familyHistoryProcessed: familyHistoryDetails ? Object.keys(familyHistoryDetails) : []
      }
    })
  } catch (error) {
    console.error("Error fetching screening recommendations:", error)
    return NextResponse.json({ error: "An error occurred while fetching screening recommendations" }, { status: 500 })
  }
}
