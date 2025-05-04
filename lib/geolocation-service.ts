export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Geocodes a location (ZIP code or city) to get its coordinates
 * @param location The location to geocode (ZIP code or city name)
 * @param state Optional state for city geocoding
 * @returns Promise resolving to coordinates or null if geocoding fails
 */
export async function geocodeLocation(location: string, state?: string): Promise<Coordinates | null> {
  try {
    // Determine if location is a ZIP code or city
    const isZipCode = /^\d{5}$/.test(location.trim())

    // Build the query parameters
    const params = new URLSearchParams()
    if (isZipCode) {
      params.append("zipCode", location)
    } else {
      params.append("city", location)
      if (state) {
        params.append("state", state)
      }
    }

    // Use our server-side API route for geocoding
    const response = await fetch(`/api/geocode?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    return data.coordinates
  } catch (error) {
    console.error("Error geocoding location:", error)
    return null
  }
}

/**
 * Geocodes a ZIP code to get its coordinates
 * @param zipCode The ZIP code to geocode
 * @returns Promise resolving to coordinates or null if geocoding fails
 */
export async function geocodeZipCode(zipCode: string): Promise<Coordinates | null> {
  return geocodeLocation(zipCode)
}

/**
 * Calculates the distance between two coordinates using the Haversine formula
 * @param coord1 First set of coordinates
 * @param coord2 Second set of coordinates
 * @returns Distance in miles
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 3958.8 // Earth's radius in miles

  // Convert latitude and longitude from degrees to radians
  const lat1Rad = (coord1.latitude * Math.PI) / 180
  const lon1Rad = (coord1.longitude * Math.PI) / 180
  const lat2Rad = (coord2.latitude * Math.PI) / 180
  const lon2Rad = (coord2.longitude * Math.PI) / 180

  // Haversine formula
  const dLat = lat2Rad - lat1Rad
  const dLon = lon2Rad - lon1Rad
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance
}

/**
 * Gets the user's current location
 * @returns Promise resolving to coordinates or null if geolocation fails
 */
export async function getCurrentLocation(): Promise<Coordinates | null> {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting current location:", error)
          resolve(null)
        },
        { enableHighAccuracy: true },
      )
    } else {
      console.error("Geolocation is not supported by this browser")
      resolve(null)
    }
  })
}
