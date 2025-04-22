export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Geocodes a ZIP code to get its coordinates
 * @param zipCode The ZIP code to geocode
 * @returns Promise resolving to coordinates or null if geocoding fails
 */
export async function geocodeZipCode(zipCode: string): Promise<Coordinates | null> {
  try {
    // In a real implementation, this would call the Google Maps Geocoding API
    // For now, we'll return mock coordinates based on the first digit of the ZIP code
    const firstDigit = Number.parseInt(zipCode.charAt(0))

    // Generate deterministic but different coordinates based on ZIP code
    const latitude = 37.0 + firstDigit * 0.5 + Number.parseInt(zipCode.substring(1, 3)) * 0.01
    const longitude = -122.0 - firstDigit * 0.5 - Number.parseInt(zipCode.substring(3, 5)) * 0.01

    return { latitude, longitude }
  } catch (error) {
    console.error("Error geocoding ZIP code:", error)
    return null
  }
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
