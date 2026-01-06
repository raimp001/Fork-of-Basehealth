"use client"

/**
 * Clinical Trials - Palantir-Inspired Design
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { Activity, Search, MapPin, FlaskConical, ExternalLink, Loader2, Users, Building2, ChevronDown, CheckCircle } from "lucide-react"

interface ClinicalTrial {
  nctId: string
  title: string
  status: string
  condition: string
  phase: string
  enrollmentCount: number
  startDate: string
  locations: Array<{ facility: string; city: string; state: string; country: string }>
  description: string
  sponsor: string
}

export default function ClinicalTrialsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [trials, setTrials] = useState<ClinicalTrial[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const searchTrials = async () => {
    if (!searchQuery.trim() && !location.trim()) {
      setError('Enter a condition or location')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('condition', searchQuery)
      if (location) params.append('location', location)
      params.append('limit', '20')

      const response = await fetch(`/api/clinical-trials/search?${params}`)
      if (!response.ok) throw new Error('Search failed')

      const data = await response.json()
      if (data.success) {
        setTrials(data.trials || [])
        if (data.trials.length === 0) {
          setError('No trials found. Try different search terms.')
        }
      } else {
        setError(data.error || 'No trials found')
        setTrials([])
      }
    } catch (err) {
      setError('Search failed. Please try again.')
      setTrials([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchTrials()
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
              <Link href="/providers/search" className="text-sm text-neutral-400 hover:text-white transition-colors">
                Providers
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
              Clinical Trials
              <br />
              <span className="text-neutral-500">Research Network</span>
            </h1>
            <p className="text-xl text-neutral-400">
              Access 400,000+ clinical trials from ClinicalTrials.gov with AI-powered eligibility matching.
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSubmit} className={`mb-12 ${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative">
                <FlaskConical className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search by condition (e.g., diabetes, cancer)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-neutral-950 border border-white/10 rounded-xl text-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-neutral-950 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="px-8 py-3 bg-white text-black font-medium rounded-xl hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Search Trials
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
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 bg-neutral-950 border border-white/5 rounded-2xl animate-pulse">
                  <div className="h-6 w-3/4 bg-neutral-800 rounded mb-3" />
                  <div className="h-4 w-1/2 bg-neutral-900 rounded mb-4" />
                  <div className="h-4 w-full bg-neutral-900 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {!isLoading && trials.length > 0 && (
            <>
              <p className="text-sm text-neutral-500 mb-6">{trials.length} trials found</p>
              <div className="space-y-4">
                {trials.map((trial, index) => (
                  <div 
                    key={trial.nctId} 
                    className={`p-6 bg-neutral-950 border border-white/5 rounded-2xl hover:border-white/10 transition-all ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded ${
                            trial.status.toLowerCase().includes('recruiting') 
                              ? 'bg-green-500/10 text-green-400' 
                              : 'bg-neutral-500/10 text-neutral-400'
                          }`}>
                            {trial.status.includes('Recruiting') && <CheckCircle className="h-3 w-3 inline mr-1" />}
                            {trial.status}
                          </span>
                          {trial.phase && (
                            <span className="px-2.5 py-1 text-xs font-medium bg-neutral-800 text-neutral-400 rounded">
                              {trial.phase}
                            </span>
                          )}
                          <span className="text-xs text-neutral-600">{trial.nctId}</span>
                        </div>

                        <h3 className="text-xl font-medium text-white mb-3 leading-snug">
                          {trial.title}
                        </h3>

                        <p className="text-neutral-400 mb-4 line-clamp-2">
                          {trial.description}
                        </p>

                        <div className="flex flex-wrap gap-6 text-sm text-neutral-500">
                          <span className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {trial.sponsor}
                          </span>
                          <span className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {trial.enrollmentCount.toLocaleString()} participants
                          </span>
                          {trial.locations?.[0] && (
                            <span className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {trial.locations[0].city}, {trial.locations[0].state}
                              {trial.locations.length > 1 && ` +${trial.locations.length - 1}`}
                            </span>
                          )}
                        </div>
                      </div>

                      <a
                        href={`https://clinicaltrials.gov/study/${trial.nctId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        View Details
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {!isLoading && trials.length === 0 && !error && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-8 bg-neutral-950 rounded-2xl flex items-center justify-center">
                <FlaskConical className="h-10 w-10 text-neutral-600" />
              </div>
              <h3 className="text-2xl font-medium mb-3">Search Clinical Trials</h3>
              <p className="text-neutral-500 max-w-md mx-auto mb-8">
                Search by condition and location to find active clinical trials.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('diabetes')
                  setLocation('California')
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
