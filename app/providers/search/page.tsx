"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ProviderCard } from '@/components/provider-card'
import { Loader2, Search, MapPin, Filter, Users, User, Stethoscope, DollarSign, Star, Clock, Heart } from 'lucide-react'
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
  const [specialty, setSpecialty] = useState('all')
  const [query, setQuery] = useState('')
  
  // Bounty form state
  const [bountyAmount, setBountyAmount] = useState('100')
  const [bountyUrgency, setBountyUrgency] = useState('normal')
  
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
  
  // Check if we're in caregiver mode
  const isCaregiverMode = searchParams.get('bounty') === 'true'
  
  // Initialize state from URL parameters
  useEffect(() => {
    const locationParam = searchParams.get('location') || searchParams.get('zipCode') || ''
    const specialtyParam = searchParams.get('specialty') || 'all'
    const queryParam = searchParams.get('query') || ''
    const screeningsParam = searchParams.get('screenings') || ''
    
    setLocation(locationParam)
    setSpecialty(specialtyParam)
    setQuery(queryParam)
    
    // If we have screenings from recommendations, auto-search
    if (locationParam || specialtyParam || queryParam || screeningsParam) {
      searchProviders(locationParam, specialtyParam, queryParam)
    }
  }, [searchParams, isCaregiverMode])
  
  const searchProviders = async (loc: string, spec: string, q: string) => {
    setLoading(true)
    try {
      // Build search parameters
      const params = new URLSearchParams()
      if (loc) params.append('location', loc)
      if (spec && spec !== 'all') params.append('specialty', spec)
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
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!location.trim()) {
      toast.error('Please enter a location')
      return
    }

    // For caregiver mode, first post bounty then search
    if (isCaregiverMode) {
      if (!query.trim()) {
        toast.error('Please describe your care needs')
        return
      }

      try {
        setLoading(true)
        
        // Post the bounty first
        const bountyData = {
          amount: parseFloat(bountyAmount) || 100,
          description: query,
          location: location,
          careType: specialty !== 'all' ? specialty : undefined,
          urgency: bountyUrgency,
          createdAt: new Date().toISOString(),
          userId: 'current-user-id', // In real app, get from auth
          contactInfo: 'user@example.com', // In real app, get from auth
        }

        // Simulate bounty posting (in real app, this would be an API call)
        console.log('Bounty posted:', bountyData)
        toast.success(`Bounty posted successfully! Amount: $${bountyData.amount}`)
        
        // Update URL with search parameters
        const params = new URLSearchParams()
        if (location) params.append('location', location)
        if (specialty && specialty !== 'all') params.append('specialty', specialty)
        if (query) params.append('query', query)
        params.append('bounty', 'true')
        
        router.push(`/providers/search?${params.toString()}`)
        
        // Now search for caregivers
        await searchProviders(location, specialty, query)
        
      } catch (error) {
        console.error('Error posting bounty:', error)
        toast.error('Failed to post bounty. Searching anyway...')
        // Still search even if bounty posting fails
        await searchProviders(location, specialty, query)
      } finally {
        setLoading(false)
      }
    } else {
      // Regular provider search
      // Update URL with search parameters
      const params = new URLSearchParams()
      if (location) params.append('location', location)
      if (specialty && specialty !== 'all') params.append('specialty', specialty)
      if (query) params.append('query', query)
      
      router.push(`/providers/search?${params.toString()}`)
      
      // Perform search
      searchProviders(location, specialty, query)
    }
  }


  
  return (
    <div className={`min-h-screen ${isCaregiverMode ? 'caregiver-page-solid bg-white' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isCaregiverMode ? 'caregiver-header-solid' : 'bg-white border-b border-slate-200'} sticky top-0 z-40 shadow-xl`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 ${isCaregiverMode ? 'bg-gradient-to-br from-rose-500 to-pink-500' : 'bg-gradient-to-br from-sky-500 to-cyan-500'} rounded-lg flex items-center justify-center`}>
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <h1 className={`text-3xl font-bold ${isCaregiverMode ? 'caregiver-text-rose' : 'text-slate-900'}`}>
              {isCaregiverMode ? 'Find Caregivers' : 'Find Healthcare Providers'}
            </h1>
          </div>
          <p className={`max-w-2xl ${isCaregiverMode ? 'caregiver-text-rose font-bold' : 'text-slate-600'}`}>
            {isCaregiverMode 
              ? 'Search for qualified caregivers in your area or post a bounty to incentivize providers to reach out to you.'
              : 'Search for qualified healthcare providers in your area. Find specialists, check availability, and book appointments instantly.'
            }
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Show screening context if we came from screening recommendations */}
        {searchParams.get('screenings') && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <h3 className="font-semibold text-blue-800">Following up on your screening recommendations</h3>
            </div>
            <p className="text-blue-700 text-sm">
              We're helping you find providers for your recommended screenings. 
              {location && ` Searching in ${location}.`}
            </p>
          </div>
        )}

        {/* Show caregiver bounty context if we came from Find Caregivers */}
        {searchParams.get('bounty') === 'true' && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                <Heart className="w-3 h-3 text-white" />
              </div>
              <h3 className="font-semibold text-rose-800">Caregiver Bounty & Search</h3>
            </div>
            <p className="text-rose-700 text-sm">
              Fill out your care needs below and click "Post Bounty & Search Caregivers" to automatically post a bounty and find qualified providers in your area.
              {location && ` Searching in ${location}.`}
            </p>
          </div>
        )}
        
        {/* Search Form */}
        <Card className={`${isCaregiverMode ? 'caregiver-card-solid shadow-xl' : 'bg-white border border-slate-200 shadow-lg'} p-8 mb-8 rounded-xl`}>
          <form onSubmit={handleSearch} className="space-y-6">
            {isCaregiverMode ? (
              <div className="space-y-6">
                {/* Location Input for Caregivers */}
                <div className="space-y-2">
                  <label htmlFor="location" className="block text-sm font-semibold caregiver-text-dark">
                    <MapPin className="h-4 w-4 inline mr-2 text-rose-600" />
                    Location
                  </label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="ZIP code, city, or address"
                    className="caregiver-input-solid h-12 text-base"
                  />
                  <p className="text-xs text-rose-600">e.g., 98101, Seattle WA, or Miami FL</p>
                </div>

                {/* Care Type for Caregivers */}
                <div className="space-y-2">
                  <label htmlFor="careType" className="block text-sm font-semibold caregiver-text-dark">
                    <Heart className="h-4 w-4 inline mr-2 text-rose-600" />
                    Type of Care Needed
                  </label>
                  <Select value={specialty} onValueChange={setSpecialty}>
                    <SelectTrigger className="caregiver-select-solid h-12">
                      <SelectValue placeholder="Select type of care" />
                    </SelectTrigger>
                    <SelectContent className="caregiver-select-content-solid max-h-64 overflow-y-auto z-50">
                      <SelectItem value="all" className="hover:bg-rose-50 focus:bg-rose-50 cursor-pointer">All Types of Care</SelectItem>
                      <SelectItem value="companionship" className="hover:bg-rose-50 focus:bg-rose-50 cursor-pointer">Companionship</SelectItem>
                      <SelectItem value="personal-care" className="hover:bg-rose-50 focus:bg-rose-50 cursor-pointer">Personal Care & Hygiene</SelectItem>
                      <SelectItem value="medical-assistance" className="hover:bg-rose-50 focus:bg-rose-50 cursor-pointer">Medical Assistance</SelectItem>
                      <SelectItem value="mobility-support" className="hover:bg-rose-50 focus:bg-rose-50 cursor-pointer">Mobility Support</SelectItem>
                      <SelectItem value="meal-preparation" className="hover:bg-rose-50 focus:bg-rose-50 cursor-pointer">Meal Preparation</SelectItem>
                      <SelectItem value="medication-management" className="hover:bg-rose-50 focus:bg-rose-50 cursor-pointer">Medication Management</SelectItem>
                      <SelectItem value="housekeeping" className="hover:bg-rose-50 focus:bg-rose-50 cursor-pointer">Light Housekeeping</SelectItem>
                      <SelectItem value="transportation" className="hover:bg-rose-50 focus:bg-rose-50 cursor-pointer">Transportation</SelectItem>
                      <SelectItem value="respite-care" className="hover:bg-rose-50 focus:bg-rose-50 cursor-pointer">Respite Care</SelectItem>
                      <SelectItem value="overnight-care" className="hover:bg-rose-50 focus:bg-rose-50 cursor-pointer">Overnight Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Patient Care Description */}
                <div className="space-y-2">
                  <label htmlFor="careDescription" className="block text-sm font-semibold caregiver-text-dark">
                    <User className="h-4 w-4 inline mr-2 text-rose-600" />
                    Describe Your Care Needs
                  </label>
                  <textarea
                    id="careDescription"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Please describe the patient's condition, specific care needs, preferred schedule, any special requirements, mobility needs, personality preferences, etc..."
                    rows={4}
                    className="caregiver-textarea-solid w-full text-base py-3 px-4 rounded-lg resize-none"
                  />
                  <p className="text-xs text-rose-600">Be specific to help caregivers understand if they're a good fit</p>
                </div>

                {/* Bounty Settings Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bounty Amount */}
                  <div className="space-y-2">
                    <label htmlFor="bountyAmount" className="block text-sm font-semibold caregiver-text-dark">
                      <DollarSign className="h-4 w-4 inline mr-2 text-rose-600" />
                      Bounty Amount ($)
                    </label>
                    <Input
                      id="bountyAmount"
                      type="number"
                      min="10"
                      step="10"
                      value={bountyAmount}
                      onChange={(e) => setBountyAmount(e.target.value)}
                      placeholder="100"
                      className="caregiver-input-solid h-12 text-base"
                    />
                    <p className="text-xs text-rose-600">Higher amounts attract more responses</p>
                  </div>

                  {/* Urgency Level */}
                  <div className="space-y-2">
                    <label htmlFor="urgencyLevel" className="block text-sm font-semibold caregiver-text-dark">
                      <Clock className="h-4 w-4 inline mr-2 text-rose-600" />
                      Urgency Level
                    </label>
                    <Select value={bountyUrgency} onValueChange={setBountyUrgency}>
                      <SelectTrigger className="caregiver-select-solid h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="caregiver-select-content-solid z-50">
                        <SelectItem value="low" className="hover:bg-rose-50 focus:bg-rose-50 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-500" />
                            Low - Within a week
                          </div>
                        </SelectItem>
                        <SelectItem value="normal" className="hover:bg-rose-50 focus:bg-rose-50 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            Normal - Within 2-3 days
                          </div>
                        </SelectItem>
                        <SelectItem value="high" className="hover:bg-rose-50 focus:bg-rose-50 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            High - Within 24 hours
                          </div>
                        </SelectItem>
                        <SelectItem value="urgent" className="hover:bg-rose-50 focus:bg-rose-50 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-red-500" />
                            Urgent - ASAP
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-rose-600">Response time expectation</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Location Input for Providers */}
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
                
                {/* Specialty Select for Providers */}
                <div className="space-y-2">
                  <label htmlFor="specialty" className="block text-sm font-semibold text-slate-700">
                    <Filter className="h-4 w-4 inline mr-2 text-sky-600" />
                    Specialty
                  </label>
                  <Select value={specialty} onValueChange={setSpecialty}>
                    <SelectTrigger className="input-healthcare h-12">
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-lg rounded-lg max-h-64 overflow-y-auto z-50">
                      <SelectItem value="all" className="hover:bg-slate-50 focus:bg-slate-50 cursor-pointer">All Specialties</SelectItem>
                      {specialties.map(spec => (
                        <SelectItem key={spec} value={spec} className="hover:bg-slate-50 focus:bg-slate-50 cursor-pointer">{spec}</SelectItem>
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
            )}
            
            <div className="flex justify-center items-center gap-4 pt-4">
              <Button 
                type="submit" 
                className={`${isCaregiverMode ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 hover:bg-slate-800'} text-white px-8 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {isCaregiverMode ? (
                      <>
                        <DollarSign className="mr-2 h-5 w-5" />
                        Post Bounty & Search Caregivers
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Find Providers
                      </>
                    )}
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
              <div className="text-sm text-slate-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
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
          <Card className="bg-white border border-slate-200 p-12 text-center shadow-lg rounded-xl">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No providers found</h3>
            <p className="text-slate-600 max-w-md mx-auto mb-6">
              Try adjusting your search criteria or expanding your search area to find more providers.
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  setLocation('')
                  setSpecialty('all')
                  setQuery('')
                }}
                variant="outline"
                className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-800 px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Clear Search
              </Button>
            </div>
          </Card>
        )}
        
        {/* Loading State */}
        {loading && (
          <Card className="bg-white border border-slate-200 p-12 text-center shadow-lg rounded-xl">
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
