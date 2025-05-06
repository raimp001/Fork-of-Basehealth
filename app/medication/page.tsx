import { Suspense } from "react"
import { MedicationClient } from "./client"

export default function MedicationPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<MedicationLoadingSkeleton />}>
        <MedicationClient />
      </Suspense>
    </div>
  )
}

function MedicationLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-36 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
    </div>
  )
}
