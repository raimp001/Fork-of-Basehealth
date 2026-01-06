"use client"

/**
 * Provider Search - Palantir-Grade Enterprise UI
 */

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  MapPin, 
  Star, 
  X, 
  Activity,
  Heart,
  ArrowRight,
  AlertCircle,
  Loader2,
  Phone,
  CheckCircle,
  Filter,
  Sparkles,
} from "lucide-react"

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
    if (initialQuery) {
      searchProviders(initialQuery)
    }
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

  const exampleSearches = [
    "cardiologist in San Francisco",
    "family doctor in New York",
    "pediatrician in Los Angeles",
    "dermatologist in Chicago"
  ]

  return (
    <div className="min-h-screen bg-[#07070c] text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#07070c]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-black" />
              </div>
              <span className="text-lg font-semibold">BaseHealth</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/screening" className="text-sm text-zinc-400 hover:text-white">
                Screening
              </Link>
              <Link href="/clinical-trials" className="text-sm text-zinc-400 hover:text-white">
                Clinical Trials
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className={`mb-10 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium mb-6">
              <Search className="h-3.5 w-3.5" />
              Provider Network
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              {isCaregiverMode ? 'Find Caregivers' : 'Find Healthcare Providers'}
            </h1>

            <p className="text-zinc-400 text-lg max-w-2xl">
              {isCaregiverMode 
                ? 'Connect with verified, licensed caregivers in your area.'
                : 'Search NPI-verified doctors and specialists using natural language.'}
            </p>

            {/* Mode toggle */}
            <div className="flex gap-2 mt-6">
              <Link
                href="/providers/search"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !isCaregiverMode 
                    ? 'bg-white text-black' 
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Doctors & Specialists
              </Link>
              <Link
                href="/providers/search?bounty=true"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isCaregiverMode 
                    ? 'bg-white text-black' 
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Caregivers
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <Card className={`p-6 bg-white/[0.02] border-white/5 mb-8 ${mounted ? 'animate-fade-in-up animation-delay-100' : 'opacity-0'}`}>
            <form onSubmit={handleSearch}>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder={isCaregiverMode ? "Enter city or ZIP code..." : "e.g., cardiologist in San Francisco"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-10 h-14 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-cyan-500/50 text-lg"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setProviders([])
                        setError(null)
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white p-1 rounded-full hover:bg-white/10"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="h-14 px-8 bg-cyan-500 hover:bg-cyan-400 text-black font-medium"
                  aria-label={isLoading ? "Searching" : "Search"}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Example searches */}
              {!isCaregiverMode && providers.length === 0 && !isLoading && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-xs text-zinc-500">Try:</span>
                  {exampleSearches.map((example, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSearchQuery(example)
                        searchProviders(example)
                      }}
                      className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-full text-zinc-400 hover:text-white transition-all"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </Card>

          {/* Error */}
          {error && (
            <Card className="p-6 bg-red-500/10 border-red-500/20 mb-8">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
            </Card>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-6 bg-white/[0.02] border-white/5 animate-pulse">
                  <div className="h-6 w-3/4 bg-white/10 rounded mb-3" />
                  <div className="h-4 w-1/2 bg-white/5 rounded mb-4" />
                  <div className="h-4 w-full bg-white/5 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-white/5 rounded mb-4" />
                  <div className="h-10 w-full bg-white/5 rounded" />
                </Card>
              ))}
            </div>
          )}

          {/* Results */}
          {!isLoading && providers.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                  {providers.length} Providers Found
                </div>
                <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-zinc-400 hover:text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map((provider, index) => (
                  <Card 
                    key={provider.npi} 
                    className={`p-6 bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer group ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-white group-hover:text-cyan-400 transition-colors">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-zinc-500">{provider.credentials}</p>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="text-xs font-mono text-zinc-600 uppercase mb-1">Specialty</div>
                        <div className="text-sm text-zinc-300">{provider.specialty}</div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-zinc-600 mt-0.5" />
                        <div className="text-sm text-zinc-400">
                          {provider.address}<br />
                          {provider.city}, {provider.state} {provider.zip}
                          {provider.distance && (
                            <Badge className="ml-2 bg-white/5 text-zinc-400 border-white/10 text-xs">
                              {provider.distance.toFixed(1)} mi
                            </Badge>
                          )}
                        </div>
                      </div>

                      {provider.phone && (
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Phone className="h-4 w-4 text-zinc-600" />
                          {provider.phone}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium text-white">{provider.rating.toFixed(1)}</span>
                          <span className="text-xs text-zinc-500">({provider.reviewCount})</span>
                        </div>
                        {provider.acceptingPatients && (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accepting
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Link href={`/appointment/book/${provider.npi}`}>
                      <Button className="w-full mt-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white">
                        Book Appointment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {!isLoading && providers.length === 0 && !error && (
            <Card className="p-12 bg-white/[0.02] border-white/5 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-white/5 rounded-2xl flex items-center justify-center">
                <Search className="h-8 w-8 text-zinc-600" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">
                Search for Healthcare Providers
              </h3>
              <p className="text-zinc-500 max-w-md mx-auto mb-6">
                Enter a search query above to find doctors and specialists. Try natural language like "cardiologist in San Francisco".
              </p>
              <Button
                onClick={() => {
                  const example = "family doctor in San Francisco"
                  setSearchQuery(example)
                  searchProviders(example)
                }}
                className="bg-cyan-500 hover:bg-cyan-400 text-black"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Try Example Search
              </Button>
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
      <div className="min-h-screen bg-[#07070c] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
