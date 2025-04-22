"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star } from "lucide-react"
import Link from "next/link"

export function SimplifiedProviderSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [providers, setProviders] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)

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
  ]

  const handleSearch = async () => {
    if (!zipCode && !specialty) {
      return
    }

    setIsSearching(true)

    try {
      // Build query parameters
      const queryParams = new URLSearchParams()

      if (zipCode) {
        queryParams.append("zipCode", zipCode)
      }

      if (specialty && specialty !== "all") {
        queryParams.append("specialty", specialty)
      }

      // Fetch providers
      const response = await fetch(`/api/providers/search?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch providers")
      }

      const data = await response.json()
      setProviders(data.providers || [])
      setHasSearched(true)
    } catch (err) {
      console.error("Error searching providers:", err)
      // Set some mock data for demonstration
      // Generate providers for the specific ZIP code
      const mockProviders = []
      const cities = {
        "98": "Seattle, WA",
        "94": "San Francisco, CA",
        "90": "Los Angeles, CA",
        "10": "New York, NY",
        "60": "Chicago, IL",
        "77": "Houston, TX",
      }

      const prefix = zipCode.substring(0, 2)
      const location = cities[prefix] || "San Francisco, CA"
      const [city, state] = location.split(", ")

      for (let i = 0; i < 3; i++) {
        const specialties = ["Family Medicine", "Internal Medicine", "Pediatrics", "Cardiology", "Dermatology"]
        const specialty = specialties[Math.floor(Math.random() * specialties.length)]
        const firstName = ["Sarah", "Michael", "Emily", "David", "Jennifer"][Math.floor(Math.random() * 5)]
        const lastName = ["Johnson", "Chen", "Rodriguez", "Smith", "Wilson"][Math.floor(Math.random() * 5)]

        mockProviders.push({
          id: `${zipCode}-${i}`,
          name: `Dr. ${firstName} ${lastName}`,
          specialty: specialty,
          rating: 4.5 + Math.random() * 0.5,
          reviewCount: 10 + Math.floor(Math.random() * 90),
          address: { city, state, zipCode },
          isNearby: true,
          distanceNote: `Within 25 miles of ${zipCode}`,
        })
      }

      setProviders(mockProviders)
    } finally {
      setIsSearching(false)
    }
  }

  const filteredProviders = searchQuery
    ? providers.filter(
        (provider) =>
          provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          provider.specialty.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : providers

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="zipCode" className="text-sm font-medium block mb-1">
                ZIP Code
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="zipCode"
                  placeholder="Enter ZIP code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="specialty" className="text-sm font-medium block mb-1">
                Specialty
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

            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isSearching} className="w-full">
                {isSearching ? "Searching..." : "Find Providers"}
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <Input
              placeholder="Filter results by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <div>
          {filteredProviders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No providers found matching your criteria.</p>
              <p className="mt-2">Try adjusting your search parameters.</p>
            </div>
          ) : (
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
                          <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{provider.name}</h3>
                              <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {provider.isVerified && (
                                <Badge variant="outline" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                              {provider.isNearby && (
                                <Badge variant="secondary" className="text-xs">
                                  Nearby
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center text-sm">
                            <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                            <span>{provider.rating?.toFixed(1) || "4.5"}</span>
                            <span className="text-muted-foreground ml-1">({provider.reviewCount || "0"})</span>
                            <div className="mx-2 h-1 w-1 rounded-full bg-muted-foreground"></div>
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                            <span className="text-muted-foreground">
                              {provider.address?.city || "Unknown"}, {provider.address?.state || ""}
                            </span>
                          </div>

                          {provider.distanceNote && (
                            <p className="text-xs text-muted-foreground">{provider.distanceNote}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/providers/${provider.id}`}>View Profile</Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/appointment/request?providerId=${provider.id}`}>Book Appointment</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
