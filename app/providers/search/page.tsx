"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search, MapPin, Star, Calendar, Phone, Globe, Filter, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [locationInput, setLocationInput] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

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

  const searchProviders = async () => {
    if (!searchQuery && !selectedSpecialty && !locationInput) {
      setError("Please enter a search term, select a specialty, or specify a location")
      return
    }

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('query', searchQuery)
      if (selectedSpecialty) params.append('specialty', selectedSpecialty)
      if (locationInput) params.append('location', locationInput)
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
    searchProviders()
  }

  // Auto-search when specialty or location changes
  useEffect(() => {
    if (hasSearched && (selectedSpecialty || locationInput)) {
      searchProviders()
    }
  }, [selectedSpecialty, locationInput])

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
            <div className="grid md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Provider name or organization..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Specialty Filter */}
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                aria-label="Select specialty"
              >
                <option value="">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>

              {/* Location Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="City, State (e.g., San Francisco, CA)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                />
              </div>

              {/* Search Button */}
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
            </div>
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
                <div key={provider.id} className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-6">
                    {/* Provider Image/Initials */}
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-indigo-600">
                        {provider.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>

                    {/* Provider Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{provider.name}</h3>
                          <p className="text-indigo-600 font-medium">{provider.specialty}</p>
                          <p className="text-gray-600">{provider.address}</p>
                          <p className="text-sm text-gray-500">NPI: {provider.npi}</p>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="font-medium">{provider.rating}</span>
                            <span className="text-gray-500">({provider.reviewCount} reviews)</span>
                          </div>
                          {provider.distance !== null && provider.distance !== undefined && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{provider.distance} miles away</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Availability</p>
                          <p className="font-medium text-sm">{provider.availability}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Languages</p>
                          <p className="font-medium text-sm">{provider.languages.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Insurance</p>
                          <p className="font-medium text-sm">{provider.insurance.slice(0, 2).join(', ')}{provider.insurance.length > 2 ? '...' : ''}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            provider.acceptingPatients 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {provider.acceptingPatients ? 'Accepting Patients' : 'Not Accepting'}
                          </span>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span className="text-sm">{provider.phone}</span>
                          </div>
                          {provider.credentials && (
                            <span className="text-sm text-gray-600">{provider.credentials}</span>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                            <Globe className="h-4 w-4 mr-2" />
                            View Profile
                          </Button>
                          <Button 
                            className="bg-indigo-600 hover:bg-indigo-700"
                            disabled={!provider.acceptingPatients}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Appointment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
              <p className="text-gray-400 mt-2">Enter a provider name, select a specialty, or specify a location to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
