import db from "@/lib/mock-db"
import type { Provider, Review } from "@/types/user"

export async function searchProviders(options: {
  specialty?: string
  zipCode?: string
  state?: string
  service?: string
  verificationStatus?: "pending" | "approved" | "rejected"
}): Promise<Provider[]> {
  return await db.searchProviders(options)
}

export async function getProviderById(providerId: string): Promise<Provider | null> {
  return await db.getProviderById(providerId)
}

export async function getProviderReviews(providerId: string): Promise<Review[]> {
  return await db.getReviewsByProviderId(providerId)
}

export async function createReview(reviewData: Omit<Review, "id" | "createdAt">): Promise<Review | null> {
  try {
    // Validate review data
    const patient = await db.getPatientById(reviewData.patientId)
    const provider = await db.getProviderById(reviewData.providerId)
    const appointment = await db.getAppointmentById(reviewData.appointmentId)

    if (!patient || !provider || !appointment) {
      return null
    }

    // Create the review
    return await db.createReview(reviewData)
  } catch (error) {
    console.error("Error creating review:", error)
    return null
  }
}

export async function updateProviderVerificationStatus(
  providerId: string,
  status: "pending" | "approved" | "rejected",
): Promise<Provider | null> {
  return await db.updateProviderVerificationStatus(providerId, status)
}

export async function getPendingProviderVerifications(): Promise<Provider[]> {
  return await db.getPendingProviderVerifications()
}

export async function updateProviderProfile(
  providerId: string,
  profileData: Partial<Provider>,
): Promise<Provider | null> {
  const provider = await db.getProviderById(providerId)
  if (!provider) {
    return null
  }

  // In a real app, we would update the database
  // For this mock, we'll just return the updated provider
  return {
    ...provider,
    ...profileData,
    updatedAt: new Date().toISOString(),
  }
}
