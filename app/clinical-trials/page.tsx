"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Search, Filter, Clock, Users, Database, Info, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { calculateTrialDistance } from "@/lib/geocoding"

interface ClinicalTrial {
  id: string
  title: string
  condition: string
  phase: string
  location: string
  distance?: number
  locationRelevance?: number
  sponsor: string
  status: string
  description: string
  eligibility: string[]
  estimatedEnrollment: number
  studyType: string
  facilityName?: string
}

// Location relevance scoring function for sorting
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

export default function ClinicalTrialsPage() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [trials, setTrials] = useState<ClinicalTrial[]>([])
  const [isLoadingTrials, setIsLoadingTrials] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedQuery, setParsedQuery] = useState<{
    conditions: string[]
    locations: string[]
    ages: string[]
    treatments: string[]
    other: string[]
  }>({
    conditions: [],
    locations: [],
    ages: [],
    treatments: [],
    other: []
  })

  // Parse natural language query to extract search terms
  const parseQuery = (query: string) => {
    const lowerQuery = query.toLowerCase()
    
    // Common medical conditions (ordered by specificity - more specific first)
    const conditions = [
      'alzheimer disease', 'alzheimer\'s disease', 'alzheimer', 'parkinson disease', 'parkinson\'s disease', 'parkinson',
      'lung cancer', 'breast cancer', 'prostate cancer', 'colon cancer', 'brain cancer', 'pancreatic cancer',
      'heart disease', 'kidney disease', 'liver disease', 'multiple sclerosis', 'high blood pressure',
      'covid-19', 'covid', 'cancer', 'diabetes', 'stroke', 'leukemia', 'lymphoma', 'melanoma', 
      'asthma', 'copd', 'depression', 'anxiety', 'bipolar', 'schizophrenia', 'autism', 'adhd',
      'arthritis', 'osteoporosis', 'fibromyalgia', 'lupus', 'hypertension', 'obesity'
    ]
    
    // US states and major cities (ordered by specificity)
    const locations = [
      // Major cities first (more specific)
      'new york city', 'los angeles', 'san francisco', 'san diego', 'san antonio', 'san jose',
      'fort worth', 'jacksonville', 'new orleans', 'las vegas', 'kansas city', 'virginia beach',
      'boston', 'chicago', 'houston', 'phoenix', 'philadelphia', 'dallas', 'austin', 
      'columbus', 'charlotte', 'indianapolis', 'seattle', 'denver', 'washington', 'atlanta',
      'miami', 'detroit', 'nashville', 'baltimore', 'memphis', 'milwaukee', 'portland',
      'birmingham', 'orlando', 'tampa', 'jacksonville',
      // State abbreviations and full names
      'new york', 'california', 'texas', 'florida', 'illinois', 'pennsylvania', 'ohio', 
      'georgia', 'north carolina', 'michigan', 'new jersey', 'virginia', 'washington',
      'arizona', 'massachusetts', 'tennessee', 'indiana', 'missouri', 'maryland', 'wisconsin',
      'colorado', 'minnesota', 'south carolina', 'alabama', 'louisiana', 'kentucky', 'oregon',
      'oklahoma', 'connecticut', 'utah', 'iowa', 'nevada', 'arkansas', 'mississippi', 'kansas',
      'new mexico', 'nebraska', 'west virginia', 'idaho', 'hawaii', 'new hampshire', 'maine',
      'montana', 'rhode island', 'delaware', 'south dakota', 'north dakota', 'alaska', 'vermont', 'wyoming',
      'ny', 'ca', 'tx', 'fl', 'il', 'pa', 'oh', 'ga', 'nc', 'mi', 'nj', 'va', 'wa', 'az', 'ma'
    ]
    
    // Common treatments
    const treatments = [
      'chemotherapy', 'radiation', 'immunotherapy', 'surgery', 'transplant',
      'drug', 'medication', 'therapy', 'treatment', 'vaccine', 'clinical trial'
    ]
    
    const foundConditions: string[] = []
    const foundLocations: string[] = []
    const foundAges: string[] = []
    const foundTreatments: string[] = []
    const otherTerms: string[] = []
    
    // Extract conditions
    conditions.forEach(condition => {
      if (lowerQuery.includes(condition)) {
        foundConditions.push(condition)
      }
    })
    
    // Extract locations
    locations.forEach(location => {
      if (lowerQuery.includes(location)) {
        foundLocations.push(location)
      }
    })
    
    // Extract treatments
    treatments.forEach(treatment => {
      if (lowerQuery.includes(treatment)) {
        foundTreatments.push(treatment)
      }
    })
    
    // Extract age information
    const ageMatches = query.match(/(\d+)\s*(year|yr|age)/gi)
    if (ageMatches) {
      foundAges.push(...ageMatches)
    }
    
    // Extract other meaningful terms (remove common words)
    const commonWords = ['the', 'and', 'or', 'in', 'at', 'for', 'with', 'year', 'old', 'years']
    const words = query.toLowerCase().split(/\s+/)
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '')
      if (cleanWord.length > 2 && 
          !commonWords.includes(cleanWord) && 
          !foundConditions.some(c => c.includes(cleanWord)) &&
          !foundLocations.some(l => l.includes(cleanWord)) &&
          !foundTreatments.some(t => t.includes(cleanWord))) {
        otherTerms.push(cleanWord)
      }
    })
    
    return {
      conditions: foundConditions,
      locations: foundLocations,
      ages: foundAges,
      treatments: foundTreatments,
      other: otherTerms
    }
  }

  // Fetch trials from ClinicalTrials.gov API
  const fetchTrials = async (query: string) => {
    if (!query.trim()) {
      setTrials([])
      return
    }

    setIsLoadingTrials(true)
    setError(null)
    
    try {
      // Parse the query
      const parsed = parseQuery(query)
      setParsedQuery(parsed)
      
      // Build search query from parsed terms with better logic
      let searchTerms: string[] = []
      
      // Prioritize medical conditions - these should be the main search terms
      if (parsed.conditions.length > 0) {
        // Use the most specific condition found
        const primaryCondition = parsed.conditions.find(c => c.includes(' ')) || parsed.conditions[0]
        searchTerms.push(primaryCondition)
      } else if (parsed.other.length > 0) {
        // If no medical conditions found, use other meaningful terms
        searchTerms.push(...parsed.other.slice(0, 2))
      } else {
        // Fallback to the original query
        searchTerms.push(query.trim())
      }
      
      // Use our API route to avoid CORS issues
      const params = new URLSearchParams({
        'pageSize': '50',
        'query': searchTerms.join(' '),  // Use space for phrase search
        'userLocation': parsed.locations.length > 0 ? parsed.locations[0] : ''  // Pass user location for filtering
      })
      
      const response = await fetch(`/api/clinical-trials?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Transform API response to our interface
      const transformedTrials: ClinicalTrial[] = data.studies?.map((study: any) => {
        const protocolSection = study.protocolSection || {}
        const identificationModule = protocolSection.identificationModule || {}
        const statusModule = protocolSection.statusModule || {}
        const designModule = protocolSection.designModule || {}
        const conditionsModule = protocolSection.conditionsModule || {}
        const descriptionModule = protocolSection.descriptionModule || {}
        const eligibilityModule = protocolSection.eligibilityModule || {}
        const contactsLocationsModule = protocolSection.contactsLocationsModule || {}
        const sponsorCollaboratorsModule = protocolSection.sponsorCollaboratorsModule || {}

        // Get first location for display - handle different API response structures
        const locations = contactsLocationsModule.locations || []
        const firstLocation = locations[0] || {}
        
        // Handle different possible location field names from ClinicalTrials.gov API
        const locationCity = firstLocation.city || firstLocation.locationCity || firstLocation.City
        const locationState = firstLocation.state || firstLocation.locationState || firstLocation.State  
        const locationCountry = firstLocation.country || firstLocation.locationCountry || firstLocation.Country || 'United States'
        
        // Debug: Log the location structure
        if (locations.length > 0) {
          console.log('Location structure for trial:', identificationModule.nctId, {
            original: firstLocation,
            parsed: { city: locationCity, state: locationState, country: locationCountry }
          })
        }
        
        const locationString = [locationCity, locationState, locationCountry]
          .filter(Boolean).join(', ')

        // Create normalized location object for distance calculation
        const normalizedLocation = {
          city: locationCity,
          state: locationState,
          country: locationCountry
        }

        // Calculate actual distance if location was mentioned in query
        const distance = parsed.locations.length > 0 ? 
          calculateTrialDistance(parsed.locations[0], normalizedLocation) : null
        
        // Debug: Log distance calculation
        if (parsed.locations.length > 0) {
          console.log(`Distance calculation: ${parsed.locations[0]} to ${locationCity}, ${locationState}:`, distance, 'miles')
        }
        
        // Calculate location relevance for sorting
        const locationRelevance = parsed.locations.length > 0 ? 
          calculateLocationRelevance(parsed.locations[0], firstLocation) : 0

        return {
          id: identificationModule.nctId || 'Unknown',
          title: identificationModule.briefTitle || 'No title available',
          condition: conditionsModule.conditions?.[0] || 'Not specified',
          phase: designModule.phases?.[0] || 'Not specified',
          location: locationString || 'Location not specified',
          distance,
          locationRelevance,
          sponsor: sponsorCollaboratorsModule.leadSponsor?.name || 'Not specified',
          status: statusModule.overallStatus || 'Unknown',
          description: descriptionModule.briefSummary || 'No description available',
          eligibility: eligibilityModule.eligibilityCriteria ? 
            eligibilityModule.eligibilityCriteria.split('\n').slice(0, 3) : 
            ['Eligibility criteria not available'],
          estimatedEnrollment: statusModule.enrollmentInfo?.count || 0,
          studyType: designModule.studyType || 'Not specified',
          facilityName: firstLocation.facility || 'Not specified'
        }
      }) || []

      // Sort by location relevance if location was provided
      if (parsed.locations.length > 0) {
        transformedTrials.sort((a, b) => (b.locationRelevance || 0) - (a.locationRelevance || 0))
      }

      setTrials(transformedTrials)
    } catch (err) {
      console.error('Error fetching trials:', err)
      setError('Failed to fetch clinical trials. Please try again.')
      setTrials([])
    } finally {
      setIsLoadingTrials(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchTrials(searchQuery)
      } else {
        setTrials([])
        setParsedQuery({ conditions: [], locations: [], ages: [], treatments: [], other: [] })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchTrials(searchQuery)
    }
  }

  const exampleQueries = [
    "lung cancer 45 year old in New York",
    "breast cancer treatment in California",
    "diabetes medication trial Boston",
    "heart disease surgery Texas",
    "alzheimer drug study 70 years old"
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="flex items-center justify-between px-8 py-6 border-b">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            basehealth.xyz
          </Link>
        </div>
        <nav className="flex items-center gap-8">
          <Button 
            asChild 
            variant="ghost" 
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium"
          >
            <a href="https://healthdb.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              healthdb.ai
            </a>
          </Button>
          <Link href="/patient-portal" className="text-gray-700 hover:text-indigo-600 transition-colors">
            Patient Portal
          </Link>
          <Link href="/settings" className="text-gray-700 hover:text-indigo-600 transition-colors">
            Settings
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/patient-portal" className="text-gray-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Find Clinical Trials</h1>
          </div>

          {/* Intelligent Search */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 mb-8">
            <div className="flex items-start gap-3 mb-6">
              <Sparkles className="h-6 w-6 text-indigo-600 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-indigo-900 mb-2">AI-Powered Clinical Trial Search</h2>
                <p className="text-indigo-800 mb-4">
                  Describe what you're looking for in natural language. Our AI will understand and find relevant clinical trials.
                </p>
              </div>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="e.g., lung cancer 45 year old in New York, breast cancer treatment in California..."
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isLoadingTrials}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 px-6"
              >
                {isLoadingTrials ? "Searching..." : "Search"}
              </Button>
            </div>

            {/* Example Queries */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(example)}
                    className="px-3 py-1 text-sm bg-white border border-indigo-200 text-indigo-700 rounded-full hover:bg-indigo-50 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Parsed Query Display */}
            {(parsedQuery.conditions.length > 0 || parsedQuery.locations.length > 0 || parsedQuery.treatments.length > 0) && (
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <p className="text-sm font-medium text-gray-700 mb-2">🤖 AI detected:</p>
                <div className="flex flex-wrap gap-2">
                  {parsedQuery.conditions.map((condition, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                      Condition: {condition}
                    </span>
                  ))}
                  {parsedQuery.treatments.map((treatment, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                      Treatment: {treatment}
                    </span>
                  ))}
                  {parsedQuery.locations.map((location, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                      Location: {location}
                    </span>
                  ))}
                  {parsedQuery.ages.map((age, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                      Age: {age}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-indigo-700 mt-4">
              🔍 Powered by ClinicalTrials.gov - Official U.S. database of clinical studies
            </p>
          </div>

          {/* Loading State */}
          {isLoadingTrials && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Searching ClinicalTrials.gov database...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <p className="text-red-700">{error}</p>
              <Button 
                onClick={() => fetchTrials(searchQuery)} 
                className="mt-3 bg-red-600 hover:bg-red-700"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Results Summary */}
          {!isLoadingTrials && !error && trials.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-green-800">
                Found <strong>{trials.length}</strong> clinical trials matching "{searchQuery}"
              </p>
            </div>
          )}

          {/* Clinical Trials List */}
          <div className="space-y-6">
            {!isLoadingTrials && !error && trials.map((trial) => (
              <div key={trial.id} className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{trial.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{trial.phase}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">{trial.status}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {trial.distance !== null && trial.distance !== undefined ? 
                          `${trial.distance} miles away` : 
                          trial.location
                        }
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Study ID</p>
                    <p className="font-mono text-sm font-medium">{trial.id}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-3">{trial.description}</p>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Study Details</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Condition:</strong> {trial.condition}</li>
                      <li><strong>Location:</strong> {trial.location}</li>
                      <li><strong>Facility:</strong> {trial.facilityName}</li>
                      <li><strong>Sponsor:</strong> {trial.sponsor}</li>
                      <li><strong>Enrollment:</strong> {trial.estimatedEnrollment} participants</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Eligibility Criteria</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {trial.eligibility.map((criteria, index) => (
                        <li key={index}>• {criteria}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    asChild
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <a 
                      href={`https://clinicaltrials.gov/study/${trial.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View on ClinicalTrials.gov
                    </a>
                  </Button>
                  <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                    Check Eligibility
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {!isLoadingTrials && !error && searchQuery && trials.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No clinical trials found for "{searchQuery}"</p>
              <p className="text-gray-400 mt-2">Try different search terms or check the examples above.</p>
            </div>
          )}

          {!searchQuery && !isLoadingTrials && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Sparkles className="h-16 w-16 text-indigo-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Search</h3>
                <p className="text-gray-600">
                  Enter your condition, age, location, or treatment preferences in the search box above to find relevant clinical trials.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}