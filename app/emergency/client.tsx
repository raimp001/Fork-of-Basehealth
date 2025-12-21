"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, AlertCircle, CheckCircle, Phone, Clock, Navigation } from "lucide-react"

export function EmergencyClient() {
  const [location, setLocation] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getLocation = () => {
    setIsGettingLocation(true)
    setError(null)
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
          setIsGettingLocation(false)
        },
        (error) => {
          // Error handled by error state
          setError("Unable to get your location. Please try again or contact emergency services directly.")
          setIsGettingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
      setError("Geolocation is not supported by this browser.")
      setIsGettingLocation(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Location Sharing Card */}
      <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-red-100 to-orange-100 w-12 h-12 rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Location Sharing</CardTitle>
              <CardDescription className="text-gray-600">
                Share your precise location with emergency services
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200 w-fit">
            <AlertCircle className="h-3 w-3 mr-1" />
            Emergency Feature
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            In case of emergency, sharing your exact location helps first responders reach you faster. 
            Your location data is only used for emergency purposes.
          </p>

          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {location ? (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-lg backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-900 mb-1">Location Captured Successfully</p>
                  <p className="text-sm text-green-700 font-mono bg-green-100/50 px-2 py-1 rounded">
                    {location}
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    This location has been saved and can be shared with emergency services
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50/50 border border-gray-200/50 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Navigation className="h-5 w-5 text-gray-500" />
                <p className="text-gray-600">
                  Click the button below to capture and share your current location
                </p>
              </div>
            </div>
          )}

          <Button 
            onClick={getLocation} 
            disabled={isGettingLocation}
            className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg font-medium"
          >
            {isGettingLocation ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Getting Location...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {location ? "Update Location" : "Share My Location"}
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Emergency Instructions */}
      <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            Emergency Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50/50 border border-red-200/50 rounded-lg text-center">
              <h4 className="font-bold text-red-900 text-lg mb-1">911</h4>
              <p className="text-sm text-red-700">Emergency Services</p>
            </div>
            <div className="p-4 bg-blue-50/50 border border-blue-200/50 rounded-lg text-center">
              <h4 className="font-bold text-blue-900 text-lg mb-1">(555) 123-4567</h4>
              <p className="text-sm text-blue-700">Poison Control</p>
            </div>
            <div className="p-4 bg-green-50/50 border border-green-200/50 rounded-lg text-center">
              <h4 className="font-bold text-green-900 text-lg mb-1">(555) 987-6543</h4>
              <p className="text-sm text-green-700">Mental Health Crisis</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Time Info */}
      {location && (
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50/60 to-indigo-50/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Estimated Response Time</h3>
                <p className="text-blue-700">
                  With your location shared, emergency services can typically reach you within <strong>8-12 minutes</strong> in this area.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
