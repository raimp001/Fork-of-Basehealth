"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function EmergencyClient() {
  const [location, setLocation] = useState<string | null>(null)

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get your location. Please try again.")
        },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }

  return (
    <div className="mt-6 border rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Your Location</h2>
      <p className="mb-4">Share your location to help emergency services find you:</p>

      {location ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
          <p className="font-medium">Your current location:</p>
          <p>{location}</p>
        </div>
      ) : (
        <p className="mb-4">Click the button below to share your current location.</p>
      )}

      <Button onClick={getLocation} className="bg-blue-600 hover:bg-blue-700">
        {location ? "Update Location" : "Share My Location"}
      </Button>
    </div>
  )
}
