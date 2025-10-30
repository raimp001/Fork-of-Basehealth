"use client"

/**
 * Caregiver Search - Palantir-Grade Enterprise UI
 * Premium, seamless user experience
 */

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { MinimalProviderSearch } from "@/components/provider/minimal-provider-search"
import { CaregiverList } from "@/components/caregiver/caregiver-list"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Search, MapPin, Star, Filter, X, Users, Sparkles } from "lucide-react"

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

function CaregiverSearchContent() {
  const searchParams = useSearchParams()
  const isCaregiverMode = searchParams?.get('bounty') === 'true'
  
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchLocation, setSearchLocation] = useState("")
  const [resultMessage, setResultMessage] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isCaregiverMode) {
      fetchCaregivers()
    }
  }, [isCaregiverMode])

  async function fetchCaregivers(location?: string) {
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
        setResultMessage(data.message || '')
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchLocation.trim()) {
      fetchCaregivers(searchLocation.trim())
    } else {
      fetchCaregivers()
    }
  }

  const clearSearch = () => {
    setSearchLocation("")
    fetchCaregivers()
  }

  // If NOT in caregiver mode, show provider search (for doctors/physicians)
  if (!isCaregiverMode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-rose-50/10">
        <MinimalNavigation />
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <MinimalProviderSearch />
          </div>
        </main>
      </div>
    )
  }

  // Caregiver search mode
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-rose-50/10">
      <MinimalNavigation />
      
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Section - Calming warm grey */}
          <div className="mb-12">
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-stone-700 text-stone-50 rounded-full text-sm font-medium mb-6 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <Users className="h-4 w-4" />
              <span>Professional Caregivers</span>
            </div>

            <h1 className={`text-5xl md:text-6xl font-bold text-stone-800 mb-6 tracking-tight ${mounted ? 'animate-fade-in-up animation-delay-100' : 'opacity-0'}`}>
              Find Professional{" "}
              <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-stone-600 bg-clip-text text-transparent">
                Caregivers
              </span>
            </h1>

            <p className={`text-xl text-stone-600 max-w-3xl leading-relaxed ${mounted ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
              Connect with verified, licensed, and background-checked caregivers in your area. All caregivers are real, approved professionals—no mock data.
            </p>
          </div>

          {/* Search Bar - Calming design */}
          <Card className={`p-8 mb-12 border-stone-200 shadow-premium bg-white ${mounted ? 'animate-fade-in-up animation-delay-300' : 'opacity-0'}`}>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <Input
                  type="text"
                  placeholder="Enter city, state, or ZIP code..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-12 h-14 text-lg border-stone-200 focus:border-stone-500 focus:ring-2 focus:ring-stone-400/20"
                />
                {searchLocation && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <Button type="submit" size="lg" className="h-14 px-10 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </form>
          </Card>

          {/* Result Message */}
          {resultMessage && !isLoading && (
            <div className="mb-8 text-center">
              <p className="text-sm text-slate-600 font-medium">
                {resultMessage}
              </p>
            </div>
          )}

          {/* Results Section */}
          {error ? (
            <Card className="p-16 text-center border-red-200 bg-gradient-to-br from-white to-red-50/30">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <X className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-red-900 mb-4">{error}</h3>
              <Button onClick={() => fetchCaregivers()} variant="outline" className="mt-4">
                Try Again
              </Button>
            </Card>
          ) : (
            <CaregiverList
              caregivers={caregivers}
              isLoading={isLoading}
              onSelect={(caregiver) => {
                window.location.href = `/caregivers/${caregiver.id}/book`
              }}
            />
          )}

          {/* Info Banner - Enterprise Style */}
          {!isLoading && caregivers.length === 0 && !error && (
            <Card className="mt-12 p-8 bg-gradient-to-br from-blue-50 to-purple-50/30 border-blue-200/60">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Become a Verified Caregiver
                  </h3>
                  <p className="text-slate-600 mb-4 leading-relaxed">
                    Join our professional caregiver network. Get matched with patients in need of quality care. 
                    Earn competitive rates with secure, blockchain-based payments.
                  </p>
                  <Link
                    href="/providers/caregiver-signup"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all duration-300"
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
    <Suspense fallback={<div className="min-h-screen bg-slate-50"><MinimalNavigation /><div className="pt-32 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div></div></div>}>
      <CaregiverSearchContent />
    </Suspense>
  )
}
