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

  // Provider data loaded from the appointment booking
  const provider = {
    id: providerId,
    name: "Provider",
    specialty: "Healthcare Provider",
    rating: 0,
    reviewCount: 0,
    address: {
      city: "",
      state: "",
    },
    isVerified: false,
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
      provider={provider}
      appointmentId={`${providerId}-${date}-${time}`}
      onEndCall={handleEndCall}
    />
  )
} 