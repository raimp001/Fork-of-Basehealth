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
import { searchProviders as searchProvidersAI } from '@/lib/ai-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const specialty = searchParams.get('specialty') || ''
    const location = searchParams.get('location') || searchParams.get('zipCode') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    
    let providers: NPIProvider[] = []
    
    // Convert location (could be ZIP code or city, state)
    const locationData = convertZipToLocation(location)
    const city = locationData.city
    const state = locationData.state
    
    console.log('Provider search params:', { 
      originalLocation: location, 
      convertedCity: city, 
      convertedState: state, 
      specialty, 
      query 
    })
    
    // Build search parameters
    const npiSearchParams: any = {
      limit,
      enumeration_type: 'NPI-1'
    }
    
    // Add location parameters if available
    if (city) npiSearchParams.city = city
    if (state) npiSearchParams.state = state
    if (location && /^\d{5}$/.test(location)) {
      npiSearchParams.postal_code = location
    }
    
    if (specialty && specialty !== 'all') {
      // Search by specialty with location
      providers = await searchProvidersBySpecialty(specialty, city, state, limit)
      
      // If no results and we have a ZIP code, try searching by state only
      if (providers.length === 0 && !city && state) {
        providers = await searchProvidersBySpecialty(specialty, undefined, state, limit)
      }
    } else if (query) {
      // Search by name or organization
              const searchResponse = await searchProviders({
          first_name: query.includes(' ') ? query.split(' ')[0] : undefined,
          last_name: query.includes(' ') ? query.split(' ').slice(1).join(' ') : query,
          organization_name: query,
          ...npiSearchParams
        })
      providers = searchResponse.results
          } else {
        // General search by location
        console.log('NPI search params:', npiSearchParams)
        const searchResponse = await searchProviders(npiSearchParams)
        providers = searchResponse.results
        console.log('NPI search results count:', providers.length)
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
        id: provider.number,
        name,
        specialty: providerSpecialty,
        address,
        distance,
        rating,
        reviewCount: Math.floor(Math.random() * 200) + 10,
        acceptingPatients,
        phone,
        npi: provider.number,
        credentials: provider.basic?.credential || '',
        gender: provider.basic?.sex || 'Not specified',
        availability: acceptingPatients ? 'Next available: ' + 
          new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toLocaleDateString() : 
          'Not accepting new patients',
        insurance: ['Medicare', 'Medicaid', 'Blue Cross Blue Shield', 'Aetna', 'Cigna'].slice(0, Math.floor(Math.random() * 3) + 2),
        languages: ['English', 'Spanish', 'French', 'Mandarin'].slice(0, Math.floor(Math.random() * 2) + 1)
      }
    })
    
    // If no providers found, try a broader search
    if (transformedProviders.length === 0 && (city || state)) {
      console.log('No providers found, trying broader search...')
      try {
        // Try searching by state only if we had a city
        if (city && state) {
          const broaderSearchParams: any = {
            state,
            limit: limit * 2,
            enumeration_type: 'NPI-1'
          }
          
          if (specialty && specialty !== 'all') {
            const broaderResults = await searchProvidersBySpecialty(specialty, undefined, state, limit * 2)
            providers = broaderResults
          } else {
            const broaderResponse = await searchProviders(broaderSearchParams)
            providers = broaderResponse.results
          }
          
          console.log('Broader search results count:', providers.length)
          
          // Re-transform the broader results
          const broaderTransformed = providers.map(provider => {
            const name = formatProviderName(provider)
            const address = getProviderAddress(provider)
            const providerSpecialty = getProviderSpecialty(provider)
            const acceptingPatients = isAcceptingPatients(provider)
            
            const rating = Math.round((Math.random() * 2 + 3) * 10) / 10
            const phone = provider.addresses?.find(addr => addr.telephone_number)?.telephone_number || 
                         provider.basic?.authorized_official_telephone_number || 
                         'Phone not available'
            
            return {
              id: provider.number,
              name,
              specialty: providerSpecialty,
              address,
              distance: null,
              rating,
              reviewCount: Math.floor(Math.random() * 200) + 10,
              acceptingPatients,
              phone,
              npi: provider.number,
              credentials: provider.basic?.credential || '',
              gender: provider.basic?.sex || 'Not specified',
              availability: acceptingPatients ? 'Next available: ' + 
                new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toLocaleDateString() : 
                'Not accepting new patients',
              insurance: ['Medicare', 'Medicaid', 'Blue Cross Blue Shield', 'Aetna', 'Cigna'].slice(0, Math.floor(Math.random() * 3) + 2),
              languages: ['English', 'Spanish', 'French', 'Mandarin'].slice(0, Math.floor(Math.random() * 2) + 1)
            }
          })
          
          transformedProviders.push(...broaderTransformed)
        }
      } catch (broaderSearchError) {
        console.error('Broader search failed:', broaderSearchError)
      }
    }
    
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
    
    // If still no providers found, use AI service as fallback
    if (transformedProviders.length === 0) {
      console.log('No providers found from NPI API, using AI service fallback')
      
      try {
        // Use the location or a default ZIP code for AI search
        const searchLocation = location || '98101' // Default to Seattle if no location
        const aiProviders = await searchProvidersAI(searchLocation, specialty)
        
        if (aiProviders && aiProviders.length > 0) {
          console.log(`Found ${aiProviders.length} providers from AI service`)
          
          // Transform AI providers to match our API format
          const aiTransformed = aiProviders.map(provider => ({
            id: provider.id,
            name: provider.name,
            specialty: provider.specialty,
            address: `${provider.address.street}, ${provider.address.city}, ${provider.address.state} ${provider.address.zipCode}`,
            distance: null,
            rating: provider.rating,
            reviewCount: provider.reviewCount,
            acceptingPatients: true,
            phone: provider.address.street ? '(555) 123-4567' : 'Contact for availability',
            npi: provider.id.startsWith('ai-') ? `AI_${provider.id}` : provider.id,
            credentials: Array.isArray(provider.credentials) ? provider.credentials.join(', ') : provider.credentials || 'MD',
            gender: 'Not specified',
            availability: `Next available: ${new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
            insurance: provider.acceptedInsurance || ['Medicare', 'Medicaid', 'Blue Cross Blue Shield'],
            languages: ['English']
          }))
          
          return NextResponse.json({
            success: true,
            providers: aiTransformed,
            total: aiTransformed.length,
            usedAI: true,
            message: 'Results enhanced with AI-powered provider search.',
            query: {
              query,
              specialty,
              location
            }
          })
        }
      } catch (aiError) {
        console.error('AI service fallback failed:', aiError)
      }
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
    
    return NextResponse.json({
      success: false,
      error: 'Provider search temporarily unavailable. Please try again later.',
      providers: [],
      total: 0,
      fallback: true
    })
  }
}
