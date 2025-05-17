// File: components/provider/simplified-provider-search.tsx

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, ExternalLink, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

interface Provider {
  id: string;
  name: string;
  specialty: string;
  rating?: number;
  reviewCount?: number;
  address: {
    full?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  isVerified?: boolean;
  isNearby?: boolean;
  distanceNote?: string;
  website?: string;
  phone?: string;
  npiNumber?: string;
  credentials?: string;
  acceptsInsurance?: boolean;
}

export function SimplifiedProviderSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const specialties = [
    "Family Medicine",
    "Internal Medicine",
    "Pediatrics",
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Psychiatry",
    "Orthopedics",
    "Obstetrics & Gynecology",
    // Dental specialties
    "Dentist",
    "General Dentist",
    "Pediatric Dentist",
  ]

  const handleSearch = async () => {
    if (!zipCode.trim()) {
       setSearchError("Please enter a ZIP code.")
       setHasSearched(true)
       setProviders([])
       return
    }

    setIsSearching(true)
    setHasSearched(false)
    setSearchError(null)
    setProviders([])

    try {
      // Build query parameters
      const queryParams = new URLSearchParams()
      queryParams.append("zipCode", zipCode.trim())

      if (specialty && specialty !== "all") {
        queryParams.append("specialty", specialty)
      }

      // Fetch providers from backend API
      const response = await fetch(`/api/providers/search?${queryParams.toString()}`)

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({}))
         throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setProviders(data.providers || [])
    } catch (err) {
      console.error("Error searching providers:", err)
      setSearchError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.")
      setProviders([])
    } finally {
      setIsSearching(false)
      setHasSearched(true)
    }
  }

  // Filtering logic
  const filteredProviders = searchQuery
    ? providers.filter(
        (provider) =>
          provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          provider.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : providers

  return (
    <div className="space-y-6">
      {/* Search Form Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ZIP Code Input */}
            <div>
              <label htmlFor="zipCode" className="text-sm font-medium block mb-1">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="zipCode"
                  placeholder="Enter 5-digit ZIP"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="pl-10"
                  required
                  pattern="\d{5}"
                  title="Enter a 5-digit US ZIP code"
                />
              </div>
            </div>

            {/* Specialty Select */}
            <div>
              <label htmlFor="specialty" className="text-sm font-medium block mb-1">
                Specialty (Optional)
              </label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger id="specialty">
                  <SelectValue placeholder="All specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All specialties</SelectItem>
                  {specialties.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Find Button */}
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isSearching} className="w-full">
                {isSearching ? "Searching..." : "Find Providers"}
              </Button>
            </div>
          </div>

          {/* Filter Input */}
          <div className="mt-4">
            <Input
              placeholder="Filter results by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!providers.length}
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Area */}
      {hasSearched && (
        <div>
          {/* Error Message Display */}
          {searchError && (
             <Card className="mb-4 border-red-500 bg-red-50">
                 <CardContent className="p-4 flex items-center text-red-700">
                     <AlertCircle className="h-5 w-5 mr-2"/>
                     <p className="text-sm font-medium">{searchError}</p>
                 </CardContent>
             </Card>
          )}

          {/* Loading/No Results/Results Display */}
          {isSearching ? (
             <div className="text-center py-8">
                 <p className="text-muted-foreground">Loading providers...</p>
             </div>
           ) : !searchError && filteredProviders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No providers found matching your criteria.</p>
              <p className="mt-2 text-sm">Try adjusting your search or ZIP code.</p>
            </div>
          ) : !searchError && filteredProviders.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {filteredProviders.length} Provider{filteredProviders.length !== 1 ? "s" : ""} Found
                </h3>
              </div>

              <div className="space-y-4">
                {filteredProviders.map((provider) => (
                  <Card key={provider.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder.svg?height=48&width=48" alt={provider.name} />
                          <AvatarFallback>{provider.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{provider.name}</h3>
                              {provider.isVerified && (
                                <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Verified Provider</span>
                                </Badge>
                              )}
                            </div>
                            {provider.npiNumber && (
                              <span className="text-xs text-muted-foreground">
                                NPI: {provider.npiNumber}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground capitalize">{provider.specialty}</p>
                          
                          {provider.credentials && (
                            <p className="text-xs text-muted-foreground">{provider.credentials}</p>
                          )}

                          <div className="flex items-center text-sm flex-wrap gap-x-2 mt-2">
                            {provider.rating && (
                              <span className="flex items-center">
                                <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                                <span>{provider.rating?.toFixed(1)}</span>
                                {provider.reviewCount && (
                                   <span className="text-muted-foreground ml-1">({provider.reviewCount})</span>
                                )}
                              </span>
                            )}
                             {provider.rating && provider.address?.full && <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>}
                            {provider.address?.full && (
                                <span className="flex items-center">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-1 flex-shrink-0" />
                                    <span className="text-muted-foreground">{provider.address.full}</span>
                                </span>
                            )}
                          </div>

                          {provider.phone && (
                            <p className="text-xs text-muted-foreground mt-1">Phone: {provider.phone}</p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/providers/profile/${provider.id}`}>View Profile</Link>
                        </Button>

                        {provider.website ? (
                          <Button size="sm" asChild>
                            <a href={provider.website} target="_blank" rel="noopener noreferrer">
                              Book Online <ExternalLink className="h-3.5 w-3.5 ml-1"/>
                            </a>
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground text-right">
                            Online booking not available.
                            {provider.phone ? ` Call: ${provider.phone}` : " See profile for details."}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
