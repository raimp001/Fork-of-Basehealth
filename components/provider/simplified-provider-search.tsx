// File: components/provider/simplified-provider-search.tsx
// Highlight: No changes needed here for the API key itself, but ensure it reflects the previous updates.

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, ExternalLink, AlertCircle } from "lucide-react" // Added ExternalLink, AlertCircle
import Link from "next/link"

// Assuming your Provider type is imported or defined elsewhere, ensure it includes optional 'website' and 'phone'
interface Provider {
  id: string
  name: string
  specialty: string
  rating?: number
  reviewCount?: number
  address: {
    full?: string // From Google
    city?: string // Parsed or from Google
    state?: string // Parsed or from Google
    zipCode?: string
  }
  isVerified?: boolean
  isNearby?: boolean // This was from mock, likely remove or recalculate
  distanceNote?: string // This was from mock, likely remove
  website?: string // Added: From Google Place Details
  phone?: string // Added: From Google Place Details
}


export function SimplifiedProviderSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null) // Added error state

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
    // Consider adding more or making dynamic if needed
  ]

  const handleSearch = async () => {
    // Basic validation - ensure zip code is present
    if (!zipCode.trim()) {
       setSearchError("Please enter a ZIP code.")
       setHasSearched(true) // Indicate a search attempt was made
       setProviders([])
       return
    }
    // Optionally add more specific ZIP code validation (e.g., regex for 5 digits)

    setIsSearching(true)
    setHasSearched(false) // Reset search status until results/error
    setSearchError(null)  // Clear previous errors
    setProviders([])      // Clear previous results

    try {
      // Build query parameters
      const queryParams = new URLSearchParams()
      queryParams.append("zipCode", zipCode.trim()) // Trim whitespace

      if (specialty && specialty !== "all") {
        queryParams.append("specialty", specialty)
      }

      // Fetch providers from *your* backend API (which now uses Google Places)
      const response = await fetch(`/api/providers/search?${queryParams.toString()}`)

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({})) // Try to parse error response
         throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setProviders(data.providers || [])

    } catch (err) {
      console.error("Error searching providers:", err)
      // Set error message for the user
      setSearchError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.")
      setProviders([]) // Ensure providers are cleared on error
    } finally {
      setIsSearching(false)
      setHasSearched(true) // Mark search as completed (even if error occurred)
    }
  }

  // Filtering logic remains the same (filters results *after* fetching)
  const filteredProviders = searchQuery
    ? providers.filter(
        (provider) =>
          provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          provider.specialty.toLowerCase().includes(searchQuery.toLowerCase()),
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
                ZIP Code <span className="text-red-500">*</span> {/* Indicate required */}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="zipCode"
                  placeholder="Enter 5-digit ZIP"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="pl-10"
                  required // HTML5 required attribute
                  pattern="\d{5}" // Basic pattern for 5 digits
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
              disabled={!providers.length} // Disable if no providers fetched
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
                 {/* Optional: Add a spinner here */}
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
                {/* Optional: Add sorting controls here */}
              </div>

              <div className="space-y-4">
                {filteredProviders.map((provider) => (
                  <Card key={provider.id}> {/* Use Google Place ID as key */}
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          {/* Placeholder image, replace if Google provides photos via API */}
                          <AvatarImage src="/placeholder.svg?height=48&width=48" alt={provider.name} />
                          {/* Use first letter of name for Fallback */}
                          <AvatarFallback>{provider.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{provider.name}</h3>
                              {/* Specialty from Google might be different, display what we have */}
                              <p className="text-sm text-muted-foreground capitalize">{provider.specialty}</p>
                            </div>
                             {/* Removed Verified/Nearby Badges as they aren't from Google */}
                          </div>

                          {/* Rating and Location */}
                          <div className="flex items-center text-sm flex-wrap gap-x-2">
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
                                    {/* Display full address or parsed city/state */}
                                    <span className="text-muted-foreground">{provider.address.full}</span>
                                </span>
                            )}
                          </div>

                           {/* Display Phone Number if available */}
                           {provider.phone && (
                               <p className="text-xs text-muted-foreground mt-1">Phone: {provider.phone}</p>
                           )}

                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" asChild>
                           {/* Link to a dynamic profile page using Google Place ID */}
                          <Link href={`/providers/profile/${provider.id}`}>View Profile</Link>
                        </Button>

                        {/* CONDITIONAL BOOKING BUTTON */}
                        {provider.website ? (
                          <Button size="sm" asChild>
                            {/* Link directly to provider's website if available */}
                            <a href={provider.website} target="_blank" rel="noopener noreferrer">
                              Book Online <ExternalLink className="h-3.5 w-3.5 ml-1"/>
                            </a>
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground text-right">
                            {/* Indicate no online booking, maybe show phone */}
                            Online booking not available.
                            {provider.phone ? ` Call: ${provider.phone}` : " See profile for details."}
                          </span>
                          // Alternative: Link to profile page again with different text
                          // <Button variant="secondary" size="sm" asChild>
                          //   <Link href={`/providers/profile/${provider.id}`}>View Details</Link>
                          // </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : null /* End of results display logic */}
        </div>
      )}
    </div>
  )
}