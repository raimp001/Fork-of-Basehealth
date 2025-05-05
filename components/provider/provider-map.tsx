"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Locate } from "lucide-react"

interface Provider {
  id: string
  name: string
  address: string
  specialties: string[]
  lat?: number
  lng?: number
  distance?: number
}

interface ProviderMapProps {
  providers: Provider[]
  center?: { lat: number; lng: number }
  onProviderSelect?: (provider: Provider) => void
}

declare global {
  interface Window {
    google: any
  }
}

export default function ProviderMap({ providers, center, onProviderSelect }: ProviderMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  // Fetch the API key from the server
  useEffect(() => {
    async function fetchApiKey() {
      try {
        const response = await fetch("/api/maps/script")
        const data = await response.json()

        if (data.success && data.apiKey) {
          setApiKey(data.apiKey)
        } else {
          setError("Could not load Maps API key")
        }
      } catch (err) {
        setError("Failed to fetch Maps API key")
      }
    }

    fetchApiKey()
  }, [])

  // Load the Google Maps script
  useEffect(() => {
    if (!apiKey || mapLoaded) return

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setMapLoaded(true)
    script.onerror = () => setError("Failed to load Google Maps")

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [apiKey, mapLoaded])

  // Initialize the map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    try {
      const defaultCenter = center || { lat: 37.7749, lng: -122.4194 } // Default to San Francisco

      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })

      setMapInstance(map)
    } catch (err) {
      setError("Error initializing map")
    }
  }, [mapLoaded, center])

  // Add markers for providers
  useEffect(() => {
    if (!mapInstance || !providers.length) return

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null))

    // Create new markers
    const newMarkers = providers
      .map((provider) => {
        // Use provider coordinates if available, otherwise geocode the address
        const position = provider.lat && provider.lng ? { lat: provider.lat, lng: provider.lng } : null

        if (!position) return null

        const marker = new window.google.maps.Marker({
          position,
          map: mapInstance,
          title: provider.name,
        })

        // Add click handler
        marker.addListener("click", () => {
          if (onProviderSelect) {
            onProviderSelect(provider)
          }

          // Create info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px;">${provider.name}</h3>
              <p style="margin: 0 0 4px 0; font-size: 14px;">${provider.specialties.join(", ")}</p>
              <p style="margin: 0; font-size: 14px;">${provider.address}</p>
              ${provider.distance ? `<p style="margin: 4px 0 0 0; font-size: 12px;">${provider.distance.toFixed(1)} miles away</p>` : ""}
            </div>
          `,
          })

          infoWindow.open(mapInstance, marker)
        })

        return marker
      })
      .filter(Boolean) as google.maps.Marker[]

    setMarkers(newMarkers)

    // Fit bounds to markers if we have any
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()

      newMarkers.forEach((marker) => {
        if (marker.getPosition()) {
          bounds.extend(marker.getPosition()!)
        }
      })

      mapInstance.fitBounds(bounds)

      // Don't zoom in too far
      const listener = window.google.maps.event.addListener(mapInstance, "idle", () => {
        if (mapInstance.getZoom()! > 16) {
          mapInstance.setZoom(16)
        }
        window.google.maps.event.removeListener(listener)
      })
    }
  }, [mapInstance, providers, onProviderSelect])

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (!mapInstance) return

    setIsLoadingLocation(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          mapInstance.setCenter(userLocation)
          mapInstance.setZoom(13)

          // Add a marker for the user's location
          new window.google.maps.Marker({
            position: userLocation,
            map: mapInstance,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
            title: "Your Location",
          })

          setIsLoadingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLoadingLocation(false)
        },
        { enableHighAccuracy: true },
      )
    } else {
      console.error("Geolocation is not supported by this browser.")
      setIsLoadingLocation(false)
    }
  }

  return (
    <Card className="w-full h-[400px] overflow-hidden">
      {error ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-red-500">{error}</p>
        </div>
      ) : !mapLoaded ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p>Loading map...</p>
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-full relative">
          <div ref={mapRef} className="w-full h-full" />
          {/* Current location button */}
          <Button
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 bg-white shadow-md"
            onClick={handleGetCurrentLocation}
            disabled={isLoadingLocation || !mapLoaded}
          >
            {isLoadingLocation ? (
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <>
                <Locate className="h-4 w-4 mr-2" />
                My Location
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  )
}
