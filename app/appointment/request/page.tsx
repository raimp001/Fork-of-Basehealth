import { OnDemandRequest } from "@/components/appointment/on-demand-request"
import db from "@/lib/mock-db"

export default async function OnDemandRequestPage() {
  // In a real app, we would get the patient from the session
  // For demo purposes, we'll use the first patient in the database
  const patients = await db.getAllPatients()
  const patient = patients[0]

  return (
    <div className="container py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Request On-Demand Healthcare</h1>
      <OnDemandRequest patient={patient} />
    </div>
  )
}
