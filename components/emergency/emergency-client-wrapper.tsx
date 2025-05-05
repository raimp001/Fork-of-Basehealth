"use client"

import { Suspense } from "react"
import { EmergencyAssistance } from "./emergency-assistance"

export function EmergencyClientWrapper() {
  return (
    <Suspense fallback={<div>Loading Emergency Assistance...</div>}>
      <EmergencyAssistance />
    </Suspense>
  )
}
