import type { Application, CaregiverApplication, ProviderApplication, ApplicationStats } from "@/types/admin"

/**
 * Admin data - starts empty.
 * Real applications come from actual user submissions.
 */

// No pre-populated applications - these come from real submissions
export const mockCaregiverApplications: CaregiverApplication[] = []

export const mockProviderApplications: ProviderApplication[] = []

export const mockApplications: Application[] = []

export const mockApplicationStats: ApplicationStats = {
  total: 0,
  pending: 0,
  underReview: 0,
  approved: 0,
  rejected: 0,
  requiresInfo: 0,
  averageReviewTime: 0,
  approvalRate: 0
}

// Admin users should be created through proper authentication
export const mockAdminUsers: { id: string; name: string; role: string; department: string }[] = []
