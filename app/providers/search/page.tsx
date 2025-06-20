"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search, MapPin, Star, Calendar, Phone, Globe, Filter, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProviderCard } from '@/components/provider-card'
import { toast } from 'sonner'

interface Provider {
  id: string
  name: string
  specialty: string
  address: string
  distance?: number | null
  rating: number
  reviewCount: number
  acceptingPatients: boolean
  phone: string
  npi: string
  credentials: string
  gender: string
  availability: string
  insurance: string[]
  languages: string[]
}

export default function ProviderSearchPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [locationInput, setLocationInput] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()

  const specialties = [
    "Primary Care",
    "Cardiology", 
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Oncology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Surgery",
    "Family Medicine",
    "Internal Medicine"
  ]

  // Initialize state from URL parameters
  useEffect(() => {
    const locationParam = searchParams.get('location') || searchParams.get('zipCode') || ''
    const specialtyParam = searchParams.get('specialty') || ''
    const queryParam = searchParams.get('query') || ''
    
    setLocationInput(locationParam)
    setSelectedSpecialty(specialtyParam)
    
    if (locationParam || specialtyParam || queryParam) {
      searchProviders(locationParam, specialtyParam, queryParam)
    }
  }, [searchParams])

  const searchProviders = async (loc: string, spec: string, q: string) => {
    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const params = new URLSearchParams()
      if (loc) params.append('location', loc)
      if (spec) params.append('specialty', spec)
      if (q) params.append('query', q)
      params.append('limit', '20')

      const response = await fetch(`/api/providers/search?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setProviders(data.providers)
        if (data.fallback) {
          setError("Using fallback data - NPI API temporarily unavailable")
        }
      } else {
        setError(data.error || "Failed to search providers")
        setProviders(data.providers || [])
      }
    } catch (err) {
      console.error('Search error:', err)
      setError("Failed to search providers. Please try again.")
      setProviders([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Update URL with search parameters
    const params = new URLSearchParams()
    if (locationInput) params.append('location', locationInput)
    if (selectedSpecialty) params.append('specialty', selectedSpecialty)
    
    router.push(`/providers/search?${params.toString()}`)
    
    // Perform search
    searchProviders(locationInput, selectedSpecialty, '')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="flex items-center justify-between px-8 py-6 border-b">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            basehealth.xyz
          </Link>
        </div>
        <nav className="flex items-center gap-8">
          <Link href="/patient-portal" className="text-gray-700 hover:text-indigo-600 transition-colors">
            Patient Portal
          </Link>
          <Link href="/settings" className="text-gray-700 hover:text-indigo-600 transition-colors">
            Settings
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/patient-portal" className="text-gray-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Find a Provider</h1>
          </div>

          {/* Search and Filters */}
          <form onSubmit={handleSearch} className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-2">
                  Location (ZIP code or City, State)
                </label>
                <Input
                  id="location"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="e.g. 98101 or Seattle, WA"
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="specialty" className="block text-sm font-medium mb-2">
                  Specialty
                </label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Specialties</SelectItem>
                    {specialties.map(specialty => (
                      <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
              <p className="text-gray-600">Searching healthcare providers...</p>
            </div>
          )}

          {/* Results Summary */}
          {!isLoading && hasSearched && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Found <strong>{providers.length}</strong> providers
                {selectedSpecialty && ` in ${selectedSpecialty}`}
                {locationInput && ` near ${locationInput}`}
              </p>
              <div className="text-sm text-gray-500">
                Powered by NPI Registry
              </div>
            </div>
          )}

          {/* Provider Cards */}
          {!isLoading && providers.length > 0 && (
            <div className="space-y-6">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && hasSearched && providers.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No providers found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your search filters or expanding your location.</p>
            </div>
          )}

          {/* Initial State */}
          {!hasSearched && !isLoading && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Search for healthcare providers</p>
              <p className="text-gray-400 mt-2">Select a specialty or specify a location to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
