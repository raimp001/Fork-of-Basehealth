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
  const [recommendations, setRecommendations] = useState<ScreeningRecommendation[]>([])
  const [selectedScreenings, setSelectedScreenings] = useState<string[]>(patientData.selectedScreenings || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFormComplete, setIsFormComplete] = useState(false)
  
  // Provider search state
  const [providers, setProviders] = useState<any[]>([])
  const [isLoadingProviders, setIsLoadingProviders] = useState(false)
  const [providerError, setProviderError] = useState<string | null>(null)
  const [zipCode, setZipCode] = useState<string>("")
  const [showProviders, setShowProviders] = useState(false)

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
    // Enhanced family history for precise screening recommendations
    familyHistoryDetails: {
      colorectalCancer: {
        hasHistory: false,
        relatives: [] as Array<{
          relationship: string; // "parent", "sibling", "grandparent", "aunt-uncle"
          ageAtDiagnosis: number | null;
          cancerType: string; // "colon", "rectal", "colorectal", "unknown"
        }>
      },
      breastOvarianCancer: {
        hasHistory: false,
        relatives: [] as Array<{
          relationship: string;
          ageAtDiagnosis: number | null;
          cancerType: string; // "breast", "ovarian", "both"
        }>
      },
      otherCancers: {
        hasHistory: false,
        relatives: [] as Array<{
          relationship: string;
          ageAtDiagnosis: number | null;
          cancerType: string;
        }>
      },
      lynch: {
        suspectedLynchSyndrome: false,
        multipleRelativesWithCRC: false,
        earlyOnsetCancers: false,
        endometrialCancer: false,
      }
    }
  })

  // Medical history categories for USPSTF compliance - enhanced with detailed family history
  const medicalHistoryCategories = {
    majorConditions: {
      title: "Personal & Family Medical History",
      items: [
        "High blood pressure or heart disease",
        "Diabetes or pre-diabetes", 
        "Personal history of cancer",
        "Personal history of polyps or abnormal colonoscopy",
        "Inflammatory bowel disease (Crohn's or Ulcerative Colitis)",
        "Previous abnormal screening results"
      ]
    },
    riskFactors: {
      title: "Key Risk Factors",
      items: [
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
        "Never had a colonoscopy (age 45+)"
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
      
      // Process smoking history
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
      
      // Process alcohol and weight
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

      // Process detailed family history for colorectal cancer
      if (detailedHistory.familyHistoryDetails.colorectalCancer.hasHistory) {
        allRiskFactors.push("family history of colorectal cancer")
        
        const firstDegreeRelatives = detailedHistory.familyHistoryDetails.colorectalCancer.relatives.filter(
          rel => rel.relationship === "parent" || rel.relationship === "sibling"
        )
        
        // Check for early onset in first-degree relatives (< 50 years)
        const earlyOnsetFirstDegree = firstDegreeRelatives.filter(rel => rel.ageAtDiagnosis && rel.ageAtDiagnosis < 50)
        if (earlyOnsetFirstDegree.length > 0) {
          allRiskFactors.push("family history colorectal cancer age < 50")
          allRiskFactors.push("high risk colorectal cancer family history")
          const earliestAge = Math.min(...earlyOnsetFirstDegree.map(rel => rel.ageAtDiagnosis!))
          allRiskFactors.push(`earliest family diagnosis age ${earliestAge}`)
        }
        
        // Check for moderate risk (first-degree relative diagnosed 50-59 years)
        const moderateOnsetFirstDegree = firstDegreeRelatives.filter(rel => rel.ageAtDiagnosis && rel.ageAtDiagnosis >= 50 && rel.ageAtDiagnosis < 60)
        if (moderateOnsetFirstDegree.length > 0) {
          allRiskFactors.push("family history colorectal cancer age 50-59")
          allRiskFactors.push("moderate risk colorectal cancer family history")
        }
        
        // Check for multiple affected first-degree relatives
        if (firstDegreeRelatives.length >= 2) {
          allRiskFactors.push("multiple first degree relatives colorectal cancer")
          allRiskFactors.push("high risk colorectal cancer family history")
        }
        
        // Any first-degree relative diagnosed ≥60 years
        const lateOnsetFirstDegree = firstDegreeRelatives.filter(rel => rel.ageAtDiagnosis && rel.ageAtDiagnosis >= 60)
        if (lateOnsetFirstDegree.length > 0 && earlyOnsetFirstDegree.length === 0 && moderateOnsetFirstDegree.length === 0) {
          allRiskFactors.push("family history colorectal cancer age >= 60")
        }
      }

      // Process Lynch syndrome indicators
      if (detailedHistory.familyHistoryDetails.lynch.multipleRelativesWithCRC) {
        allRiskFactors.push("suspected lynch syndrome", "3+ relatives colorectal cancer")
      }
      if (detailedHistory.familyHistoryDetails.lynch.earlyOnsetCancers) {
        allRiskFactors.push("suspected lynch syndrome", "family colorectal cancer age < 45")
      }
      if (detailedHistory.familyHistoryDetails.lynch.endometrialCancer) {
        allRiskFactors.push("suspected lynch syndrome", "family endometrial cancer age < 50")
      }

      const params = new URLSearchParams({
        age,
        gender,
        riskFactors: allRiskFactors.join(","),
        familyHistoryDetails: JSON.stringify(detailedHistory.familyHistoryDetails)
      })
      const res = await fetch(`/api/screening/recommendations?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch recommendations")
      const data = await res.json()
      setRecommendations(data.recommendations || [])
      
      // Auto-select essential and recommended screenings
      const autoSelectedScreenings = data.recommendations
        .filter((rec: any) => rec.importance === "essential" || rec.importance === "recommended")
        .map((rec: any) => rec.id)
      setSelectedScreenings(autoSelectedScreenings)
      
      // Automatically search for providers if we have recommendations and zip code
      if (data.recommendations.length > 0 && zipCode) {
        await searchProviders(data.recommendations, zipCode)
      }
      
    } catch (err) {
      setError("Failed to fetch recommendations")
    } finally {
      setIsLoading(false)
    }
  }

  // Auto search for providers based on recommendations
  const searchProviders = async (recommendations: any[], location: string) => {
    if (!location || recommendations.length === 0) return
    
    setIsLoadingProviders(true)
    setProviderError(null)
    
    try {
      // Get unique specialties from recommendations
      const specialties = [...new Set(recommendations.map(rec => rec.specialtyNeeded))]
      const primarySpecialty = specialties[0] || "Primary Care"
      
      const response = await fetch(`/api/providers/search?zipCode=${location}&specialty=${encodeURIComponent(primarySpecialty)}&limit=6`)
      
      if (!response.ok) {
        throw new Error("Failed to search providers")
      }
      
      const data = await response.json()
      setProviders(data.providers || [])
      setShowProviders(true)
      
    } catch (err) {
      console.error("Provider search error:", err)
      setProviderError("Unable to find providers in your area. You can search manually later.")
    } finally {
      setIsLoadingProviders(false)
    }
  }

  const handleProviderSearch = async () => {
    if (!zipCode) {
      setProviderError("Please enter your ZIP code to find providers")
      return
    }
    
    await searchProviders(recommendations, zipCode)
  }

  const handleSaveAndContinue = () => {
    console.log('Save and Continue clicked', { age, gender, medicalHistory, detailedHistory, selectedScreenings })
    updatePatientData({
      age: Number.parseInt(age),
      gender,
      medicalHistory,
      detailedHistory,
      selectedScreenings,
      zipCode,
    })
    
    // Continue to next step in workflow
    onComplete()
  }

  const handleBookAppointment = (provider: any, screening: any) => {
    // Navigate to appointment booking with provider and screening info
    const bookingUrl = `/appointment/book?providerId=${provider.id}&screening=${encodeURIComponent(screening.name)}&specialtyNeeded=${encodeURIComponent(screening.specialtyNeeded)}`
    window.open(bookingUrl, '_blank')
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

          {/* Enhanced Family History Section */}
          <div className="space-y-4 border-t pt-4 mt-6">
            <h4 className="font-medium text-gray-900 border-b pb-1">Detailed Family History</h4>
            <p className="text-sm text-muted-foreground">
              Providing specific details about family cancer history helps us recommend the most appropriate screening schedule for you.
            </p>
            
            {/* Colorectal Cancer Family History */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="family-colorectal-cancer"
                  checked={detailedHistory.familyHistoryDetails.colorectalCancer.hasHistory}
                  onCheckedChange={(checked) => {
                    setDetailedHistory({
                      ...detailedHistory,
                      familyHistoryDetails: {
                        ...detailedHistory.familyHistoryDetails,
                        colorectalCancer: {
                          ...detailedHistory.familyHistoryDetails.colorectalCancer,
                          hasHistory: checked === true
                        }
                      }
                    })
                  }}
                />
                <Label htmlFor="family-colorectal-cancer" className="font-medium">
                  Family history of colorectal cancer
                </Label>
              </div>
              
              {detailedHistory.familyHistoryDetails.colorectalCancer.hasHistory && (
                <div className="ml-6 space-y-3 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    Please add details about family members with colorectal cancer. Age at diagnosis is crucial for determining your screening schedule.
                  </p>
                  
                  {detailedHistory.familyHistoryDetails.colorectalCancer.relatives.map((relative, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white rounded border">
                      <div>
                        <Label className="text-xs text-gray-600">Relationship</Label>
                        <Select
                          value={relative.relationship}
                          onValueChange={(value) => {
                            const newRelatives = [...detailedHistory.familyHistoryDetails.colorectalCancer.relatives]
                            newRelatives[index] = { ...relative, relationship: value }
                            setDetailedHistory({
                              ...detailedHistory,
                              familyHistoryDetails: {
                                ...detailedHistory.familyHistoryDetails,
                                colorectalCancer: {
                                  ...detailedHistory.familyHistoryDetails.colorectalCancer,
                                  relatives: newRelatives
                                }
                              }
                            })
                          }}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="grandparent">Grandparent</SelectItem>
                            <SelectItem value="aunt-uncle">Aunt/Uncle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-600">Age at diagnosis</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 45"
                          value={relative.ageAtDiagnosis || ""}
                          onChange={(e) => {
                            const newRelatives = [...detailedHistory.familyHistoryDetails.colorectalCancer.relatives]
                            newRelatives[index] = { 
                              ...relative, 
                              ageAtDiagnosis: e.target.value ? parseInt(e.target.value) : null 
                            }
                            setDetailedHistory({
                              ...detailedHistory,
                              familyHistoryDetails: {
                                ...detailedHistory.familyHistoryDetails,
                                colorectalCancer: {
                                  ...detailedHistory.familyHistoryDetails.colorectalCancer,
                                  relatives: newRelatives
                                }
                              }
                            })
                          }}
                          className="text-xs"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newRelatives = detailedHistory.familyHistoryDetails.colorectalCancer.relatives.filter((_, i) => i !== index)
                            setDetailedHistory({
                              ...detailedHistory,
                              familyHistoryDetails: {
                                ...detailedHistory.familyHistoryDetails,
                                colorectalCancer: {
                                  ...detailedHistory.familyHistoryDetails.colorectalCancer,
                                  relatives: newRelatives
                                }
                              }
                            })
                          }}
                          className="text-xs"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newRelatives = [
                        ...detailedHistory.familyHistoryDetails.colorectalCancer.relatives,
                        { relationship: "", ageAtDiagnosis: null, cancerType: "colorectal" }
                      ]
                      setDetailedHistory({
                        ...detailedHistory,
                        familyHistoryDetails: {
                          ...detailedHistory.familyHistoryDetails,
                          colorectalCancer: {
                            ...detailedHistory.familyHistoryDetails.colorectalCancer,
                            relatives: newRelatives
                          }
                        }
                      })
                    }}
                  >
                    + Add Family Member
                  </Button>
                </div>
              )}
            </div>

            {/* Lynch Syndrome Indicators */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-800">Lynch Syndrome Indicators</h5>
              <p className="text-xs text-gray-600">These factors may indicate increased genetic risk requiring earlier screening.</p>
              
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="multiple-relatives-crc"
                    checked={detailedHistory.familyHistoryDetails.lynch.multipleRelativesWithCRC}
                    onCheckedChange={(checked) => {
                      setDetailedHistory({
                        ...detailedHistory,
                        familyHistoryDetails: {
                          ...detailedHistory.familyHistoryDetails,
                          lynch: {
                            ...detailedHistory.familyHistoryDetails.lynch,
                            multipleRelativesWithCRC: checked === true
                          }
                        }
                      })
                    }}
                  />
                  <Label htmlFor="multiple-relatives-crc" className="text-sm">
                    3+ relatives with colorectal cancer (any age)
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="early-onset-cancers"
                    checked={detailedHistory.familyHistoryDetails.lynch.earlyOnsetCancers}
                    onCheckedChange={(checked) => {
                      setDetailedHistory({
                        ...detailedHistory,
                        familyHistoryDetails: {
                          ...detailedHistory.familyHistoryDetails,
                          lynch: {
                            ...detailedHistory.familyHistoryDetails.lynch,
                            earlyOnsetCancers: checked === true
                          }
                        }
                      })
                    }}
                  />
                  <Label htmlFor="early-onset-cancers" className="text-sm">
                    Family member with colorectal cancer diagnosed before age 45
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="endometrial-cancer"
                    checked={detailedHistory.familyHistoryDetails.lynch.endometrialCancer}
                    onCheckedChange={(checked) => {
                      setDetailedHistory({
                        ...detailedHistory,
                        familyHistoryDetails: {
                          ...detailedHistory.familyHistoryDetails,
                          lynch: {
                            ...detailedHistory.familyHistoryDetails.lynch,
                            endometrialCancer: checked === true
                          }
                        }
                      })
                    }}
                  />
                  <Label htmlFor="endometrial-cancer" className="text-sm">
                    Family history of endometrial cancer before age 50
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
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

          {/* ZIP Code for Provider Search */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h4 className="font-medium text-blue-900 mb-2">Find Providers in Your Area</h4>
            <p className="text-sm text-blue-700 mb-3">
              Enter your ZIP code to automatically find healthcare providers who can perform your recommended screenings.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter ZIP code (e.g., 90210)"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleProviderSearch}
                disabled={!zipCode || isLoadingProviders}
                variant="outline"
              >
                {isLoadingProviders ? "Searching..." : "Find Providers"}
              </Button>
            </div>
            {providerError && (
              <p className="text-sm text-red-600 mt-2">{providerError}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveAndContinue}
              disabled={!isFormComplete}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Providers Section */}
      {showProviders && providers.length > 0 && (
        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Available Providers</h3>
            <span className="text-sm text-gray-600">{providers.length} providers found</span>
          </div>
          
          <div className="grid gap-4">
            {providers.slice(0, 3).map((provider: any) => (
              <Card key={provider.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{provider.name}</h4>
                        {provider.acceptingPatients && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Accepting Patients
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{provider.specialty}</p>
                      <p className="text-sm text-gray-500">{provider.address}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>⭐ {provider.rating} ({provider.reviewCount} reviews)</span>
                        {provider.distance && <span>📍 {provider.distance} miles</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {selectedScreenings.slice(0, 2).map(screeningId => {
                        const screening = recommendations.find(r => r.id === screeningId)
                        return screening ? (
                          <Button
                            key={screeningId}
                            size="sm"
                            onClick={() => handleBookAppointment(provider, screening)}
                            className="text-xs"
                          >
                            Book {screening.name}
                          </Button>
                        ) : null
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {providers.length > 3 && (
              <Card className="border-dashed">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    {providers.length - 3} more providers available
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const searchUrl = `/providers/search?zipCode=${zipCode}&screenings=${selectedScreenings.join(",")}`
                      window.open(searchUrl, '_blank')
                    }}
                  >
                    View All Providers
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
      
      {selectedScreenings.length > 0 && !showProviders && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <div className="text-sm text-green-800">
            <strong>Great!</strong> You've selected {selectedScreenings.length} screening{selectedScreenings.length > 1 ? 's' : ''}. 
            Enter your ZIP code above to find healthcare providers who can perform these screenings.
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
            <strong>Ready to find providers?</strong> Please select at least one screening recommendation above, then click "Continue to Find Providers" to search for healthcare providers in your area.
          </div>
        </div>
      )}
    </div>
  )
} 