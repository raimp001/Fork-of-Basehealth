"use client"

import { Suspense } from "react"
import EmergencyAssistance from "./emergency-assistance"

export default function EmergencyClientWrapper() {
  return (
    <Suspense fallback={<div className="p-4">Loading emergency services...</div>}>
      <EmergencyAssistance />
    </Suspense>
  )
}
