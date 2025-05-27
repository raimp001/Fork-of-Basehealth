// Geocoding and distance calculation utilities
export interface Coordinates {
  latitude: number
  longitude: number
}

export interface LocationData {
  city?: string
  state?: string
  country?: string
  coordinates?: Coordinates
}

// Haversine formula to calculate distance between two points on Earth
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(coord2.latitude - coord1.latitude)
  const dLon = toRadians(coord2.longitude - coord1.longitude)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Major US cities and states coordinates database
export const locationCoordinates: Record<string, Coordinates> = {
  // California cities
  'los angeles, california': { latitude: 34.0522, longitude: -118.2437 },
  'san francisco, california': { latitude: 37.7749, longitude: -122.4194 },
  'san diego, california': { latitude: 32.7157, longitude: -117.1611 },
  'sacramento, california': { latitude: 38.5816, longitude: -121.4944 },
  'fresno, california': { latitude: 36.7378, longitude: -119.7871 },
  'irvine, california': { latitude: 33.6846, longitude: -117.8265 },
  'california': { latitude: 36.7783, longitude: -119.4179 }, // Center of California
  
  // Other major cities
  'new york, new york': { latitude: 40.7128, longitude: -74.0060 },
  'chicago, illinois': { latitude: 41.8781, longitude: -87.6298 },
  'houston, texas': { latitude: 29.7604, longitude: -95.3698 },
  'phoenix, arizona': { latitude: 33.4484, longitude: -112.0740 },
  'philadelphia, pennsylvania': { latitude: 39.9526, longitude: -75.1652 },
  'san antonio, texas': { latitude: 29.4241, longitude: -98.4936 },
  'dallas, texas': { latitude: 32.7767, longitude: -96.7970 },
  'austin, texas': { latitude: 30.2672, longitude: -97.7431 },
  'jacksonville, florida': { latitude: 30.3322, longitude: -81.6557 },
  'fort worth, texas': { latitude: 32.7555, longitude: -97.3308 },
  'columbus, ohio': { latitude: 39.9612, longitude: -82.9988 },
  'charlotte, north carolina': { latitude: 35.2271, longitude: -80.8431 },
  'seattle, washington': { latitude: 47.6062, longitude: -122.3321 },
  'denver, colorado': { latitude: 39.7392, longitude: -104.9903 },
  'boston, massachusetts': { latitude: 42.3601, longitude: -71.0589 },
  'detroit, michigan': { latitude: 42.3314, longitude: -83.0458 },
  'nashville, tennessee': { latitude: 36.1627, longitude: -86.7816 },
  'memphis, tennessee': { latitude: 35.1495, longitude: -90.0490 },
  'portland, oregon': { latitude: 45.5152, longitude: -122.6784 },
  'las vegas, nevada': { latitude: 36.1699, longitude: -115.1398 },
  'louisville, kentucky': { latitude: 38.2527, longitude: -85.7585 },
  'baltimore, maryland': { latitude: 39.2904, longitude: -76.6122 },
  'milwaukee, wisconsin': { latitude: 43.0389, longitude: -87.9065 },
  'albuquerque, new mexico': { latitude: 35.0844, longitude: -106.6504 },
  'tucson, arizona': { latitude: 32.2226, longitude: -110.9747 },
  'atlanta, georgia': { latitude: 33.7490, longitude: -84.3880 },
  'miami, florida': { latitude: 25.7617, longitude: -80.1918 },
  'mobile, alabama': { latitude: 30.6954, longitude: -88.0399 },
  'birmingham, alabama': { latitude: 33.5186, longitude: -86.8104 },
  'huntsville, alabama': { latitude: 34.7304, longitude: -86.5861 },
  'montgomery, alabama': { latitude: 32.3668, longitude: -86.3000 },
  'orlando, florida': { latitude: 28.5383, longitude: -81.3792 },
  'tampa, florida': { latitude: 27.9506, longitude: -82.4572 },
  'fort lauderdale, florida': { latitude: 26.1224, longitude: -80.1373 },
  'st. petersburg, florida': { latitude: 27.7676, longitude: -82.6403 },
  'tallahassee, florida': { latitude: 30.4518, longitude: -84.2807 },
  'gainesville, florida': { latitude: 29.6516, longitude: -82.3248 },
  
  // States (center coordinates)
  'alabama': { latitude: 32.3617, longitude: -86.2792 },
  'alaska': { latitude: 64.0685, longitude: -152.2782 },
  'arizona': { latitude: 34.2744, longitude: -111.2847 },
  'arkansas': { latitude: 34.8938, longitude: -92.4426 },
  'colorado': { latitude: 39.0646, longitude: -105.3272 },
  'connecticut': { latitude: 41.5834, longitude: -72.7622 },
  'delaware': { latitude: 39.1612, longitude: -75.5264 },
  'florida': { latitude: 27.7663, longitude: -81.6868 },
  'georgia': { latitude: 33.2490, longitude: -83.4426 },
  'hawaii': { latitude: 21.1098, longitude: -157.5311 },
  'idaho': { latitude: 44.2394, longitude: -114.5103 },
  'illinois': { latitude: 40.3363, longitude: -89.0022 },
  'indiana': { latitude: 39.8647, longitude: -86.2604 },
  'iowa': { latitude: 42.0046, longitude: -93.2140 },
  'kansas': { latitude: 38.5111, longitude: -96.8005 },
  'kentucky': { latitude: 37.6690, longitude: -84.6514 },
  'louisiana': { latitude: 31.1801, longitude: -91.8749 },
  'maine': { latitude: 44.6074, longitude: -69.3977 },
  'maryland': { latitude: 39.0724, longitude: -76.7902 },
  'massachusetts': { latitude: 42.2373, longitude: -71.5314 },
  'michigan': { latitude: 43.3266, longitude: -84.5361 },
  'minnesota': { latitude: 45.7326, longitude: -93.9196 },
  'mississippi': { latitude: 32.7364, longitude: -89.6678 },
  'missouri': { latitude: 38.4623, longitude: -92.3020 },
  'montana': { latitude: 47.0527, longitude: -110.2148 },
  'nebraska': { latitude: 41.1289, longitude: -98.2883 },
  'nevada': { latitude: 38.4199, longitude: -117.1219 },
  'new hampshire': { latitude: 43.4108, longitude: -71.5653 },
  'new jersey': { latitude: 40.3140, longitude: -74.5089 },
  'new mexico': { latitude: 34.8375, longitude: -106.2371 },
  'new york': { latitude: 42.1497, longitude: -74.9384 },
  'north carolina': { latitude: 35.6411, longitude: -79.8431 },
  'north dakota': { latitude: 47.5362, longitude: -99.7930 },
  'ohio': { latitude: 40.3736, longitude: -82.7755 },
  'oklahoma': { latitude: 35.5376, longitude: -96.9247 },
  'oregon': { latitude: 44.5672, longitude: -122.1269 },
  'pennsylvania': { latitude: 40.5773, longitude: -77.2640 },
  'rhode island': { latitude: 41.6772, longitude: -71.5101 },
  'south carolina': { latitude: 33.8191, longitude: -80.9066 },
  'south dakota': { latitude: 44.2853, longitude: -99.4632 },
  'tennessee': { latitude: 35.7449, longitude: -86.7489 },
  'texas': { latitude: 31.1060, longitude: -97.6475 },
  'utah': { latitude: 40.1135, longitude: -111.8535 },
  'vermont': { latitude: 44.0407, longitude: -72.7093 },
  'virginia': { latitude: 37.7680, longitude: -78.2057 },
  'washington': { latitude: 47.3917, longitude: -121.5708 },
  'west virginia': { latitude: 38.4680, longitude: -80.9696 },
  'wisconsin': { latitude: 44.2619, longitude: -89.6165 },
  'wyoming': { latitude: 42.7475, longitude: -107.2085 }
}

// Get coordinates for a location string
export function getLocationCoordinates(locationString: string): Coordinates | null {
  if (!locationString) return null
  
  const normalized = locationString.toLowerCase().trim()
  
  // Try exact match first
  if (locationCoordinates[normalized]) {
    return locationCoordinates[normalized]
  }
  
  // Try to find partial matches - prioritize city matches over state matches
  let bestMatch: Coordinates | null = null
  let bestMatchScore = 0
  
  for (const [key, coords] of Object.entries(locationCoordinates)) {
    let score = 0
    
    // Exact match gets highest score
    if (key === normalized) {
      return coords
    }
    
    // City name matches get high score
    if (key.includes(normalized) || normalized.includes(key)) {
      // Prefer city matches over state matches
      if (key.includes(',')) {
        score = 10 // City match
      } else {
        score = 5  // State match
      }
      
      // Prefer longer matches
      score += Math.min(normalized.length, key.length)
      
      if (score > bestMatchScore) {
        bestMatchScore = score
        bestMatch = coords
      }
    }
  }
  
  return bestMatch
}

// Parse location from clinical trial data
export function parseTrialLocation(location: { city?: string, state?: string, country?: string }): string {
  const parts = []
  if (location.city) parts.push(location.city.toLowerCase())
  if (location.state) parts.push(location.state.toLowerCase())
  if (location.country && location.country.toLowerCase() !== 'united states') {
    parts.push(location.country.toLowerCase())
  }
  return parts.join(', ')
}

// Calculate distance between user location and trial location
export function calculateTrialDistance(userLocation: string, trialLocation: { city?: string, state?: string, country?: string }): number | null {
  const userCoords = getLocationCoordinates(userLocation)
  if (!userCoords) return null
  
  const trialLocationString = parseTrialLocation(trialLocation)
  const trialCoords = getLocationCoordinates(trialLocationString)
  if (!trialCoords) return null
  
  return calculateDistance(userCoords, trialCoords)
} 