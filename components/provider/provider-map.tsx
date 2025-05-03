"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Locate } from "lucide-react"
import type { Provider } from "@/types/user"
import { geocodeZipCode } from "@/lib/geolocation-service"

interface ProviderMapProps {
  providers: Provider[]
  zipCode?: string
  onProviderSelect?: (provider: Provider) => void
}

export function ProviderMap({ providers, zipCode, onProviderSelect }: ProviderMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [centerCoordinates, setCenterCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  // Load Google Maps script
  useEffect(() => {
    if (!mapLoaded && mapRef.current) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=&libraries=places&callback=initMap`
      script.async = true
      script.defer = true

      // Define the callback function
      window.initMap = () => {
        setMapLoaded(true)
      }

      document.head.appendChild(script)

      return () => {
        // Clean up
        delete window.initMap
        document.head.removeChild(script)
      }
    }
  }, [mapLoaded])

  // Initialize map when loaded
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapLoaded || !mapRef.current) return

      // Default coordinates (San Francisco)
      let mapCenter = { lat: 37.7749, lng: -122.4194 }

      // If zipCode is provided, geocode it
      if (zipCode) {
        const coordinates = await geocodeZipCode(zipCode)
        if (coordinates) {
          mapCenter = { lat: coordinates.latitude, lng: coordinates.longitude }
          setCenterCoordinates(mapCenter)
        }
      }

      // Create the map
      const newMap = new google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 11,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      })

      setMap(newMap)
    }

    initializeMap()
  }, [mapLoaded, zipCode])

  // Add markers for providers
  useEffect(() => {
    if (!map || !providers.length) return

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null))

    // Create new markers
    const newMarkers = providers.map((provider, index) => {
      // Try to get coordinates from provider address
      const geocodeAddress = async () => {
        const fullAddress = `${provider.address.street}, ${provider.address.city}, ${provider.address.state} ${provider.address.zipCode}`
        const coordinates = await geocodeZipCode(provider.address.zipCode)

        if (coordinates) {
          const position = { lat: coordinates.latitude, lng: coordinates.longitude }

          // Add a small offset to prevent markers from overlapping
          position.lat += (Math.random() - 0.5) * 0.01
          position.lng += (Math.random() - 0.5) * 0.01

          const marker = new google.maps.Marker({
            position,
            map,
            title: provider.name,
            label: {
              text: (index + 1).toString(),
              color: "white",
            },
            animation: google.maps.Animation.DROP,
          })

          // Add info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="max-width: 200px">
                <h3 style="font-weight: bold; margin-bottom: 5px">${provider.name}</h3>
                <p style="margin: 0">${provider.specialty}</p>
                <p style="margin: 5px 0">${fullAddress}</p>
                <p style="margin: 0">Rating: ${provider.rating.toFixed(1)} (${provider.reviewCount} reviews)</p>
              </div>
            `,
          })

          marker.addListener("click", () => {
            infoWindow.open(map, marker)
            if (onProviderSelect) {
              onProviderSelect(provider)
            }
          })

          return marker
        }
        return null
      }

      return geocodeAddress()
    })

    // Wait for all markers to be created
    Promise.all(newMarkers).then((resolvedMarkers) => {
      setMarkers(resolvedMarkers.filter(Boolean) as google.maps.Marker[])
    })

    // Fit bounds to show all markers
    if (providers.length > 1) {
      const bounds = new google.maps.LatLngBounds()
      markers.forEach((marker) => {
        if (marker && marker.getPosition()) {
          bounds.extend(marker.getPosition()!)
        }
      })
      map.fitBounds(bounds)
    }

    return () => {
      markers.forEach((marker) => marker.setMap(null))
    }
  }, [map, providers, onProviderSelect])

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (!map) return

    setIsLoadingLocation(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          map.setCenter(userLocation)
          map.setZoom(13)

          // Add a marker for the user's location
          new google.maps.Marker({
            position: userLocation,
            map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
            title: "Your Location",
          })

          setCenterCoordinates(userLocation)
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
    <Card className="relative overflow-hidden">
      <div ref={mapRef} className="w-full h-[400px]" />

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

      {/* Map loading state */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p>Loading map...</p>
          </div>
        </div>
      )}

      {/* No providers state */}
      {mapLoaded && providers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center p-4">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>No providers to display on the map.</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search criteria.</p>
          </div>
        </div>
      )}
    </Card>
  )
}

// Add TypeScript definitions for Google Maps
declare global {
  interface Window {
    initMap: () => void
    google: any // Specify 'any' type to avoid Typescript error
  }
}
