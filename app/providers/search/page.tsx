"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProviderCard } from '@/components/provider-card'
import { Loader2, Search, MapPin, Filter, Users, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'

interface Provider {
  id: string
  name: string
  specialty: string
  address: string
  distance?: number
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])
  const [location, setLocation] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [query, setQuery] = useState('')
  
  const specialties = [
    'Primary Care',
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Obstetrics and Gynecology',
    'Ophthalmology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Urology'
  ]
  
  // Initialize state from URL parameters
  useEffect(() => {
    const locationParam = searchParams.get('location') || searchParams.get('zipCode') || ''
    const specialtyParam = searchParams.get('specialty') || ''
    const queryParam = searchParams.get('query') || ''
    
    setLocation(locationParam)
    setSpecialty(specialtyParam)
    setQuery(queryParam)
    
    if (locationParam || specialtyParam || queryParam) {
      searchProviders(locationParam, specialtyParam, queryParam)
    }
  }, [searchParams])
  
  const searchProviders = async (loc: string, spec: string, q: string) => {
    setLoading(true)
    try {
      // Build search parameters
      const params = new URLSearchParams()
      if (loc) params.append('location', loc)
      if (spec) params.append('specialty', spec)
      if (q) params.append('query', q)
      
      const response = await fetch(`/api/providers/search?${params.toString()}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch providers')
      }
      
      setProviders(data.providers)
      
      if (data.providers.length === 0) {
        toast.info('No providers found. Try adjusting your search criteria.')
      } else {
        toast.success(`Found ${data.providers.length} provider${data.providers.length !== 1 ? 's' : ''}`)
      }
    } catch (error) {
      console.error('Error searching providers:', error)
      toast.error('Failed to search providers. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Update URL with search parameters
    const params = new URLSearchParams()
    if (location) params.append('location', location)
    if (specialty) params.append('specialty', specialty)
    if (query) params.append('query', query)
    
    router.push(`/providers/search?${params.toString()}`)
    
    // Perform search
    searchProviders(location, specialty, query)
  }
  
  return (
    <div className="min-h-screen bg-healthcare-gradient">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-sky-100 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Find Healthcare Providers</h1>
          </div>
          <p className="text-slate-600 max-w-2xl">
            Search for qualified healthcare providers in your area. Find specialists, check availability, and book appointments instantly.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="glass-card p-8 mb-8 shadow-healthcare-lg">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Location Input */}
              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-semibold text-slate-700">
                  <MapPin className="h-4 w-4 inline mr-2 text-sky-600" />
                  Location
                </label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="ZIP code, city, or address"
                  className="input-healthcare h-12 text-base"
                />
                <p className="text-xs text-slate-500">e.g., 98101, Seattle WA, or Miami FL</p>
              </div>
              
              {/* Specialty Select */}
              <div className="space-y-2">
                <label htmlFor="specialty" className="block text-sm font-semibold text-slate-700">
                  <Filter className="h-4 w-4 inline mr-2 text-sky-600" />
                  Specialty
                </label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger className="input-healthcare h-12">
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Specialties</SelectItem>
                    {specialties.map(spec => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Provider Name/Organization */}
              <div className="space-y-2">
                <label htmlFor="query" className="block text-sm font-semibold text-slate-700">
                  <Users className="h-4 w-4 inline mr-2 text-sky-600" />
                  Provider Name
                </label>
                <Input
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Doctor or organization name"
                  className="input-healthcare h-12 text-base"
                />
                <p className="text-xs text-slate-500">Search by provider or practice name</p>
              </div>
            </div>
            
            <div className="flex justify-center pt-4">
              <Button 
                type="submit" 
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Find Providers
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
        
        {/* Results Section */}
        {providers.length > 0 ? (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                Search Results
                <span className="text-sky-600 ml-2">({providers.length})</span>
              </h2>
              <div className="text-sm text-slate-600 bg-white/80 px-4 py-2 rounded-lg shadow-sm">
                Sorted by {location ? 'distance' : 'rating'}
              </div>
            </div>
            
            {/* Provider Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <div key={provider.id} className="fade-in-up">
                  <ProviderCard provider={provider} />
                </div>
              ))}
            </div>
          </div>
        ) : !loading && (
          <Card className="glass-card p-12 text-center shadow-healthcare">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No providers found</h3>
            <p className="text-slate-600 max-w-md mx-auto mb-6">
              Try adjusting your search criteria or expanding your search area to find more providers.
            </p>
            <Button 
              onClick={() => {
                setLocation('')
                setSpecialty('')
                setQuery('')
              }}
              variant="outline"
              className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-800 px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Clear Search
            </Button>
          </Card>
        )}
        
        {/* Loading State */}
        {loading && (
          <Card className="glass-card p-12 text-center shadow-healthcare">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-sky-600 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Searching for providers...</h3>
            <p className="text-slate-600">
              We're finding the best healthcare providers in your area.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
