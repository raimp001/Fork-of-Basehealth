"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { ScreeningRecommendation } from "@/types/user"
import Link from "next/link"

export function ScreeningRecommendations() {
  const [age, setAge] = useState<string>("")
  const [gender, setGender] = useState<string>("all")
  const [riskFactors, setRiskFactors] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<ScreeningRecommendation[]>([])
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([])
  const [zipCode, setZipCode] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const commonRiskFactors = [
    "Family history of cancer",
    "Smoking",
    "High blood pressure",
    "Diabetes",
    "High cholesterol",
    "Obesity",
    "Alcohol consumption",
    "Previous abnormal test results",
  ]

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      setAge(value)
    }
  }

  const handleRiskFactorChange = (factor: string, checked: boolean) => {
    if (checked) {
      setRiskFactors([...riskFactors, factor])
    } else {
      setRiskFactors(riskFactors.filter((rf) => rf !== factor))
    }
  }

  const handleRecommendationToggle = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRecommendations([...selectedRecommendations, id])
    } else {
      setSelectedRecommendations(selectedRecommendations.filter((r) => r !== id))
    }
  }

  const fetchRecommendations = async () => {
    if (!age) {
      setError("Please enter your age")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const queryParams = new URLSearchParams({
        age,
        gender,
      })

      if (riskFactors.length > 0) {
        queryParams.append("riskFactors", riskFactors.join(","))
      }

      const response = await fetch(`/api/screening/recommendations?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations")
      }

      const data = await response.json()
      setRecommendations(data.recommendations)

      // Auto-select essential recommendations
      const essentialRecommendations = data.recommendations
        .filter((rec: ScreeningRecommendation) => rec.importance === "essential")
        .map((rec: ScreeningRecommendation) => rec.id)

      setSelectedRecommendations(essentialRecommendations)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "essential":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Essential</Badge>
      case "recommended":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Recommended</Badge>
      case "routine":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Routine</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Screening Recommendations</CardTitle>
          <CardDescription>
            Get personalized health screening recommendations based on your age, gender, and risk factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" value={age} onChange={handleAgeChange} placeholder="Enter your age" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Prefer not to say</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Risk Factors (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {commonRiskFactors.map((factor) => (
                  <div key={factor} className="flex items-center space-x-2">
                    <Checkbox
                      id={`risk-${factor}`}
                      checked={riskFactors.includes(factor)}
                      onCheckedChange={(checked) => handleRiskFactorChange(factor, checked === true)}
                    />
                    <Label htmlFor={`risk-${factor}`} className="text-sm font-normal">
                      {factor}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={fetchRecommendations} disabled={isLoading || !age}>
            {isLoading ? "Loading..." : "Get Recommendations"}
          </Button>
        </CardFooter>
      </Card>

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Recommended Screenings</CardTitle>
            <CardDescription>Based on your age, gender, and risk factors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((recommendation) => (
                <div key={recommendation.id} className="flex items-start space-x-3 border-b pb-4">
                  <Checkbox
                    id={`rec-${recommendation.id}`}
                    checked={selectedRecommendations.includes(recommendation.id)}
                    onCheckedChange={(checked) => handleRecommendationToggle(recommendation.id, checked === true)}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Label htmlFor={`rec-${recommendation.id}`} className="font-medium">
                        {recommendation.name}
                      </Label>
                      <div className="ml-2">{getImportanceBadge(recommendation.importance)}</div>
                    </div>
                    <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                    <p className="text-sm">
                      <span className="font-medium">Frequency:</span> {recommendation.frequency}
                    </p>
                    {recommendation.riskFactors && recommendation.riskFactors.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Risk Factors:</span> {recommendation.riskFactors.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start space-y-4">
            <div className="w-full">
              <Label htmlFor="zipCode">Enter your ZIP code to find providers</Label>
              <div className="flex mt-2">
                <Input
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="ZIP code"
                  className="mr-2"
                />
                <Button 
                  asChild 
                  disabled={!zipCode || selectedRecommendations.length === 0}
                >
                  <Link
                    href={`/providers/search?zipCode=${zipCode}&screenings=${selectedRecommendations.join(",")}`}
                  >
                    Find Providers
                  </Link>
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
