"use client"

/**
 * Clinical Trials - Claude.ai Design
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, MapPin, FlaskConical, ExternalLink, Loader2, Users, CheckCircle, AlertCircle, Building2 } from "lucide-react"

interface ClinicalTrial {
  nctId: string
  briefTitle: string
  briefSummary: string
  condition: string
  phase: string
  enrollment: number
  locationString: string
  studyType: string
  eligibilityScore?: number
  recommendationLevel?: string
}

// Major Cancer Centers for filtering
const CANCER_CENTERS = [
  { name: 'MD Anderson', city: 'Houston, TX' },
  { name: 'Memorial Sloan Kettering', city: 'New York, NY' },
  { name: 'Mayo Clinic', city: 'Rochester, MN' },
  { name: 'Dana-Farber', city: 'Boston, MA' },
  { name: 'Fred Hutch', city: 'Seattle, WA' },
  { name: 'UCSF', city: 'San Francisco, CA' },
  { name: 'UCLA', city: 'Los Angeles, CA' },
  { name: 'Stanford', city: 'Palo Alto, CA' },
  { name: 'OHSU', city: 'Portland, OR' },
  { name: 'Johns Hopkins', city: 'Baltimore, MD' },
  { name: 'Cleveland Clinic', city: 'Cleveland, OH' },
  { name: 'Duke', city: 'Durham, NC' },
]

export default function ClinicalTrialsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [institution, setInstitution] = useState('')
  const [trials, setTrials] = useState<ClinicalTrial[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const searchTrials = async (conditionOverride?: string, locationOverride?: string, institutionOverride?: string) => {
    const searchCondition = conditionOverride ?? searchQuery
    const searchLocation = locationOverride ?? location
    const searchInstitution = institutionOverride ?? institution

    if (!searchCondition.trim() && !searchLocation.trim() && !searchInstitution.trim()) {
      setError('Please enter a condition, location, or institution to search')
      return
    }

    setIsLoading(true)
    setError(null)
    setTrials([])

    try {
      const params = new URLSearchParams()
      
      if (searchCondition.trim()) {
        params.append('query', searchCondition.trim())
      }
      if (searchLocation.trim()) {
        params.append('location', searchLocation.trim())
      }
      if (searchInstitution.trim()) {
        params.append('institution', searchInstitution.trim())
      }
      params.append('pageSize', '25')

      const response = await fetch(`/api/clinical-trials?${params}`)
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
        setTrials([])
      } else if (data.studies && data.studies.length > 0) {
        setTrials(data.studies)
        setTotalCount(data.totalCount || data.studies.length)
      } else {
        setError('No actively recruiting trials found. Try different search terms or check back later.')
        setTrials([])
      }
    } catch (err) {
      console.error('Clinical trials search error:', err)
      setError('Failed to search clinical trials. Please try again.')
      setTrials([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchTrials()
  }

  const searchByCenter = (centerName: string, centerCity: string) => {
    setSearchQuery('')
    setLocation(centerCity)
    setInstitution(centerName)
    searchTrials('', centerCity, centerName)
  }

  // Focus on common conditions with high trial volume
  const exampleSearches = [
    { condition: 'lung cancer', location: 'California' },
    { condition: 'breast cancer', location: 'New York' },
    { condition: 'type 2 diabetes', location: 'Texas' },
    { condition: 'hypertension', location: 'Florida' },
    { condition: 'prostate cancer', location: '' },
    { condition: 'leukemia', location: '' },
  ]

  // Common condition categories for quick access
  const conditionCategories = [
    { 
      name: 'Oncology', 
      icon: '🎗️',
      conditions: ['Lung Cancer', 'Breast Cancer', 'Prostate Cancer', 'Leukemia', 'Lymphoma', 'Colon Cancer', 'Melanoma']
    },
    { 
      name: 'Cardiovascular', 
      icon: '❤️',
      conditions: ['Hypertension', 'Heart Failure', 'Coronary Artery Disease', 'Atrial Fibrillation']
    },
    { 
      name: 'Metabolic', 
      icon: '🩺',
      conditions: ['Type 2 Diabetes', 'Type 1 Diabetes', 'Obesity', 'Metabolic Syndrome']
    },
  ]

  const runExampleSearch = (condition: string, loc: string) => {
    setSearchQuery(condition)
    setLocation(loc)
    setInstitution('')
    searchTrials(condition, loc, '')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b" style={{ backgroundColor: 'rgba(26, 25, 21, 0.9)', borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-lg font-medium tracking-tight hover:opacity-80 transition-opacity">
              BaseHealth
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/screening" className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                Screening
              </Link>
              <Link href="/providers/search" className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                Providers
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-24">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className={`max-w-3xl mb-8 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h1 className="text-4xl md:text-5xl font-normal tracking-tight mb-4" style={{ lineHeight: '1.1' }}>
              Clinical Trials
              <br />
              <span style={{ color: 'var(--text-secondary)' }}>Research Network</span>
            </h1>
            <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
              Search 400,000+ clinical trials from ClinicalTrials.gov.
            </p>
          </div>

          {/* Important Disclaimer */}
          <div 
            className={`mb-8 p-4 rounded-xl ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
              <div>
                <p className="font-medium mb-1" style={{ color: '#f59e0b' }}>Important Notice</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Trial availability shown here may not reflect real-time status. Some institutions may not have updated whether a trial is still enrolling. 
                  <strong> Always contact the clinical trial team directly</strong> to confirm current enrollment status and eligibility before making any decisions.
                </p>
              </div>
            </div>
          </div>

          {/* Condition Categories */}
          <div className={`mb-8 ${mounted ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Popular Categories</p>
            <div className="grid md:grid-cols-3 gap-4">
              {conditionCategories.map((category) => (
                <div 
                  key={category.name}
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{category.icon}</span>
                    <h3 className="font-medium">{category.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.conditions.map((condition) => (
                      <button
                        key={condition}
                        onClick={() => runExampleSearch(condition, '')}
                        className="px-2 py-1 text-xs rounded transition-colors"
                        style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Major Cancer Centers */}
          <div className={`mb-8 ${mounted ? 'animate-fade-in-up delay-150' : 'opacity-0'}`}>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
              🏥 Major Cancer & Research Centers
            </p>
            <div className="flex flex-wrap gap-2">
              {CANCER_CENTERS.map((center) => (
                <button
                  key={center.name}
                  onClick={() => searchByCenter(center.name, center.city)}
                  className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                >
                  {center.name}
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({center.city.split(',')[0]})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSubmit} className={`mb-10 ${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <FlaskConical className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Condition (e.g., lung cancer, diabetes)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-lg text-base focus:outline-none transition-colors"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="City, State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-lg focus:outline-none transition-colors"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Institution (optional)"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-lg focus:outline-none transition-colors"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Quick:</span>
                {exampleSearches.slice(0, 4).map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => runExampleSearch(ex.condition, ex.location)}
                    className="px-3 py-1 text-sm rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                  >
                    {ex.condition}{ex.location ? ` (${ex.location.split(',')[0]})` : ''}
                  </button>
                ))}
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="px-6 py-3 font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Searching...
                  </>
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
            <div className="mb-8 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'rgba(220, 100, 100, 0.1)', color: '#dc6464', border: '1px solid rgba(220, 100, 100, 0.2)' }}>
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 rounded-xl border animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                  <div className="h-5 w-3/4 rounded mb-3" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                  <div className="h-4 w-1/2 rounded mb-4" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                  <div className="h-4 w-full rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {!isLoading && trials.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Showing {trials.length} of {totalCount.toLocaleString()} trials
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Data from ClinicalTrials.gov
                </p>
              </div>
              
              {/* Reminder banner */}
              <div 
                className="mb-6 p-3 rounded-lg flex items-center gap-2 text-sm"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>
                  Remember: Contact the trial team directly to verify current enrollment status.
                </span>
              </div>
              <div className="space-y-4">
                {trials.map((trial, index) => (
                  <div 
                    key={trial.nctId} 
                    className={`p-5 rounded-xl border transition-all ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          <span 
                            className="px-2 py-0.5 text-xs font-medium rounded flex items-center gap-1" 
                            style={{ backgroundColor: 'rgba(107, 155, 107, 0.15)', color: '#6b9b6b' }}
                            title="Status may be outdated - verify with trial team"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Listed as Active
                          </span>
                          {trial.phase && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded" style={{ backgroundColor: 'rgba(150, 120, 180, 0.15)', color: '#9678b4' }}>
                              Phase {trial.phase.replace('PHASE', '').trim()}
                            </span>
                          )}
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{trial.nctId}</span>
                        </div>

                        <h3 className="text-lg font-medium mb-3 leading-snug">
                          {trial.briefTitle}
                        </h3>

                        {trial.briefSummary && (
                          <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                            {trial.briefSummary.slice(0, 300)}...
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                          {trial.condition && (
                            <span className="flex items-center gap-2">
                              <FlaskConical className="h-4 w-4" />
                              {trial.condition.split(',').slice(0, 2).join(', ')}
                            </span>
                          )}
                          {trial.enrollment > 0 && (
                            <span className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {trial.enrollment.toLocaleString()} participants
                            </span>
                          )}
                          {trial.locationString && (
                            <span className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {trial.locationString}
                            </span>
                          )}
                        </div>
                      </div>

                      <a
                        href={`https://clinicaltrials.gov/study/${trial.nctId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 font-medium rounded-lg text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
                        style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
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
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <FlaskConical className="h-8 w-8" style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 className="text-xl font-medium mb-2">Search Clinical Trials</h3>
              <p className="max-w-md mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
                Enter a health condition and optionally a location to find active clinical trials.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {exampleSearches.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => runExampleSearch(ex.condition, ex.location)}
                    className="px-4 py-2 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                  >
                    {ex.condition}{ex.location ? ` in ${ex.location}` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
