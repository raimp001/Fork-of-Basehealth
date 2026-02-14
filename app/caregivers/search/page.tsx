"use client"

/**
 * Caregiver Search Page
 * 
 * Dedicated search for caregivers - separate from provider search.
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  Clock, 
  Shield, 
  Heart,
  Loader2,
  User,
  CheckCircle,
  AlertTriangle,
  Navigation,
  ArrowRight,
  X,
} from "lucide-react"

interface Caregiver {
  id: string
  name: string
  specialty: string
  specialties: string[]
  yearsExperience: string
  location: string
  serviceAreas: string[]
  languages: string[]
  hourlyRate: number | null
  rating: number
  reviewCount: number
  bio: string
  verified: boolean
  badges: string[]
  acceptsInsurance: boolean
  willingToTravel: boolean
  availableForUrgent: boolean
}

// Caregiver-specific specialties
const CAREGIVER_SPECIALTIES = [
  { label: 'All Types', value: '' },
  { label: 'Elder Care', value: 'Elder Care' },
  { label: 'Post-Surgery Care', value: 'Post-Surgery Care' },
  { label: 'Dementia Care', value: 'Dementia Care' },
  { label: 'Pediatric Care', value: 'Pediatric Care' },
  { label: 'Disability Support', value: 'Disability Support' },
  { label: 'Chronic Illness Care', value: 'Chronic Illness Care' },
  { label: 'Hospice Care', value: 'Hospice Care' },
  { label: 'Physical Therapy Support', value: 'Physical Therapy Support' },
  { label: 'Mental Health Support', value: 'Mental Health Support' },
  { label: 'Companionship', value: 'Companionship' },
]

export default function CaregiverSearchPage() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [zipCode, setZipCode] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [urgentOnly, setUrgentOnly] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `/api/geocode/reverse?lat=${position.coords.latitude}&lng=${position.coords.longitude}`
          )
          if (response.ok) {
            const data = await response.json()
            if (data.zip) {
              setZipCode(data.zip)
            } else if (data.city) {
              setZipCode(data.city)
            }
          }
        } catch (err) {
          console.error('Reverse geocoding failed:', err)
        } finally {
          setIsLocating(false)
        }
      },
      () => {
        setIsLocating(false)
      },
      { timeout: 10000 }
    )
  }

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!zipCode.trim()) {
      setError('Please enter a ZIP code or location')
      return
    }
    
    setLoading(true)
    setHasSearched(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.append("zipCode", zipCode)
      if (specialty) params.append("specialty", specialty)
      if (urgentOnly) params.append("urgent", "true")

      const response = await fetch(`/api/caregivers/search?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setCaregivers(data.caregivers)
        if (data.caregivers.length === 0) {
          setError('No caregivers found in this area. Try a different location.')
        }
      } else {
        setCaregivers([])
        setError(data.error || 'Search failed')
      }
    } catch (err) {
      console.error("Search failed:", err)
      setCaregivers([])
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <main className="py-8">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className={`max-w-3xl mb-10 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h1 className="text-4xl md:text-5xl font-normal tracking-tight mb-4" style={{ lineHeight: '1.1' }}>
              Find Caregivers
              <br />
              <span style={{ color: 'var(--text-secondary)' }}>in Your Area</span>
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Search verified caregivers by location and care type.
            </p>

            {/* Mode toggle */}
            <div className="flex gap-3 mt-6">
              <Link
                href="/providers/search"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ 
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-medium)'
                }}
              >
                Doctors & Specialists
              </Link>
              <Link
                href="/caregivers/search"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ 
                  backgroundColor: 'var(--text-primary)', 
                  color: 'var(--bg-primary)' 
                }}
              >
                Find Caregivers
              </Link>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
              <div className="grid md:grid-cols-4 gap-4">
                {/* Location */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="ZIP code or city"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-lg focus:outline-none"
                      style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                    />
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={isLocating}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      title="Use my location"
                    >
                      {isLocating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Navigation className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Care Type */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Care Type
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none appearance-none"
                    style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                  >
                    {CAREGIVER_SPECIALTIES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Urgent Filter */}
                <div className="md:col-span-1 flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer py-3">
                    <input
                      type="checkbox"
                      checked={urgentOnly}
                      onChange={(e) => setUrgentOnly(e.target.checked)}
                      className="rounded"
                      style={{ accentColor: 'hsl(var(--accent))' }}
                    />
                    <AlertTriangle className="h-4 w-4" style={{ color: '#f59e0b' }} />
                    <span className="text-sm">Urgent only</span>
                  </label>
                </div>

                {/* Search Button */}
                <div className="md:col-span-1 flex items-end">
                  <button
                    type="submit"
                    disabled={loading || !zipCode.trim()}
                    className="w-full py-3 font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Search
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <X className="h-5 w-5" style={{ color: '#ef4444' }} />
              <p style={{ color: '#ef4444' }}>{error}</p>
            </div>
          )}

          {/* Results */}
          {!hasSearched ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 mx-auto mb-6" style={{ color: 'var(--border-medium)' }} />
              <h3 className="text-xl font-medium mb-3">Search for Caregivers</h3>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                Enter your location to find verified caregivers in your area.
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <Shield className="h-3 w-3 inline mr-1" /> Background Checked
                </span>
                <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <CheckCircle className="h-3 w-3 inline mr-1" /> Licensed
                </span>
                <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <Heart className="h-3 w-3 inline mr-1" /> CPR Certified
                </span>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-16">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Searching for caregivers...</p>
            </div>
          ) : caregivers.length === 0 && !error ? (
            <div className="text-center py-16">
              <User className="h-16 w-16 mx-auto mb-6" style={{ color: 'var(--border-medium)' }} />
              <h3 className="text-xl font-medium mb-3">No Caregivers Found</h3>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                No verified caregivers found in your area yet.
              </p>
              <Link
                href="/onboarding?role=caregiver"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
                style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
              >
                <Heart className="h-4 w-4" />
                Become a Caregiver
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Found {caregivers.length} caregiver{caregivers.length !== 1 ? 's' : ''} in your area
              </p>

              {caregivers.map((caregiver) => (
                <div 
                  key={caregiver.id} 
                  className="p-6 rounded-xl transition-all hover:border-opacity-80"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)' }}>
                      <Heart className="h-7 w-7" style={{ color: '#ec4899' }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium">{caregiver.name}</h3>
                            {caregiver.verified && (
                              <CheckCircle className="h-5 w-5" style={{ color: '#22c55e' }} />
                            )}
                          </div>
                          <p style={{ color: 'var(--text-secondary)' }}>{caregiver.specialty}</p>
                        </div>
                        
                        {caregiver.hourlyRate && (
                          <div className="text-right">
                            <p className="text-lg font-medium" style={{ color: '#22c55e' }}>
                              ${caregiver.hourlyRate}/hr
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {caregiver.badges.map((badge) => (
                          <span 
                            key={badge} 
                            className="px-2 py-1 rounded text-xs flex items-center gap-1"
                            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                          >
                            <Shield className="h-3 w-3" />
                            {badge}
                          </span>
                        ))}
                        {caregiver.availableForUrgent && (
                          <span 
                            className="px-2 py-1 rounded text-xs flex items-center gap-1"
                            style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Urgent Available
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-4 text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" style={{ color: '#fbbf24' }} />
                          <span>{caregiver.rating.toFixed(1)}</span>
                          <span style={{ color: 'var(--text-muted)' }}>({caregiver.reviewCount})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{caregiver.yearsExperience} experience</span>
                        </div>
                        {caregiver.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{caregiver.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Bio */}
                      {caregiver.bio && (
                        <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                          {caregiver.bio}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link
                          href={`/caregivers/${caregiver.id}`}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                          style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                        >
                          View Profile
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <button
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                          style={{ border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                        >
                          <Phone className="h-4 w-4" />
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA for caregivers */}
          <div 
            className="mt-12 p-8 rounded-xl text-center"
            style={{ 
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(244, 63, 94, 0.1))',
              border: '1px solid rgba(236, 72, 153, 0.2)'
            }}
          >
            <Heart className="h-10 w-10 mx-auto mb-4" style={{ color: '#ec4899' }} />
            <h3 className="text-xl font-medium mb-2">Are you a caregiver?</h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Join our network of verified caregivers and connect with families who need your help.
            </p>
            <Link
              href="/onboarding?role=caregiver"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
            >
              <Heart className="h-4 w-4" />
              Apply as Caregiver
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
