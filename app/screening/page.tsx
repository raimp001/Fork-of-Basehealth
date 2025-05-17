"use client"

import { ScreeningForm } from "@/components/workflow/screening-form"

export default function ScreeningPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6 text-center">USPSTF Health Screening</h1>
      <ScreeningForm
        patientData={{}}
        updatePatientData={() => {}}
        onComplete={() => {}}
      />
    </div>
  )
}
