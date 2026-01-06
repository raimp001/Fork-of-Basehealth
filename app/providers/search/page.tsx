"use client"

/**
 * Provider Search - Palantir-Inspired Design
 */

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Activity, Search, MapPin, Star, X, ArrowRight, Loader2, CheckCircle } from "lucide-react"

export const dynamic = 'force-dynamic'

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
  const initialQuery = searchParams?.get('query') || ''
  
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])

  useEffect(() => {
    setMounted(true)
    if (initialQuery) searchProviders(initialQuery)
  }, [initialQuery])

  const searchProviders = async (query: string) => {
    if (!query.trim()) {
      setError('Please enter a search query')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({ query, limit: '20' })
      const response = await fetch(`/api/providers/search?${params.toString()}`)
      
      if (!response.ok) throw new Error('Search failed')

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
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchProviders(searchQuery)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-medium">BaseHealth</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/screening" className="text-sm text-neutral-400 hover:text-white transition-colors">
                Screening
              </Link>
              <Link href="/clinical-trials" className="text-sm text-neutral-400 hover:text-white transition-colors">
                Clinical Trials
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className={`max-w-3xl mb-16 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-6">
              {isCaregiverMode ? 'Find Caregivers' : 'Find Healthcare'}
              <br />
              <span className="text-neutral-500">{isCaregiverMode ? 'in Your Area' : 'Providers'}</span>
            </h1>
            <p className="text-xl text-neutral-400">
              {isCaregiverMode 
                ? 'Connect with verified, licensed caregivers.'
                : 'Search NPI-verified doctors and specialists using natural language.'}
            </p>

            {/* Mode toggle */}
            <div className="flex gap-3 mt-8">
              <Link
                href="/providers/search"
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  !isCaregiverMode ? 'bg-white text-black' : 'text-neutral-400 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                Doctors & Specialists
              </Link>
              <Link
                href="/providers/search?bounty=true"
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isCaregiverMode ? 'bg-white text-black' : 'text-neutral-400 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                Caregivers
              </Link>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className={`mb-12 ${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                <input
                  type="text"
                  placeholder={isCaregiverMode ? "Enter city or ZIP code..." : "e.g., cardiologist in San Francisco"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-neutral-950 border border-white/10 rounded-xl text-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setProviders([])
                      setError(null)
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                aria-label={isLoading ? "Searching" : "Search"}
                className="px-8 py-4 bg-white text-black font-medium rounded-xl hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Search
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-6 bg-neutral-950 border border-white/5 rounded-2xl animate-pulse">
                  <div className="h-6 w-3/4 bg-neutral-800 rounded mb-3" />
                  <div className="h-4 w-1/2 bg-neutral-900 rounded mb-4" />
                  <div className="h-4 w-full bg-neutral-900 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-neutral-900 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {!isLoading && providers.length > 0 && (
            <>
              <p className="text-sm text-neutral-500 mb-6">{providers.length} providers found</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider, index) => (
                  <div 
                    key={provider.npi} 
                    className={`p-6 bg-neutral-950 border border-white/5 rounded-2xl hover:border-white/10 transition-all group ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-medium text-white group-hover:text-neutral-200 transition-colors">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-neutral-500">{provider.credentials}</p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <p className="text-neutral-400">{provider.specialty}</p>
                      <div className="flex items-start gap-2 text-sm text-neutral-500">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span>
                          {provider.city}, {provider.state}
                          {provider.distance && ` • ${provider.distance.toFixed(1)} mi`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-medium">{provider.rating.toFixed(1)}</span>
                        <span className="text-sm text-neutral-500">({provider.reviewCount})</span>
                      </div>
                      {provider.acceptingPatients && (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle className="h-3 w-3" />
                          Accepting
                        </span>
                      )}
                    </div>

                    <Link 
                      href={`/appointment/book/${provider.npi}`}
                      className="mt-4 w-full py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-center hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      Book Appointment
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {!isLoading && providers.length === 0 && !error && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-8 bg-neutral-950 rounded-2xl flex items-center justify-center">
                <Search className="h-10 w-10 text-neutral-600" />
              </div>
              <h3 className="text-2xl font-medium mb-3">Search for Providers</h3>
              <p className="text-neutral-500 max-w-md mx-auto mb-8">
                Enter a search query above to find doctors and specialists.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('family doctor in San Francisco')
                  searchProviders('family doctor in San Francisco')
                }}
                className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Try Example Search
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function ProvidersSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
