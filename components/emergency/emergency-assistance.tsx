"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, MapPin, Phone } from "lucide-react"

export function EmergencyAssistance() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getLocation = () => {
    setIsLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lng: longitude })

        try {
          const response = await fetch(`/api/geocode/reverse?lat=${latitude}&lng=${longitude}`)
          const data = await response.json()

          if (data.error) {
            setError(data.error)
          } else if (data.address) {
            setAddress(data.address)
          }
        } catch (err) {
          console.error("Error fetching address:", err)
          setError("Failed to get your address")
        } finally {
          setIsLoading(false)
        }
      },
      (err) => {
        console.error("Geolocation error:", err)
        setError(`Error getting your location: ${err.message}`)
        setIsLoading(false)
      },
    )
  }

  const callEmergency = () => {
    window.location.href = "tel:911"
  }

  return (
    <div className="space-y-6">
      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-6 w-6" />
            Emergency Services
          </CardTitle>
          <CardDescription className="text-red-600">
            If you are experiencing a medical emergency, please call 911 immediately
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button variant="destructive" size="lg" className="w-full py-6 text-lg" onClick={callEmergency}>
            <Phone className="mr-2 h-5 w-5" />
            Call 911
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Location</CardTitle>
          <CardDescription>Share your location to help emergency services find you</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="p-3 mb-4 rounded-md bg-red-50 text-red-600">{error}</div>}

          {location && (
            <div className="space-y-2">
              <div className="p-3 rounded-md bg-muted flex items-start gap-2">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Your coordinates:</p>
                  <p className="text-sm">Latitude: {location.lat.toFixed(6)}</p>
                  <p className="text-sm">Longitude: {location.lng.toFixed(6)}</p>
                </div>
              </div>

              {address && (
                <div className="p-3 rounded-md bg-muted flex items-start gap-2">
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Your address:</p>
                    <p className="text-sm">{address}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={getLocation} disabled={isLoading} className="w-full">
            {isLoading ? "Getting location..." : location ? "Update location" : "Share my location"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nearby Facilities</CardTitle>
          <CardDescription>Find emergency care facilities near you</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Share your location to see nearby emergency rooms and urgent care facilities.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" disabled={!location} className="w-full">
            Find nearby facilities
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
