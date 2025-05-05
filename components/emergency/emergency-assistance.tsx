"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Phone, MapPin } from "lucide-react"

export default function EmergencyAssistance() {
  const [location, setLocation] = useState("")
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState("")

  const detectLocation = () => {
    setLoadingLocation(true)
    setLocationError("")

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      setLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          // Call reverse geocoding API
          const response = await fetch(`/api/geocode/reverse?lat=${latitude}&lng=${longitude}`)

          if (!response.ok) {
            throw new Error("Failed to get address from coordinates")
          }

          const data = await response.json()
          setLocation(data.address || `${latitude}, ${longitude}`)
        } catch (error) {
          setLocationError("Failed to determine your location")
          console.error("Geolocation error:", error)
        } finally {
          setLoadingLocation(false)
        }
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`)
        setLoadingLocation(false)
      },
    )
  }

  useEffect(() => {
    // Automatically try to detect location when component mounts
    detectLocation()
  }, [])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-red-600" />
            <span>Emergency Contacts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-md">
              <h3 className="font-bold text-red-800">Emergency Services: 911</h3>
              <p className="text-sm text-red-700">For immediate life-threatening emergencies</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-md">
              <h3 className="font-bold text-blue-800">Poison Control: 1-800-222-1222</h3>
              <p className="text-sm text-blue-700">For exposure to potentially harmful substances</p>
            </div>

            <div className="p-4 bg-amber-50 rounded-md">
              <h3 className="font-bold text-amber-800">Crisis Hotline: 988</h3>
              <p className="text-sm text-amber-700">For mental health crisis support</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>Your Location</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Current Location</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Your current address"
                  className="flex-1"
                />
                <Button onClick={detectLocation} disabled={loadingLocation} variant="outline">
                  {loadingLocation ? "Detecting..." : "Detect"}
                </Button>
              </div>
              {locationError && <p className="text-sm text-red-600">{locationError}</p>}
            </div>

            <div className="p-4 bg-gray-100 rounded-md">
              <h3 className="font-bold">Nearby Facilities</h3>
              <p className="text-sm text-gray-600 mb-2">Based on your location</p>

              {location ? (
                <ul className="space-y-2">
                  <li className="p-2 bg-white rounded border border-gray-200">
                    <div className="font-medium">City General Hospital</div>
                    <div className="text-sm text-gray-600">2.3 miles away</div>
                  </li>
                  <li className="p-2 bg-white rounded border border-gray-200">
                    <div className="font-medium">Westside Urgent Care</div>
                    <div className="text-sm text-gray-600">1.5 miles away</div>
                  </li>
                </ul>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Please provide your location to see nearby facilities</span>
                </div>
              )}
            </div>

            <Button className="w-full bg-red-600 hover:bg-red-700">Find Emergency Care Near Me</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
