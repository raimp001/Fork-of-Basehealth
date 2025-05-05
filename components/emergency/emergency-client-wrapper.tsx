"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Use dynamic import with no SSR in a client component
const EmergencyAssistance = dynamic(() => import("./emergency-assistance"), {
  ssr: false,
  loading: () => <div className="p-4">Loading emergency services...</div>,
})

export default function EmergencyClientWrapper() {
  return (
    <Suspense fallback={<div className="p-4">Loading emergency services...</div>}>
      <EmergencyAssistance />
    </Suspense>
  )
}
