import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter'
import { apiCache, generateKey } from '@/lib/api-cache'

// Basic ZIP code to city/state mapping
const ZIP_TO_LOCATION: Record<string, { city: string; state: string }> = {
  // New York
  '10001': { city: 'New York', state: 'NY' },
  '10002': { city: 'New York', state: 'NY' },
  '10003': { city: 'New York', state: 'NY' },
  '11201': { city: 'Brooklyn', state: 'NY' },
  
  // California
  '90001': { city: 'Los Angeles', state: 'CA' },
  '90210': { city: 'Beverly Hills', state: 'CA' },
  '94102': { city: 'San Francisco', state: 'CA' },
  '95113': { city: 'San Jose', state: 'CA' },
  '92101': { city: 'San Diego', state: 'CA' },
  
  // Texas
  '75201': { city: 'Dallas', state: 'TX' },
  '77001': { city: 'Houston', state: 'TX' },
  '78701': { city: 'Austin', state: 'TX' },
  
  // Illinois
  '60601': { city: 'Chicago', state: 'IL' },
  
  // Florida
  '33101': { city: 'Miami', state: 'FL' },
  '32801': { city: 'Orlando', state: 'FL' },
  
  // Washington
  '98101': { city: 'Seattle', state: 'WA' },
  
  // Massachusetts
  '02101': { city: 'Boston', state: 'MA' },
  
  // Pennsylvania
  '19019': { city: 'Philadelphia', state: 'PA' },
  
  // Georgia
  '30301': { city: 'Atlanta', state: 'GA' },
  
  // Colorado
  '80201': { city: 'Denver', state: 'CO' },
  
  // Arizona
  '85001': { city: 'Phoenix', state: 'AZ' }
}

// Function to determine state from ZIP code prefix
function getStateFromZip(zip: string): string | null {
  const prefix = zip.substring(0, 3)
  
  // More specific mappings
  if (prefix >= '010' && prefix <= '027') return 'MA'
  if (prefix >= '028' && prefix <= '029') return 'RI'
  if (prefix >= '030' && prefix <= '038') return 'NH'
  if (prefix >= '039' && prefix <= '049') return 'ME'
  if (prefix >= '050' && prefix <= '059') return 'VT'
  if (prefix >= '060' && prefix <= '069') return 'CT'
  if (prefix >= '070' && prefix <= '089') return 'NJ'
  if (prefix >= '100' && prefix <= '149') return 'NY'
  if (prefix >= '150' && prefix <= '196') return 'PA'
  if (prefix >= '200' && prefix <= '219') return 'MD'
  if (prefix >= '220' && prefix <= '246') return 'VA'
  if (prefix >= '270' && prefix <= '289') return 'NC'
  if (prefix >= '290' && prefix <= '299') return 'SC'
  if (prefix >= '300' && prefix <= '319') return 'GA'
  if (prefix >= '320' && prefix <= '339') return 'FL'
  if (prefix >= '350' && prefix <= '369') return 'AL'
  if (prefix >= '370' && prefix <= '385') return 'TN'
  if (prefix >= '400' && prefix <= '427') return 'KY'
  if (prefix >= '430' && prefix <= '458') return 'OH'
  if (prefix >= '460' && prefix <= '479') return 'IN'
  if (prefix >= '480' && prefix <= '499') return 'MI'
  if (prefix >= '500' && prefix <= '528') return 'IA'
  if (prefix >= '530' && prefix <= '549') return 'WI'
  if (prefix >= '550' && prefix <= '567') return 'MN'
  if (prefix >= '600' && prefix <= '629') return 'IL'
  if (prefix >= '630' && prefix <= '658') return 'MO'
  if (prefix >= '660' && prefix <= '679') return 'KS'
  if (prefix >= '680' && prefix <= '693') return 'NE'
  if (prefix >= '700' && prefix <= '714') return 'LA'
  if (prefix >= '716' && prefix <= '729') return 'AR'
  if (prefix >= '730' && prefix <= '749') return 'OK'
  if (prefix >= '750' && prefix <= '799') return 'TX'
  if (prefix >= '800' && prefix <= '816') return 'CO'
  if (prefix >= '820' && prefix <= '831') return 'WY'
  if (prefix >= '832' && prefix <= '838') return 'ID'
  if (prefix >= '840' && prefix <= '847') return 'UT'
  if (prefix >= '850' && prefix <= '865') return 'AZ'
  if (prefix >= '870' && prefix <= '884') return 'NM'
  if (prefix >= '889' && prefix <= '898') return 'NV'
  if (prefix >= '900' && prefix <= '961') return 'CA'
  if (prefix >= '967' && prefix <= '968') return 'HI'
  if (prefix >= '970' && prefix <= '979') return 'OR'
  if (prefix >= '980' && prefix <= '994') return 'WA'
  if (prefix >= '995' && prefix <= '999') return 'AK'
  
  return null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const zipCode = searchParams.get('zipCode') || ''
    
    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid ZIP code format'
      }, { status: 400 })
    }
    
    // First check our mapping
    const location = ZIP_TO_LOCATION[zipCode]
    
    if (location) {
      return NextResponse.json({
        success: true,
        zipCode,
        city: location.city,
        state: location.state,
        source: 'local'
      })
    }
    
    // Try to get state from ZIP prefix
    const state = getStateFromZip(zipCode)
    
    if (state) {
      return NextResponse.json({
        success: true,
        zipCode,
        city: '',
        state,
        source: 'prefix',
        partial: true
      })
    }
    
    // If we have Google Geocoding API key, try that
    if (process.env.GOOGLE_GEOCODING_API_KEY) {
      try {
        const googleResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${process.env.GOOGLE_GEOCODING_API_KEY}`
        )
        
        if (googleResponse.ok) {
          const data = await googleResponse.json()
          
          if (data.results && data.results.length > 0) {
            const result = data.results[0]
            let city = ''
            let state = ''
            
            for (const component of result.address_components) {
              if (component.types.includes('locality')) {
                city = component.long_name
              }
              if (component.types.includes('administrative_area_level_1')) {
                state = component.short_name
              }
            }
            
            if (city || state) {
              return NextResponse.json({
                success: true,
                zipCode,
                city,
                state,
                source: 'google'
              })
            }
          }
        }
      } catch (error) {
        logger.error('Google Geocoding error', error)
      }
    }
    
    // Fallback - couldn't determine location
    return NextResponse.json({
      success: false,
      zipCode,
      error: 'Unable to determine location for this ZIP code',
      message: 'Please enter city and state manually'
    })
    
  } catch (error) {
    logger.error('Geocoding error', error)
    
    return NextResponse.json({
      success: false,
      error: 'Geocoding service error'
    }, { status: 500 })
  }
}