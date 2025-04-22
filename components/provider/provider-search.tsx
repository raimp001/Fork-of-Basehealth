"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProviderCard } from "@/components/provider/provider-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin } from "lucide-react"
import type { Provider, ScreeningRecommendation } from "@/types/user"
import db from "@/lib/mock-db"

export function ProviderSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [providers, setProviders] = useState<Provider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [specialty, setSpecialty] = useState<string>(searchParams.get("specialty") || "")
  const [zipCode, setZipCode] = useState<string>(searchParams.get("zipCode") || "")
  const [screeningIds, setScreeningIds] = useState<string[]>(searchParams.get("screenings")?.split(",") || [])
  const [screenings, setScreenings] = useState<ScreeningRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchPerformed, setSearchPerformed] = useState(false)

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
    "Ophthalmology",
    "Radiology",
    "Gastroenterology",
    "Urology",
    "Endocrinology",
    "Pulmonology",
  ]

  useEffect(() => {
    // Fetch screening recommendations if we have IDs
    const fetchScreenings = async () => {
      if (screeningIds.length === 0) return

      try {
        const screeningPromises = screeningIds.map((id) =>
          fetch(`/api/screening/recommendations/${id}`).then((res) => res.json()),
        )

        const screeningResults = await Promise.all(screeningPromises)
        setScreenings(screeningResults.map((result) => result.recommendation))

        // Set specialty based on first screening if not already set
        if (!specialty && screeningResults.length > 0) {
          setSpecialty(screeningResults[0].recommendation.specialtyNeeded)
        }
      } catch (err) {
        console.error("Error fetching screenings:", err)
      }
    }

    fetchScreenings()
  }, [screeningIds, specialty])

  useEffect(() => {
    // Auto-search when zip code is provided via URL params
    if (searchParams.get("zipCode")) {
      setZipCode(searchParams.get("zipCode") || "")
      handleInitialSearch()
    }
  }, [searchParams])

  const handleInitialSearch = async () => {
    if (!zipCode) return

    setError(null)
    setIsLoading(true)
    setSearchPerformed(true)

    try {
      // Try to get providers from mock DB directly first
      const mockProviders = await db.searchProviders({
        zipCode,
        specialty: specialty !== "all" ? specialty : undefined,
      })

      if (mockProviders.length > 0) {
        console.log("Using mock database providers")
        setProviders(mockProviders)
        setFilteredProviders(mockProviders)
      } else {
        // If no mock providers, try the API
        console.log("No mock providers found, trying API")
        const response = await fetch(`/api/providers?zipCode=${zipCode}${specialty ? `&specialty=${specialty}` : ""}`)

        if (!response.ok) {
          throw new Error("Failed to fetch providers")
        }

        const data = await response.json()
        setProviders(data.providers)
        setFilteredProviders(data.providers)
      }
    } catch (err) {
      console.error("Search error:", err)
      setError("Unable to find providers. Please try a different search.")

      // Fallback to mock data
      try {
        console.log("Falling back to mock database")
        let mockProviders = await db.getAllProviders()

        // Filter by zipCode if provided
        if (zipCode) {
          mockProviders = mockProviders.filter((p) => p.address.zipCode.startsWith(zipCode.substring(0, 1)))
        }

        // Filter by specialty if provided
        if (specialty && specialty !== "all") {
          mockProviders = mockProviders.filter((p) => p.specialty.toLowerCase().includes(specialty.toLowerCase()))
        }

        if (mockProviders.length > 0) {
          setError(null) // Clear error if we found fallback providers
          setProviders(mockProviders)
          setFilteredProviders(mockProviders)
        }
      } catch (fallbackErr) {
        console.error("Fallback error:", fallbackErr)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!zipCode) {
      setError("Please enter a ZIP code to find providers nearby")
      return
    }

    setError(null)
    setIsLoading(true)
    setSearchPerformed(true)

    try {
      // Try to get providers from mock DB directly first
      const mockProviders = await db.searchProviders({
        zipCode,
        specialty: specialty !== "all" ? specialty : undefined,
      })

      if (mockProviders.length > 0) {
        console.log("Using mock database providers")
        setProviders(mockProviders)
        setFilteredProviders(mockProviders)
      } else {
        // If no mock providers, try the API
        console.log("No mock providers found, trying API")
        const response = await fetch(`/api/providers?zipCode=${zipCode}${specialty ? `&specialty=${specialty}` : ""}`)

        if (!response.ok) {
          throw new Error("Failed to fetch providers")
        }

        const data = await response.json()
        setProviders(data.providers)
        setFilteredProviders(data.providers)
      }
    } catch (err) {
      console.error("Search error:", err)
      setError("Unable to find providers. Please try a different search.")

      // Fallback to mock data
      try {
        console.log("Falling back to mock database")
        let mockProviders = await db.getAllProviders()

        // Filter by zipCode if provided
        if (zipCode) {
          mockProviders = mockProviders.filter((p) => p.address.zipCode.startsWith(zipCode.substring(0, 1)))
        }

        // Filter by specialty if provided
        if (specialty && specialty !== "all") {
          mockProviders = mockProviders.filter((p) => p.specialty.toLowerCase().includes(specialty.toLowerCase()))
        }

        if (mockProviders.length > 0) {
          setError(null) // Clear error if we found fallback providers
          setProviders(mockProviders)
          setFilteredProviders(mockProviders)
        }
      } catch (fallbackErr) {
        console.error("Fallback error:", fallbackErr)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm) {
      const filtered = providers.filter(
        (provider) =>
          provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.services.some((service) => service.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredProviders(filtered)
    } else {
      setFilteredProviders(providers)
    }
  }, [searchTerm, providers])

  const handleSpecialtyChange = (value: string) => {
    setSpecialty(value)
  }

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and limit to 5 digits
    if (value === "" || (/^\d+$/.test(value) && value.length <= 5)) {
      setZipCode(value)
    }
  }

  return (
    <div className="space-y-6">
      {screenings.length > 0 && (
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">Selected Screenings</h3>
          <ul className="list-disc list-inside space-y-1">
            {screenings.map((screening) => (
              <li key={screening.id}>
                {screening.name} - {screening.specialtyNeeded}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
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
                onChange={handleZipCodeChange}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="specialty" className="text-sm font-medium block mb-1">
              Specialty
            </label>
            <Select value={specialty} onValueChange={handleSpecialtyChange}>
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
            <Button onClick={handleSearch} disabled={isLoading} className="w-full">
              {isLoading ? "Searching..." : "Find Providers Nearby"}
            </Button>
          </div>
        </div>

        <div>
          <Input
            placeholder="Filter results by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : searchPerformed && filteredProviders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No providers found matching your criteria.</p>
          {zipCode && (
            <div className="mt-4">
              <p className="mb-2">Try these suggestions:</p>
              <ul className="list-disc list-inside text-left max-w-md mx-auto">
                <li>Check if your ZIP code is correct</li>
                <li>Try a different specialty</li>
                <li>Expand your search to include providers in nearby areas</li>
              </ul>
            </div>
          )}
          {!zipCode && <p className="mt-2">Please enter a ZIP code to find providers in your area.</p>}
        </div>
      ) : filteredProviders.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {filteredProviders.length} Provider{filteredProviders.length !== 1 ? "s" : ""} Found
            </h3>
            <div className="text-sm text-muted-foreground">Showing healthcare providers</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
