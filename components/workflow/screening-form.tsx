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
}

export function ScreeningForm({ patientData, updatePatientData, onComplete }: ScreeningFormProps) {
  const [age, setAge] = useState<string>(patientData.age?.toString() || "")
  const [gender, setGender] = useState<string>(patientData.gender || "all")
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
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
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
      // In a real app, this would be an API call
      // For now, we'll simulate it with mock data based on USPSTF guidelines
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock USPSTF recommendations based on age and gender
      const mockRecommendations: ScreeningRecommendation[] = []

      const ageNum = Number.parseInt(age)

      // Colorectal cancer screening
      if (ageNum >= 45 && ageNum <= 75) {
        mockRecommendations.push({
          id: "colorectal",
          name: "Colorectal Cancer Screening",
          description: "Screening for colorectal cancer in adults aged 45 to 75 years.",
          importance: "essential",
          ageRange: { min: 45, max: 75 },
          gender: "all",
          frequency: "Every 10 years for colonoscopy, other tests may be more frequent",
          specialtyNeeded: "Gastroenterology",
        })
      }

      // Breast cancer screening
      if (gender === "female" && ageNum >= 50 && ageNum <= 74) {
        mockRecommendations.push({
          id: "breast",
          name: "Breast Cancer Screening",
          description: "Mammography every 2 years for women aged 50 to 74 years.",
          importance: "essential",
          ageRange: { min: 50, max: 74 },
          gender: "female",
          frequency: "Every 2 years",
          specialtyNeeded: "Radiology",
        })
      }

      // Cervical cancer screening
      if (gender === "female" && ageNum >= 21 && ageNum <= 65) {
        mockRecommendations.push({
          id: "cervical",
          name: "Cervical Cancer Screening",
          description: "Pap smear every 3 years for women aged 21 to 65 years.",
          importance: "essential",
          ageRange: { min: 21, max: 65 },
          gender: "female",
          frequency: "Every 3 years",
          specialtyNeeded: "Gynecology",
        })
      }

      // Lung cancer screening
      if (ageNum >= 50 && ageNum <= 80 && medicalHistory.includes("Smoking")) {
        mockRecommendations.push({
          id: "lung",
          name: "Lung Cancer Screening",
          description:
            "Annual screening for lung cancer with low-dose computed tomography in adults aged 50 to 80 years who have a 20 pack-year smoking history.",
          importance: "recommended",
          ageRange: { min: 50, max: 80 },
          gender: "all",
          frequency: "Annually",
          specialtyNeeded: "Pulmonology",
        })
      }

      // Prostate cancer screening
      if (gender === "male" && ageNum >= 55 && ageNum <= 69) {
        mockRecommendations.push({
          id: "prostate",
          name: "Prostate Cancer Screening",
          description:
            "Periodic screening for prostate cancer with prostate-specific antigen (PSA) testing in men aged 55 to 69 years.",
          importance: "recommended",
          ageRange: { min: 55, max: 69 },
          gender: "male",
          frequency: "Discuss with your doctor",
          specialtyNeeded: "Urology",
        })
      }

      // Diabetes screening
      if (
        ageNum >= 40 &&
        ageNum <= 70 &&
        (medicalHistory.includes("Obesity") || medicalHistory.includes("High blood pressure"))
      ) {
        mockRecommendations.push({
          id: "diabetes",
          name: "Diabetes Screening",
          description:
            "Screening for prediabetes and type 2 diabetes in adults aged 40 to 70 years who are overweight or obese.",
          importance: "recommended",
          ageRange: { min: 40, max: 70 },
          gender: "all",
          frequency: "Every 3 years",
          specialtyNeeded: "Primary Care",
        })
      }

      // Hypertension screening
      if (ageNum >= 18) {
        mockRecommendations.push({
          id: "hypertension",
          name: "Hypertension Screening",
          description: "Screening for high blood pressure in adults aged 18 years or older.",
          importance: "essential",
          ageRange: { min: 18, max: 120 },
          gender: "all",
          frequency: "Annually",
          specialtyNeeded: "Primary Care",
        })
      }

      // Cholesterol screening
      if (ageNum >= 20) {
        mockRecommendations.push({
          id: "cholesterol",
          name: "Cholesterol Screening",
          description: "Screening for lipid disorders in adults aged 20 years or older.",
          importance: "recommended",
          ageRange: { min: 20, max: 120 },
          gender: "all",
          frequency: "Every 5 years",
          specialtyNeeded: "Primary Care",
        })
      }

      // Osteoporosis screening
      if (
        (gender === "female" && ageNum >= 65) ||
        (gender === "female" && ageNum >= 50 && medicalHistory.includes("Family history of osteoporosis"))
      ) {
        mockRecommendations.push({
          id: "osteoporosis",
          name: "Osteoporosis Screening",
          description:
            "Screening for osteoporosis in women aged 65 years and older and in younger women whose fracture risk is equal to or greater than that of a 65-year-old white woman who has no additional risk factors.",
          importance: "recommended",
          ageRange: { min: 65, max: 120 },
          gender: "female",
          frequency: "Every 2 years",
          specialtyNeeded: "Endocrinology",
        })
      }

      setRecommendations(mockRecommendations)

      // Auto-select essential recommendations
      const essentialRecommendations = mockRecommendations
        .filter((rec) => rec.importance === "essential")
        .map((rec) => rec.id)

      setSelectedScreenings(essentialRecommendations)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndContinue = () => {
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

        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            value={zipCode}
            onChange={handleZipCodeChange}
            placeholder="Enter your ZIP code"
            maxLength={5}
          />
          <p className="text-sm text-muted-foreground">We need your ZIP code to find healthcare providers near you.</p>
        </div>

        <div className="flex justify-end">
          <Button onClick={fetchRecommendations} disabled={isLoading || !age || !gender}>
            {isLoading ? "Loading..." : "Get Screening Recommendations"}
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
                      </div>
                      <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                      <p className="text-sm">
                        <span className="font-medium">Frequency:</span> {recommendation.frequency}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Specialty:</span> {recommendation.specialtyNeeded}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
        <Button onClick={handleSaveAndContinue} disabled={!isFormComplete || selectedScreenings.length === 0}>
          Save and Continue
        </Button>
      </div>
    </div>
  )
}
