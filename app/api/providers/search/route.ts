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
import db from '@/lib/mock-db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const specialty = searchParams.get('specialty') || ''
    const location = searchParams.get('location') || searchParams.get('zipCode') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    
    let providers: NPIProvider[] = []
    let transformedProviders: any[] = []
    let usedFallback = false
    let fallbackType = ''
    
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

    // First, try NPI API if we have good location data
    if (city && state) {
      try {
        // Build search parameters
        const npiSearchParams: any = {
          limit,
          enumeration_type: 'NPI-1'
        }
        
        // Add location parameters
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
          providers = searchResponse?.results || []
        } else {
          // General search by location
          const searchResponse = await searchProviders(npiSearchParams)
          providers = searchResponse?.results || []
        }
        
        // Transform NPI providers to our format
        transformedProviders = providers.map(provider => {
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
          
          // Generate a website URL for some providers (simulate real providers having websites)
          const hasWebsite = Math.random() > 0.4 // 60% of providers have websites
          const website = hasWebsite ? `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.medicalpractice.com` : undefined
          
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
            languages: ['English', 'Spanish', 'French', 'Mandarin'].slice(0, Math.floor(Math.random() * 2) + 1),
            website
          }
        })
        
        console.log(`Found ${transformedProviders.length} providers from NPI API`)
      } catch (npiError) {
        console.log('NPI API failed:', npiError)
        // Continue to fallback
      }
    }

    // If no providers from NPI, try AI service
    if (transformedProviders.length === 0 && location) {
      try {
        console.log('Trying AI service fallback...')
        const aiProviders = await searchProvidersAI(location, specialty)
        
        if (aiProviders && aiProviders.length > 0) {
          console.log(`Found ${aiProviders.length} providers from AI service`)
          
          transformedProviders = aiProviders.map(provider => {
            const hasWebsite = Math.random() > 0.5
            const website = hasWebsite ? `https://${provider.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.healthcarepractice.com` : undefined
            
            return {
              id: provider.id,
              name: provider.name,
              specialty: provider.specialty,
              address: `${provider.address?.street || 'Address not available'}, ${provider.address?.city || city || 'Unknown'}, ${provider.address?.state || state || 'Unknown'} ${provider.address?.zipCode || location}`,
              distance: null,
              rating: provider.rating || (3 + Math.random() * 2),
              reviewCount: provider.reviewCount || Math.floor(Math.random() * 100) + 10,
              acceptingPatients: true,
              phone: '(555) 123-4567',
              npi: provider.id.startsWith('ai-') ? `AI_${provider.id}` : provider.id,
              credentials: Array.isArray(provider.credentials) ? provider.credentials.join(', ') : provider.credentials || 'MD',
              gender: 'Not specified',
              availability: `Next available: ${new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
              insurance: ['Medicare', 'Medicaid', 'Blue Cross Blue Shield'],
              languages: ['English'],
              website
            }
          })
          
          usedFallback = true
          fallbackType = 'AI'
        }
      } catch (aiError) {
        console.log('AI service failed:', aiError)
        // Continue to mock fallback
      }
    }

    // If still no providers, use mock database as final fallback
    if (transformedProviders.length === 0) {
      try {
        console.log('Using mock database fallback...')
        
        // Ensure mock database is seeded
        await db.seedData()
        
        let mockProviders = await db.getAllProviders()
        console.log(`Found ${mockProviders.length} providers in mock database`)
        
        // If no providers in database, generate some for the location
        if (mockProviders.length === 0 && location) {
          const zipCode = /^\d{5}$/.test(location) ? location : '98101' // Default to Seattle ZIP
          mockProviders = db.generateProvidersForZipCode(zipCode, 10)
          console.log(`Generated ${mockProviders.length} providers for ZIP ${zipCode}`)
        }
        
        // Filter by specialty if provided
        if (specialty && specialty !== 'all') {
          const filtered = mockProviders.filter((p) => 
            p.specialty.toLowerCase().includes(specialty.toLowerCase()) ||
            specialty.toLowerCase().includes(p.specialty.toLowerCase())
          )
          if (filtered.length > 0) {
            mockProviders = filtered
          }
          // If no specialty match, keep all providers rather than show none
        }
        
        // Transform to API format
        transformedProviders = mockProviders.map(provider => ({
          id: provider.id,
          name: provider.name,
          specialty: provider.specialty,
          address: `${provider.address.street}, ${provider.address.city}, ${provider.address.state} ${provider.address.zipCode}`,
          distance: null,
          rating: provider.rating,
          reviewCount: provider.reviewCount,
          acceptingPatients: provider.verificationStatus === 'approved',
          phone: '(555) 123-4567', // Mock phone for demo
          npi: provider.id,
          credentials: provider.credentials.join(', '),
          gender: 'Not specified',
          availability: provider.verificationStatus === 'approved' ? 
            `Next available: ${new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}` : 
            'Not accepting new patients',
          insurance: provider.acceptedInsurance,
          languages: ['English'],
          website: `https://${provider.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.practice.com`
        }))
        
        usedFallback = true
        fallbackType = 'Mock Database'
        
      } catch (mockError) {
        console.error('Mock database fallback failed:', mockError)
        
        // Last resort: generate some basic providers
        const zipCode = /^\d{5}$/.test(location || '') ? location : '98101'
        const fallbackProviders = Array.from({ length: 5 }, (_, i) => ({
          id: `fallback-${i}`,
          name: `Dr. ${['John', 'Jane', 'Mike', 'Sarah', 'David'][i]} ${ ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson'][i]}`,
          specialty: specialty || 'Family Medicine',
          address: `${100 + i * 100} Medical Center Dr, ${city || 'Seattle'}, ${state || 'WA'} ${zipCode}`,
          distance: null,
          rating: 4.0 + Math.random(),
          reviewCount: 20 + i * 15,
          acceptingPatients: true,
          phone: `(555) ${String(123 + i).padStart(3, '0')}-4567`,
          npi: `FALLBACK${String(i).padStart(4, '0')}`,
          credentials: 'MD',
          gender: 'Not specified',
          availability: `Next available: ${new Date(Date.now() + (i + 1) * 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
          insurance: ['Medicare', 'Medicaid', 'Blue Cross Blue Shield'],
          languages: ['English'],
          website: undefined
        }))
        
        transformedProviders = fallbackProviders
        usedFallback = true
        fallbackType = 'Emergency Fallback'
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

    return NextResponse.json({
      success: true,
      providers: transformedProviders,
      total: transformedProviders.length,
      usedFallback,
      fallbackType,
      message: usedFallback ? `Results from ${fallbackType} - ${transformedProviders.length} providers found` : undefined,
      query: {
        query,
        specialty,
        location: location || undefined
      }
    })
    
  } catch (error) {
    console.error('Provider search error:', error)
    
    // Even if everything fails, return some basic providers
    const basicProviders = [
      {
        id: 'emergency-1',
        name: 'Dr. Emergency Provider',
        specialty: 'Family Medicine', 
        address: 'Medical Center, Your Area',
        distance: null,
        rating: 4.5,
        reviewCount: 50,
        acceptingPatients: true,
        phone: '(555) 123-4567',
        npi: 'EMERGENCY001',
        credentials: 'MD',
        gender: 'Not specified',
        availability: 'Call for availability',
        insurance: ['Most Insurance Accepted'],
        languages: ['English'],
        website: undefined
      }
    ]
    
    return NextResponse.json({
      success: true,
      providers: basicProviders,
      total: basicProviders.length,
      usedFallback: true,
      fallbackType: 'Emergency Provider',
      message: 'Provider search temporarily limited. Please try again later.',
      query: {
        query: searchParams.get('query') || '',
        specialty: searchParams.get('specialty') || '',
        location: searchParams.get('location') || searchParams.get('zipCode') || ''
      }
    })
  }
}
