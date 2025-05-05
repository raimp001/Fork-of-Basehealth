"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { PhoneCall, MapPin, AlertTriangle } from "lucide-react"

export default function EmergencyAssistance() {
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleEmergencyCall = () => {
    // In a real app, this would use a native API to initiate a call
    window.location.href = "tel:911"
  }

  const handleFindNearbyER = () => {
    setLoading(true)
    setError("")

    try {
      // Navigate to provider search with emergency filter
      router.push(`/providers/search?emergency=true&location=${encodeURIComponent(location)}`)
    } catch (err) {
      setError("Unable to find emergency services. Please call 911 directly.")
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card className="border-red-500">
        <CardHeader className="bg-red-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle />
            Emergency Services
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Button onClick={handleEmergencyCall} size="lg" className="w-full bg-red-600 hover:bg-red-700">
              <PhoneCall className="mr-2 h-5 w-5" />
              Call 911
            </Button>

            <p className="text-sm text-gray-500">
              If you are experiencing a medical emergency, please call 911 immediately.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Find Nearby Emergency Room</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="location">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="location">Enter Location</TabsTrigger>
              <TabsTrigger value="current">Use Current Location</TabsTrigger>
            </TabsList>

            <TabsContent value="location" className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter ZIP code or address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <Button onClick={handleFindNearbyER} disabled={!location || loading} className="w-full">
                  <MapPin className="mr-2 h-4 w-4" />
                  Find Nearby Emergency Rooms
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="current" className="space-y-4">
              <Button
                onClick={() => {
                  setLoading(true)
                  // In a real app, this would use the Geolocation API
                  setTimeout(() => {
                    router.push("/providers/search?emergency=true&useCurrentLocation=true")
                  }, 1000)
                }}
                disabled={loading}
                className="w-full"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Use My Current Location
              </Button>
            </TabsContent>
          </Tabs>

          {error && <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• Call 911 for immediate life-threatening emergencies</li>
            <li>• Poison Control: 1-800-222-1222</li>
            <li>• Mental Health Crisis Line: 988</li>
            <li>• Have your medical information ready if possible</li>
            <li>• Stay calm and follow dispatcher instructions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
