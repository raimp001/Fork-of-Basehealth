"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Search, Filter, Clock, Users, Database, Info, Sparkles, User, Calendar, X, AlertCircle, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { calculateTrialDistance } from "@/lib/geocoding"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

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

interface EligibilityForm {
  age: string
  gender: string
  medicalConditions: string[]
  currentMedications: string
  previousTreatments: string
  additionalInfo: string
}

interface EligibilityResult {
  isEligible: boolean
  score: number
  reasons: string[]
  recommendations: string[]
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

  // Eligibility check state
  const [selectedTrialForEligibility, setSelectedTrialForEligibility] = useState<ClinicalTrial | null>(null)
  const [eligibilityForm, setEligibilityForm] = useState<EligibilityForm>({
    age: "",
    gender: "",
    medicalConditions: [],
    currentMedications: "",
    previousTreatments: "",
    additionalInfo: ""
  })
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false)

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
        
        // Location structure parsed successfully
        
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
        
        // Distance calculation completed
        
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

  const handleEligibilityCheck = async (trial: ClinicalTrial) => {
    setSelectedTrialForEligibility(trial)
    setEligibilityResult(null)
    setEligibilityForm({
      age: "",
      gender: "",
      medicalConditions: [],
      currentMedications: "",
      previousTreatments: "",
      additionalInfo: ""
    })
  }

  const checkEligibility = async () => {
    if (!selectedTrialForEligibility) return

    setIsCheckingEligibility(true)
    
    try {
      // Simulate AI eligibility assessment
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const age = parseInt(eligibilityForm.age)
      const trial = selectedTrialForEligibility
      
      let score = 0
      const reasons: string[] = []
      const recommendations: string[] = []
      
      // Age eligibility check
      if (trial.id === "NCT05123456") { // Lung cancer trial
        if (age >= 18) {
          score += 25
          reasons.push("✓ Meets age requirement (18+ years)")
        } else {
          reasons.push("✗ Does not meet age requirement (must be 18+ years)")
        }
      } else if (trial.id === "NCT05234567") { // Diabetes trial
        if (age >= 21 && age <= 75) {
          score += 25
          reasons.push("✓ Meets age requirement (21-75 years)")
        } else {
          reasons.push("✗ Does not meet age requirement (must be 21-75 years)")
        }
      } else if (trial.id === "NCT05345678") { // Alzheimer's trial
        if (age >= 55 && age <= 85) {
          score += 25
          reasons.push("✓ Meets age requirement (55-85 years)")
        } else {
          reasons.push("✗ Does not meet age requirement (must be 55-85 years)")
        }
      }
      
      // Condition-specific checks
      if (trial.condition.toLowerCase().includes("lung cancer")) {
        if (eligibilityForm.medicalConditions.includes("lung cancer") || 
            eligibilityForm.medicalConditions.includes("cancer")) {
          score += 30
          reasons.push("✓ Has relevant medical condition")
        } else {
          score += 5
          reasons.push("? Medical condition relevance unclear")
          recommendations.push("Discuss your medical history with the study coordinator")
        }
      }
      
      if (trial.condition.toLowerCase().includes("diabetes")) {
        if (eligibilityForm.medicalConditions.includes("diabetes") || 
            eligibilityForm.medicalConditions.includes("type 2 diabetes")) {
          score += 30
          reasons.push("✓ Has Type 2 diabetes diagnosis")
        } else {
          reasons.push("✗ Must have Type 2 diabetes diagnosis")
        }
      }
      
      if (trial.condition.toLowerCase().includes("alzheimer")) {
        if (eligibilityForm.medicalConditions.includes("family history alzheimer") ||
            eligibilityForm.additionalInfo.toLowerCase().includes("family history")) {
          score += 20
          reasons.push("✓ Has family history of Alzheimer's disease")
        } else {
          score += 10
          reasons.push("? Family history information needed")
          recommendations.push("Family history of Alzheimer's may be required")
        }
      }
      
      // Previous treatments
      if (eligibilityForm.previousTreatments.trim()) {
        score += 15
        reasons.push("✓ Has treatment history information")
      }
      
      // Additional scoring
      if (eligibilityForm.currentMedications.trim()) {
        score += 10
        reasons.push("✓ Provided current medications")
      }
      
      // Final recommendations
      if (score >= 70) {
        recommendations.push("You appear to be a good candidate for this trial")
        recommendations.push("Contact the study coordinator to discuss participation")
      } else if (score >= 40) {
        recommendations.push("You may be eligible but additional screening is needed")
        recommendations.push("Schedule a consultation to determine full eligibility")
      } else {
        recommendations.push("This trial may not be suitable based on initial criteria")
        recommendations.push("Consider discussing other trial options with your healthcare provider")
      }
      
      setEligibilityResult({
        isEligible: score >= 40,
        score,
        reasons,
        recommendations
      })
      
    } catch (err) {
      setError("Failed to check eligibility. Please try again.")
    } finally {
      setIsCheckingEligibility(false)
    }
  }

  const handleMedicalConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      setEligibilityForm(prev => ({
        ...prev,
        medicalConditions: [...prev.medicalConditions, condition]
      }))
    } else {
      setEligibilityForm(prev => ({
        ...prev,
        medicalConditions: prev.medicalConditions.filter(c => c !== condition)
      }))
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header with gradient */}
      <header className="bg-white/80 backdrop-blur-md border-b border-indigo-200/50 sticky top-0 z-40">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              BaseHealth
            </Link>
            <Badge variant="secondary" className="ml-3 bg-indigo-100 text-indigo-700 border-indigo-200">
              Clinical Trials
            </Badge>
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
        </div>
      </header>

      {/* Enhanced Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header Section */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/patient-portal" className="text-gray-500 hover:text-indigo-600 transition-colors p-2 hover:bg-white/50 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Find Clinical Trials
              </h1>
              <p className="text-gray-600 mt-2">Discover research studies that match your medical needs</p>
            </div>
          </div>

          {/* Enhanced Search Section */}
          <Card className="mb-8 border-0 shadow-xl bg-white/60 backdrop-blur-sm">
            <CardContent className="p-8">
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
                  className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white/80 backdrop-blur-sm shadow-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isLoadingTrials}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-6 shadow-lg"
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
                      className="px-3 py-1 text-sm bg-white/80 border border-indigo-200 text-indigo-700 rounded-full hover:bg-indigo-50 transition-all duration-200 hover:shadow-md"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parsed Query Display */}
              {(parsedQuery.conditions.length > 0 || parsedQuery.locations.length > 0 || parsedQuery.treatments.length > 0) && (
                <div className="bg-white/80 rounded-lg p-4 border border-indigo-200 backdrop-blur-sm">
                  <p className="text-sm font-medium text-gray-700 mb-2">🤖 AI detected:</p>
                  <div className="flex flex-wrap gap-2">
                    {parsedQuery.conditions.map((condition, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded border border-red-200">
                        Condition: {condition}
                      </span>
                    ))}
                    {parsedQuery.treatments.map((treatment, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-200">
                        Treatment: {treatment}
                      </span>
                    ))}
                    {parsedQuery.locations.map((location, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded border border-green-200">
                        Location: {location}
                      </span>
                    ))}
                    {parsedQuery.ages.map((age, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded border border-purple-200">
                        Age: {age}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm text-indigo-700 mt-4 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Powered by ClinicalTrials.gov - Official U.S. database of clinical studies
              </p>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoadingTrials && (
            <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching ClinicalTrials.gov database...</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Alert className="mb-8 border-red-200 bg-red-50/80 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Results Summary */}
          {!isLoadingTrials && !error && trials.length > 0 && (
            <Alert className="mb-6 border-green-200 bg-green-50/80 backdrop-blur-sm">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800">
                Found <strong>{trials.length}</strong> clinical trials matching "{searchQuery}"
              </AlertDescription>
            </Alert>
          )}

          {/* Enhanced Clinical Trials List */}
          <div className="space-y-6">
            {!isLoadingTrials && !error && trials.map((trial) => (
              <Card key={trial.id} className="border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{trial.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                        <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">{trial.phase}</Badge>
                        <Badge className="bg-green-100 text-green-700 border-green-200">{trial.status}</Badge>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {trial.distance !== null && trial.distance !== undefined ? 
                            `${trial.distance} miles away` : 
                            trial.location
                          }
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {trial.estimatedEnrollment} participants
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Study ID</p>
                      <p className="font-mono text-sm font-medium bg-gray-100 px-2 py-1 rounded">{trial.id}</p>
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
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                    >
                      <a 
                        href={`https://clinicaltrials.gov/study/${trial.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        View on ClinicalTrials.gov
                      </a>
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 shadow-lg"
                          onClick={() => handleEligibilityCheck(trial)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Check Eligibility
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Eligibility Check: {selectedTrialForEligibility?.title}
                          </DialogTitle>
                        </DialogHeader>
                        
                        {!eligibilityResult ? (
                          <div className="space-y-6">
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                Please provide your medical information to check eligibility for this clinical trial. This is a preliminary assessment only.
                              </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="age">Age</Label>
                                <Input
                                  id="age"
                                  type="number"
                                  placeholder="Enter your age"
                                  value={eligibilityForm.age}
                                  onChange={(e) => setEligibilityForm(prev => ({ ...prev, age: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select value={eligibilityForm.gender} onValueChange={(value) => setEligibilityForm(prev => ({ ...prev, gender: value }))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Medical Conditions (Select all that apply)</Label>
                              <div className="grid grid-cols-2 gap-2">
                                {["Cancer", "Lung Cancer", "Diabetes", "Type 2 Diabetes", "Heart Disease", "High Blood Pressure", "Family History Alzheimer", "Other"].map((condition) => (
                                  <div key={condition} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={condition}
                                      checked={eligibilityForm.medicalConditions.includes(condition.toLowerCase())}
                                      onCheckedChange={(checked) => handleMedicalConditionChange(condition.toLowerCase(), checked as boolean)}
                                    />
                                    <Label htmlFor={condition} className="text-sm">{condition}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="medications">Current Medications</Label>
                              <Textarea
                                id="medications"
                                placeholder="List your current medications..."
                                value={eligibilityForm.currentMedications}
                                onChange={(e) => setEligibilityForm(prev => ({ ...prev, currentMedications: e.target.value }))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="treatments">Previous Treatments</Label>
                              <Textarea
                                id="treatments"
                                placeholder="Describe any previous treatments you've received..."
                                value={eligibilityForm.previousTreatments}
                                onChange={(e) => setEligibilityForm(prev => ({ ...prev, previousTreatments: e.target.value }))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="additional">Additional Information</Label>
                              <Textarea
                                id="additional"
                                placeholder="Any other relevant medical information..."
                                value={eligibilityForm.additionalInfo}
                                onChange={(e) => setEligibilityForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
                              />
                            </div>

                            <Button 
                              onClick={checkEligibility}
                              disabled={!eligibilityForm.age || !eligibilityForm.gender || isCheckingEligibility}
                              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                              {isCheckingEligibility ? "Checking Eligibility..." : "Check Eligibility"}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className={`p-4 rounded-lg ${eligibilityResult.isEligible ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                {eligibilityResult.isEligible ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                                )}
                                <h3 className={`font-semibold ${eligibilityResult.isEligible ? 'text-green-800' : 'text-yellow-800'}`}>
                                  {eligibilityResult.isEligible ? 'Potentially Eligible' : 'Additional Screening Required'}
                                </h3>
                              </div>
                              <p className={`text-sm ${eligibilityResult.isEligible ? 'text-green-700' : 'text-yellow-700'}`}>
                                Eligibility Score: {eligibilityResult.score}/100
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Assessment Details</h4>
                              <ul className="space-y-1">
                                {eligibilityResult.reasons.map((reason, index) => (
                                  <li key={index} className="text-sm text-gray-700">{reason}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                              <ul className="space-y-1">
                                {eligibilityResult.recommendations.map((rec, index) => (
                                  <li key={index} className="text-sm text-gray-700">• {rec}</li>
                                ))}
                              </ul>
                            </div>

                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                This is a preliminary assessment only. Final eligibility must be determined by the study team through official screening procedures.
                              </AlertDescription>
                            </Alert>

                            <div className="flex gap-3">
                              <Button 
                                asChild
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                              >
                                <a 
                                  href={`https://clinicaltrials.gov/study/${selectedTrialForEligibility?.id}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  Contact Study Team
                                </a>
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setEligibilityResult(null)}
                                className="flex-1"
                              >
                                Check Another
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!isLoadingTrials && !error && searchQuery && trials.length === 0 && (
            <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <p className="text-gray-500 text-lg">No clinical trials found for "{searchQuery}"</p>
                <p className="text-gray-400 mt-2">Try different search terms or check the examples above.</p>
              </CardContent>
            </Card>
          )}

          {!searchQuery && !isLoadingTrials && (
            <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <Sparkles className="h-16 w-16 text-indigo-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Search</h3>
                  <p className="text-gray-600">
                    Enter your condition, age, location, or treatment preferences in the search box above to find relevant clinical trials.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}