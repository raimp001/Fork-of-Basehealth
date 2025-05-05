"use client"

import { Suspense } from "react"
import EmergencyAssistance from "./emergency-assistance"

export default function EmergencyClientWrapper() {
  return (
    <Suspense fallback={<div>Loading emergency services...</div>}>
      <EmergencyAssistance />
    </Suspense>
  )
}
