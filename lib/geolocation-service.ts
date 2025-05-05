import { logger } from "./logger"

// Types
export interface GeocodeResult {
  lat: number
  lng: number
  formattedAddress: string
}

export interface ReverseGeocodeResult {
  formattedAddress: string
  city: string
  state: string
  zip: string
}

// Geocode an address to coordinates
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    logger.info(`Geocoding address: ${address}`)

    const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`)

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.success || !data.location) {
      throw new Error("Invalid geocoding response")
    }

    return {
      lat: data.location.lat,
      lng: data.location.lng,
      formattedAddress: data.formattedAddress,
    }
  } catch (error) {
    logger.error("Error geocoding address:", error)
    return null
  }
}

// Geocode a ZIP code to coordinates
export async function geocodeZip(zip: string): Promise<GeocodeResult | null> {
  try {
    logger.info(`Geocoding ZIP: ${zip}`)

    const response = await fetch(`/api/geocode?zip=${encodeURIComponent(zip)}`)

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.success || !data.location) {
      throw new Error("Invalid geocoding response")
    }

    return {
      lat: data.location.lat,
      lng: data.location.lng,
      formattedAddress: data.formattedAddress,
    }
  } catch (error) {
    logger.error("Error geocoding ZIP:", error)
    return null
  }
}

// Reverse geocode coordinates to an address
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  try {
    logger.info(`Reverse geocoding: ${lat}, ${lng}`)

    const response = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`)

    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.success || !data.address) {
      throw new Error("Invalid reverse geocoding response")
    }

    return data.address
  } catch (error) {
    logger.error("Error reverse geocoding:", error)
    return null
  }
}

// Get current location using browser geolocation API
export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    })
  })
}

// Export default to fix the error
export default {
  geocodeAddress,
  geocodeZip,
  reverseGeocode,
  getCurrentLocation,
}
