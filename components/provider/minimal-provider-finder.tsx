"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Star, Users } from "lucide-react"

interface Provider {
  id: string
  name: string
  specialty: string
  rating: number
  reviewCount: number
  distance?: string
  acceptsCrypto: boolean
  avatar?: string
}

export function MinimalProviderFinder() {
  const [searchQuery, setSearchQuery] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!zipCode.trim()) return
    
    setIsSearching(true)
    setHasSearched(true)
    
    try {
      const params = new URLSearchParams()
      if (zipCode) params.append('zipCode', zipCode)
      if (searchQuery) params.append('specialty', searchQuery)
      
      const response = await fetch(`/api/providers/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProviders(data.providers || [])
      } else {
        setProviders([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setProviders([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="container px-4 py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">Find Providers</h1>

      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by specialty or provider name"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex space-x-2">
          <Input 
            placeholder="ZIP code" 
            className="w-32" 
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
          />
          <Button onClick={handleSearch} disabled={isSearching || !zipCode.trim()} className="flex-1">
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {!hasSearched ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Search for Providers</h3>
            <p className="text-sm text-muted-foreground">
              Enter your ZIP code to find healthcare providers near you.
            </p>
          </CardContent>
        </Card>
      ) : providers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No Providers Found</h3>
            <p className="text-sm text-muted-foreground">
              Try a different ZIP code or specialty.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {providers.map((provider) => (
            <Card key={provider.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={provider.avatar || "/placeholder.svg"} alt={provider.name} />
                    <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                      </div>
                      {provider.acceptsCrypto && (
                        <Badge variant="outline" className="text-xs">
                          Accepts Crypto
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center text-sm">
                      <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                      <span>{provider.rating?.toFixed(1) || 'N/A'}</span>
                      <span className="text-muted-foreground ml-1">({provider.reviewCount || 0})</span>
                      {provider.distance && (
                        <>
                          <div className="mx-2 h-1 w-1 rounded-full bg-muted-foreground"></div>
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                          <span className="text-muted-foreground">{provider.distance}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                  <Button size="sm">Book Appointment</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
