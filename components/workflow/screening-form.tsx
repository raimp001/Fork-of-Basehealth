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
  ageRange: { min: number; max: number }
  gender: "male" | "female" | "all"
  frequency: string
  riskFactors?: string[]
  specialtyNeeded: string
  importance: "essential" | "recommended" | "routine"
  grade?: string
  link?: string
}

export function ScreeningForm({ patientData, updatePatientData, onComplete }: ScreeningFormProps) {
  const router = useRouter()
  const [age, setAge] = useState<string>(patientData.age?.toString() || "")
  const [gender, setGender] = useState<string>(patientData.gender || "")
  const [medicalHistory, setMedicalHistory] = useState<string[]>(patientData.medicalHistory || [])
  const [zipCode, setZipCode] = useState<string>(patientData.zipCode || "")
  const [recommendations, setRecommendations] = useState<ScreeningRecommendation[]>([])
  const [selectedScreenings, setSelectedScreenings] = useState<string[]>(patientData.selectedScreenings || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFormComplete, setIsFormComplete] = useState(false)

  // Detailed medical history for USPSTF recommendations
  const [detailedHistory, setDetailedHistory] = useState({
    smokingStatus: "",
    packYears: "",
    quitDate: "",
    hypertension: false,
    diabetes: false,
    highCholesterol: false,
    heartDisease: false,
    familyHistoryCancer: "",
    familyHistoryHeartDisease: false,
    familyHistoryOsteoporosis: false,
    familyHistoryDiabetes: false,
    bodyWeight: "",
    height: "",
    alcoholConsumption: "",
    physicalActivity: "",
    sexuallyActive: "",
    numberSexualPartners: "",
    historySTIs: false,
    lastPapSmear: "",
    lastMammogram: "",
    previousAbnormalResults: [],
    lastColonoscopy: "",
    currentMedications: "",
    allergies: "",
    menopauseStatus: "",
  })

  // Medical history categories for USPSTF compliance - streamlined
  const medicalHistoryCategories = {
    majorConditions: {
      title: "Personal & Family Medical History",
      items: [
        "High blood pressure or heart disease",
        "Diabetes or pre-diabetes",
        "Personal history of cancer",
        "Family history of breast/ovarian cancer",
        "Family history of colorectal cancer",
        "Family history of heart disease",
        "Inflammatory bowel disease",
        "Previous abnormal screening results"
      ]
    },
    riskFactors: {
      title: "Key Risk Factors",
      items: [
        "Current or former smoker",
        "High alcohol consumption",
        "Obesity or significant weight issues", 
        "HIV positive",
        "Taking hormone replacement therapy",
        "African American or Ashkenazi Jewish ancestry",
        "Early menopause or fracture after age 50",
        "Immunocompromised"
      ]
    },
    screeningStatus: {
      title: "Screening History",
      items: [
        "Never had a pap smear or overdue (>3 years)",
        "Never had a mammogram", 
        "Multiple sexual partners or STI history",
        "Personal history of polyps"
      ]
    }
  }

  useEffect(() => {
    const isValid = age !== "" && gender !== ""
    setIsFormComplete(isValid)
  }, [age, gender])

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
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
      const allRiskFactors = [...medicalHistory]
      
      if (detailedHistory.smokingStatus === "current") {
        allRiskFactors.push("smoking", "current smoker")
      } else if (detailedHistory.smokingStatus === "former") {
        allRiskFactors.push("former smoker", "smoking history")
        
        const packYears = parseInt(detailedHistory.packYears) || 0
        const quitYear = parseInt(detailedHistory.quitDate) || new Date().getFullYear()
        const yearsSinceQuit = new Date().getFullYear() - quitYear
        
        if (packYears >= 20) {
          allRiskFactors.push("20 pack-year history")
        }
        if (yearsSinceQuit <= 15) {
          allRiskFactors.push("quit within past 15 years")
        }
      }
      
      if (detailedHistory.alcoholConsumption === "heavy") {
        allRiskFactors.push("excessive alcohol")
      }
      
      if (detailedHistory.bodyWeight === "obese") {
        allRiskFactors.push("obesity", "BMI >= 30")
      } else if (detailedHistory.bodyWeight === "overweight") {
        allRiskFactors.push("overweight", "BMI 25-29.9")
      } else if (detailedHistory.bodyWeight === "underweight") {
        allRiskFactors.push("low body weight")
      }

      const params = new URLSearchParams({
        age,
        gender,
        riskFactors: allRiskFactors.join(",")
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
    console.log('Save and Continue clicked', { age, gender, medicalHistory, detailedHistory, zipCode, selectedScreenings })
    updatePatientData({
      age: Number.parseInt(age),
      gender,
      medicalHistory,
      detailedHistory,
      zipCode,
      selectedScreenings,
    })
    
    // Navigate to provider search with selected screenings
    if (selectedScreenings.length > 0) {
      const params = new URLSearchParams()
      params.append('screenings', selectedScreenings.join(","))
      if (zipCode.trim()) {
        params.append('location', zipCode.trim())
      }
      console.log('Navigating to provider search with params:', params.toString())
      router.push(`/providers/search?${params.toString()}`)
    } else {
      // If no screenings selected, still call onComplete for any parent workflow
      onComplete()
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
              <SelectTrigger id="gender" className="w-full bg-white border-2 border-slate-300 hover:border-slate-400 focus:border-blue-500 shadow-sm">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-slate-200 shadow-xl rounded-lg max-h-64 overflow-y-auto z-50" position="popper" sideOffset={5}>
                <SelectItem value="male" className="hover:bg-slate-100 focus:bg-slate-100 px-3 py-2">Male</SelectItem>
                <SelectItem value="female" className="hover:bg-slate-100 focus:bg-slate-100 px-3 py-2">Female</SelectItem>
                <SelectItem value="all" className="hover:bg-slate-100 focus:bg-slate-100 px-3 py-2">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code (Optional)</Label>
          <Input 
            id="zipCode" 
            type="text"
            maxLength={5}
            value={zipCode} 
            onChange={handleZipCodeChange} 
            placeholder="Enter your ZIP code (optional)" 
            className="w-full max-w-xs"
          />
          <p className="text-xs text-gray-500">ZIP code helps find nearby providers for screenings</p>
        </div>

        <div className="space-y-6">
          <Label className="text-lg font-medium">Medical History & Risk Factors</Label>
          <p className="text-sm text-muted-foreground">
            Select all that apply. We've streamlined these key factors to provide accurate USPSTF screening recommendations efficiently.
          </p>
          
          {Object.entries(medicalHistoryCategories).map(([categoryKey, category]) => (
            <div key={categoryKey} className="space-y-3">
              <h4 className="font-medium text-gray-900 border-b pb-1">{category.title}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {category.items.map((item) => (
                  <div key={item} className="flex items-start space-x-2">
                    <Checkbox
                      id={`history-${item}`}
                      checked={medicalHistory.includes(item)}
                      onCheckedChange={(checked) => handleMedicalHistoryChange(item, checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor={`history-${item}`} className="text-sm font-normal leading-5">
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-gray-900">Additional Information (Optional but recommended)</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smoking-status">Smoking Status</Label>
                <Select value={detailedHistory.smokingStatus} onValueChange={(value) => 
                  setDetailedHistory({...detailedHistory, smokingStatus: value})
                }>
                  <SelectTrigger className="bg-white border-2 border-slate-300 hover:border-slate-400 focus:border-blue-500 shadow-sm">
                    <SelectValue placeholder="Select smoking status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-slate-200 shadow-xl rounded-lg max-h-64 overflow-y-auto z-50">
                    <SelectItem value="never" className="hover:bg-slate-100 focus:bg-slate-100 px-3 py-2">Never smoked</SelectItem>
                    <SelectItem value="current" className="hover:bg-slate-100 focus:bg-slate-100 px-3 py-2">Current smoker</SelectItem>
                    <SelectItem value="former" className="hover:bg-slate-100 focus:bg-slate-100 px-3 py-2">Former smoker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(detailedHistory.smokingStatus === "current" || detailedHistory.smokingStatus === "former") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="pack-years">Pack-years (packs per day × years smoked)</Label>
                    <Input
                      id="pack-years"
                      type="number"
                      placeholder="e.g., 20"
                      value={detailedHistory.packYears}
                      onChange={(e) => setDetailedHistory({...detailedHistory, packYears: e.target.value})}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">Important for lung cancer screening eligibility</p>
                  </div>
                  
                  {detailedHistory.smokingStatus === "former" && (
                    <div className="space-y-2">
                      <Label htmlFor="quit-date">Year quit smoking</Label>
                      <Input
                        id="quit-date"
                        type="number"
                        placeholder="e.g., 2020"
                        min="1950"
                        max={new Date().getFullYear()}
                        value={detailedHistory.quitDate}
                        onChange={(e) => setDetailedHistory({...detailedHistory, quitDate: e.target.value})}
                        className="w-full"
                      />
                    </div>
                  )}
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="alcohol">Weekly alcohol consumption</Label>
                <Select value={detailedHistory.alcoholConsumption} onValueChange={(value) => 
                  setDetailedHistory({...detailedHistory, alcoholConsumption: value})
                }>
                  <SelectTrigger className="bg-white border-2 border-slate-300 hover:border-slate-400 focus:border-blue-500 shadow-sm">
                    <SelectValue placeholder="Select alcohol consumption" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-slate-200 shadow-xl rounded-lg max-h-64 overflow-y-auto z-50">
                    <SelectItem value="none" className="hover:bg-slate-100 focus:bg-slate-100 px-3 py-2">None</SelectItem>
                    <SelectItem value="light" className="hover:bg-slate-100 focus:bg-slate-100 px-3 py-2">1-3 drinks per week</SelectItem>
                    <SelectItem value="moderate" className="hover:bg-slate-100 focus:bg-slate-100 px-3 py-2">4-7 drinks per week</SelectItem>
                    <SelectItem value="heavy" className="hover:bg-slate-100 focus:bg-slate-100 px-3 py-2">8+ drinks per week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bmi-category">Body Mass Index (BMI) Category</Label>
                <Select value={detailedHistory.bodyWeight} onValueChange={(value) => 
                  setDetailedHistory({...detailedHistory, bodyWeight: value})
                }>
                  <SelectTrigger className="bg-white border-2 border-slate-300 hover:border-slate-400 focus:border-blue-500 shadow-sm">
                    <SelectValue placeholder="Select BMI category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-slate-200 shadow-xl rounded-lg max-h-64 overflow-y-auto z-50">
                    <SelectItem value="underweight" className="hover:bg-slate-100 focus:bg-slate-100 px-3 py-2">Underweight (BMI &lt;18.5)</SelectItem>
                    <SelectItem value="normal" className="hover:bg-slate-100 focus:bg-slate-100 px-3 py-2">Normal weight (BMI 18.5-24.9)</SelectItem>
                    <SelectItem value="overweight" className="hover:bg-slate-100 focus:bg-slate-100 px-3 py-2">Overweight (BMI 25-29.9)</SelectItem>
                    <SelectItem value="obese" className="hover:bg-slate-100 focus:bg-slate-100 px-3 py-2">Obese (BMI ≥30)</SelectItem>
                    <SelectItem value="unknown" className="hover:bg-slate-100 focus:bg-slate-100 px-3 py-2">Don't know</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Important for diabetes and other screening recommendations</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={fetchRecommendations} disabled={isLoading || !age || !gender}>
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
            Based on your age, gender, and medical history, the following screenings are recommended according to USPSTF guidelines:
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

          <div className="flex justify-end">
            <Button
              onClick={handleSaveAndContinue}
              disabled={!isFormComplete || selectedScreenings.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {selectedScreenings.length > 0 ? 'Find Providers for Selected Screenings' : 'Save and Continue'}
            </Button>
          </div>
        </div>
      )}

      {selectedScreenings.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <div className="text-sm text-green-800">
            <strong>Great!</strong> You've selected {selectedScreenings.length} screening{selectedScreenings.length > 1 ? 's' : ''}. 
            Click "Find Providers" below to search for healthcare providers who can perform these screenings{zipCode ? ` near ${zipCode}` : ''}.
          </div>
        </div>
      )}

      {!age && !gender && (
        <div className="text-sm text-amber-600 mt-2">
          Please enter your age and select gender to see screening recommendations.
        </div>
      )}
      {!gender && age && (
        <div className="text-sm text-amber-600 mt-2">
          Please select your gender to continue.
        </div>
      )}
      {!age && gender && (
        <div className="text-sm text-amber-600 mt-2">
          Please enter your age to continue.
        </div>
      )}
      {isFormComplete && recommendations.length > 0 && selectedScreenings.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
          <div className="text-sm text-amber-800">
            <strong>Ready to find providers?</strong> Please select at least one screening recommendation above, then click "Find Providers" to search for healthcare providers in your area.
            {!zipCode && <span className="block mt-1"><strong>Tip:</strong> Adding your ZIP code helps us find providers near you!</span>}
          </div>
        </div>
      )}
    </div>
  )
} 