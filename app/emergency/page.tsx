import { Suspense } from "react"
import EmergencyClientWrapper from "@/components/emergency/emergency-client-wrapper"

export default function EmergencyPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Emergency Assistance</h1>
      <Suspense fallback={<div>Loading emergency services...</div>}>
        <EmergencyClientWrapper />
      </Suspense>
    </div>
  )
}
