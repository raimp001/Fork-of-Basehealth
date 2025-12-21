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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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
      // Error logged on server side
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
      setError('Failed to search. Please try again.')
      setProviders([])
      // Error logged on server side
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
    <div className="min-h-screen bg-white">
      <MinimalNavigation />
      
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Section */}
          <div className="mb-12">
            <div className={`inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-full text-sm font-semibold mb-6 shadow-md ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
              {isCaregiverMode ? <Heart className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
              <span>{isCaregiverMode ? 'Professional Caregivers' : 'Healthcare Providers'}</span>
            </div>

            <h1 className={`text-5xl md:text-6xl font-bold text-stone-900 mb-6 tracking-tight ${mounted ? 'animate-fade-in-up animation-delay-100' : 'opacity-0'}`}>
              {isCaregiverMode ? 'Find Professional ' : 'Find Healthcare '}
              <span className="text-stone-700">
                {isCaregiverMode ? 'Caregivers' : 'Providers'}
              </span>
            </h1>

            <p className={`text-lg md:text-xl text-stone-700 max-w-3xl leading-relaxed font-medium ${mounted ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
              {isCaregiverMode 
                ? 'Connect with verified, licensed, and background-checked caregivers. All caregivers are real, approved professionals—no mock data.'
                : 'Search verified doctors and specialists. Real NPI data, natural language.'}
            </p>

            {/* Mode toggle */}
            <div className="mt-8 flex gap-3">
              <Link
                href="/providers/search"
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  !isCaregiverMode 
                    ? 'bg-stone-900 text-white shadow-lg hover:shadow-xl' 
                    : 'bg-white text-stone-700 border-2 border-stone-300 hover:border-stone-400 hover:bg-stone-50'
                }`}
              >
                Doctors & Specialists
              </Link>
              <Link
                href="/providers/search?bounty=true"
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isCaregiverMode 
                    ? 'bg-stone-900 text-white shadow-lg hover:shadow-xl' 
                    : 'bg-white text-stone-700 border-2 border-stone-300 hover:border-stone-400 hover:bg-stone-50'
                }`}
              >
                Caregivers
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <Card className={`p-8 mb-12 border-2 border-stone-300 shadow-xl bg-white ${mounted ? 'animate-fade-in-up animation-delay-300' : 'opacity-0'}`}>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-700 z-10" />
                  <Input
                    type="text"
                    placeholder={isCaregiverMode ? "Enter city, state, or ZIP code..." : "e.g., cardiologist in San Francisco"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-10 h-14 text-lg border-2 border-stone-300 bg-white text-stone-900 placeholder:text-stone-600 placeholder:font-normal focus:border-stone-700 focus:ring-2 focus:ring-stone-500/30 rounded-xl transition-all duration-200 font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      aria-label="Clear search"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1 rounded-full hover:bg-stone-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isLoading}
                  className="h-14 px-10 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
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
              {isLoading && (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-stone-100 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              )}
              {!isCaregiverMode && !isLoading && providers.length === 0 && (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="text-sm font-bold text-stone-900">Try searching for:</span>
                  {exampleSearches.map((example, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSearchQuery(example)
                        searchProviders(example)
                      }}
                      className="text-sm px-5 py-2.5 bg-white hover:bg-stone-50 border-2 border-stone-300 hover:border-stone-400 text-stone-900 font-semibold rounded-lg transition-all duration-200 hover:shadow-md shadow-sm"
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
            <Card className="p-12 text-center border-2 border-rose-200 bg-gradient-to-br from-white to-rose-50/40 mb-8 shadow-lg">
              <div className="w-16 h-16 mx-auto mb-6 bg-rose-100 rounded-full flex items-center justify-center shadow-md">
                <AlertCircle className="h-8 w-8 text-rose-700" />
              </div>
              <h3 className="text-xl font-bold text-rose-900 mb-2">{error}</h3>
              <p className="text-stone-600 mb-6">Please try a different search or check your connection.</p>
              <Button 
                onClick={() => {
                  setError(null)
                  if (isCaregiverMode) {
                    searchCaregivers()
                  }
                }} 
                variant="outline"
                className="mt-4 border-2 border-stone-300 hover:border-stone-400 font-semibold px-6"
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
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
                  {providers.length} {providers.length === 1 ? 'Provider' : 'Providers'} Found
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <Card key={provider.npi} className="p-6 hover:shadow-2xl transition-all duration-300 border-2 border-stone-300 hover:border-stone-500 cursor-pointer group bg-white">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-stone-700 transition-colors">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-stone-700 font-semibold">{provider.credentials}</p>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <div className="text-xs font-bold text-stone-600 uppercase tracking-wide mb-2">Specialty</div>
                        <div className="text-base font-semibold text-stone-900">{provider.specialty}</div>
                      </div>

                      <div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-5 w-5 text-stone-700 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-stone-800 font-medium">
                            {provider.address}<br />
                            {provider.city}, {provider.state} {provider.zip}
                            {provider.distance && (
                              <Badge variant="outline" className="ml-2 text-xs font-bold border-2 border-stone-400 text-stone-800">
                                {provider.distance.toFixed(1)} mi
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {provider.phone && (
                        <div className="text-sm text-stone-800 font-semibold">
                          📞 {provider.phone}
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-3 border-t-2 border-stone-200">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                          <span className="text-base font-bold text-stone-900">{provider.rating.toFixed(1)}</span>
                          <span className="text-xs text-stone-600 font-medium">({provider.reviewCount})</span>
                        </div>
                        {provider.acceptingPatients && (
                          <Badge className="bg-emerald-600 text-white text-xs font-bold border-0">
                            Accepting Patients
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-base">
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
                    We're building our verified caregiver network in your area
                  </h3>
                  <p className="text-stone-600 mb-4 leading-relaxed">
                    Be the first to join or check back soon. All caregivers are verified, licensed, and background-checked.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/providers/caregiver-signup"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-lg font-medium hover:bg-stone-700 transition-all duration-300"
                    >
                      Apply Now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/providers/search"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-stone-700 border-2 border-stone-300 rounded-lg font-medium hover:border-stone-400 hover:bg-stone-50 transition-all duration-300"
                    >
                      Looking for doctors or specialists instead?
                    </Link>
                  </div>
                  
                  {/* Verification Explainer */}
                  <div className="mt-6 pt-6 border-t border-stone-200">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="verification" className="border-none">
                        <AccordionTrigger className="text-sm font-semibold text-stone-700 hover:no-underline py-2">
                          How verification works
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-0">
                          <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                            <h4 className="font-semibold text-stone-900 mb-2 text-sm">Verified, Licensed Caregivers</h4>
                            <p className="text-sm text-stone-600 leading-relaxed">
                              All caregivers complete background checks, license verification, and reference checks before joining our network. We verify credentials through state licensing boards and NPI databases.
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
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
