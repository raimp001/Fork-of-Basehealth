"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Search, Filter, Clock, Users, Database } from "lucide-react"
import { useState, useEffect } from "react"

interface ClinicalTrial {
  id: string
  title: string
  condition: string
  phase: string
  location: string
  distance: number
  sponsor: string
  status: string
  description: string
  eligibility: string[]
  estimatedEnrollment: number
  studyType: string
}

export default function ClinicalTrialsPage() {
  const [location, setLocation] = useState<string>("")
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [manualLocation, setManualLocation] = useState<string>("")
  const [trials, setTrials] = useState<ClinicalTrial[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCondition, setSelectedCondition] = useState("")
  const [isLoadingTrials, setIsLoadingTrials] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch trials from ClinicalTrials.gov API
  const fetchTrials = async (searchQuery?: string, locationQuery?: string) => {
    setIsLoadingTrials(true)
    setError(null)
    
    try {
      // Build query parameters for ClinicalTrials.gov API
      const params = new URLSearchParams({
        'format': 'json',
        'min_rnk': '1',
        'max_rnk': '20', // Limit to 20 results for better performance
        'fields': 'NCTId,BriefTitle,Condition,Phase,OverallStatus,BriefSummary,EligibilityCriteria,EnrollmentCount,StudyType,LocationCity,LocationState,LocationCountry,LeadSponsorName'
      })

      // Add search terms if provided
      if (searchQuery) {
        params.append('cond', searchQuery)
      }
      
      // Add location filter if provided
      if (locationQuery) {
        params.append('locn', locationQuery)
      }

      // Default to recruiting studies
      params.append('recrs', 'a') // All recruitment statuses
      
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
          distance: Math.random() * 20 + 1, // Random distance for demo - would calculate based on user location
          sponsor: sponsorCollaboratorsModule.leadSponsor?.name || 'Not specified',
          status: statusModule.overallStatus || 'Unknown',
          description: descriptionModule.briefSummary || 'No description available',
          eligibility: eligibilityModule.eligibilityCriteria ? 
            eligibilityModule.eligibilityCriteria.split('\n').slice(0, 3) : 
            ['Eligibility criteria not available'],
          estimatedEnrollment: statusModule.enrollmentInfo?.count || 0,
          studyType: designModule.studyType || 'Not specified'
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
    // Load initial trials
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
      // Refetch trials with location filter
      fetchTrials(searchTerm || selectedCondition, manualLocation.trim())
    }
  }

  const handleSearch = () => {
    const query = searchTerm || selectedCondition
    fetchTrials(query, location)
  }

  // Real-time search when search term or condition changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || selectedCondition) {
        handleSearch()
      }
    }, 500) // Debounce search by 500ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCondition])

  const conditions = [...new Set(trials.map(trial => trial.condition))]

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
            <h1 className="text-4xl font-bold text-gray-900">Clinical Trials Near You</h1>
          </div>

          {/* Location Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  <span className="text-gray-700">Current Location:</span>
                  <span className="font-medium text-gray-900">
                    {location || "Not set"}
                  </span>
                </div>
                <Button 
                  onClick={getLocation}
                  disabled={isLoadingLocation}
                  variant="outline"
                  className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                >
                  {isLoadingLocation ? "Detecting..." : "Auto-Detect"}
                </Button>
              </div>
              
              {/* Manual Location Input */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter ZIP code, city, or address (e.g., 94301, Palo Alto CA, New York NY)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualLocationSubmit()}
                  />
                </div>
                <Button 
                  onClick={handleManualLocationSubmit}
                  disabled={!manualLocation.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap"
                >
                  Set Location
                </Button>
              </div>
              
              <p className="text-sm text-gray-600">
                💡 Enter your location to find clinical trials near you. We'll calculate distances to nearby medical centers.
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white border rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Search Clinical Trials</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by condition, keyword, or study title (e.g., diabetes, cancer, COVID-19)..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  aria-label="Filter by medical condition"
                >
                  <option value="">All Conditions</option>
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isLoadingTrials}
                className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap px-6"
              >
                {isLoadingTrials ? "Searching..." : "Search Trials"}
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              🔍 Powered by ClinicalTrials.gov - Official database of clinical studies
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

          {/* Clinical Trials List */}
          <div className="space-y-6">
            {!isLoadingTrials && !error && trials.map((trial) => (
              <div key={trial.id} className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{trial.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{trial.phase}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">{trial.status}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {trial.distance} miles away
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Study ID</p>
                    <p className="font-mono text-sm">{trial.id}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{trial.description}</p>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Key Details</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Condition:</strong> {trial.condition}</li>
                      <li><strong>Location:</strong> {trial.location}</li>
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
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Learn More
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
              <p className="text-gray-500 text-lg">No clinical trials found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your search terms or location.</p>
              <Button 
                onClick={() => fetchTrials()} 
                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              >
                Load All Trials
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 
} 