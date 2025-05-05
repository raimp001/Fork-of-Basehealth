import { EmergencyClientWrapper } from "@/components/emergency/emergency-client-wrapper"

export default function EmergencyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Emergency Assistance</h1>
      <EmergencyClientWrapper />
    </div>
  )
}
