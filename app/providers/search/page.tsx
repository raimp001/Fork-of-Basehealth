"use client"

/**
 * Provider & Caregiver Search - Real-time, No Mock Data
 * /providers/search = Doctor search (NPI data)
 * /providers/search?bounty=true = Caregiver search
 */

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { CaregiverList } from "@/components/caregiver/caregiver-list"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSpinner } from "@/components/ui/loading"
import Link from "next/link"
import { 
  Search, 
  MapPin, 
  Star, 
  X, 
  Users, 
  Sparkles,
  Stethoscope,
  Heart,
  ArrowRight,
  AlertCircle
} from "lucide-react"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface Caregiver {
  id: string
  name: string
  specialty: string
  location: string
  distance?: number
  hourlyRate: number
  rating: number
  reviewCount: number
  isLicensed: boolean
  isCPRCertified: boolean
  isBackgroundChecked: boolean
  experience: string
  languages: string[]
  availability: string
  bio?: string
  certifications?: string[]
  services?: string[]
  status?: string
  isVerified?: boolean
  isMock?: boolean
}

interface Provider {
  npi: string
  name: string
  specialty: string
  address: string
  city: string
  state: string
  zip: string
  distance: number | null
  rating: number
  reviewCount: number
  acceptingPatients: boolean
  phone: string
  credentials: string
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const isCaregiverMode = searchParams?.get('bounty') === 'true'
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  
  // Caregiver state
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [caregiverMessage, setCaregiverMessage] = useState("")
  
  // Provider state
  const [providers, setProviders] = useState<Provider[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Search caregivers
  const searchCaregivers = async (location?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const url = location 
        ? `/api/caregivers/search?location=${encodeURIComponent(location)}`
        : '/api/caregivers/search'
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setCaregivers(data.results || [])
        setCaregiverMessage(data.message || '')
      } else {
        setError('Failed to load caregivers')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Search providers (doctors)
  const searchProviders = async (query: string) => {
    if (!query.trim()) {
      setError('Please enter a search query')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        query,
        limit: '20'
      })

      const response = await fetch(`/api/providers/search?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      
      if (data.success) {
        setProviders(data.providers || [])
        if (data.providers.length === 0) {
          setError('No providers found. Try a different search.')
        }
      } else {
        setError(data.error || 'No providers found')
        setProviders([])
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to search. Please try again.')
      setProviders([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (isCaregiverMode) {
      searchCaregivers(searchQuery)
    } else {
      searchProviders(searchQuery)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setCaregivers([])
    setProviders([])
    setError(null)
  }

  // Quick example searches for providers
  const exampleSearches = [
    "cardiologist in San Francisco",
    "family doctor in New York",
    "pediatrician near me",
    "dermatologist in Los Angeles"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-rose-50/10">
      <MinimalNavigation />
      
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Section */}
          <div className="mb-12">
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-stone-700 text-stone-50 rounded-full text-sm font-medium mb-6 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
              {isCaregiverMode ? <Heart className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
              <span>{isCaregiverMode ? 'Professional Caregivers' : 'Healthcare Providers'}</span>
            </div>

            <h1 className={`text-5xl md:text-6xl font-bold text-stone-800 mb-6 tracking-tight ${mounted ? 'animate-fade-in-up animation-delay-100' : 'opacity-0'}`}>
              {isCaregiverMode ? 'Find Professional ' : 'Find Healthcare '}
              <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-stone-600 bg-clip-text text-transparent">
                {isCaregiverMode ? 'Caregivers' : 'Providers'}
              </span>
            </h1>

            <p className={`text-xl text-stone-600 max-w-3xl leading-relaxed ${mounted ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
              {isCaregiverMode 
                ? 'Connect with verified, licensed, and background-checked caregivers. All caregivers are real, approved professionals—no mock data.'
                : 'Search for doctors and specialists using natural language. All providers from real NPI Registry—no mock data.'}
            </p>

            {/* Mode toggle */}
            <div className="mt-6 flex gap-3">
              <Link
                href="/providers/search"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${!isCaregiverMode ? 'bg-stone-800 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'}`}
              >
                Doctors & Specialists
              </Link>
              <Link
                href="/providers/search?bounty=true"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${isCaregiverMode ? 'bg-stone-800 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'}`}
              >
                Caregivers
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <Card className={`p-8 mb-12 border-stone-200 shadow-premium bg-white ${mounted ? 'animate-fade-in-up animation-delay-300' : 'opacity-0'}`}>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <Input
                    type="text"
                    placeholder={isCaregiverMode ? "Enter city, state, or ZIP code..." : "e.g., cardiologist in San Francisco"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-lg border-stone-200 focus:border-stone-500 focus:ring-2 focus:ring-stone-400/20"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isLoading}
                  className="h-14 px-10 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Example searches for providers */}
              {!isCaregiverMode && !isLoading && providers.length === 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-stone-500">Examples:</span>
                  {exampleSearches.map((example, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSearchQuery(example)
                        searchProviders(example)
                      }}
                      className="text-xs px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </Card>

          {/* Result message */}
          {caregiverMessage && isCaregiverMode && !isLoading && (
            <div className="mb-8 text-center">
              <p className="text-sm text-stone-600 font-medium">
                {caregiverMessage}
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <Card className="p-12 text-center border-rose-200 bg-gradient-to-br from-white to-rose-50/30 mb-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-rose-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-semibold text-rose-900 mb-4">{error}</h3>
              <Button 
                onClick={() => {
                  setError(null)
                  if (isCaregiverMode) {
                    searchCaregivers()
                  }
                }} 
                variant="outline"
                className="mt-4"
              >
                Try Again
              </Button>
            </Card>
          )}

          {/* Caregiver Results */}
          {isCaregiverMode && !error && (
            <CaregiverList
              caregivers={caregivers}
              isLoading={isLoading}
              onSelect={(caregiver) => {
                window.location.href = `/caregivers/${caregiver.id}/book`
              }}
            />
          )}

          {/* Provider Results (Doctors) */}
          {!isCaregiverMode && !error && !isLoading && providers.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-stone-800">
                  {providers.length} Providers Found
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <Card key={provider.npi} className="p-6 hover:shadow-lg transition-shadow border-stone-200 hover:border-stone-300">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-stone-800 mb-1">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-stone-600">{provider.credentials}</p>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="text-sm font-medium text-stone-700 mb-1">Specialty</div>
                        <div className="text-sm text-stone-600">{provider.specialty}</div>
                      </div>

                      <div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-stone-400 mt-0.5" />
                          <div className="text-sm text-stone-600">
                            {provider.address}<br />
                            {provider.city}, {provider.state} {provider.zip}
                            {provider.distance && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {provider.distance.toFixed(1)} mi
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {provider.phone && (
                        <div className="text-sm text-stone-600">
                          📞 {provider.phone}
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-stone-400 text-stone-400" />
                          <span className="text-sm font-medium">{provider.rating.toFixed(1)}</span>
                          <span className="text-xs text-stone-500">({provider.reviewCount})</span>
                        </div>
                        {provider.acceptingPatients && (
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                            Accepting Patients
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button className="w-full bg-stone-800 hover:bg-stone-700 text-white">
                      View Profile
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state for providers */}
          {!isCaregiverMode && !isLoading && providers.length === 0 && !error && (
            <EmptyState
              icon={Stethoscope}
              title="Search for Healthcare Providers"
              description="Enter a search query above to find doctors and specialists. Try something like 'cardiologist in San Francisco' or 'family doctor near me'"
              action={{
                label: "Try Example Search",
                onClick: () => {
                  const example = "family doctor in San Francisco"
                  setSearchQuery(example)
                  searchProviders(example)
                }
              }}
            />
          )}

          {/* Info banner for caregivers */}
          {isCaregiverMode && !isLoading && caregivers.length === 0 && !error && (
            <Card className="mt-12 p-8 bg-gradient-to-br from-rose-50 to-stone-50/30 border-rose-200/60">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-stone-800 mb-2">
                    Become a Verified Caregiver
                  </h3>
                  <p className="text-stone-600 mb-4 leading-relaxed">
                    Join our professional caregiver network. Get matched with patients in need of quality care. 
                    Earn competitive rates with secure, blockchain-based payments.
                  </p>
                  <Link
                    href="/providers/caregiver-signup"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-lg font-medium hover:bg-stone-700 transition-all duration-300"
                  >
                    Apply Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default function ProvidersSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50">
        <MinimalNavigation />
        <div className="pt-32 text-center">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="text-stone-600 mt-4">Loading search...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
