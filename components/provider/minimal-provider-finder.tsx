"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Star } from "lucide-react"

export function MinimalProviderFinder() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const providers = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialty: "Family Medicine",
      rating: 4.8,
      reviewCount: 120,
      distance: "2.3 miles",
      acceptsCrypto: true,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      specialty: "Cardiology",
      rating: 4.9,
      reviewCount: 85,
      distance: "3.5 miles",
      acceptsCrypto: true,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      specialty: "Pediatrics",
      rating: 4.7,
      reviewCount: 65,
      distance: "1.8 miles",
      acceptsCrypto: false,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const handleSearch = () => {
    setIsSearching(true)
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false)
    }, 1000)
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
          <Input placeholder="ZIP code" className="w-32" />
          <Button onClick={handleSearch} disabled={isSearching} className="flex-1">
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

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
                    <span>{provider.rating}</span>
                    <span className="text-muted-foreground ml-1">({provider.reviewCount})</span>
                    <div className="mx-2 h-1 w-1 rounded-full bg-muted-foreground"></div>
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                    <span className="text-muted-foreground">{provider.distance}</span>
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
    </div>
  )
}
