"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, AlertTriangle } from "lucide-react"

export default function EmergencyAssistance() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getLocation = () => {
    setIsLoadingLocation(true)
    setError(null)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setLocation(coords)

          // Get address from coordinates
          try {
            const response = await fetch(`/api/geocode/reverse?lat=${coords.lat}&lng=${coords.lng}`)
            const data = await response.json()

            if (data.success && data.address) {
              setAddress(data.address)
            } else {
              console.error("Failed to get address:", data.error)
            }
          } catch (err) {
            console.error("Error fetching address:", err)
          }

          setIsLoadingLocation(false)
        },
        (err) => {
          console.error("Error getting location:", err)
          setError("Unable to get your location. Please enable location services.")
          setIsLoadingLocation(false)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    } else {
      setError("Geolocation is not supported by this browser.")
      setIsLoadingLocation(false)
    }
  }

  const callEmergency = () => {
    window.location.href = "tel:911"
  }

  useEffect(() => {
    // Automatically try to get location when component mounts
    getLocation()
  }, [])

  return (
    <div className="space-y-4">
      <Card className="border-red-500">
        <CardHeader className="bg-red-500 text-white">
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6" />
            Emergency Assistance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-lg font-medium">
              If you are experiencing a medical emergency, please call 911 immediately.
            </p>

            <Button variant="destructive" size="lg" className="w-full text-lg py-6" onClick={callEmergency}>
              <Phone className="mr-2 h-6 w-6" /> Call 911
            </Button>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Your Location</h3>

              {isLoadingLocation ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  <span className="ml-2">Getting your location...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-red-700">{error}</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={getLocation}>
                    Try Again
                  </Button>
                </div>
              ) : location ? (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-red-500 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      {address ? (
                        <p>{address}</p>
                      ) : (
                        <p>
                          Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Share this location with emergency services if needed
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Button variant="outline" onClick={getLocation}>
                  <MapPin className="mr-2 h-4 w-4" /> Get My Location
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nearby Emergency Services</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">These are the closest emergency services to your location:</p>

          {!location ? (
            <p>Please enable location services to see nearby emergency facilities.</p>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium">Memorial Hospital Emergency Room</h3>
                <p className="text-sm text-gray-500">1.2 miles away</p>
                <p className="text-sm">123 Medical Center Dr</p>
                <div className="mt-2">
                  <Button variant="outline" size="sm" className="mr-2">
                    <Phone className="mr-1 h-3 w-3" /> Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="mr-1 h-3 w-3" /> Directions
                  </Button>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium">Urgent Care Center</h3>
                <p className="text-sm text-gray-500">2.5 miles away</p>
                <p className="text-sm">456 Health Parkway</p>
                <div className="mt-2">
                  <Button variant="outline" size="sm" className="mr-2">
                    <Phone className="mr-1 h-3 w-3" /> Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="mr-1 h-3 w-3" /> Directions
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
