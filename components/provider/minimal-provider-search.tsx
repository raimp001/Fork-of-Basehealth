"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  MapPin,
  Star,
  DollarSign,
  Filter,
  X,
  ChevronDown,
  Phone,
  Video,
  Clock,
  Heart,
  Shield,
  Users,
  Calendar,
  FileText,
  Sparkles,
  MessageSquare
} from "lucide-react"
import { parseNaturalLanguageQuery } from "@/lib/ai-service"

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
  gender: string
  availability: string
  insurance: string[]
  languages: string[]
}

export function MinimalProviderSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [providers, setProviders] = useState<Provider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    acceptingPatients: false,
    hasRating: false,
    withinDistance: false,
    distance: "10"
  })

  // Natural language search examples
  const searchExamples = [
    "heart doctor in Chicago",
    "diabetes specialist in New York",
    "pediatrician in Miami",
    "dermatologist in Los Angeles",
    "mental health therapist in Seattle",
    "orthopedic surgeon in Boston",
    "cancer specialist in Houston",
    "family doctor in Denver",
    "urgent care in Phoenix",
    "women's health doctor in Atlanta"
  ]

  const handleNaturalLanguageSearch = (query: string) => {
    setSearchQuery(query)
    
    // Parse the natural language query
    const parsed = parseNaturalLanguageQuery(query)
    
    // Update form fields based on parsed query
    if (parsed.location) {
      setLocation(parsed.location)
    }
    if (parsed.specialty) {
      setSpecialty(parsed.specialty)
    }
    
    // Trigger search with parsed parameters
    searchProviders(parsed.specialty || "", parsed.location || "")
  }

  const searchProviders = async (specialtyQuery: string, locationQuery: string) => {
    if (!specialtyQuery && !locationQuery && !searchQuery) {
      setProviders([])
      setFilteredProviders([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const params = new URLSearchParams()
      if (specialtyQuery) params.append('specialty', specialtyQuery)
      if (locationQuery) params.append('location', locationQuery)
      if (searchQuery) params.append('query', searchQuery)
      params.append('limit', '20')

      const response = await fetch(`/api/providers/search?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch providers')

      const data = await response.json()
      
      if (data.success) {
        setProviders(data.providers)
        setFilteredProviders(data.providers)
      } else {
        setError(data.error || 'No providers found')
        setProviders([])
        setFilteredProviders([])
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to search providers. Please try again.')
      setProviders([])
      setFilteredProviders([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    // Always use natural language search
    if (searchQuery.trim()) {
      handleNaturalLanguageSearch(searchQuery)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    let filtered = [...providers]

    if (filters.acceptingPatients) {
      filtered = filtered.filter(p => p.acceptingPatients)
    }

    if (filters.hasRating) {
      filtered = filtered.filter(p => p.rating >= 4.0)
    }

    if (filters.withinDistance && filters.distance) {
      const maxDistance = parseFloat(filters.distance)
      filtered = filtered.filter(p => p.distance === null || p.distance <= maxDistance)
    }

    setFilteredProviders(filtered)
  }, [providers, filters])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          AI-Powered Search
        </div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Find Healthcare Providers
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Search for doctors, specialists, and healthcare providers using natural language.
        </p>
      </div>

      {/* Natural Language Search */}
      <Card className="p-6 border-gray-100 mb-6">
        <div className="mb-4">
          
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="e.g., heart doctor in Chicago, diabetes specialist in New York..."
              className="flex-1 border-2 border-gray-400 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleNaturalLanguageSearch(searchQuery)
                }
              }}
            />
            <Button 
              onClick={() => handleNaturalLanguageSearch(searchQuery)}
              disabled={!searchQuery.trim()}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

                      {/* Search Examples */}
                <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Examples:</span>
              {searchExamples.map((example, index) => (
                    <button
                key={index}
                onClick={() => handleNaturalLanguageSearch(example)}
                className="text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-gray-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          
          {hasSearched && filteredProviders.length > 0 && (
            <span className="text-sm text-gray-600">
              {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-4 border-gray-100 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={filters.acceptingPatients}
                onCheckedChange={(checked) => handleFilterChange('acceptingPatients', checked)}
              />
              <span className="text-sm text-gray-700">Accepting patients</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={filters.hasRating}
                onCheckedChange={(checked) => handleFilterChange('hasRating', checked)}
              />
              <span className="text-sm text-gray-700">4+ star rating</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={filters.withinDistance}
                onCheckedChange={(checked) => handleFilterChange('withinDistance', checked)}
              />
              <span className="text-sm text-gray-700">Within distance</span>
            </label>
            {filters.withinDistance && (
              <Select value={filters.distance} onValueChange={(value) => handleFilterChange('distance', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 miles</SelectItem>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="50">50 miles</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for providers...</p>
          </div>
        ) : error ? (
          <Card className="p-6 border-red-200 bg-red-50">
            <p className="text-red-800">{error}</p>
          </Card>
        ) : hasSearched && filteredProviders.length > 0 ? (
          filteredProviders.map((provider) => (
            <Card key={provider.npi} className="p-6 border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {provider.specialty}
                    </Badge>
                    {provider.acceptingPatients && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Accepting Patients
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {provider.address}, {provider.city}, {provider.state} {provider.zip}
                    </span>
                    {provider.distance && (
                      <span>{provider.distance.toFixed(1)} miles away</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {provider.rating} ({provider.reviewCount} reviews)
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {provider.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {provider.availability}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                    <Button size="sm" variant="outline" className="border-gray-200">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : hasSearched ? (
          !isLoading && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or location
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search for Healthcare Providers</h3>
            <p className="text-gray-600">
              Enter your search criteria above to find providers in your area
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
