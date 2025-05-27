import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const specialty = searchParams.get('specialty') || ''
    const location = searchParams.get('location') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    
    let providers: NPIProvider[] = []
    
    // Convert location (could be ZIP code or city, state)
    const locationData = convertZipToLocation(location)
    const city = locationData.city
    const state = locationData.state
    
    if (specialty && specialty !== 'all') {
      // Search by specialty
      providers = await searchProvidersBySpecialty(specialty, city, state, limit)
    } else if (query) {
      // Search by name or organization
      const searchResponse = await searchProviders({
        first_name: query.includes(' ') ? query.split(' ')[0] : undefined,
        last_name: query.includes(' ') ? query.split(' ').slice(1).join(' ') : query,
        organization_name: query,
        city,
        state,
        limit,
        enumeration_type: 'NPI-1'
      })
      providers = searchResponse.results
    } else {
      // General search by location
      const searchResponse = await searchProviders({
        city,
        state,
        limit,
        enumeration_type: 'NPI-1'
      })
      providers = searchResponse.results
    }
    
    // Transform providers to our format
    const transformedProviders = providers.map(provider => {
      const name = formatProviderName(provider)
      const address = getProviderAddress(provider)
      const providerSpecialty = getProviderSpecialty(provider)
      const acceptingPatients = isAcceptingPatients(provider)
      
      // Calculate distance if location is provided
      let distance: number | null = null
      if (location && provider.addresses?.[0]) {
        const providerLocation = {
          city: provider.addresses[0].city,
          state: provider.addresses[0].state,
          country: provider.addresses[0].country_name
        }
        distance = calculateTrialDistance(location, providerLocation)
      }
      
      // Generate a rating (in real app, this would come from reviews/ratings service)
      const rating = Math.round((Math.random() * 2 + 3) * 10) / 10 // 3.0-5.0 rating
      
      // Get phone number from address or basic info
      const phone = provider.addresses?.find(addr => addr.telephone_number)?.telephone_number || 
                   provider.basic?.authorized_official_telephone_number || 
                   'Phone not available'
      
      return {
        id: provider.number, // Use 'number' instead of 'npi'
        name,
        specialty: providerSpecialty,
        address,
        distance,
        rating,
        reviewCount: Math.floor(Math.random() * 200) + 10, // Mock review count
        acceptingPatients,
        phone,
        npi: provider.number, // Use 'number' field
        credentials: provider.basic?.credential || '',
        gender: provider.basic?.sex || 'Not specified', // Use 'sex' instead of 'gender'
        // Mock additional fields that would come from other sources
        availability: acceptingPatients ? 'Next available: ' + 
          new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toLocaleDateString() : 
          'Not accepting new patients',
        insurance: ['Medicare', 'Medicaid', 'Blue Cross Blue Shield', 'Aetna', 'Cigna'].slice(0, Math.floor(Math.random() * 3) + 2),
        languages: ['English', 'Spanish', 'French', 'Mandarin'].slice(0, Math.floor(Math.random() * 2) + 1)
      }
    })
    
    // Sort by distance if location provided, otherwise by rating
    if (location) {
      transformedProviders.sort((a, b) => {
        if (a.distance === null && b.distance === null) return b.rating - a.rating
        if (a.distance === null) return 1
        if (b.distance === null) return -1
        return a.distance - b.distance
      })
    } else {
      transformedProviders.sort((a, b) => b.rating - a.rating)
    }
    
    return NextResponse.json({
      success: true,
      providers: transformedProviders,
      total: transformedProviders.length,
      query: {
        query,
        specialty,
        location
      }
    })
    
  } catch (error) {
    console.error('Provider search error:', error)
    
    // Return fallback mock data if API fails
    const mockProviders = [
      {
        id: 'fallback_1',
        name: 'Dr. Sarah Johnson, MD',
        specialty: 'Family Medicine',
        address: 'API temporarily unavailable',
        distance: null,
        rating: 4.8,
        reviewCount: 156,
        acceptingPatients: true,
        phone: 'Contact for availability',
        npi: 'API_FALLBACK',
        credentials: 'MD',
        gender: 'Female',
        availability: 'API temporarily unavailable',
        insurance: ['Medicare', 'Blue Cross Blue Shield'],
        languages: ['English']
      }
    ]
    
    return NextResponse.json({
      success: false,
      error: 'Provider search temporarily unavailable',
      providers: mockProviders,
      total: mockProviders.length,
      fallback: true
    })
  }
}
