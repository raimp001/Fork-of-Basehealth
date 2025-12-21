"use client"

import { useState, useEffect } from "react"
import { OnDemandRequest } from "@/components/appointment/on-demand-request"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function AppointmentRequestClient() {
  const [patient, setPatient] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create a mock patient to use as fallback
  const mockPatient = {
    id: "mock-patient-1",
    name: "Demo Patient",
    email: "demo.patient@example.com",
    role: "patient" as const,
    dateOfBirth: "1985-06-15",
    medicalHistory: ["None"],
    allergies: ["None"],
    medications: ["None"],
    address: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "12345",
      country: "USA",
    },
    preferredPharmacy: {
      name: "Local Pharmacy",
      address: "456 Pharmacy St, Anytown, CA 12345",
      phone: "555-123-4567",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  useEffect(() => {
    // Fetch patient data or use mock data
    const fetchPatient = async () => {
      setIsLoading(true)
      try {
        // In a real app, we would fetch from an API
        // For now, simulate a delay and use mock data
        await new Promise((resolve) => setTimeout(resolve, 500))
        setPatient(mockPatient)
      } catch (err) {
        // Error handled by error state
        setError("Failed to load patient data. Using demo patient instead.")
        setPatient(mockPatient)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatient()
  }, [])

  if (isLoading) {
    return null // Loading state is handled by Suspense in the parent
  }

  return (
    <>
      {error && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <OnDemandRequest patient={patient} />
    </>
  )
}
