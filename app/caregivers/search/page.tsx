"use client"

/**
 * Caregiver Search Page
 * 
 * Search for verified caregivers by location, specialty, and availability.
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  Clock, 
  Shield, 
  Heart,
  Filter,
  Loader2,
  User,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  DollarSign,
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

const SPECIALTIES = [
  "All Specialties",
  "Elder Care",
  "Post-Surgery Care",
  "Dementia Care",
  "Pediatric Care",
  "Disability Support",
  "Chronic Illness Care",
  "Hospice Care",
  "Physical Therapy Support",
  "Mental Health Support",
]

export default function CaregiverSearchPage() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  
  const [zipCode, setZipCode] = useState("")
  const [specialty, setSpecialty] = useState("All Specialties")
  const [urgentOnly, setUrgentOnly] = useState(false)

  const handleSearch = async () => {
    if (!zipCode.trim()) return
    
    setLoading(true)
    setHasSearched(true)

    try {
      const params = new URLSearchParams()
      if (zipCode) params.append("zipCode", zipCode)
      if (specialty && specialty !== "All Specialties") params.append("specialty", specialty)
      if (urgentOnly) params.append("urgent", "true")

      const response = await fetch(`/api/caregivers/search?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setCaregivers(data.caregivers)
      } else {
        setCaregivers([])
      }
    } catch (error) {
      console.error("Search failed:", error)
      setCaregivers([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Home
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Find Caregivers</h1>
              <p className="text-gray-600">Search verified caregivers in your area</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Enter ZIP code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialty
                </label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1 flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={urgentOnly}
                    onChange={(e) => setUrgentOnly(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">
                    <AlertTriangle className="h-4 w-4 inline mr-1 text-orange-500" />
                    Urgent availability
                  </span>
                </label>
              </div>

              <div className="md:col-span-1 flex items-end">
                <Button 
                  onClick={handleSearch} 
                  disabled={loading || !zipCode.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {!hasSearched ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-pink-300" />
              <h3 className="text-xl font-semibold mb-2">Search for Caregivers</h3>
              <p className="text-gray-600 mb-6">
                Enter your ZIP code to find verified caregivers in your area.
              </p>
              <div className="flex justify-center gap-4">
                <Badge variant="outline">Background Checked</Badge>
                <Badge variant="outline">Licensed</Badge>
                <Badge variant="outline">CPR Certified</Badge>
              </div>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">Searching for caregivers...</p>
          </div>
        ) : caregivers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No Caregivers Found</h3>
              <p className="text-gray-600 mb-4">
                No verified caregivers found in your area. Try a different ZIP code or specialty.
              </p>
              <Button variant="outline" asChild>
                <Link href="/onboarding?role=caregiver">
                  <Heart className="h-4 w-4 mr-2" />
                  Become a Caregiver
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Found {caregivers.length} caregiver{caregivers.length !== 1 ? "s" : ""} in your area
            </p>

            {caregivers.map((caregiver) => (
              <Card key={caregiver.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <Heart className="h-8 w-8 text-pink-500" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{caregiver.name}</h3>
                            {caregiver.verified && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <p className="text-gray-600">{caregiver.specialty}</p>
                        </div>
                        
                        {caregiver.hourlyRate && (
                          <div className="text-right">
                            <p className="text-lg font-semibold text-green-600">
                              ${caregiver.hourlyRate}/hr
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {caregiver.badges.map((badge) => (
                          <Badge key={badge} variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            {badge}
                          </Badge>
                        ))}
                        {caregiver.availableForUrgent && (
                          <Badge className="bg-orange-100 text-orange-700 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Urgent Available
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{caregiver.rating.toFixed(1)}</span>
                          <span className="text-gray-400">({caregiver.reviewCount})</span>
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
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {caregiver.bio}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button asChild>
                          <Link href={`/caregivers/${caregiver.id}`}>
                            View Profile
                          </Link>
                        </Button>
                        <Button variant="outline">
                          <Phone className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA for caregivers */}
        <Card className="mt-8 bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Are you a caregiver?</h3>
            <p className="text-gray-600 mb-4">
              Join our network of verified caregivers and connect with families who need your help.
            </p>
            <Button asChild>
              <Link href="/onboarding?role=caregiver">
                <Heart className="h-4 w-4 mr-2" />
                Apply as Caregiver
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
