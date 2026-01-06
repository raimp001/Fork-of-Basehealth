"use client"

/**
 * Clinical Trials - Palantir-Grade Enterprise UI
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  FlaskConical, 
  Search, 
  MapPin, 
  Calendar,
  Activity,
  ArrowRight,
  X,
  AlertCircle,
  Loader2,
  Filter,
  ExternalLink,
  Building2,
  Users,
  CheckCircle,
} from "lucide-react"

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

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase()
    if (s.includes('recruiting')) return 'emerald'
    if (s.includes('active')) return 'cyan'
    if (s.includes('completed')) return 'zinc'
    if (s.includes('terminated') || s.includes('withdrawn')) return 'red'
    return 'zinc'
  }

  const exampleSearches = [
    { condition: "diabetes", location: "California" },
    { condition: "cancer", location: "New York" },
    { condition: "heart disease", location: "Texas" },
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
              <Link href="/providers/search" className="text-sm text-zinc-400 hover:text-white">
                Providers
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className={`mb-10 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-medium mb-6">
              <FlaskConical className="h-3.5 w-3.5" />
              Research Network
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              Clinical Trials
            </h1>

            <p className="text-zinc-400 text-lg max-w-2xl">
              Access 400,000+ clinical trials from ClinicalTrials.gov. 
              AI-powered eligibility matching helps you find relevant opportunities.
            </p>
          </div>

          {/* Search */}
          <Card className={`p-6 bg-white/[0.02] border-white/5 mb-8 ${mounted ? 'animate-fade-in-up animation-delay-100' : 'opacity-0'}`}>
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                  <FlaskConical className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder="Search by condition (e.g., diabetes, cancer)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-10 h-14 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-purple-500/50 text-lg"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white p-1 rounded-full hover:bg-white/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder="Location (city or state)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-zinc-500">Try:</span>
                  {exampleSearches.map((example, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSearchQuery(example.condition)
                        setLocation(example.location)
                      }}
                      className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-full text-zinc-400 hover:text-white transition-all"
                    >
                      {example.condition} in {example.location}
                    </button>
                  ))}
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-purple-500 hover:bg-purple-400 text-black font-medium"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search Trials
                    </>
                  )}
                </Button>
              </div>
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
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-6 bg-white/[0.02] border-white/5 animate-pulse">
                  <div className="h-6 w-3/4 bg-white/10 rounded mb-3" />
                  <div className="h-4 w-1/2 bg-white/5 rounded mb-4" />
                  <div className="h-4 w-full bg-white/5 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-white/5 rounded" />
                </Card>
              ))}
            </div>
          )}

          {/* Results */}
          {!isLoading && trials.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                  {trials.length} Trials Found
                </div>
                <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-zinc-400 hover:text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="space-y-4">
                {trials.map((trial, index) => (
                  <Card 
                    key={trial.nctId} 
                    className={`p-6 bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`text-xs font-mono ${
                            getStatusColor(trial.status) === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            getStatusColor(trial.status) === 'cyan' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                            getStatusColor(trial.status) === 'red' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                          }`}>
                            {trial.status.includes('Recruiting') && <CheckCircle className="h-3 w-3 mr-1" />}
                            {trial.status}
                          </Badge>
                          {trial.phase && (
                            <Badge className="bg-white/5 text-zinc-400 border-white/10 text-xs">
                              {trial.phase}
                            </Badge>
                          )}
                          <span className="text-xs font-mono text-zinc-600">{trial.nctId}</span>
                        </div>

                        <h3 className="text-lg font-medium text-white mb-2 leading-snug">
                          {trial.title}
                        </h3>

                        <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                          {trial.description}
                        </p>

                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-zinc-600" />
                            <span className="text-zinc-400 truncate">{trial.sponsor}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-zinc-600" />
                            <span className="text-zinc-400">{trial.enrollmentCount.toLocaleString()} participants</span>
                          </div>
                          {trial.locations && trial.locations[0] && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-zinc-600" />
                              <span className="text-zinc-400 truncate">
                                {trial.locations[0].city}, {trial.locations[0].state}
                                {trial.locations.length > 1 && ` +${trial.locations.length - 1}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <a
                          href={`https://clinicaltrials.gov/study/${trial.nctId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all"
                        >
                          View Details
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {!isLoading && trials.length === 0 && !error && (
            <Card className="p-12 bg-white/[0.02] border-white/5 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                <FlaskConical className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">
                Search Clinical Trials
              </h3>
              <p className="text-zinc-500 max-w-md mx-auto mb-6">
                Search by condition and location to find active clinical trials. 
                Data sourced from ClinicalTrials.gov.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('diabetes')
                  setLocation('California')
                  setTimeout(() => searchTrials(), 100)
                }}
                className="bg-purple-500 hover:bg-purple-400 text-black"
              >
                <FlaskConical className="h-4 w-4 mr-2" />
                Try Example Search
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
