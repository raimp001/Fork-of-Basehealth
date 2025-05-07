import { Suspense } from "react"
import MedicationClient from "./client"

export default function MedicationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Medication Management</h1>
      <Suspense fallback={<MedicationSkeleton />}>
        <MedicationClient />
      </Suspense>
    </div>
  )
}

function MedicationSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded mb-4 w-3/4"></div>
      <div className="h-32 bg-gray-200 rounded mb-4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  )
}
