"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Phone, MapPin, AlertTriangle, Ambulance, Info } from "lucide-react"

export function EmergencyAssistance() {
  const [location, setLocation] = useState("")
  const [isLocating, setIsLocating] = useState(false)
  const [isCalling, setIsCalling] = useState(false)

  const handleGetLocation = () => {
    setIsLocating(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, we would use the coordinates to find nearby emergency services
          console.log("Location:", position.coords.latitude, position.coords.longitude)
          setLocation(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`)
          setIsLocating(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLocating(false)
        },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
      setIsLocating(false)
    }
  }

  const handleEmergencyCall = () => {
    setIsCalling(true)

    // Simulate a call
    setTimeout(() => {
      setIsCalling(false)
      alert("This is a demo. In a real emergency, please call 911 directly.")
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Emergency Warning</AlertTitle>
        <AlertDescription>
          If you are experiencing a life-threatening emergency, please call 911 immediately or go to your nearest
          emergency room.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Assistance</CardTitle>
          <CardDescription>Get help quickly in case of a medical emergency</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="emergency">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
              <TabsTrigger value="urgent">Urgent Care</TabsTrigger>
              <TabsTrigger value="telehealth">Telehealth</TabsTrigger>
            </TabsList>

            <TabsContent value="emergency" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="location">Your Location</Label>
                <div className="flex space-x-2">
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your address or use current location"
                    className="flex-1"
                  />
                  <Button onClick={handleGetLocation} disabled={isLocating} variant="outline">
                    {isLocating ? "Locating..." : "Get Location"}
                    <MapPin className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Button
                  size="lg"
                  variant="destructive"
                  className="h-20"
                  onClick={handleEmergencyCall}
                  disabled={isCalling}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  {isCalling ? "Connecting..." : "Call Emergency Services (911)"}
                </Button>

                <Button size="lg" className="h-20" variant="outline">
                  <Ambulance className="mr-2 h-5 w-5" />
                  Find Nearest ER
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="urgent" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="urgent-location">Your Location</Label>
                <div className="flex space-x-2">
                  <Input
                    id="urgent-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your address or use current location"
                    className="flex-1"
                  />
                  <Button onClick={handleGetLocation} disabled={isLocating} variant="outline">
                    {isLocating ? "Locating..." : "Get Location"}
                    <MapPin className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <Button className="w-full">
                  <Ambulance className="mr-2 h-4 w-4" />
                  Find Urgent Care Centers
                </Button>
              </div>

              <div className="bg-muted p-4 rounded-md mt-4">
                <h3 className="font-medium flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  When to use urgent care:
                </h3>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Minor injuries and illnesses</li>
                  <li>• Fever without rash</li>
                  <li>• Vomiting or persistent diarrhea</li>
                  <li>• Abdominal pain</li>
                  <li>• Dehydration</li>
                  <li>• Minor broken bones and sprains</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="telehealth" className="space-y-4 pt-4">
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium">On-Demand Virtual Care</h3>
                <p className="text-sm mt-1">
                  Connect with a healthcare provider within minutes for non-emergency medical issues.
                </p>
              </div>

              <Button className="w-full">Start Virtual Urgent Care Visit</Button>

              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  Available 24/7 for minor illnesses, prescription refills, and medical advice.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <p className="text-sm text-muted-foreground">
            Remember: For life-threatening emergencies, always call 911 or go to the nearest emergency room.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
