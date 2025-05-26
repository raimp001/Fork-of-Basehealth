import { NextRequest, NextResponse } from 'next/server'

// Location relevance scoring function
function calculateLocationRelevance(userLocation: string, trialLocation: { city?: string, state?: string, country?: string }): number {
  if (!userLocation || !trialLocation.city) return 0
  
  const userLower = userLocation.toLowerCase()
  const trialCity = trialLocation.city?.toLowerCase() || ''
  const trialState = trialLocation.state?.toLowerCase() || ''
  const trialCountry = trialLocation.country?.toLowerCase() || ''
  
  // Exact city match - highest relevance
  if (trialCity.includes(userLower) || userLower.includes(trialCity)) {
    return 100
  }
  
  // Same state/region - high relevance
  if (trialState.includes(userLower) || userLower.includes(trialState)) {
    return 80
  }
  
  // Same country - medium relevance
  if (trialCountry.includes('united states') && (userLower.includes('usa') || userLower.includes('us') || userLower.includes('america'))) {
    return 60
  }
  
  // Different country - low relevance
  return 20
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  try {
    // Build the ClinicalTrials.gov API URL with the search parameters
    const apiParams = new URLSearchParams({
      'format': 'json',
      'pageSize': searchParams.get('pageSize') || '50',
      'fields': 'NCTId,BriefTitle,Condition,Phase,OverallStatus,BriefSummary,EligibilityCriteria,EnrollmentCount,StudyType,LocationCity,LocationState,LocationCountry,LeadSponsorName,LocationFacility'
    })

    // Add the search query if provided
    const query = searchParams.get('query')
    const userLocation = searchParams.get('userLocation')
    
    if (query) {
      apiParams.append('query.cond', query)
    }
    
    // Add location filter if provided
    if (userLocation) {
      apiParams.append('query.locn', userLocation)
    }

    const apiUrl = `https://clinicaltrials.gov/api/v2/studies?${apiParams.toString()}`
    
    console.log('Fetching from ClinicalTrials.gov:', apiUrl)
    
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
      totalCount: data.totalCount || 0
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching clinical trials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clinical trials' },
      { status: 500 }
    )
  }
} 