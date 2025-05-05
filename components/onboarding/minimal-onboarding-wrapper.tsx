"use client"

import { Suspense } from "react"
import MinimalOnboarding from "./minimal-onboarding"

export default function MinimalOnboardingWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading onboarding experience...</div>}>
      <MinimalOnboarding />
    </Suspense>
  )
}
