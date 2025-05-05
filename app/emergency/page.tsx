export default function EmergencyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-red-600 mb-8">Emergency Assistance</h1>
      {/* Dynamic import to avoid any potential server/client issues */}
      <div className="emergency-container">
        {/* @ts-expect-error Server Component */}
        <EmergencyAssistanceWrapper />
      </div>
    </div>
  )
}

// This is a server component that wraps the client component
function EmergencyAssistanceWrapper() {
  const EmergencyAssistance = dynamic(() => import("@/components/emergency/emergency-assistance"), {
    ssr: false,
    loading: () => <div>Loading emergency services...</div>,
  })

  return <EmergencyAssistance />
}

// Import dynamic at the top level to avoid "use client" directive issues
import dynamic from "next/dynamic"
