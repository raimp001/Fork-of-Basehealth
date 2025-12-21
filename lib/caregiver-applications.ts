/**
 * Caregiver Application Storage Utilities
 * Shared functions for managing caregiver applications
 */

// In-memory storage for demo (replace with database in production)
const applications: any[] = []

export function getAllApplications() {
  return applications
}

export function getApplicationById(id: string) {
  return applications.find(app => app.id === id)
}

export function updateApplicationStatus(id: string, status: string, reviewNotes?: string, reviewedBy?: string) {
  const index = applications.findIndex(app => app.id === id)
  if (index !== -1) {
    applications[index] = {
      ...applications[index],
      status,
      reviewNotes,
      reviewedBy,
      reviewedAt: new Date().toISOString()
    }
    return applications[index]
  }
  return null
}

export function addApplication(application: any) {
  applications.push(application)
  return application
}
