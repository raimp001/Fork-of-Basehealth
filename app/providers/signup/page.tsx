"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading"

/**
 * Redirect to new onboarding wizard
 * Old URL: /providers/signup
 * New URL: /onboarding (with provider pre-selected)
 */
export default function ProvidersSignupRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to new onboarding with provider role pre-selected
    router.replace("/onboarding?role=provider")
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
