import { NextRequest, NextResponse } from 'next/server'

// Note: Distance calculation is now handled on the frontend using accurate geocoding

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  try {
    // Build the ClinicalTrials.gov API URL with the search parameters
    const apiParams = new URLSearchParams({
      'format': 'json',
      'pageSize': searchParams.get('pageSize') || '50'
      // Remove fields parameter to get full data structure for proper location parsing
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