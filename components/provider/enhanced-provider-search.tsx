"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProviderCard } from "@/components/provider/provider-card"
import { MapPin, Search, Sparkles } from "lucide-react"
import { searchProviders } from "@/lib/provider-search-service"
import type { Provider } from "@/types/user"

// Add a new function to enhance providers with AI
const enhanceProvidersWithAI = async (providers: Provider[], searchQuery: string, zipCode: string) => {
  try {
    const response = await fetch("/api/providers/ai-enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providers,
        query: searchQuery,
        zipCode,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to enhance providers")
    }

    const data = await response.json()
    return data.providers
  } catch (err) {
    console.error("Error enhancing providers:", err)
    // Return original providers if enhancement fails
    return providers
  }
}

export function EnhancedProviderSearch() {
  // Search state
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchPerformed, setSearchPerformed] = useState(false)

  // Simple search parameters
  const [location, setLocation] = useState<string>("")
  const [providerType, setProviderType] = useState<string>("physician")
  const [useAI, setUseAI] = useState<boolean>(true)

  const providerTypes = [
    { value: "physician", label: "Physician (MD/DO)" },
    { value: "np", label: "Nurse Practitioner" },
    { value: "pa", label: "Physician Assistant" },
    { value: "acupuncturist", label: "Acupuncturist" },
    { value: "dentist", label: "Dentist" },
  ]

  const handleSearch = async () => {
    if (!location) {
      setError("Please enter a ZIP code or city")
      return
    }

    setError(null)
    setIsLoading(true)
    setSearchPerformed(true)

    try {
      // Determine if location is a ZIP code or city
      const isZipCode = /^\d{5}$/.test(location.trim())

      // Search providers using the combined search service
      const searchResults = await searchProviders({
        zipCode: isZipCode ? location : undefined,
        location: !isZipCode ? location : undefined,
        providerType: providerType as any,
        useNPI: true,
        useAI: useAI,
      })

      setProviders(searchResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while searching for providers")
      setProviders([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Healthcare Providers</CardTitle>
          <CardDescription>Search for providers by location and type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter ZIP code or city (e.g., 10001 or Boston, MA)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1">
              <Select value={providerType} onValueChange={setProviderType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider type" />
                </SelectTrigger>
                <SelectContent>
                  {providerTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSearch} disabled={isLoading} className="md:w-auto w-full">
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useAI"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="useAI" className="text-sm flex items-center">
              <Sparkles className="h-4 w-4 mr-1 text-yellow-500" />
              Use AI to enhance provider search results
            </label>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : searchPerformed && providers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No providers found matching your criteria.</p>
          <div className="mt-4">
            <p className="mb-2">Try these suggestions:</p>
            <ul className="list-disc list-inside text-left max-w-md mx-auto">
              <li>Check if your location is spelled correctly</li>
              <li>Try using a ZIP code instead of city name</li>
              <li>Try a different provider type</li>
              <li>For cities, include the state (e.g., "Boston, MA")</li>
              <li>Make sure the AI enhancement option is enabled</li>
            </ul>
          </div>
        </div>
      ) : providers.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {providers.length} Provider{providers.length !== 1 ? "s" : ""} Found
            </h3>
            {useAI && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 mr-1 text-yellow-500" />
                AI-enhanced results
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
