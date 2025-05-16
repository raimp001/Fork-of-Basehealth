"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import { AlertCircle, MapPin, Star, CheckCircle, List, MapIcon } from "lucide-react"
import type { PatientData } from "./patient-workflow"

interface ProviderSelectionProps {
  patientData: PatientData
  updatePatientData: (data: Partial<PatientData>) => void
  onComplete: () => void
}

type Provider = {
  id: string
  name: string
  specialty: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  rating: number
  reviewCount: number
  distance?: number
  isVerified: boolean
  acceptsInsurance: boolean
  nextAvailable?: string
  education?: string[]
  languages?: string[]
  image?: string
}

export function ProviderSelection({ patientData, updatePatientData, onComplete }: ProviderSelectionProps) {
  const [providers, setProviders] = useState<Provider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(patientData.selectedProvider || null)
  const [specialty, setSpecialty] = useState<string>("Primary Care")
  const [searchTerm, setSearchTerm] = useState("")
  const [maxDistance, setMaxDistance] = useState<number>(25)
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zipCode, setZipCode] = useState<string>(patientData.zipCode || "")

  useEffect(() => {
    if (patientData.zipCode) {
      fetchProviders()
    }
  }, [patientData.zipCode])

  const fetchProviders = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // In a real app, this would be an API call
      // For now, we'll simulate it with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate mock providers
      const mockProviders: Provider[] = [
        {
          id: "p1",
          name: "Dr. Sarah Johnson",
          specialty: "Primary Care",
          address: {
            street: "123 Medical Center Dr",
            city: "Anytown",
            state: "CA",
            zipCode: zipCode || "90210",
          },
          rating: 4.8,
          reviewCount: 124,
          distance: 2.3,
          isVerified: true,
          acceptsInsurance: true,
          nextAvailable: "Tomorrow",
          education: ["Harvard Medical School", "Johns Hopkins Residency"],
          languages: ["English", "Spanish"],
          image: "/placeholder.svg?key=60knf",
        },
        {
          id: "p2",
          name: "Dr. Michael Chen",
          specialty: "Primary Care",
          address: {
            street: "456 Health Blvd",
            city: "Anytown",
            state: "CA",
            zipCode: zipCode || "90210",
          },
          rating: 4.6,
          reviewCount: 98,
          distance: 3.5,
          isVerified: true,
          acceptsInsurance: true,
          nextAvailable: "Today",
          education: ["UCLA Medical School", "Stanford Residency"],
          languages: ["English", "Mandarin"],
          image: "/placeholder.svg?key=oya61",
        },
        {
          id: "p3",
          name: "Dr. Emily Rodriguez",
          specialty: "Primary Care",
          address: {
            street: "789 Wellness Way",
            city: "Anytown",
            state: "CA",
            zipCode: zipCode || "90210",
          },
          rating: 4.9,
          reviewCount: 156,
          distance: 4.1,
          isVerified: true,
          acceptsInsurance: true,
          nextAvailable: "In 2 days",
          education: ["UCSF Medical School", "Mayo Clinic Residency"],
          languages: ["English", "Spanish", "Portuguese"],
          image: "/placeholder.svg?key=2rvof",
        },
        {
          id: "p4",
          name: "Dr. James Wilson",
          specialty: "Primary Care",
          address: {
            street: "321 Care Street",
            city: "Anytown",
            state: "CA",
            zipCode: zipCode || "90210",
          },
          rating: 4.5,
          reviewCount: 87,
          distance: 1.8,
          isVerified: true,
          acceptsInsurance: true,
          nextAvailable: "In 3 days",
          education: ["Columbia Medical School", "NYU Residency"],
          languages: ["English"],
          image: "/placeholder.svg?key=nujbk",
        },
        {
          id: "p5",
          name: "Dr. Lisa Martinez",
          specialty: "Primary Care",
          address: {
            street: "555 Physician Plaza",
            city: "Anytown",
            state: "CA",
            zipCode: zipCode || "90210",
          },
          rating: 4.7,
          reviewCount: 112,
          distance: 5.2,
          isVerified: true,
          acceptsInsurance: true,
          nextAvailable: "Today",
          education: ["Duke Medical School", "Vanderbilt Residency"],
          languages: ["English", "Spanish"],
          image: "/placeholder.svg?key=0dkqz",
        },
      ]

      setProviders(mockProviders)
      setFilteredProviders(mockProviders)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm || maxDistance < 25) {
      const filtered = providers.filter(
        (provider) =>
          (searchTerm === "" ||
            provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            provider.specialty.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (provider.distance === undefined || provider.distance <= maxDistance),
      )
      setFilteredProviders(filtered)
    } else {
      setFilteredProviders(providers)
    }
  }, [searchTerm, providers, maxDistance])

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider)
  }

  const handleSaveAndContinue = () => {
    if (selectedProvider) {
      updatePatientData({
        selectedProvider,
      })
      onComplete()
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Enter ZIP code"
                  className="pl-10"
                  maxLength={5}
                />
              </div>
              <Button variant="outline" onClick={fetchProviders}>
                Search
              </Button>
            </div>
          </div>
          <div>
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Primary Care">Primary Care</SelectItem>
                <SelectItem value="Family Medicine">Family Medicine</SelectItem>
                <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="w-full md:w-2/3">
            <Input
              placeholder="Filter by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-1/3 space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="distance" className="text-sm font-medium">
                Max Distance: {maxDistance} miles
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={viewMode === "list" ? "bg-muted" : ""}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={viewMode === "map" ? "bg-muted" : ""}
                  onClick={() => setViewMode("map")}
                >
                  <MapIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Slider
              id="distance"
              min={5}
              max={50}
              step={5}
              value={[maxDistance]}
              onValueChange={(value) => setMaxDistance(value[0])}
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {viewMode === "list" ? (
            <div className="space-y-4">
              {filteredProviders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No providers found matching your criteria.</p>
                </div>
              ) : (
                <>
                  <div className="text-sm text-muted-foreground">{filteredProviders.length} providers found</div>

                  {filteredProviders.map((provider) => (
                    <Card
                      key={provider.id}
                      className={`overflow-hidden cursor-pointer transition-all ${
                        selectedProvider?.id === provider.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleProviderSelect(provider)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={provider.image || "/placeholder.svg"} alt={provider.name} />
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
                                <Badge variant="secondary" className="text-xs">
                                  {provider.nextAvailable}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center text-sm">
                              <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                              <span>{provider.rating}</span>
                              <span className="text-muted-foreground ml-1">({provider.reviewCount})</span>
                              <div className="mx-2 h-1 w-1 rounded-full bg-muted-foreground"></div>
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                              <span className="text-muted-foreground">
                                {provider.address.city}, {provider.address.state}
                              </span>
                            </div>

                            {provider.distance && (
                              <p className="text-sm text-primary font-medium">
                                {provider.distance.toFixed(1)} miles away
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="bg-muted h-64 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Map view would be displayed here</p>
            </div>
          )}
        </>
      )}

      {selectedProvider && (
        <div className="pt-4">
          <h3 className="text-lg font-medium mb-2">Selected Provider</h3>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedProvider.image || "/placeholder.svg"} alt={selectedProvider.name} />
                  <AvatarFallback>{selectedProvider.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="text-xl font-medium">{selectedProvider.name}</h3>
                  <p className="text-muted-foreground">{selectedProvider.specialty}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <h4 className="text-sm font-medium">Contact & Location</h4>
                      <p className="text-sm mt-1">
                        {selectedProvider.address.street}
                        <br />
                        {selectedProvider.address.city}, {selectedProvider.address.state}{" "}
                        {selectedProvider.address.zipCode}
                      </p>
                      {selectedProvider.distance && (
                        <p className="text-sm text-primary font-medium mt-1">
                          {selectedProvider.distance.toFixed(1)} miles away
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium">Education</h4>
                      <ul className="text-sm mt-1 space-y-1">
                        {selectedProvider.education?.map((edu, index) => (
                          <li key={index}>{edu}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium">Languages</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedProvider.languages?.map((lang, index) => (
                        <Badge key={index} variant="secondary">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between items-center pt-4">
        <div>
          {selectedProvider && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              Provider selected
            </div>
          )}
        </div>
        <Button onClick={handleSaveAndContinue} disabled={!selectedProvider}>
          Save and Continue
        </Button>
      </div>
    </div>
  )
}
