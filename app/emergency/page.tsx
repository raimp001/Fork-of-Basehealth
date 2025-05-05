import EmergencyClientWrapper from "@/components/emergency/emergency-client-wrapper"

export default function EmergencyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-red-600 mb-8">Emergency Assistance</h1>
      <EmergencyClientWrapper />
    </div>
  )
}
