"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { MinimalProviderSearch } from "@/components/provider/minimal-provider-search"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Search, MapPin, Star } from "lucide-react"

interface Caregiver {
  id: string
  name: string
  specialty: string
  location: string
  hourlyRate: number
  rating: number
  reviewCount: number
  isLicensed: boolean
  isCPRCertified: boolean
  isBackgroundChecked: boolean
}

function CaregiverSearchContent() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchLocation, setSearchLocation] = useState("")

  useEffect(() => {
    fetchCaregivers()
  }, [])

  async function fetchCaregivers(location?: string) {
    try {
      setIsLoading(true)
      const url = location 
        ? `/api/caregivers/search?location=${encodeURIComponent(location)}`
        : '/api/caregivers/search'
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setCaregivers(data.results || [])
      } else {
        setError('Failed to load caregivers')
      }
    } catch (err) {
      setError('Network error')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchLocation.trim()) {
      fetchCaregivers(searchLocation.trim())
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Professional Caregivers
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with licensed, background-checked caregivers in your area
          </p>

          {/* Search Form */}
          <Card className="p-6 mb-8">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter city or ZIP code"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </Card>

          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading caregivers...</p>
            </div>
          )}

          {error && (
            <Card className="p-6 bg-red-50 border-red-200 mb-6">
              <p className="text-red-600">{error}</p>
            </Card>
          )}

          {!isLoading && !error && caregivers.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-600 mb-4">No caregivers found in this area</p>
              <p className="text-sm text-gray-500">Try searching in a different location</p>
            </Card>
          )}

          {!isLoading && caregivers.length > 0 && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Found {caregivers.length} caregivers
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {caregivers.map((caregiver) => (
                  <Card key={caregiver.id} className="p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {caregiver.name}
                    </h3>
                    <p className="text-gray-600 mb-2">{caregiver.specialty}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      {caregiver.location}
                    </p>
                    
                    {/* Certifications */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {caregiver.isLicensed && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          Licensed
                        </span>
                      )}
                      {caregiver.isCPRCertified && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                          CPR
                        </span>
                      )}
                      {caregiver.isBackgroundChecked && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="ml-1 font-medium">{caregiver.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({caregiver.reviewCount})
                        </span>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        ${caregiver.hourlyRate}/hr
                      </div>
                    </div>

                    <Button className="w-full" asChild>
                      <Link href={`/providers/${caregiver.id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </Card>
                ))}
              </div>
            </>
          )}

          <Card className="p-8 mt-12 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Are You a Professional Caregiver?
              </h2>
              <p className="text-gray-600 mb-6">
                Join our network of trusted caregivers and connect with families who need your help
              </p>
              <Button asChild size="lg">
                <Link href="/providers/caregiver-signup">
                  Apply to Join Our Network
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

function ProvidersSearchPage() {
  const searchParams = useSearchParams()
  const isCaregiverSearch = searchParams.get('bounty') === 'true'

  // If searching for caregivers, show caregiver search
  if (isCaregiverSearch) {
    return <CaregiverSearchContent />
  }

  // Otherwise show provider (physician/NPI) search
  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />
      <div className="pt-16">
        <MinimalProviderSearch />
      </div>
    </div>
  )
}

export default function ProvidersSearchPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ProvidersSearchPage />
    </Suspense>
  )
}
