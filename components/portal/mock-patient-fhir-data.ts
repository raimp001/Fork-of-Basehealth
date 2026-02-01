/**
 * Patient FHIR data placeholder.
 * Real patient data comes from authenticated user sessions and EMR connections.
 * This file is kept for type compatibility but contains no data.
 */

interface PatientRecord {
  id: string
  name: string
  dob: string
  conditions: string[]
  medications: string[]
  labs: string[]
  allergies: string[]
  imaging: string[]
  progressNotes: string[]
  aiSummary: string
}

// Empty array - real data comes from authenticated sessions
const mockPatientData: PatientRecord[] = []

export default mockPatientData
