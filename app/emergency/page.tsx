import dynamic from "next/dynamic"

// Use dynamic import with no SSR
const EmergencyClientWrapper = dynamic(() => import("@/components/emergency/emergency-client-wrapper"), {
  ssr: false,
  loading: () => <div className="p-4">Loading emergency services...</div>,
})

export default function EmergencyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Emergency Assistance</h1>
      <p className="mb-8 text-red-600 font-bold">If this is a life-threatening emergency, call 911 immediately.</p>
      <EmergencyClientWrapper />
    </div>
  )
}
