import type { ScreeningRecommendation } from "@/types/user"
import db from "@/lib/mock-db"

/**
 * Get screening recommendations based on age and gender
 * @param age Patient age
 * @param gender Patient gender
 * @returns Promise resolving to an array of screening recommendations
 */
export async function getScreeningRecommendations(age: number, gender = "all"): Promise<ScreeningRecommendation[]> {
  try {
    // Get all screening recommendations from the database
    const allRecommendations = await db.getAllScreeningRecommendations()

    // Filter recommendations based on age and gender
    return allRecommendations.filter((recommendation) => {
      // Check age range
      const isInAgeRange =
        age >= recommendation.ageRange.min &&
        (recommendation.ageRange.max === undefined || age <= recommendation.ageRange.max)

      // Check gender
      const matchesGender = recommendation.gender === "all" || recommendation.gender === gender

      return isInAgeRange && matchesGender
    })
  } catch (error) {
    console.error("Error getting screening recommendations:", error)
    return []
  }
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
