"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle } from "lucide-react"
import type { PatientData } from "./patient-workflow"
import { useRouter } from "next/navigation"

interface ScreeningFormProps {
  patientData: PatientData
  updatePatientData: (data: Partial<PatientData>) => void
  onComplete: () => void
}

type ScreeningRecommendation = {
  id: string
  name: string
  description: string
  importance: "essential" | "recommended" | "routine"
  ageRange: { min: number; max: number }
  gender: "male" | "female" | "all"
  frequency: string
  specialtyNeeded: string
  grade?: string
  link?: string
}

export function ScreeningForm({ patientData, updatePatientData, onComplete }: ScreeningFormProps) {
  const router = useRouter();
  const [age, setAge] = useState<string>(patientData.age?.toString() || "")
  const [gender, setGender] = useState<string>(patientData.gender || "")
  const [medicalHistory, setMedicalHistory] = useState<string[]>(patientData.medicalHistory || [])
  const [zipCode, setZipCode] = useState<string>(patientData.zipCode || "")
  const [recommendations, setRecommendations] = useState<ScreeningRecommendation[]>([])
  const [selectedScreenings, setSelectedScreenings] = useState<string[]>(patientData.selectedScreenings || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFormComplete, setIsFormComplete] = useState(false)

  const commonMedicalHistory = [
    "High blood pressure",
    "Diabetes",
    "High cholesterol",
    "Heart disease",
    "Cancer history",
    "Smoking",
    "Alcohol use",
    "Family history of cancer",
    "Previous abnormal test results",
    "Obesity",
  ]

  useEffect(() => {
    // Check if form is complete enough to proceed
    const isValid = age !== "" && gender !== "" && zipCode.length === 5
    setIsFormComplete(isValid)
  }, [age, gender, zipCode])

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and reasonable age range
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 1 && parseInt(value) <= 120)) {
      setAge(value)
    }
  }

  const handleMedicalHistoryChange = (item: string, checked: boolean) => {
    if (checked) {
      setMedicalHistory([...medicalHistory, item])
    } else {
      setMedicalHistory(medicalHistory.filter((i) => i !== item))
    }
  }

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and limit to 5 digits
    if (value === "" || (/^\d+$/.test(value) && value.length <= 5)) {
      setZipCode(value)
    }
  }

  const handleRecommendationToggle = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedScreenings([...selectedScreenings, id])
    } else {
      setSelectedScreenings(selectedScreenings.filter((r) => r !== id))
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
      const params = new URLSearchParams({
        age,
        gender,
        riskFactors: medicalHistory.join(",")
      })
      const res = await fetch(`/api/screening/recommendations?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch recommendations")
      const data = await res.json()
      setRecommendations(data.recommendations || [])
    } catch (err) {
      setError("Failed to fetch recommendations")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndContinue = () => {
    console.log('Save and Continue clicked', { age, gender, medicalHistory, zipCode, selectedScreenings });
    updatePatientData({
      age: Number.parseInt(age),
      gender,
      medicalHistory,
      zipCode,
      selectedScreenings,
    })
    onComplete()
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
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
            <Input 
              id="age" 
              type="number"
              min="1"
              max="120"
              value={age} 
              onChange={handleAgeChange} 
              placeholder="Enter your age" 
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="gender" className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="z-[9999]" position="popper" sideOffset={5}>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="all">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code *</Label>
          <Input 
            id="zipCode" 
            type="text"
            maxLength={5}
            value={zipCode} 
            onChange={handleZipCodeChange} 
            placeholder="Enter your ZIP code" 
            className="w-full max-w-xs"
          />
        </div>

        <div className="space-y-2">
          <Label>Medical History (Select all that apply)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {commonMedicalHistory.map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox
                  id={`history-${item}`}
                  checked={medicalHistory.includes(item)}
                  onCheckedChange={(checked) => handleMedicalHistoryChange(item, checked === true)}
                />
                <Label htmlFor={`history-${item}`} className="text-sm font-normal">
                  {item}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={fetchRecommendations} disabled={isLoading || !age || !gender || zipCode.length !== 5}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Loading...
              </div>
            ) : (
              "Get Screening Recommendations"
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Recommended Screenings</h3>
          <p className="text-sm text-muted-foreground">
            Based on your age, gender, and medical history, the following screenings are recommended according to USPSTF
            guidelines:
          </p>

          <div className="space-y-4">
            {recommendations.map((recommendation) => (
              <Card key={recommendation.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={`rec-${recommendation.id}`}
                      checked={selectedScreenings.includes(recommendation.id)}
                      onCheckedChange={(checked) => handleRecommendationToggle(recommendation.id, checked === true)}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Label htmlFor={`rec-${recommendation.id}`} className="font-medium">
                          {recommendation.name}
                        </Label>
                        <div className="ml-2">{getImportanceBadge(recommendation.importance)}</div>
                        {recommendation.grade && (
                          <span className="ml-2 text-xs font-semibold text-blue-700">Grade: {recommendation.grade}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                      <p className="text-sm">
                        <span className="font-medium">Frequency:</span> {recommendation.frequency}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Specialty:</span> {recommendation.specialtyNeeded}
                      </p>
                      {recommendation.link && (
                        <a
                          href={recommendation.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 block"
                        >
                          View USPSTF Guideline
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => {
                router.push(`/providers/search?screenings=${selectedScreenings.join(",")}`)
              }}
              disabled={selectedScreenings.length === 0}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4">
        <div>
          {isFormComplete && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              Ready to continue
            </div>
          )}
        </div>
      </div>
      {!isFormComplete && (
        <div className="text-sm text-red-600 mt-2">
          Please complete all required fields: 
          {!age && " Age"}
          {!gender && " Gender"}
          {zipCode.length !== 5 && " ZIP Code"}
        </div>
      )}
      {isFormComplete && recommendations.length > 0 && selectedScreenings.length === 0 && (
        <div className="text-sm text-amber-600 mt-2">
          Please select at least one screening recommendation to continue.
        </div>
      )}
    </div>
  )
}
