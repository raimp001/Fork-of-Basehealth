import type { ScreeningRecommendation } from "@/types/user"
import { uspstfGuidelines } from "@/lib/uspstf-guidelines"

/**
 * Get screening recommendations based on age and gender (USPSTF guidelines)
 * @param age Patient age
 * @param gender Patient gender
 * @param riskFactors Array of risk factors
 * @returns Promise resolving to an array of screening recommendations
 */
export async function getScreeningRecommendations(
  age: number,
  gender = "all",
  riskFactors: string[] = []
): Promise<ScreeningRecommendation[]> {
  const normalizedRiskFactors = riskFactors.map(rf => rf.toLowerCase().trim())
  
  // Filter guidelines based on age and gender first
  const ageGenderFilteredGuidelines = uspstfGuidelines.filter((g) =>
    (g.gender === gender || g.gender === "all") &&
    age >= g.minAge &&
    age <= g.maxAge
  )

  // Enhanced filtering for complex family history rules
  const filteredGuidelines = ageGenderFilteredGuidelines.filter((g) => {
    // If no risk factors specified by user, only include universal screenings
    if (riskFactors.length === 0) {
      return !g.riskFactors || g.riskFactors.length === 0
    }
    
    // If guideline has no specific risk factors, it's a universal screening
    if (!g.riskFactors || g.riskFactors.length === 0) {
      return true
    }
    
    // Special handling for colorectal cancer family history rules
    if (g.screening.includes("Colorectal Cancer")) {
      return matchesColorectalCancerCriteria(g, normalizedRiskFactors, age)
    }
    
    // Special handling for Lynch syndrome
    if (g.screening.includes("Lynch Syndrome")) {
      return matchesLynchSyndromeCriteria(g, normalizedRiskFactors)
    }
    
    // Standard risk factor matching for other screenings
    const matchesRiskFactor = g.riskFactors.some(guidelineRF => {
      const normalizedGuidelineRF = guidelineRF.toLowerCase().trim()
      return normalizedRiskFactors.some(userRF => {
        // More flexible matching
        const exactMatch = userRF === normalizedGuidelineRF
        const containsMatch = userRF.includes(normalizedGuidelineRF) || normalizedGuidelineRF.includes(userRF)
        return exactMatch || containsMatch
      })
    })
    
    return matchesRiskFactor
  })

  // Map to recommendation format with enhanced descriptions
  const recommendations = filteredGuidelines.map((g) => {
    let enhancedDescription = g.description
    let adjustedMinAge = g.minAge
    
    // Enhance descriptions based on risk factors for colorectal cancer
    if (g.screening.includes("Colorectal Cancer") && riskFactors.length > 0) {
      const earliestFamilyAge = extractEarliestFamilyDiagnosisAge(normalizedRiskFactors)
      if (earliestFamilyAge && earliestFamilyAge < 50) {
        const recommendedStartAge = Math.max(25, earliestFamilyAge - 10, 40)
        adjustedMinAge = recommendedStartAge
        enhancedDescription += ` Given family history of colorectal cancer diagnosed at age ${earliestFamilyAge}, screening should begin at age ${recommendedStartAge} (10 years before earliest family diagnosis, but not before age 25).`
      }
    }
    
    return {
      id: g.screening.replace(/\s+/g, "-").toLowerCase(),
      name: g.screening,
      description: enhancedDescription,
      ageRange: { min: adjustedMinAge, max: g.maxAge },
      gender: g.gender,
      frequency: g.frequency,
      importance: g.grade === "A" ? "essential" : g.grade === "B" ? "recommended" : "routine",
      specialtyNeeded: g.specialtyNeeded || "Primary Care",
      riskFactors: g.riskFactors || [],
      grade: g.grade,
    }
  })

  return recommendations
}

/**
 * Enhanced matching for colorectal cancer screening criteria
 */
function matchesColorectalCancerCriteria(guideline: any, riskFactors: string[], age: number): boolean {
  const guidelineRiskFactors = guideline.riskFactors?.map((rf: string) => rf.toLowerCase()) || []
  
  // High Risk Screening (Early Onset)
  if (guideline.screening.includes("High Risk")) {
    return riskFactors.some(rf => 
      rf.includes("family history colorectal cancer age < 50") ||
      rf.includes("high risk colorectal cancer family history") ||
      rf.includes("multiple first degree relatives colorectal cancer")
    )
  }
  
  // Moderate Risk Screening (Age 50-59)
  if (guideline.screening.includes("Moderate Risk")) {
    return riskFactors.some(rf => 
      rf.includes("family history colorectal cancer age 50-59") ||
      rf.includes("moderate risk colorectal cancer family history")
    )
  }
  
  // Personal History Risk
  if (guideline.screening.includes("Personal History")) {
    return riskFactors.some(rf => 
      rf.includes("personal history of polyps") ||
      rf.includes("inflammatory bowel disease") ||
      rf.includes("personal history of cancer")
    )
  }
  
  // Standard colorectal screening - only if no high-risk factors present
  if (!guideline.screening.includes("High Risk") && 
      !guideline.screening.includes("Moderate Risk") && 
      !guideline.screening.includes("Personal History") &&
      !guideline.screening.includes("Lynch Syndrome")) {
    // Include if no high-risk family history factors are present
    const hasHighRiskFactors = riskFactors.some(rf => 
      rf.includes("family history colorectal cancer age < 50") ||
      rf.includes("family history colorectal cancer age 50-59") ||
      rf.includes("suspected lynch syndrome")
    )
    return !hasHighRiskFactors
  }
  
  return false
}

/**
 * Enhanced matching for Lynch syndrome criteria
 */
function matchesLynchSyndromeCriteria(guideline: any, riskFactors: string[]): boolean {
  return riskFactors.some(rf => 
    rf.includes("suspected lynch syndrome") ||
    rf.includes("3+ relatives colorectal cancer") ||
    rf.includes("family colorectal cancer age < 45") ||
    rf.includes("family endometrial cancer age < 50")
  )
}

/**
 * Extract the earliest family diagnosis age from risk factors
 */
function extractEarliestFamilyDiagnosisAge(riskFactors: string[]): number | null {
  for (const rf of riskFactors) {
    const match = rf.match(/earliest family diagnosis age (\d+)/)
    if (match) {
      return parseInt(match[1])
    }
  }
  return null
}

/**
 * Prioritize recommendations by importance
 * @param recommendations Array of screening recommendations
 * @returns Prioritized array of screening recommendations
 */
export function prioritizeRecommendations(recommendations: ScreeningRecommendation[]): ScreeningRecommendation[] {
  // Define importance order
  const importanceOrder = {
    essential: 1,
    recommended: 2,
    routine: 3,
  }

  // Sort by importance
  return [...recommendations].sort((a, b) => {
    const importanceA = importanceOrder[a.importance as keyof typeof importanceOrder] || 999
    const importanceB = importanceOrder[b.importance as keyof typeof importanceOrder] || 999
    return importanceA - importanceB
  })
}

/**
 * Filter recommendations by risk factors
 * @param recommendations Array of screening recommendations
 * @param riskFactors Array of risk factors
 * @returns Filtered array of screening recommendations
 */
export function getRecommendationsByRiskFactors(
  recommendations: ScreeningRecommendation[],
  riskFactors: string[],
): ScreeningRecommendation[] {
  if (!riskFactors.length) {
    return recommendations
  }

  // Include recommendations that match any of the risk factors
  // or don't have specific risk factors listed
  return recommendations.filter((recommendation) => {
    // If recommendation doesn't have risk factors, include it
    if (!recommendation.riskFactors || recommendation.riskFactors.length === 0) {
      return true
    }

    // Check if any of the patient's risk factors match the recommendation's risk factors
    return riskFactors.some((factor) =>
      recommendation.riskFactors?.some((rf) => rf.toLowerCase().includes(factor.toLowerCase())),
    )
  })
}
