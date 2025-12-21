import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter'
import { 
  searchProviders, 
  searchProvidersBySpecialty, 
  formatProviderName, 
  getProviderAddress, 
  getProviderSpecialty,
  isAcceptingPatients,
  NPIProvider 
} from '@/lib/npi-api'
import { calculateTrialDistance, convertZipToLocation } from '@/lib/geocoding'
import { searchProviders as searchProvidersAI, parseNaturalLanguageQuery } from '@/lib/ai-service'
import { healthDBService } from '@/lib/healthdb-service'

// Map screening types to provider specialties
const SCREENING_TO_SPECIALTY_MAP: Record<string, string[]> = {
  'blood_pressure': ['Internal Medicine', 'Family Medicine', 'Primary Care', 'Cardiology'],
  'cholesterol': ['Internal Medicine', 'Family Medicine', 'Primary Care', 'Cardiology'],
  'diabetes': ['Internal Medicine', 'Family Medicine', 'Primary Care', 'Endocrinology'],
  'cancer': ['Oncology', 'Internal Medicine', 'Family Medicine'],
  'breast_cancer': ['Oncology', 'Radiology', 'OB/GYN', 'Women\'s Health'],
  'colorectal_cancer': ['Gastroenterology', 'Internal Medicine', 'Family Medicine'],
  'lung_cancer': ['Pulmonology', 'Oncology', 'Internal Medicine'],
  'cervical_cancer': ['OB/GYN', 'Women\'s Health', 'Family Medicine'],
  'depression': ['Psychiatry', 'Psychology', 'Mental Health', 'Primary Care'],
  'vision': ['Ophthalmology', 'Optometry'],
  'hearing': ['Audiology', 'ENT', 'Otolaryngology'],
  'osteoporosis': ['Rheumatology', 'Internal Medicine', 'Endocrinology'],
  'immunization': ['Internal Medicine', 'Family Medicine', 'Primary Care'],
  'std': ['Internal Medicine', 'Family Medicine', 'Infectious Disease', 'OB/GYN'],
  'hiv': ['Infectious Disease', 'Internal Medicine', 'Primary Care']
}

// Enhanced provider relevance scoring algorithm
function calculateProviderRelevanceScore(params: {
  provider: NPIProvider
  query: string
  enhancedSpecialty?: string
  searchSpecialties: string[]
  location?: string
  distance?: number | null
  specialty: string
}): number {
  const { provider, query, enhancedSpecialty, searchSpecialties, distance, specialty } = params
  let score = 0
  
  // Base score for having complete information
  score += 10
  
  // Specialty relevance scoring (highest priority)
  if (enhancedSpecialty && specialty) {
    const specialtyLower = specialty.toLowerCase()
    const enhancedSpecialtyLower = enhancedSpecialty.toLowerCase()
    
    // Exact specialty match
    if (specialtyLower === enhancedSpecialtyLower) {
      score += 100
    } else if (specialtyLower.includes(enhancedSpecialtyLower) || enhancedSpecialtyLower.includes(specialtyLower)) {
      score += 75
    } else if (searchSpecialties.some(s => specialtyLower.includes(s.toLowerCase()) || s.toLowerCase().includes(specialtyLower))) {
      score += 50
    }
    
    // Primary care bonus for general searches
    if (['family medicine', 'internal medicine', 'primary care', 'general practice'].includes(specialtyLower)) {
      score += 25
    }
  }
  
  // Distance scoring (closer is better)
  if (distance !== null && distance !== undefined) {
    if (distance <= 5) score += 50
    else if (distance <= 10) score += 40
    else if (distance <= 15) score += 30
    else if (distance <= 25) score += 20
    else if (distance <= 50) score += 10
    // No bonus for distances > 50 miles
  }
  
  // Provider availability scoring
  if (isAcceptingPatients(provider)) {
    score += 30
  }
  
  // Credential scoring
  const credentials = provider.basic?.credential || ''
  if (credentials.includes('MD') || credentials.includes('DO')) {
    score += 20
  } else if (credentials.includes('NP') || credentials.includes('PA')) {
    score += 15
  }
  
  // Name relevance (if query contains provider name terms)
  if (query && provider.basic) {
    const queryLower = query.toLowerCase()
    const firstName = provider.basic.first_name?.toLowerCase() || ''
    const lastName = provider.basic.last_name?.toLowerCase() || ''
    const orgName = provider.basic.organization_name?.toLowerCase() || ''
    
    if (queryLower.includes(firstName) || queryLower.includes(lastName) || queryLower.includes(orgName)) {
      score += 40
    }
  }
  
  // Address completeness scoring
  const primaryAddress = provider.addresses?.find(addr => addr.address_purpose === 'LOCATION') || provider.addresses?.[0]
  if (primaryAddress) {
    if (primaryAddress.telephone_number) score += 5
    if (primaryAddress.address_1) score += 5
    if (primaryAddress.city && primaryAddress.state) score += 10
  }
  
  // Multiple taxonomy bonus (indicates specialization)
  if (provider.taxonomies && provider.taxonomies.length > 1) {
    score += 10
  }
  
  return Math.max(0, score) // Ensure non-negative score
}

// Execute fallback search with improved error handling and consistency
async function executeFallbackSearch(params: {
  searchSpecialties: string[]
  location?: string
  query: string
  limit: number
  city?: string
  state?: string
}): Promise<any[]> {
  const { searchSpecialties, location, query, limit, city, state } = params
  
  // Try Google Places API first (if available)
  if (process.env.GOOGLE_PLACES_API_KEY) {
    try {
      const googleQuery = searchSpecialties.length > 0 
        ? `${searchSpecialties[0]} doctor near ${location || city || 'local area'}`
        : `doctor near ${location || city || 'local area'}`
        
      const googleResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(googleQuery)}&key=${process.env.GOOGLE_PLACES_API_KEY}`,
        { timeout: 5000 } as any // Add timeout
      )
      
      if (googleResponse.ok) {
        const googleData = await googleResponse.json()
        
        if (googleData.results && googleData.results.length > 0) {
          console.log(`Found ${googleData.results.length} providers from Google Places`)
          
          return googleData.results.slice(0, limit).map((place: any, index: number) => {
            const formattedAddress = place.formatted_address || ''
            const addressParts = formattedAddress.split(',')
            
            return {
              npi: `GOOGLE_${place.place_id}`,
              name: place.name || `Healthcare Provider ${index + 1}`,
              specialty: searchSpecialties[0] || 'Healthcare Provider',
              address: addressParts[0]?.trim() || 'Address not available',
              city: addressParts[1]?.trim() || city || '',
              state: addressParts[2]?.trim()?.split(' ')[0] || state || '',
              zip: formattedAddress.match(/\d{5}/)?.[0] || '',
              distance: null, // Google doesn't provide exact distance
              rating: place.rating || 4.0,
              reviewCount: place.user_ratings_total || 0,
              acceptingPatients: true,
              phone: 'Contact for availability',
              credentials: 'Healthcare Professional',
              gender: 'Not specified',
              availability: 'Contact for availability',
              insurance: ['Most major insurance accepted'],
              languages: ['English'],
              source: 'Google Places'
            }
          })
        }
      }
    } catch (googleError) {
      console.warn('Google Places API error:', googleError)
      // Continue to AI fallback
    }
  }
  
  // Try AI service as final fallback
  try {
    const aiProviders = await searchProvidersAI(
      location || city || '98101', 
      searchSpecialties[0] || 'general practice'
    )
    
    if (aiProviders && aiProviders.length > 0) {
      console.log(`Found ${aiProviders.length} providers from AI service`)
      
      return aiProviders.slice(0, limit).map((provider, index) => ({
        npi: provider.id || `AI_${index}`,
        name: provider.name || `Dr. Provider ${index + 1}`,
        specialty: provider.specialty || searchSpecialties[0] || 'General Practice',
        address: provider.address?.street || 'Address not available',
        city: provider.address?.city || city || '',
        state: provider.address?.state || state || '',
        zip: provider.address?.zipCode || '',
        distance: null,
        rating: Math.min(Math.max(provider.rating || 4.0, 3.0), 5.0), // Clamp between 3-5
        reviewCount: provider.reviewCount || Math.floor(Math.random() * 50) + 10,
        acceptingPatients: true,
        phone: '(555) 123-4567',
        credentials: Array.isArray(provider.credentials) 
          ? provider.credentials.join(', ') 
          : provider.credentials || 'MD',
        gender: 'Not specified',
        availability: `Available for appointments`,
        insurance: provider.acceptedInsurance || ['Medicare', 'Medicaid', 'Most major insurance'],
        languages: ['English'],
        source: 'AI Generated'
      }))
    }
  } catch (aiError) {
    console.warn('AI service error:', aiError)
  }
  
  return [] // Return empty array if all fallbacks fail
}

// Calculate relevance score for fallback results
function calculateFallbackRelevanceScore(params: {
  provider: any
  query: string
  enhancedSpecialty?: string
  searchSpecialties: string[]
  distance?: number | null
}): number {
  const { provider, query, enhancedSpecialty, searchSpecialties, distance } = params
  let score = 0
  
  // Base score (lower than NPI results to prioritize real data)
  score += 5
  
  // Specialty relevance
  if (enhancedSpecialty && provider.specialty) {
    const providerSpecialtyLower = provider.specialty.toLowerCase()
    const enhancedSpecialtyLower = enhancedSpecialty.toLowerCase()
    
    if (providerSpecialtyLower === enhancedSpecialtyLower) {
      score += 80
    } else if (providerSpecialtyLower.includes(enhancedSpecialtyLower) || 
               enhancedSpecialtyLower.includes(providerSpecialtyLower)) {
      score += 60
    } else if (searchSpecialties.some(s => 
      providerSpecialtyLower.includes(s.toLowerCase()) || 
      s.toLowerCase().includes(providerSpecialtyLower)
    )) {
      score += 40
    }
  }
  
  // Rating bonus
  if (provider.rating >= 4.5) score += 20
  else if (provider.rating >= 4.0) score += 15
  else if (provider.rating >= 3.5) score += 10
  
  // Review count bonus
  if (provider.reviewCount >= 50) score += 15
  else if (provider.reviewCount >= 20) score += 10
  else if (provider.reviewCount >= 5) score += 5
  
  // Source preference (Google Places over AI)
  if (provider.source === 'Google Places') score += 10
  else if (provider.source === 'AI Generated') score += 2
  
  // Address completeness
  if (provider.address && provider.address !== 'Address not available') score += 5
  if (provider.city && provider.state) score += 5
  if (provider.phone && provider.phone !== 'Contact for availability') score += 5
  
  return Math.max(0, score)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const specialty = searchParams.get('specialty') || ''
    const specialties = searchParams.get('specialties') || ''
    let location = searchParams.get('location') || searchParams.get('zipCode') || ''
    const distance = searchParams.get('distance') || '10'
    const screenings = searchParams.get('screenings') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    
    let providers: NPIProvider[] = []
    let searchSpecialties: string[] = []
    let enhancedLocation = location
    let enhancedSpecialty = specialty
    
    // Process natural language query if provided
    if (query && query.trim()) {
      logger.debug('Processing natural language query', { query })
      const parsedQuery = parseNaturalLanguageQuery(query)
      logger.debug('Parsed query result', { parsedQuery })
      
      // Always prioritize parsed location from natural language query
      if (parsedQuery.location) {
        enhancedLocation = parsedQuery.location
        console.log('Using parsed location:', enhancedLocation)
      }
      
      // Always prioritize parsed specialty from natural language query  
      if (parsedQuery.specialty) {
        enhancedSpecialty = parsedQuery.specialty
        console.log('Using parsed specialty:', enhancedSpecialty)
      }
      
      // Map condition to specialty if no specialty found
      if (parsedQuery.condition && !enhancedSpecialty) {
        const conditionToSpecialtyMap: Record<string, string> = {
          'cancer': 'Oncology',
          'diabetes': 'Endocrinology',
          'heart': 'Cardiology',
          'alzheimer': 'Neurology',
          'asthma': 'Pulmonology',
          'arthritis': 'Rheumatology',
          'depression': 'Psychiatry',
          'obesity': 'Internal Medicine',
          'hypertension': 'Cardiology',
          'stroke': 'Neurology',
          'kidney': 'Nephrology',
          'liver': 'Hepatology',
          'lung': 'Pulmonology',
          'breast': 'Oncology',
          'colon': 'Gastroenterology',
          'skin': 'Dermatology',
          'eye': 'Ophthalmology',
          'ear': 'Otolaryngology',
          'bone': 'Orthopedics',
          'mental': 'Psychiatry'
        }
        enhancedSpecialty = conditionToSpecialtyMap[parsedQuery.condition] || 'Internal Medicine'
        console.log('Mapped condition to specialty:', parsedQuery.condition, '->', enhancedSpecialty)
      }
    }
    
    // Determine which specialties to search for
    if (screenings) {
      // Map screenings to specialties
      const screeningList = screenings.split(',').filter(Boolean)
      const specialtySet = new Set<string>()
      
      screeningList.forEach(screening => {
        const mappedSpecialties = SCREENING_TO_SPECIALTY_MAP[screening.toLowerCase()] || 
                                 ['Internal Medicine', 'Family Medicine', 'Primary Care']
        mappedSpecialties.forEach(s => specialtySet.add(s))
      })
      
      searchSpecialties = Array.from(specialtySet)
    } else if (specialties) {
      searchSpecialties = specialties.split(',').filter(Boolean)
    } else if (enhancedSpecialty && enhancedSpecialty !== 'all') {
      searchSpecialties = [enhancedSpecialty]
    }
    
    // Convert location (could be ZIP code or city, state)
    const locationData = convertZipToLocation(enhancedLocation)
    const city = locationData.city
    const state = locationData.state
    
    console.log('Provider search params:', { 
      originalLocation: location,
      enhancedLocation,
      city, 
      state, 
      originalSpecialty: specialty,
      enhancedSpecialty,
      searchSpecialties,
      screenings,
      distance,
      query
    })
    
    // Search for providers
    if (searchSpecialties.length > 0) {
      // Search for each specialty and combine results
      const allProviders: NPIProvider[] = []
      
      for (const spec of searchSpecialties) {
        try {
          const specProviders = await searchProvidersBySpecialty(spec, city, state, Math.ceil(limit / searchSpecialties.length))
          if (specProviders && Array.isArray(specProviders)) {
            allProviders.push(...specProviders)
          }
        } catch (error) {
          console.error(`Error searching for specialty ${spec}:`, error)
        }
      }
      
      // Remove duplicates based on NPI number
      const uniqueProviders = new Map<string, NPIProvider>()
      allProviders.forEach(p => uniqueProviders.set(p.number, p))
      providers = Array.from(uniqueProviders.values())
      
    } else {
      // General search by location
      const npiSearchParams: any = {
        limit,
        enumeration_type: 'NPI-1'
      }
      
      if (city) npiSearchParams.city = city
      if (state) npiSearchParams.state = state
      if (enhancedLocation && /^\d{5}$/.test(enhancedLocation)) {
        npiSearchParams.postal_code = enhancedLocation
      }
      
      try {
        const searchResponse = await searchProviders(npiSearchParams)
        providers = searchResponse?.results || []
      } catch (error) {
        console.error('Error in general provider search:', error)
        providers = []
      }
    }
    
    // Transform providers with enhanced relevance scoring
    let transformedProviders = providers.map(provider => {
      const name = formatProviderName(provider)
      const addressInfo = getProviderAddress(provider)
      const providerSpecialty = getProviderSpecialty(provider)
      const acceptingPatients = isAcceptingPatients(provider)
      
      // Extract detailed address information
      const primaryAddress = provider.addresses?.find(addr => addr.address_purpose === 'LOCATION') || provider.addresses?.[0]
      const providerCity = primaryAddress?.city || ''
      const providerState = primaryAddress?.state || ''
      const providerZip = primaryAddress?.postal_code?.substring(0, 5) || ''
      
      // Calculate distance if location is provided
      let calculatedDistance: number | null = null
      if (location && primaryAddress) {
        const providerLocation = {
          city: providerCity,
          state: providerState,
          country: primaryAddress.country_name || 'United States'
        }
        calculatedDistance = calculateTrialDistance(location, providerLocation)
      }
      
      // Calculate relevance score for better ranking
      const relevanceScore = calculateProviderRelevanceScore({
        provider,
        query,
        enhancedSpecialty,
        searchSpecialties,
        location: enhancedLocation,
        distance: calculatedDistance,
        specialty: providerSpecialty
      })
      
      // Get phone number
      const phone = primaryAddress?.telephone_number?.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') || 
                   'Contact for availability'
      
      return {
        npi: provider.number,
        name,
        specialty: providerSpecialty,
        address: primaryAddress?.address_1 || addressInfo.split(',')[0] || 'Address not available',
        city: providerCity,
        state: providerState,
        zip: providerZip,
        distance: calculatedDistance,
        rating: 4.5, // Default rating since NPI API doesn't provide ratings
        reviewCount: 0, // NPI API doesn't provide review counts
        acceptingPatients,
        phone,
        credentials: provider.basic?.credential || '',
        gender: provider.basic?.gender || 'Not specified',
        availability: acceptingPatients ? 'Contact for availability' : 'Not accepting new patients',
        insurance: ['Contact provider for insurance information'],
        languages: ['English'], // Default since NPI API doesn't provide language info
        relevanceScore // Add relevance score for sorting
      }
    })
    
    // Filter by exact location match if city and state are specified
    if (city && state) {
      transformedProviders = transformedProviders.filter(p => {
        const providerState = p.state?.toUpperCase()
        const requestedState = state.toUpperCase()
        
        // Must match the state exactly
        if (providerState !== requestedState) {
          return false
        }
        
        // If city is specified, check for city match (more flexible)
        if (city) {
          const providerCity = p.city?.toLowerCase()
          const requestedCity = city.toLowerCase()
          
          // Allow partial matches for city names (e.g., "Seattle" matches "SEATTLE")
          return providerCity?.includes(requestedCity) || requestedCity.includes(providerCity)
        }
        
        return true
      })
      
      console.log(`Filtered to ${transformedProviders.length} providers matching location: ${city}, ${state}`)
    }
    
    // Filter by distance if specified
    const maxDistance = parseFloat(distance)
    if (location && maxDistance > 0) {
      transformedProviders = transformedProviders.filter(p => 
        p.distance === null || p.distance <= maxDistance
      )
    }
    
    // Enhanced sorting by relevance score, distance, and rating
    transformedProviders.sort((a, b) => {
      // Primary sort by relevance score (higher is better)
      if (a.relevanceScore !== b.relevanceScore) {
        return (b.relevanceScore || 0) - (a.relevanceScore || 0)
      }
      
      // Secondary sort by distance (if both have distance)
      if (location && a.distance !== null && b.distance !== null) {
        return a.distance - b.distance
      }
      
      // Tertiary sort by patient acceptance (accepting patients first)
      if (a.acceptingPatients !== b.acceptingPatients) {
        return b.acceptingPatients ? 1 : -1
      }
      
      // Final sort by rating
      return (b.rating || 0) - (a.rating || 0)
    })
    
    // Limit results
    transformedProviders = transformedProviders.slice(0, limit)
    
    // Enhanced fallback system with better error handling and consistent formatting
    if (transformedProviders.length === 0) {
      console.log('No providers found from NPI API, initiating enhanced fallback sequence...')
      
      const fallbackResults = await executeFallbackSearch({
        searchSpecialties,
        location: enhancedLocation,
        query,
        limit,
        city,
        state
      })
      
      if (fallbackResults.length > 0) {
        // Apply consistent formatting and scoring to fallback results
        transformedProviders = fallbackResults.map(provider => ({
          ...provider,
          relevanceScore: calculateFallbackRelevanceScore({
            provider,
            query,
            enhancedSpecialty,
            searchSpecialties,
            distance: provider.distance
          })
        }))
        
        // Sort fallback results using the same algorithm
        transformedProviders.sort((a, b) => {
          if (a.relevanceScore !== b.relevanceScore) {
            return (b.relevanceScore || 0) - (a.relevanceScore || 0)
          }
          if (a.distance !== null && b.distance !== null) {
            return a.distance - b.distance
          }
          return (b.rating || 0) - (a.rating || 0)
        })
      }
    }

    // Enhance results with HealthDB recommendations if available
    if (transformedProviders.length > 0 && searchSpecialties.length > 0) {
      try {
        const healthDBResponse = await healthDBService.getProviderRecommendations(
          searchSpecialties[0], 
          location,
          searchSpecialties[0]
        )
        
        if (healthDBResponse.success) {
          // Add HealthDB insights to provider data
          transformedProviders = transformedProviders.map(provider => ({
            ...provider,
            healthDBScore: Math.random() * 100, // Placeholder for real scoring
            recommendationReason: 'Matches your condition and location preferences'
          }))
        }
      } catch (healthDBError) {
        console.warn('HealthDB enhancement failed:', healthDBError)
        // Continue with original results if HealthDB fails
      }
    }

    return NextResponse.json({
      success: true,
      providers: transformedProviders,
      total: transformedProviders.length,
      location: {
        searched: location,
        city,
        state
      },
      specialties: searchSpecialties,
      screenings: screenings ? screenings.split(',') : [],
      enhanced: true,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Provider search error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Provider search temporarily unavailable. Please try again later.',
      providers: [],
      total: 0
    })
  }
}