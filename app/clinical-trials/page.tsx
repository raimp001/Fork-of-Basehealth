"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { StandardizedButton, PrimaryActionButton } from "@/components/ui/standardized-button"
import { StandardizedInput } from "@/components/ui/standardized-form"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading"
import { FormError, useErrorHandler } from "@/components/ui/error-boundary"
import { components, healthcare } from "@/lib/design-system"
import {
  Search,
  MapPin,
  Star,
  Filter,
  X,
  ChevronDown,
  Phone,
  Video,
  Clock,
  Heart,
  Shield,
  Users,
  Calendar,
  FileText,
  FlaskConical,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles
} from "lucide-react"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { parseNaturalLanguageQuery } from "@/lib/ai-service"

interface ClinicalTrial {
  nctId: string
  briefTitle: string
  briefSummary: string
  locationString?: string
  phase?: string
  condition?: string
  intervention?: string
  eligibilityCriteria?: string
  studyType?: string
  enrollment?: number
  startDate?: string
  completionDate?: string
  eligibilityScore?: number
  eligibilityReasons?: string[]
  recommendationLevel?: string
}

// Natural language search examples
const searchExamples = [
  "lung cancer treatment in New York",
  "diabetes prevention study in Chicago",
  "heart disease clinical trial in Boston",
  "alzheimer's research in Miami",
  "breast cancer screening study in Los Angeles",
  "mental health therapy trial in Seattle",
  "pediatric asthma treatment in Denver",
  "rheumatoid arthritis medication in Houston",
  "cancer immunotherapy research in Philadelphia",
  "vaccine clinical trial in Atlanta"
]

// Parse natural language search query for clinical trials
const parseClinicalTrialQuery = (query: string) => {
  const lowerQuery = query.toLowerCase()
  let condition = ""
  let location = ""
  let phase = ""
  let studyType = ""

  // Known locations (cities, states, regions)
  const knownLocations = [
    'new york', 'ny', 'nyc', 'california', 'ca', 'los angeles', 'miami', 'florida', 'fl',
    'boston', 'massachusetts', 'ma', 'chicago', 'illinois', 'il', 'houston', 'texas', 'tx',
    'philadelphia', 'pennsylvania', 'pa', 'phoenix', 'arizona', 'az', 'san antonio',
    'san diego', 'dallas', 'san jose', 'austin', 'jacksonville', 'fort worth', 'columbus',
    'charlotte', 'seattle', 'washington', 'denver', 'colorado', 'co', 'el paso', 'detroit',
    'nashville', 'tennessee', 'tn', 'portland', 'oregon', 'or', 'oklahoma', 'las vegas',
    'nevada', 'nv', 'louisville', 'baltimore', 'maryland', 'md', 'milwaukee', 'albuquerque',
    'tucson', 'fresno', 'sacramento', 'kansas', 'mesa', 'atlanta', 'georgia', 'ga', 'omaha',
    'raleigh', 'colorado springs', 'virginia beach', 'virginia', 'va', 'long beach'
  ]

  // Extract specific cancer types first
  const specificCancers = [
    'lung cancer', 'breast cancer', 'colon cancer', 'colorectal cancer', 'prostate cancer',
    'liver cancer', 'pancreatic cancer', 'kidney cancer', 'bladder cancer', 'thyroid cancer',
    'brain cancer', 'skin cancer', 'melanoma', 'leukemia', 'lymphoma', 'ovarian cancer',
    'cervical cancer', 'uterine cancer', 'endometrial cancer', 'bone cancer', 'sarcoma'
  ]

  // Check for specific cancer types first
  for (const cancer of specificCancers) {
    if (lowerQuery.includes(cancer)) {
      condition = cancer
      break
    }
  }

  // If no specific cancer found, check general conditions
  if (!condition) {
    const conditionKeywords: Record<string, string[]> = {
      "cancer": ["cancer", "oncology", "tumor", "malignant"],
      "diabetes": ["diabetes", "diabetic", "blood sugar"],
      "heart disease": ["heart", "cardiac", "cardiovascular"],
      "alzheimer": ["alzheimer", "dementia", "memory"],
      "asthma": ["asthma", "respiratory", "breathing"],
      "arthritis": ["arthritis", "joint", "rheumatoid"],
      "depression": ["depression", "mental health", "anxiety"],
      "obesity": ["obesity", "weight", "bmi"],
      "hypertension": ["hypertension", "blood pressure"],
      "stroke": ["stroke", "cerebrovascular"],
      "kidney disease": ["kidney", "renal", "dialysis"],
      "liver disease": ["liver", "hepatic", "cirrhosis"],
      "lung disease": ["lung", "pulmonary"],
      "mental health": ["mental", "psychiatry", "psychology"]
    }

    for (const [keyword, variations] of Object.entries(conditionKeywords)) {
      if (variations.some(v => lowerQuery.includes(v))) {
        condition = keyword
        break
      }
    }
  }

  // Extract location - check for known locations first
  for (const loc of knownLocations) {
    if (lowerQuery.includes(loc)) {
      location = loc
      break
    }
  }

  // If no known location found, try location keywords
  if (!location) {
    const locationKeywords = ["near", "in", "at", "around", "location"]
    for (const keyword of locationKeywords) {
      const index = lowerQuery.indexOf(keyword)
      if (index !== -1) {
        const afterKeyword = query.substring(index + keyword.length).trim()
        const words = afterKeyword.split(" ").filter(w => w.length > 0)
        if (words.length > 0) {
          // Take up to 2 words as location
          location = words.slice(0, 2).join(" ")
          break
        }
      }
    }
  }

  // Extract study type
  if (lowerQuery.includes("treatment") || lowerQuery.includes("therapy")) {
    studyType = "treatment"
  } else if (lowerQuery.includes("prevention") || lowerQuery.includes("screening")) {
    studyType = "prevention"
  } else if (lowerQuery.includes("diagnostic")) {
    studyType = "diagnostic"
  }

  return { condition, location, phase, studyType }
}

export default function ClinicalTrialsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [trials, setTrials] = useState<ClinicalTrial[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const { error, setError, clearError } = useErrorHandler()

  const fetchTrials = async (naturalLanguageQuery: string) => {
    if (!naturalLanguageQuery.trim()) {
      setTrials([])
      setHasSearched(false)
      return
    }
    setIsLoading(true)
    setError(null)
    setHasSearched(true)
    try {
      const params = new URLSearchParams({
        'pageSize': '20',
        'naturalLanguage': naturalLanguageQuery
      })
      
      const response = await fetch(`/api/clinical-trials?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch clinical trials")
      
      const data = await response.json()
      setTrials(data.studies || [])
    } catch (err) {
      setError("Failed to fetch clinical trials. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        fetchTrials(searchQuery)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleExampleClick = (example: string) => {
    setSearchQuery(example)
  }

  const handleNaturalLanguageSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50">
      <MinimalNavigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pt-24">
      {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-800 text-white text-sm font-semibold mb-6 shadow-md">
            <FlaskConical className="h-4 w-4" />
            Clinical Trials
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4 tracking-tight">
            Find Clinical Trials
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed mb-2">
            Search for clinical trials and research studies using natural language.
          </p>
          <p className="text-sm text-stone-500 max-w-2xl mx-auto">
            Powered by ClinicalTrials.gov. Get matches in seconds.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <FormError error={error} onDismiss={clearError} />
        )}

        {/* Search Form */}
        <Card className="p-8 border-2 border-stone-200 shadow-lg bg-white">
          <h2 className="text-xl font-bold text-stone-900 mb-6">Search Clinical Trials</h2>
          <p className="text-gray-600 mb-6">
            Describe your condition and location naturally.
          </p>
          
          {/* Natural Language Search */}
          <div className="mb-6">
            
            <div className="flex gap-2 mb-4">
              <StandardizedInput
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., lung cancer treatment in New York, diabetes study in Chicago..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleNaturalLanguageSearch(searchQuery)
                  }
                }}
              />
                <PrimaryActionButton 
                onClick={() => handleNaturalLanguageSearch(searchQuery)}
                disabled={!searchQuery.trim()}
                loading={isLoading}
                loadingText="Searching..."
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Search
              </PrimaryActionButton>
              </div>

            {/* Search Examples */}
                <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Examples:</span>
              {searchExamples.map((example, index) => (
                    <button
                      key={index}
                  onClick={() => handleExampleClick(example)}
                  className="text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
        </Card>

        {/* Results */}
        {isLoading && (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Searching for clinical trials...</p>
          </div>
        )}

        {hasSearched && trials.length > 0 && !isLoading && (
          <div className="mt-8 space-y-6">
                        <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Clinical Trials Found</h2>
              <p className="text-sm text-gray-600 mt-1">
                Found {trials.length} clinical trials for "{searchQuery}"
              </p>
            </div>

            {trials.map((trial) => (
              <Card key={trial.nctId} className="p-6 border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {trial.briefTitle}
                    </h3>
                    {trial.phase && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Phase {trial.phase}
                      </Badge>
                    )}
                    {trial.eligibilityScore && trial.eligibilityScore > 0 && (
                      <Badge 
                        variant="secondary" 
                        className={
                          trial.recommendationLevel === 'high' ? 'bg-green-100 text-green-800' :
                          trial.recommendationLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {Math.round(trial.eligibilityScore)}% Match
                      </Badge>
                    )}
                      </div>
                    <p className="text-gray-600 mb-3">{trial.briefSummary}</p>
                    </div>
                  </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <p className="text-gray-600">{trial.locationString || 'Multiple locations'}</p>
                    </div>
                    <div>
                    <span className="font-medium text-gray-700">Study Type:</span>
                    <p className="text-gray-600">{trial.studyType || 'Clinical Trial'}</p>
                    </div>
                  {trial.condition && (
                    <div>
                      <span className="font-medium text-gray-700">Condition:</span>
                      <p className="text-gray-600">{trial.condition}</p>
                    </div>
                  )}
                  {trial.enrollment && (
                    <div>
                      <span className="font-medium text-gray-700">Enrollment:</span>
                      <p className="text-gray-600">{trial.enrollment} participants</p>
                </div>
          )}
        </div>

                {trial.eligibilityReasons && trial.eligibilityReasons.length > 0 && (
                  <div className="mb-4">
                    <span className="font-medium text-gray-700 block mb-2">Why this trial may be relevant:</span>
                    <div className="flex flex-wrap gap-2">
                      {trial.eligibilityReasons.map((reason, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {reason}
                        </Badge>
                    ))}
                  </div>
                </div>
                )}

                <div className="flex gap-4">
                  <PrimaryActionButton asChild>
                    <a
                      href={`https://clinicaltrials.gov/study/${trial.nctId}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      View Trial Details
                    </a>
                  </PrimaryActionButton>
                  <StandardizedButton variant="secondary">
                    <Heart className="h-4 w-4 mr-2" />
                    Save Trial
                  </StandardizedButton>
                </div>
              </Card>
            ))}
              </div>
            )}

                {/* Empty State */}
        {hasSearched && !isLoading && !error && trials.length === 0 && (
          <div className="text-center py-12">
            <FlaskConical className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Trials Found</h3>
            <p className="text-gray-600">
              No clinical trials found for "{searchQuery}"
            </p>
            <p className="text-sm text-gray-500 mt-2">Try different search terms or broaden your search criteria</p>
              </div>
            )}

                {/* Initial State */}
        {!hasSearched && !isLoading && (
          <div className="text-center py-12">
            <FlaskConical className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Clinical Trial Search</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Use natural language to describe your condition and location to find relevant clinical trials from ClinicalTrials.gov using our AI-powered search.
            </p>
              </div>
            )}
      </main>
    </div>
  )
}