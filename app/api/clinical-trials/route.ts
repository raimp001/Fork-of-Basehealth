import { NextRequest, NextResponse } from 'next/server'
import { healthDBService } from '@/lib/healthdb-service'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  try {
    // Build the ClinicalTrials.gov API URL with the search parameters
    const apiParams = new URLSearchParams({
      'format': 'json',
      'pageSize': searchParams.get('pageSize') || '50'
    })

    // Add the search query if provided
    const query = searchParams.get('query')
    const userLocation = searchParams.get('userLocation')
    const location = searchParams.get('location')
    const naturalLanguage = searchParams.get('naturalLanguage')
    
    // Build search query - separate condition from location for better results
    let searchCondition = ''
    let searchLocation = ''
    
    // If naturalLanguage parameter is provided, use it as the primary query
    if (naturalLanguage && naturalLanguage.trim()) {
      searchCondition = naturalLanguage.trim()
    } else {
      searchCondition = query && query.trim() ? query.trim() : ''
      searchLocation = location && location.trim() ? location.trim() : userLocation && userLocation.trim() ? userLocation.trim() : ''
    }
    
    // If query contains location info, try to separate it
    if (searchCondition && !searchLocation) {
      // Comprehensive location database for accurate parsing
      const cityStateMap = {
        // Major US Cities with proper state mapping
        'seattle': 'Seattle, WA',
        'spokane': 'Spokane, WA',
        'tacoma': 'Tacoma, WA',
        'vancouver': 'Vancouver, WA',
        'bellevue': 'Bellevue, WA',
        'everett': 'Everett, WA',
        'new york': 'New York, NY',
        'nyc': 'New York, NY',
        'brooklyn': 'Brooklyn, NY',
        'queens': 'Queens, NY',
        'manhattan': 'Manhattan, NY',
        'bronx': 'Bronx, NY',
        'buffalo': 'Buffalo, NY',
        'rochester': 'Rochester, NY',
        'syracuse': 'Syracuse, NY',
        'albany': 'Albany, NY',
        'los angeles': 'Los Angeles, CA',
        'san francisco': 'San Francisco, CA',
        'san diego': 'San Diego, CA',
        'san jose': 'San Jose, CA',
        'fresno': 'Fresno, CA',
        'sacramento': 'Sacramento, CA',
        'long beach': 'Long Beach, CA',
        'oakland': 'Oakland, CA',
        'bakersfield': 'Bakersfield, CA',
        'anaheim': 'Anaheim, CA',
        'santa ana': 'Santa Ana, CA',
        'riverside': 'Riverside, CA',
        'stockton': 'Stockton, CA',
        'irvine': 'Irvine, CA',
        'fremont': 'Fremont, CA',
        'san bernardino': 'San Bernardino, CA',
        'modesto': 'Modesto, CA',
        'fontana': 'Fontana, CA',
        'oxnard': 'Oxnard, CA',
        'moreno valley': 'Moreno Valley, CA',
        'huntington beach': 'Huntington Beach, CA',
        'glendale': 'Glendale, CA',
        'santa clarita': 'Santa Clarita, CA',
        'garden grove': 'Garden Grove, CA',
        'chicago': 'Chicago, IL',
        'aurora': 'Aurora, IL',
        'rockford': 'Rockford, IL',
        'joliet': 'Joliet, IL',
        'naperville': 'Naperville, IL',
        'springfield': 'Springfield, IL',
        'peoria': 'Peoria, IL',
        'elgin': 'Elgin, IL',
        'waukegan': 'Waukegan, IL',
        'houston': 'Houston, TX',
        'san antonio': 'San Antonio, TX',
        'dallas': 'Dallas, TX',
        'austin': 'Austin, TX',
        'fort worth': 'Fort Worth, TX',
        'el paso': 'El Paso, TX',
        'arlington': 'Arlington, TX',
        'corpus christi': 'Corpus Christi, TX',
        'plano': 'Plano, TX',
        'laredo': 'Laredo, TX',
        'lubbock': 'Lubbock, TX',
        'garland': 'Garland, TX',
        'irving': 'Irving, TX',
        'amarillo': 'Amarillo, TX',
        'grand prairie': 'Grand Prairie, TX',
        'brownsville': 'Brownsville, TX',
        'mckinney': 'McKinney, TX',
        'frisco': 'Frisco, TX',
        'phoenix': 'Phoenix, AZ',
        'tucson': 'Tucson, AZ',
        'mesa': 'Mesa, AZ',
        'chandler': 'Chandler, AZ',
        'glendale': 'Glendale, AZ',
        'scottsdale': 'Scottsdale, AZ',
        'gilbert': 'Gilbert, AZ',
        'tempe': 'Tempe, AZ',
        'peoria': 'Peoria, AZ',
        'philadelphia': 'Philadelphia, PA',
        'pittsburgh': 'Pittsburgh, PA',
        'allentown': 'Allentown, PA',
        'erie': 'Erie, PA',
        'reading': 'Reading, PA',
        'scranton': 'Scranton, PA',
        'bethlehem': 'Bethlehem, PA',
        'lancaster': 'Lancaster, PA',
        'jacksonville': 'Jacksonville, FL',
        'miami': 'Miami, FL',
        'tampa': 'Tampa, FL',
        'orlando': 'Orlando, FL',
        'st petersburg': 'St. Petersburg, FL',
        'hialeah': 'Hialeah, FL',
        'tallahassee': 'Tallahassee, FL',
        'fort lauderdale': 'Fort Lauderdale, FL',
        'port st lucie': 'Port St. Lucie, FL',
        'cape coral': 'Cape Coral, FL',
        'hollywood': 'Hollywood, FL',
        'gainesville': 'Gainesville, FL',
        'miramar': 'Miramar, FL',
        'coral springs': 'Coral Springs, FL',
        'clearwater': 'Clearwater, FL',
        'columbus': 'Columbus, OH',
        'cleveland': 'Cleveland, OH',
        'cincinnati': 'Cincinnati, OH',
        'toledo': 'Toledo, OH',
        'akron': 'Akron, OH',
        'dayton': 'Dayton, OH',
        'parma': 'Parma, OH',
        'canton': 'Canton, OH',
        'youngstown': 'Youngstown, OH',
        'charlotte': 'Charlotte, NC',
        'raleigh': 'Raleigh, NC',
        'greensboro': 'Greensboro, NC',
        'durham': 'Durham, NC',
        'winston salem': 'Winston-Salem, NC',
        'fayetteville': 'Fayetteville, NC',
        'cary': 'Cary, NC',
        'wilmington': 'Wilmington, NC',
        'high point': 'High Point, NC',
        'indianapolis': 'Indianapolis, IN',
        'fort wayne': 'Fort Wayne, IN',
        'evansville': 'Evansville, IN',
        'south bend': 'South Bend, IN',
        'carmel': 'Carmel, IN',
        'fishers': 'Fishers, IN',
        'bloomington': 'Bloomington, IN',
        'hammond': 'Hammond, IN',
        'gary': 'Gary, IN',
        'denver': 'Denver, CO',
        'colorado springs': 'Colorado Springs, CO',
        'aurora': 'Aurora, CO',
        'fort collins': 'Fort Collins, CO',
        'lakewood': 'Lakewood, CO',
        'thornton': 'Thornton, CO',
        'arvada': 'Arvada, CO',
        'westminster': 'Westminster, CO',
        'pueblo': 'Pueblo, CO',
        'washington': 'Washington, DC',
        'boston': 'Boston, MA',
        'worcester': 'Worcester, MA',
        'springfield': 'Springfield, MA',
        'lowell': 'Lowell, MA',
        'cambridge': 'Cambridge, MA',
        'new bedford': 'New Bedford, MA',
        'brockton': 'Brockton, MA',
        'quincy': 'Quincy, MA',
        'lynn': 'Lynn, MA',
        'detroit': 'Detroit, MI',
        'grand rapids': 'Grand Rapids, MI',
        'warren': 'Warren, MI',
        'sterling heights': 'Sterling Heights, MI',
        'lansing': 'Lansing, MI',
        'ann arbor': 'Ann Arbor, MI',
        'flint': 'Flint, MI',
        'dearborn': 'Dearborn, MI',
        'livonia': 'Livonia, MI',
        'nashville': 'Nashville, TN',
        'memphis': 'Memphis, TN',
        'knoxville': 'Knoxville, TN',
        'chattanooga': 'Chattanooga, TN',
        'clarksville': 'Clarksville, TN',
        'murfreesboro': 'Murfreesboro, TN',
        'franklin': 'Franklin, TN',
        'jackson': 'Jackson, TN',
        'portland': 'Portland, OR',
        'eugene': 'Eugene, OR',
        'salem': 'Salem, OR',
        'gresham': 'Gresham, OR',
        'hillsboro': 'Hillsboro, OR',
        'bend': 'Bend, OR',
        'beaverton': 'Beaverton, OR',
        'medford': 'Medford, OR',
        'springfield': 'Springfield, OR',
        'oklahoma city': 'Oklahoma City, OK',
        'tulsa': 'Tulsa, OK',
        'norman': 'Norman, OK',
        'broken arrow': 'Broken Arrow, OK',
        'lawton': 'Lawton, OK',
        'edmond': 'Edmond, OK',
        'moore': 'Moore, OK',
        'midwest city': 'Midwest City, OK',
        'las vegas': 'Las Vegas, NV',
        'henderson': 'Henderson, NV',
        'reno': 'Reno, NV',
        'north las vegas': 'North Las Vegas, NV',
        'sparks': 'Sparks, NV',
        'carson city': 'Carson City, NV',
        'louisville': 'Louisville, KY',
        'lexington': 'Lexington, KY',
        'bowling green': 'Bowling Green, KY',
        'owensboro': 'Owensboro, KY',
        'covington': 'Covington, KY',
        'richmond': 'Richmond, KY',
        'georgetown': 'Georgetown, KY',
        'florence': 'Florence, KY',
        'baltimore': 'Baltimore, MD',
        'frederick': 'Frederick, MD',
        'rockville': 'Rockville, MD',
        'gaithersburg': 'Gaithersburg, MD',
        'bowie': 'Bowie, MD',
        'hagerstown': 'Hagerstown, MD',
        'annapolis': 'Annapolis, MD',
        'college park': 'College Park, MD',
        'salisbury': 'Salisbury, MD',
        'milwaukee': 'Milwaukee, WI',
        'madison': 'Madison, WI',
        'green bay': 'Green Bay, WI',
        'kenosha': 'Kenosha, WI',
        'racine': 'Racine, WI',
        'appleton': 'Appleton, WI',
        'waukesha': 'Waukesha, WI',
        'oshkosh': 'Oshkosh, WI',
        'eau claire': 'Eau Claire, WI',
        'atlanta': 'Atlanta, GA',
        'augusta': 'Augusta, GA',
        'columbus': 'Columbus, GA',
        'savannah': 'Savannah, GA',
        'athens': 'Athens, GA',
        'sandy springs': 'Sandy Springs, GA',
        'roswell': 'Roswell, GA',
        'macon': 'Macon, GA',
        'johns creek': 'Johns Creek, GA',
        'omaha': 'Omaha, NE',
        'lincoln': 'Lincoln, NE',
        'bellevue': 'Bellevue, NE',
        'grand island': 'Grand Island, NE',
        'kearney': 'Kearney, NE',
        'fremont': 'Fremont, NE',
        'hastings': 'Hastings, NE',
        'north platte': 'North Platte, NE',
        'albuquerque': 'Albuquerque, NM',
        'las cruces': 'Las Cruces, NM',
        'rio rancho': 'Rio Rancho, NM',
        'santa fe': 'Santa Fe, NM',
        'roswell': 'Roswell, NM',
        'farmington': 'Farmington, NM',
        'clovis': 'Clovis, NM',
        'hobbs': 'Hobbs, NM'
      }

      // State abbreviations and full names
      const stateMap = {
        'alabama': 'Alabama',
        'al': 'Alabama',
        'alaska': 'Alaska',
        'ak': 'Alaska',
        'arizona': 'Arizona',
        'az': 'Arizona',
        'arkansas': 'Arkansas',
        'ar': 'Arkansas',
        'california': 'California',
        'ca': 'California',
        'colorado': 'Colorado',
        'co': 'Colorado',
        'connecticut': 'Connecticut',
        'ct': 'Connecticut',
        'delaware': 'Delaware',
        'de': 'Delaware',
        'florida': 'Florida',
        'fl': 'Florida',
        'georgia': 'Georgia',
        'ga': 'Georgia',
        'hawaii': 'Hawaii',
        'hi': 'Hawaii',
        'idaho': 'Idaho',
        'id': 'Idaho',
        'illinois': 'Illinois',
        'il': 'Illinois',
        'indiana': 'Indiana',
        'in': 'Indiana',
        'iowa': 'Iowa',
        'ia': 'Iowa',
        'kansas': 'Kansas',
        'ks': 'Kansas',
        'kentucky': 'Kentucky',
        'ky': 'Kentucky',
        'louisiana': 'Louisiana',
        'la': 'Louisiana',
        'maine': 'Maine',
        'me': 'Maine',
        'maryland': 'Maryland',
        'md': 'Maryland',
        'massachusetts': 'Massachusetts',
        'ma': 'Massachusetts',
        'michigan': 'Michigan',
        'mi': 'Michigan',
        'minnesota': 'Minnesota',
        'mn': 'Minnesota',
        'mississippi': 'Mississippi',
        'ms': 'Mississippi',
        'missouri': 'Missouri',
        'mo': 'Missouri',
        'montana': 'Montana',
        'mt': 'Montana',
        'nebraska': 'Nebraska',
        'ne': 'Nebraska',
        'nevada': 'Nevada',
        'nv': 'Nevada',
        'new hampshire': 'New Hampshire',
        'nh': 'New Hampshire',
        'new jersey': 'New Jersey',
        'nj': 'New Jersey',
        'new mexico': 'New Mexico',
        'nm': 'New Mexico',
        'new york': 'New York',
        'ny': 'New York',
        'north carolina': 'North Carolina',
        'nc': 'North Carolina',
        'north dakota': 'North Dakota',
        'nd': 'North Dakota',
        'ohio': 'Ohio',
        'oh': 'Ohio',
        'oklahoma': 'Oklahoma',
        'ok': 'Oklahoma',
        'oregon': 'Oregon',
        'or': 'Oregon',
        'pennsylvania': 'Pennsylvania',
        'pa': 'Pennsylvania',
        'rhode island': 'Rhode Island',
        'ri': 'Rhode Island',
        'south carolina': 'South Carolina',
        'sc': 'South Carolina',
        'south dakota': 'South Dakota',
        'sd': 'South Dakota',
        'tennessee': 'Tennessee',
        'tn': 'Tennessee',
        'texas': 'Texas',
        'tx': 'Texas',
        'utah': 'Utah',
        'ut': 'Utah',
        'vermont': 'Vermont',
        'vt': 'Vermont',
        'virginia': 'Virginia',
        'va': 'Virginia',
        'washington': 'Washington',
        'wa': 'Washington',
        'washington state': 'Washington',
        'west virginia': 'West Virginia',
        'wv': 'West Virginia',
        'wisconsin': 'Wisconsin',
        'wi': 'Wisconsin',
        'wyoming': 'Wyoming',
        'wy': 'Wyoming',
        'district of columbia': 'Washington, DC',
        'dc': 'Washington, DC'
      }

      // Comprehensive location extraction with priority order
      const originalQuery = searchCondition
      const lowerCondition = searchCondition.toLowerCase()
      
      // Step 1: Look for explicit "City, State" patterns first (highest priority)
      const cityStatePattern = /\b([a-zA-Z\s]+),\s*([A-Z]{2})\b/i
      const cityStateMatch = searchCondition.match(cityStatePattern)
      if (cityStateMatch) {
        searchLocation = `${cityStateMatch[1].trim()}, ${cityStateMatch[2].trim()}`
        searchCondition = searchCondition.replace(cityStateMatch[0], '').trim()
      }
      
      // Step 2: Look for known cities (medium-high priority)
      if (!searchLocation) {
        // Sort cities by length (longest first) to match more specific names first
        const sortedCities = Object.keys(cityStateMap).sort((a, b) => b.length - a.length)
        
        for (const city of sortedCities) {
          const regex = new RegExp(`\\b${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
          if (regex.test(lowerCondition)) {
            searchLocation = cityStateMap[city]
            searchCondition = searchCondition.replace(regex, '').trim()
            break
          }
        }
      }
      
      // Step 3: Look for states (medium priority)
      if (!searchLocation) {
        const sortedStates = Object.keys(stateMap).sort((a, b) => b.length - a.length)
        
        for (const state of sortedStates) {
          const regex = new RegExp(`\\b${state.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
          if (regex.test(lowerCondition)) {
            searchLocation = stateMap[state]
            searchCondition = searchCondition.replace(regex, '').trim()
            break
          }
        }
      }
      
      // Step 4: Look for location prepositions (lower priority)
      if (!searchLocation) {
        const prepositionPatterns = [
          /\b(?:in|near|at|around|from)\s+([a-zA-Z\s,]+?)(?:\s+(?:for|with|treatment|study|trial|research)|$)/i,
          /\b(?:in|near|at|around|from)\s+([a-zA-Z\s,]+)/i
        ]
        
        for (const pattern of prepositionPatterns) {
          const match = searchCondition.match(pattern)
          if (match) {
            const rawLocation = match[1].trim()
            
            // Check if it's a known city or state
            if (cityStateMap[rawLocation.toLowerCase()]) {
              searchLocation = cityStateMap[rawLocation.toLowerCase()]
            } else if (stateMap[rawLocation.toLowerCase()]) {
              searchLocation = stateMap[rawLocation.toLowerCase()]
            } else {
              // Use as-is if not in our database
              searchLocation = rawLocation
            }
            
            searchCondition = searchCondition.replace(match[0], '').trim()
            break
          }
        }
      }
      
      // Clean up the condition after location extraction
      if (searchLocation) {
        // Remove hanging prepositions
        searchCondition = searchCondition.replace(/\b(in|at|near|around|from)\s*$/i, '').trim()
        searchCondition = searchCondition.replace(/^\s*(in|at|near|around|from)\s+/i, '').trim()
        // Clean up multiple spaces
        searchCondition = searchCondition.replace(/\s+/g, ' ').trim()
        // Remove trailing/leading commas
        searchCondition = searchCondition.replace(/^[,\s]+|[,\s]+$/g, '').trim()
      }
    }
    
    if (searchCondition) {
      apiParams.append('query.cond', searchCondition)
    }
    
    if (searchLocation) {
      apiParams.append('query.locn', searchLocation)
    }

    const apiUrl = `https://clinicaltrials.gov/api/v2/studies?${apiParams.toString()}`
    
    console.log('Clinical Trials Search Parameters:', {
      originalQuery: naturalLanguage || query,
      extractedCondition: searchCondition,
      extractedLocation: searchLocation,
      apiUrl
    })
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'BaseHealth Clinical Trials Search',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('ClinicalTrials.gov API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `API request failed: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    console.log('ClinicalTrials.gov response:', {
      studiesCount: data.studies?.length || 0,
      totalCount: data.totalCount || 0,
      searchQuery: searchCondition,
      searchLocation: searchLocation
    })

    let enhancedStudies = data.studies || []

    // If no results found with location, try without location
    if (enhancedStudies.length === 0 && searchLocation && searchCondition) {
      console.log('No results with location, trying without location...')
      const fallbackParams = new URLSearchParams({
        'format': 'json',
        'pageSize': searchParams.get('pageSize') || '50'
      })
      
      fallbackParams.append('query.cond', searchCondition)
      
      const fallbackUrl = `https://clinicaltrials.gov/api/v2/studies?${fallbackParams.toString()}`
      console.log('Fallback search:', fallbackUrl)
      
      try {
        const fallbackResponse = await fetch(fallbackUrl, {
          headers: {
            'User-Agent': 'BaseHealth Clinical Trials Search',
            'Accept': 'application/json',
          },
        })
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          enhancedStudies = fallbackData.studies || []
          console.log('Fallback results:', enhancedStudies.length)
        }
      } catch (fallbackError) {
        console.warn('Fallback search failed:', fallbackError)
      }
    }

    // Transform studies to match frontend interface
    const transformedStudies = enhancedStudies.map((study: any) => {
      const protocol = study.protocolSection || {}
      const identification = protocol.identificationModule || {}
      const description = protocol.descriptionModule || {}
      const conditions = protocol.conditionsModule || {}
      const design = protocol.designModule || {}
      const eligibility = protocol.eligibilityModule || {}
      const contacts = protocol.contactsLocationsModule || {}
      
      // Extract location information and find best matching location
      let locationString = ''
      let locationPriority = 0 // 0 = no match, 1 = state match, 2 = city match
      
      if (contacts.locations && contacts.locations.length > 0) {
        let bestLocation = contacts.locations[0]
        
        // If we have a search location, try to find the best matching location
        if (searchLocation) {
          const searchCity = searchLocation.split(',')[0]?.trim().toLowerCase()
          const searchState = searchLocation.split(',')[1]?.trim().toUpperCase()
          
          for (const location of contacts.locations) {
            const locationCity = location.city?.toLowerCase()
            const locationState = location.state?.toUpperCase()
            
            // Prioritize exact city matches
            if (searchCity && locationCity?.includes(searchCity)) {
              bestLocation = location
              locationPriority = 2
              break
            }
            // Then state matches
            else if (searchState && locationState === searchState && locationPriority < 1) {
              bestLocation = location
              locationPriority = 1
            }
          }
        }
        
        locationString = `${bestLocation.city || ''}, ${bestLocation.state || ''}, ${bestLocation.country || ''}`.replace(/^,\s*|,\s*$/g, '')
      }
      
      // Extract phase information
      let phase = ''
      if (design.phases && design.phases.length > 0) {
        phase = design.phases[0].replace('PHASE', '')
      }
      
      return {
        nctId: identification.nctId || '',
        briefTitle: identification.briefTitle || '',
        briefSummary: description.briefSummary || '',
        locationString,
        phase,
        condition: conditions.conditions ? conditions.conditions.join(', ') : '',
        studyType: design.studyType || '',
        enrollment: design.enrollmentInfo?.count || 0,
        eligibilityCriteria: eligibility.eligibilityCriteria || '',
        // Add HealthDB enhancement if available
        eligibilityScore: study.eligibilityScore || 0,
        eligibilityReasons: study.eligibilityReasons || [],
        recommendationLevel: study.recommendationLevel || 'medium',
        // Add location priority for sorting
        locationPriority
      }
    })

    // Enhance with HealthDB.ai analysis if available
    if (searchCondition && transformedStudies.length > 0) {
      try {
        const healthDBResponse = await healthDBService.analyzeClinicalTrialEligibility(
          { query: searchCondition, location: searchLocation }, 
          transformedStudies
        )
        
        if (healthDBResponse.success) {
          // Merge HealthDB insights with transformed studies
          transformedStudies.forEach((study, index) => {
            if (healthDBResponse.data[index]) {
              study.eligibilityScore = healthDBResponse.data[index].eligibilityScore || study.eligibilityScore
              study.eligibilityReasons = healthDBResponse.data[index].eligibilityReasons || study.eligibilityReasons
              study.recommendationLevel = healthDBResponse.data[index].recommendationLevel || study.recommendationLevel
            }
          })
        }
      } catch (healthDBError) {
        console.warn('HealthDB enhancement failed:', healthDBError)
        // Continue with transformed studies if HealthDB fails
      }
    }

    enhancedStudies = transformedStudies

    // Sort by location priority (local trials first) and then by eligibility score
    enhancedStudies.sort((a, b) => {
      // First sort by location priority (higher is better)
      if (a.locationPriority !== b.locationPriority) {
        return b.locationPriority - a.locationPriority
      }
      // Then by eligibility score (higher is better)
      return (b.eligibilityScore || 0) - (a.eligibilityScore || 0)
    })

    return NextResponse.json({
      ...data,
      studies: enhancedStudies,
      enhanced: true,
      fallbackUsed: data.studies?.length === 0 && enhancedStudies.length > 0,
      searchCondition,
      searchLocation,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching clinical trials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clinical trials' },
      { status: 500 }
    )
  }
} 