"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading"

/**
 * Redirect to new onboarding wizard
 * Old URL: /providers/caregiver-signup
 * New URL: /onboarding (with caregiver pre-selected)
 */
export default function CaregiverSignupRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to new onboarding with caregiver role pre-selected
    router.replace("/onboarding?role=caregiver")
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Redirecting to new signup...</p>
      </div>
    </div>
  )
}
