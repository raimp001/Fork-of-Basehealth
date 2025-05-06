"use client"

import { MedicationManager } from "@/components/medication/medication-manager"

export default function MedicationClientWrapper() {
  return (
    <div className="container mx-auto py-6">
      <MedicationManager />
    </div>
  )
}
