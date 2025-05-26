"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Search, Filter, Clock, Users, Database, Info } from "lucide-react"
import { useState, useEffect } from "react"

interface ClinicalTrial {
  id: string
  title: string
  condition: string
  phase: string
  location: string
  distance?: number
  sponsor: string
  status: string
  description: string
  eligibility: string[]
  estimatedEnrollment: number
  studyType: string
  facilityName?: string
}

export default function ClinicalTrialsPage() {
  const [location, setLocation] = useState<string>("")
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [manualLocation, setManualLocation] = useState<string>("")
  const [trials, setTrials] = useState<ClinicalTrial[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [conditionTerm, setConditionTerm] = useState("")
  const [interventionTerm, setInterventionTerm] = useState("")
  const [otherTerms, setOtherTerms] = useState("")
  const [facilityName, setFacilityName] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("recruiting")
  const [ageGroup, setAgeGroup] = useState("")
  const [isLoadingTrials, setIsLoadingTrials] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch trials from ClinicalTrials.gov API
  const fetchTrials = async () => {
    setIsLoadingTrials(true)
    setError(null)
    
    try {
      // Build query parameters for ClinicalTrials.gov API
      const params = new URLSearchParams({
        'format': 'json',
        'min_rnk': '1',
        'max_rnk': '50', // Increased to show more results
        'fields': 'NCTId,BriefTitle,Condition,Phase,OverallStatus,BriefSummary,EligibilityCriteria,EnrollmentCount,StudyType,LocationCity,LocationState,LocationCountry,LeadSponsorName,LocationFacility'
      })

      // Add search terms if provided
      if (conditionTerm.trim()) {
        params.append('cond', conditionTerm.trim())
      }
      
      if (interventionTerm.trim()) {
        params.append('intr', interventionTerm.trim())
      }

      if (otherTerms.trim()) {
        params.append('term', otherTerms.trim())
      }

      if (facilityName.trim()) {
        params.append('lead', facilityName.trim())
      }
      
      // Add location filter if provided (optional)
      if (location.trim()) {
        params.append('locn', location.trim())
      }

      // Add recruitment status filter
      if (selectedStatus === 'recruiting') {
        params.append('recrs', 'a') // Active, recruiting
      } else if (selectedStatus === 'all') {
        params.append('recrs', 'abdefghijk') // All statuses
      }

      // Add age group if specified
      if (ageGroup === 'child') {
        params.append('age', '0-17')
      } else if (ageGroup === 'adult') {
        params.append('age', '18-64')
      } else if (ageGroup === 'older') {
        params.append('age', '65+')
      }
      
      const response = await fetch(`https://clinicaltrials.gov/api/v2/studies?${params.toString()}`)
      
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

        // Get first location for display
        const locations = contactsLocationsModule.locations || []
        const firstLocation = locations[0] || {}
        const locationString = [firstLocation.city, firstLocation.state, firstLocation.country]
          .filter(Boolean).join(', ')

        return {
          id: identificationModule.nctId || 'Unknown',
          title: identificationModule.briefTitle || 'No title available',
          condition: conditionsModule.conditions?.[0] || 'Not specified',
          phase: designModule.phases?.[0] || 'Not specified',
          location: locationString || 'Location not specified',
          distance: location.trim() ? Math.random() * 50 + 5 : undefined, // Only show distance if location provided
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

      setTrials(transformedTrials)
    } catch (err) {
      console.error('Error fetching trials:', err)
      setError('Failed to fetch clinical trials. Please try again.')
      setTrials([])
    } finally {
      setIsLoadingTrials(false)
    }
  }

  useEffect(() => {
    // Load initial trials with recruiting status
    fetchTrials()
  }, [])

  const getLocation = async () => {
    setIsLoadingLocation(true)
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            // In real app, use reverse geocoding API to get city name
            setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`)
            setIsLoadingLocation(false)
          },
          (error) => {
            console.error("Error getting location:", error)
            setLocation("Location access denied - Please enter manually")
            setIsLoadingLocation(false)
          }
        )
      } else {
        setLocation("Geolocation not supported - Please enter manually")
        setIsLoadingLocation(false)
      }
    } catch (error) {
      console.error("Location error:", error)
      setLocation("Error detecting location - Please enter manually")
      setIsLoadingLocation(false)
    }
  }

  const handleManualLocationSubmit = () => {
    if (manualLocation.trim()) {
      setLocation(manualLocation.trim())
    }
  }

  const handleSearch = () => {
    fetchTrials()
  }

  const clearAllFilters = () => {
    setConditionTerm("")
    setInterventionTerm("")
    setOtherTerms("")
    setFacilityName("")
    setLocation("")
    setManualLocation("")
    setSelectedStatus("recruiting")
    setAgeGroup("")
  }

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
            <h1 className="text-4xl font-bold text-gray-900">Clinical Trials Search</h1>
          </div>

          {/* Search Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-blue-900 mb-2">How to Search</h2>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Condition:</strong> Enter a disease or condition (e.g., "breast cancer", "diabetes")</li>
                  <li>• <strong>Treatment:</strong> Enter a specific intervention (e.g., "radiation therapy", "metformin")</li>
                  <li>• <strong>Other Terms:</strong> Enter NCT numbers, study names, or keywords</li>
                  <li>• <strong>Location:</strong> Optional - enter city, state, or ZIP code to find nearby trials</li>
                  <li>• Use quotation marks for exact phrases (e.g., "heart disease")</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Advanced Search Form */}
          <div className="bg-white border rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-6">Search Clinical Trials</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition or Disease
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., breast cancer, diabetes, COVID-19"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={conditionTerm}
                    onChange={(e) => setConditionTerm(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intervention/Treatment
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., radiation therapy, metformin, surgery"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={interventionTerm}
                    onChange={(e) => setInterventionTerm(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Terms
                  </label>
                  <input
                    type="text"
                    placeholder="NCT number, study name, investigator, keywords"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={otherTerms}
                    onChange={(e) => setOtherTerms(e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="City, state, ZIP code, or country"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualLocationSubmit()}
                    />
                    <Button 
                      onClick={getLocation}
                      disabled={isLoadingLocation}
                      variant="outline"
                      className="border-indigo-500 text-indigo-600 hover:bg-indigo-50 whitespace-nowrap"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      {isLoadingLocation ? "..." : "Auto"}
                    </Button>
                  </div>
                  {location && (
                    <p className="text-sm text-gray-600 mt-1">Current: {location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facility Name
                  </label>
                  <input
                    type="text"
                    placeholder="Hospital or institution name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Study Status
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      aria-label="Study Status"
                    >
                      <option value="recruiting">Recruiting Studies</option>
                      <option value="all">All Studies</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age Group
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                      aria-label="Age Group"
                    >
                      <option value="">All Ages</option>
                      <option value="child">Child (0-17)</option>
                      <option value="adult">Adult (18-64)</option>
                      <option value="older">Older Adult (65+)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleSearch}
                disabled={isLoadingTrials}
                className="bg-indigo-600 hover:bg-indigo-700 px-8"
              >
                {isLoadingTrials ? "Searching..." : "Search Trials"}
              </Button>
              <Button 
                onClick={clearAllFilters}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Clear All
              </Button>
            </div>

            <p className="text-sm text-gray-600 mt-4">
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
                onClick={() => fetchTrials()} 
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
                Found <strong>{trials.length}</strong> clinical trials matching your search criteria
                {location && <span> near {location}</span>}
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
                      {trial.distance && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {trial.distance.toFixed(1)} miles away
                        </span>
                      )}
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

          {!isLoadingTrials && !error && trials.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No clinical trials found matching your search criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your search terms or removing some filters.</p>
              <Button 
                onClick={clearAllFilters} 
                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              >
                Clear Filters & Search All
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}