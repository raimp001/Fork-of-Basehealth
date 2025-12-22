"use client"

import { useSearchParams, useParams } from "next/navigation"
import { VirtualVisit } from "@/components/appointment/virtual-visit"
import { useRouter } from "next/navigation"

export default function VirtualVisitPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const date = searchParams.get("date")
  const time = searchParams.get("time")
  const providerId = params?.providerId as string

  // In a real app, you would fetch the provider data and appointment details here
  const mockProvider = {
    id: providerId,
    name: "Dr. John Smith",
    specialty: "Family Medicine",
    rating: 4.8,
    reviewCount: 120,
    address: {
      city: "Seattle",
      state: "WA",
    },
    isVerified: true,
  }

  const handleEndCall = () => {
    // In a real app, you would:
    // 1. End the video call
    // 2. Update the appointment status
    // 3. Show a feedback form
    router.push("/appointments")
  }

  if (!date || !time) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Appointment</h1>
          <p className="text-muted-foreground">
            This appointment link is invalid or has expired.
          </p>
        </div>
      </div>
    )
  }

  return (
    <VirtualVisit
      provider={mockProvider}
      appointmentId={`${providerId}-${date}-${time}`}
      onEndCall={handleEndCall}
    />
  )
} 