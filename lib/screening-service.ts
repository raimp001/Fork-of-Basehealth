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

  // Then filter by risk factors or include if no specific risk factors required
  const filteredGuidelines = ageGenderFilteredGuidelines.filter((g) => {
    // If no risk factors specified by user, include all age/gender appropriate screenings
    if (riskFactors.length === 0) {
      return true
    }
    
    // If guideline has no specific risk factors, it's a universal screening
    if (!g.riskFactors || g.riskFactors.length === 0) {
      return true
    }
    
    // Check if any user risk factor matches any guideline risk factor
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

  // Map to recommendation format
  const recommendations = filteredGuidelines.map((g) => ({
    id: g.screening.replace(/\s+/g, "-").toLowerCase(),
    name: g.screening,
    description: g.description,
    ageRange: { min: g.minAge, max: g.maxAge },
    gender: g.gender,
    frequency: g.frequency,
    importance: g.grade === "A" ? "essential" : g.grade === "B" ? "recommended" : "routine",
    specialtyNeeded: g.specialtyNeeded || "Primary Care",
    riskFactors: g.riskFactors || [],
    grade: g.grade,
  }))

  return recommendations
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
