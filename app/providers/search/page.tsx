"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { StandardizedButton, PrimaryActionButton } from "@/components/ui/standardized-button"
import { StandardizedInput } from "@/components/ui/standardized-form"
import { Badge } from "@/components/ui/badge"
import { ProviderCardSkeleton, LoadingSpinner } from "@/components/ui/loading"
import { FormError, NetworkError, useErrorHandler } from "@/components/ui/error-boundary"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { components } from "@/lib/design-system"
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
  Upload
} from "lucide-react"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { MinimalProviderSearch } from "@/components/provider/minimal-provider-search"
import Link from "next/link"

interface Caregiver {
  id: string
  name: string
  specialty: string
  location: string
  distance: number
  rating: number
  reviewCount: number
  hourlyRate: number
  availability: string
  isLicensed: boolean
  isCPRCertified: boolean
  isBackgroundChecked: boolean
  experience: string
  languages: string[]
  image?: string
}

// Mock caregiver data
// Removed mock data - now using real API data
const mockCaregivers: Caregiver[] = [
  {
    id: "1",
    name: "Maria Rodriguez",
    specialty: "Elder Care",
    location: "San Francisco, CA",
    distance: 2.1,
    rating: 4.9,
    reviewCount: 156,
    hourlyRate: 25,
    availability: "Available immediately",
    isLicensed: true,
    isCPRCertified: true,
    isBackgroundChecked: true,
    experience: "8 years",
    languages: ["English", "Spanish"],
    image: "/placeholder.svg"
  },
  {
    id: "2",
    name: "James Wilson",
    specialty: "Post-Surgery Care",
    location: "San Francisco, CA",
    distance: 3.5,
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 30,
    availability: "Next week",
    isLicensed: true,
    isCPRCertified: true,
    isBackgroundChecked: true,
    experience: "12 years",
    languages: ["English"],
    image: "/placeholder.svg"
  },
  {
    id: "3",
    name: "Sarah Chen",
    specialty: "Pediatric Care",
    location: "San Francisco, CA",
    distance: 1.8,
    rating: 4.7,
    reviewCount: 203,
    hourlyRate: 28,
    availability: "Available immediately",
    isLicensed: true,
    isCPRCertified: true,
    isBackgroundChecked: true,
    experience: "6 years",
    languages: ["English", "Mandarin"],
    image: "/placeholder.svg"
  }
]

const careTypes = [
  "Elder Care",
  "Post-Surgery Care", 
  "Pediatric Care",
  "Dementia Care",
  "Hospice Care",
  "Companion Care",
  "Medical Equipment Support",
  "Medication Management"
]

const durations = [
  "1-2 weeks",
  "1 month",
  "3 months", 
  "6 months",
  "1 year",
  "Ongoing"
]

const frequencies = [
  "A few hours per day",
  "8 hours per day",
  "12 hours per day",
  "24/7 care",
  "Weekends only",
  "As needed"
]

const timePreferences = [
  "Morning (6 AM - 12 PM)",
  "Afternoon (12 PM - 6 PM)", 
  "Evening (6 PM - 12 AM)",
  "Overnight (12 AM - 6 AM)",
  "Flexible"
]

const urgencyLevels = [
  "Immediate (within 24 hours)",
  "Urgent (within 3 days)",
  "Standard (within 1 week)",
  "Planned (within 2 weeks)"
]

export default function ProvidersSearchPage() {
  const searchParams = useSearchParams()
  const isBounty = searchParams.get('bounty') === 'true'
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const { error, handleError, clearError } = useErrorHandler()
  
  const [formData, setFormData] = useState({
    location: '',
    careType: '',
    description: '',
    condition: '',
    startDate: '',
    duration: '',
    frequency: '',
    hours: '',
    days: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    },
    budgetPeriod: 'hourly',
    amount: '',
    urgency: '',
    requirements: {
      licensedNurse: false,
      cprCertified: false,
      firstAidCertified: false,
      backgroundCheck: false,
      medicalEquipment: false,
      bilingual: false,
      petFriendly: false,
      nonSmoker: false,
      ownTransportation: false
    }
  })

  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [showResults, setShowResults] = useState(false)

  // Fetch real caregivers on mount
  useEffect(() => {
    const fetchCaregivers = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/caregivers/search', {
          method: 'GET'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        if (data.success && data.results) {
          setCaregivers(data.results)
        } else {
          throw new Error(data.error || 'Failed to fetch caregivers')
        }
      } catch (error) {
        console.error('Error fetching caregivers:', error)
        setError(error instanceof Error ? error : new Error('Failed to fetch caregivers'))
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCaregivers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setIsSearching(true)
    
    try {
      const response = await fetch('/api/caregivers/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: formData.location,
          careType: formData.careType,
          requirements: formData.requirements,
          urgency: formData.urgency,
          startDate: formData.startDate,
          duration: formData.duration,
          frequency: formData.frequency,
          maxDistance: 50
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to search caregivers')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setCaregivers(data.results)
        setShowResults(true)
      } else {
        throw new Error(data.error || 'Search failed')
      }
      
    } catch (err) {
      handleError("Unable to search for providers. Please check your connection and try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: !prev.days[day]
      }
    }))
  }

  if (isBounty) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MinimalNavigation />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pt-24">
      {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mb-4">
              <Heart className="h-4 w-4" />
              Professional Caregivers
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Find Professional Caregivers
            </h1>
            <p className="text-gray-600">
              Connect with qualified, compassionate caregivers in your area. Describe your needs and we'll match you with the right professionals.
            </p>
          </div>

          {/* Why Choose Section */}
          <Card className="p-6 border-gray-100 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Why Choose Our Caregiver Network?</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Background Checked</h3>
                  <p className="text-sm text-gray-600">All caregivers are background checked & licensed</p>
        </div>
      </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Rated & Reviewed</h3>
                  <p className="text-sm text-gray-600">Rated & reviewed by families like yours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Compassionate Care</h3>
                  <p className="text-sm text-gray-600">Compassionate, professional care you can trust</p>
          </div>
              </div>
            </div>
          </Card>

          {/* Care Request Form */}
          <Card className="p-6 border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 block">
                    Your Location *
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter your city or ZIP code"
                    className="border-2 border-gray-400 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="careType" className="text-sm font-medium text-gray-700 mb-2 block">
                    Type of Care Needed *
                  </Label>
                  <Select value={formData.careType} onValueChange={(value) => setFormData(prev => ({ ...prev, careType: value }))}>
                    <SelectTrigger className="border-2 border-gray-400 bg-white text-gray-900 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                      <SelectValue placeholder="Select care type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-300 shadow-lg max-h-60 overflow-y-auto">
                      {careTypes.map(type => (
                        <SelectItem key={type} value={type} className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                  Describe Your Care Needs *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the specific care needs, daily activities, and any special requirements..."
                  className="min-h-[100px] border-2 border-gray-400 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
                </div>

              <div>
                <Label htmlFor="condition" className="text-sm font-medium text-gray-700 mb-2 block">
                  Patient Condition/Diagnosis (Optional)
                </Label>
                <Input
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                  placeholder="e.g., Alzheimer's, post-surgery recovery, etc."
                  className="border-2 border-gray-400 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                </div>

              {/* Care Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Care Schedule</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-2 block">
                      Preferred Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="border-2 border-gray-400 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration" className="text-sm font-medium text-gray-700 mb-2 block">
                      Duration Needed
                    </Label>
                    <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                      <SelectTrigger className="border-2 border-gray-400 bg-white text-gray-900 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-300 shadow-lg max-h-60 overflow-y-auto">
                        {durations.map(duration => (
                          <SelectItem key={duration} value={duration} className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">{duration}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                          </div>
                          </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequency" className="text-sm font-medium text-gray-700 mb-2 block">
                      Frequency
                    </Label>
                    <Select value={formData.frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}>
                      <SelectTrigger className="border-2 border-gray-400 bg-white text-gray-900 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-300 shadow-lg max-h-60 overflow-y-auto">
                        {frequencies.map(freq => (
                          <SelectItem key={freq} value={freq} className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">{freq}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                          </div>
                  <div>
                    <Label htmlFor="hours" className="text-sm font-medium text-gray-700 mb-2 block">
                      Preferred Hours
                    </Label>
                    <Select value={formData.hours} onValueChange={(value) => setFormData(prev => ({ ...prev, hours: value }))}>
                      <SelectTrigger className="border-2 border-gray-400 bg-white text-gray-900 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                        <SelectValue placeholder="Select time preference" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-300 shadow-lg max-h-60 overflow-y-auto">
                        {timePreferences.map(time => (
                          <SelectItem key={time} value={time} className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Preferred Days (Select all that apply)
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(formData.days).map(([day, checked]) => (
                      <label key={day} className="flex items-center gap-2">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleDay(day)}
                        />
                        <span className="text-sm text-gray-700 capitalize">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Budget & Investment */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Budget & Investment</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="budgetPeriod" className="text-sm font-medium text-gray-700 mb-2 block">
                      Budget Period
                    </Label>
                    <Select value={formData.budgetPeriod} onValueChange={(value) => setFormData(prev => ({ ...prev, budgetPeriod: value }))}>
                      <SelectTrigger className="border-2 border-gray-400 bg-white text-gray-900 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-300 shadow-lg max-h-60 overflow-y-auto">
                        <SelectItem value="hourly" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Per Hour</SelectItem>
                        <SelectItem value="daily" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Per Day</SelectItem>
                        <SelectItem value="weekly" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Per Week</SelectItem>
                        <SelectItem value="monthly" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Per Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount" className="text-sm font-medium text-gray-700 mb-2 block">
                      Amount ($) *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="Enter budget amount"
                      className="border-2 border-gray-400 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="urgency" className="text-sm font-medium text-gray-700 mb-2 block">
                      Urgency Level
                    </Label>
                    <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
                      <SelectTrigger className="border-2 border-gray-400 bg-white text-gray-900 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                        <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-300 shadow-lg max-h-60 overflow-y-auto">
                        {urgencyLevels.map(level => (
                          <SelectItem key={level} value={level} className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  </div>
                </div>
                </div>
                
              {/* Special Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Special Requirements (Optional)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.requirements.licensedNurse}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          requirements: { ...prev.requirements, licensedNurse: checked as boolean }
                        }))}
                      />
                      <span className="text-sm text-gray-700">Licensed Nurse (RN/LPN)</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.requirements.cprCertified}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          requirements: { ...prev.requirements, cprCertified: checked as boolean }
                        }))}
                      />
                      <span className="text-sm text-gray-700">CPR Certified</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.requirements.firstAidCertified}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          requirements: { ...prev.requirements, firstAidCertified: checked as boolean }
                        }))}
                      />
                      <span className="text-sm text-gray-700">First Aid Certified</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.requirements.backgroundCheck}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          requirements: { ...prev.requirements, backgroundCheck: checked as boolean }
                        }))}
                      />
                      <span className="text-sm text-gray-700">Background Check Required</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.requirements.medicalEquipment}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          requirements: { ...prev.requirements, medicalEquipment: checked as boolean }
                        }))}
                      />
                      <span className="text-sm text-gray-700">Experience with Medical Equipment</span>
                    </label>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.requirements.bilingual}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          requirements: { ...prev.requirements, bilingual: checked as boolean }
                        }))}
                      />
                      <span className="text-sm text-gray-700">Bilingual Required</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.requirements.petFriendly}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          requirements: { ...prev.requirements, petFriendly: checked as boolean }
                        }))}
                      />
                      <span className="text-sm text-gray-700">Pet Friendly</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.requirements.nonSmoker}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          requirements: { ...prev.requirements, nonSmoker: checked as boolean }
                        }))}
                      />
                      <span className="text-sm text-gray-700">Non-Smoker</span>
                  </label>
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.requirements.ownTransportation}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          requirements: { ...prev.requirements, ownTransportation: checked as boolean }
                        }))}
                      />
                      <span className="text-sm text-gray-700">Own Transportation</span>
                    </label>
                  </div>
                </div>
              </div>
            
              <PrimaryActionButton 
                type="submit" 
                loading={isSearching}
                loadingText="Searching for providers..."
                className="w-full"
              >
                Find Caregivers
              </PrimaryActionButton>
          </form>
        </Card>
        
          {/* Error Display */}
          {error && (
            <div className="mt-6">
              <FormError 
                message={error}
                onRetry={() => {
                  clearError()
                  handleSubmit(new Event('submit') as any)
                }}
              />
            </div>
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Loading providers...</h3>
              {Array.from({ length: 3 }).map((_, i) => (
                <ProviderCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Results */}
          {!isLoading && caregivers.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Matching Caregivers</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {caregivers.map((caregiver) => (
                  <Card key={caregiver.id} className="p-4 border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex gap-4 mb-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {caregiver.name}
                        </h3>
                        <p className="text-sm text-gray-600">{caregiver.specialty}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{caregiver.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            ({caregiver.reviewCount} reviews)
                          </span>
                        </div>
              </div>
            </div>
            
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{caregiver.location} • {caregiver.distance} mi</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>${caregiver.hourlyRate}/hour</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{caregiver.availability}</span>
                </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-3.5 w-3.5" />
                        <span>{caregiver.experience} experience</span>
            </div>
          </div>

                    <div className="flex items-center gap-2 mb-4">
                      {caregiver.isLicensed && (
                        <Badge variant="secondary" className="text-xs">
                          Licensed
                        </Badge>
                      )}
                      {caregiver.isCPRCertified && (
                        <Badge variant="secondary" className="text-xs">
                          CPR Certified
                        </Badge>
                      )}
                      {caregiver.isBackgroundChecked && (
                        <Badge variant="secondary" className="text-xs">
                          Background Checked
                        </Badge>
                      )}
            </div>

                    <div className="flex gap-2">
                      <Button asChild className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">
                        <Link href={`/appointment/book?caregiver=${caregiver.id}`}>
                          Contact Caregiver
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" className="border-gray-200">
                        <Phone className="h-4 w-4" />
              </Button>
            </div>
          </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && showResults && caregivers.length === 0 && (
            <div className="mt-8">
              <Card className="p-8 text-center border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No caregivers found</h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  We couldn't find any caregivers matching your criteria. Try adjusting your requirements or location.
                </p>
                <StandardizedButton
                  variant="secondary"
                  onClick={() => {
                    setShowResults(false)
                    // Fetch all caregivers again
                    window.location.reload()
                  }}
                >
                  Reset search
                </StandardizedButton>
              </Card>
            </div>
          )}

          {/* Caregiver Signup Section */}
          <div className="mt-12">
            <Card className="p-6 border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Are You a Professional Caregiver?
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Join our trusted network of professional caregivers and connect with families who need compassionate, skilled care. 
                  Earn competitive rates and work with families in your preferred locations.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Competitive Pay</h3>
                  <p className="text-sm text-gray-600">Earn $25-35/hour with flexible scheduling</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Choose Your Area</h3>
                  <p className="text-sm text-gray-600">Work in your preferred locations</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Verified Network</h3>
                  <p className="text-sm text-gray-600">Background checked & licensed professionals</p>
                </div>
            </div>

              <div className="text-center">
                <PrimaryActionButton asChild className="px-8 py-3">
                  <Link href="/providers/caregiver-signup">
                    Apply to Join Our Network
                  </Link>
                </PrimaryActionButton>
                <p className="text-sm text-gray-500 mt-3">
                  Application takes 5-10 minutes • Background check required
                </p>
              </div>
          </Card>
          </div>
        </main>
      </div>
    )
  }

  // Regular provider search (existing functionality)
  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />
      <div className="pt-16">
        <MinimalProviderSearch />
      </div>
    </div>
  )
}