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
  
  // ZIP code for provider search
  const [zipCode, setZipCode] = useState<string>("")

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

  // Enhanced medical history categories based on USPSTF high-yield domains
  const medicalHistoryCategories = {
    personalMedicalHistory: {
      title: "Personal Medical History",
      items: [
        "High blood pressure (hypertension)",
        "Diabetes or pre-diabetes",
        "High cholesterol or lipid disorders",
        "Personal history of any cancer",
        "Personal history of colon polyps",
        "Inflammatory bowel disease (Crohn's or Ulcerative Colitis)",
        "Osteoporosis or previous fracture after age 50",
        "HIV positive",
        "Immune suppression (transplant, long-term steroids)",
        "Previous abnormal screening results"
      ]
    },
    reproductiveHistory: {
      title: "Reproductive & Hormonal History (Women)",
      items: [
        "Age at first menstrual period (before 12 or after 15)",
        "Never been pregnant or first pregnancy after age 30",
        "History of gestational diabetes or pre-eclampsia",
        "Currently taking or previously taken hormone replacement therapy",
        "Taking oral contraceptives for >5 years",
        "History of infertility or fertility treatments",
        "Early menopause (before age 45)",
        "History of DES (diethylstilbestrol) exposure"
      ]
    },
    sexualHealthHistory: {
      title: "Sexual Health & STI History",
      items: [
        "Multiple sexual partners (>4 lifetime)",
        "History of sexually transmitted infections",
        "Currently sexually active",
        "New sexual partner in past year",
        "Partner with STI history",
        "Never use barrier protection",
        "Men who have sex with men"
      ]
    },
    substanceUse: {
      title: "Substance Use History",
      items: [
        "Current or former injection drug use",
        "Unhealthy alcohol use (binge drinking or daily use)",
        "History of blood transfusion before 1992",
        "History of sharing needles or drug equipment",
        "Regular prescription opioid use"
      ]
    },
    exposureHistory: {
      title: "Environmental & Occupational Exposures",
      items: [
        "Radon exposure in home or workplace",
        "Asbestos exposure",
        "Silica or coal dust exposure",
        "Born in tuberculosis-endemic country",
        "Born in hepatitis B endemic region",
        "History of incarceration",
        "Healthcare worker with blood/body fluid exposure",
        "History of tattoos or body piercing",
        "Dialysis patient"
      ]
    },
    mentalHealthSocial: {
      title: "Mental Health & Social Factors",
      items: [
        "History of depression or anxiety",
        "Current or past intimate partner violence",
        "Food insecurity or housing instability",
        "Social isolation or lack of support",
        "History of suicide attempt or ideation",
        "High stress levels or major life changes"
      ]
    },
    medicationsTherapies: {
      title: "Current Medications & Therapies",
      items: [
        "Daily aspirin or regular NSAID use",
        "Tamoxifen or raloxifene (breast cancer prevention)",
        "Bisphosphonates for bone health",
        "Immunosuppressive medications",
        "Anticoagulant medications (blood thinners)",
        "History of thoracic radiation therapy"
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

      // Process all medical history categories for comprehensive USPSTF assessment
      
      // Process reproductive history (affects breast, cervical, bone screening)
      if (gender === "female") {
        const reproductiveFactors = medicalHistory.filter(item => 
          medicalHistoryCategories.reproductiveHistory.items.includes(item)
        )
        reproductiveFactors.forEach(factor => {
          if (factor.includes("hormone replacement therapy")) {
            allRiskFactors.push("hormone therapy use", "HRT use")
          }
          if (factor.includes("first pregnancy after age 30") || factor.includes("Never been pregnant")) {
            allRiskFactors.push("nulliparity or late first pregnancy")
          }
          if (factor.includes("gestational diabetes")) {
            allRiskFactors.push("history gestational diabetes")
          }
          if (factor.includes("Early menopause")) {
            allRiskFactors.push("early menopause", "osteoporosis risk")
          }
        })
      }

      // Process sexual health factors (affects STI, cervical cancer screening)
      const sexualHealthFactors = medicalHistory.filter(item => 
        medicalHistoryCategories.sexualHealthHistory.items.includes(item)
      )
      if (sexualHealthFactors.length > 0) {
        allRiskFactors.push("sexually active")
        if (sexualHealthFactors.some(f => f.includes("Multiple sexual partners"))) {
          allRiskFactors.push("multiple sexual partners", "high risk sexual behavior")
        }
        if (sexualHealthFactors.some(f => f.includes("sexually transmitted infections"))) {
          allRiskFactors.push("STI history", "increased cervical cancer risk")
        }
        if (sexualHealthFactors.some(f => f.includes("men who have sex with men"))) {
          allRiskFactors.push("MSM", "high risk population")
        }
      }

      // Process substance use (affects hepatitis, HIV screening)
      const substanceFactors = medicalHistory.filter(item => 
        medicalHistoryCategories.substanceUse.items.includes(item)
      )
      if (substanceFactors.length > 0) {
        if (substanceFactors.some(f => f.includes("injection drug use"))) {
          allRiskFactors.push("injection drug use", "hepatitis risk", "HIV risk")
        }
        if (substanceFactors.some(f => f.includes("blood transfusion before 1992"))) {
          allRiskFactors.push("blood transfusion pre-1992", "hepatitis C risk")
        }
        if (substanceFactors.some(f => f.includes("Unhealthy alcohol use"))) {
          allRiskFactors.push("excessive alcohol", "alcohol use disorder")
        }
      }

      // Process exposure history (affects TB, hepatitis screening)
      const exposureFactors = medicalHistory.filter(item => 
        medicalHistoryCategories.exposureHistory.items.includes(item)
      )
      if (exposureFactors.length > 0) {
        if (exposureFactors.some(f => f.includes("tuberculosis-endemic"))) {
          allRiskFactors.push("TB risk", "born in endemic region")
        }
        if (exposureFactors.some(f => f.includes("hepatitis B endemic"))) {
          allRiskFactors.push("hepatitis B risk", "endemic region exposure")
        }
        if (exposureFactors.some(f => f.includes("asbestos") || f.includes("silica"))) {
          allRiskFactors.push("occupational lung exposure", "lung cancer risk")
        }
        if (exposureFactors.some(f => f.includes("healthcare worker"))) {
          allRiskFactors.push("occupational exposure", "hepatitis risk")
        }
      }

      // Process medications/therapies (affects screening intervals and risk)
      const medicationFactors = medicalHistory.filter(item => 
        medicalHistoryCategories.medicationsTherapies.items.includes(item)
      )
      if (medicationFactors.length > 0) {
        if (medicationFactors.some(f => f.includes("aspirin") || f.includes("NSAID"))) {
          allRiskFactors.push("chronic NSAID use", "bleeding risk")
        }
        if (medicationFactors.some(f => f.includes("tamoxifen") || f.includes("raloxifene"))) {
          allRiskFactors.push("SERM use", "breast cancer prevention therapy")
        }
        if (medicationFactors.some(f => f.includes("thoracic radiation"))) {
          allRiskFactors.push("radiation exposure", "secondary cancer risk")
        }
      }

      // Process mental health factors (affects depression screening)
      const mentalHealthFactors = medicalHistory.filter(item => 
        medicalHistoryCategories.mentalHealthSocial.items.includes(item)
      )
      if (mentalHealthFactors.length > 0) {
        if (mentalHealthFactors.some(f => f.includes("depression") || f.includes("anxiety"))) {
          allRiskFactors.push("mental health history", "depression risk")
        }
        if (mentalHealthFactors.some(f => f.includes("intimate partner violence"))) {
          allRiskFactors.push("IPV history", "trauma history")
        }
        if (mentalHealthFactors.some(f => f.includes("suicide"))) {
          allRiskFactors.push("suicide risk", "mental health crisis history")
        }
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

      // Process breast/ovarian cancer family history
      if (detailedHistory.familyHistoryDetails.breastOvarianCancer.hasHistory) {
        allRiskFactors.push("family history of breast cancer", "family history of ovarian cancer")
        
        const relatives = detailedHistory.familyHistoryDetails.breastOvarianCancer.relatives || []
        const earlyOnsetBreast = relatives.filter(rel => 
          rel.cancerType?.includes("breast") && rel.ageAtDiagnosis && rel.ageAtDiagnosis < 50
        )
        
        if (earlyOnsetBreast.length > 0) {
          allRiskFactors.push("family history breast cancer age < 50")
          allRiskFactors.push("high risk breast cancer family history")
        }
        
        // Multiple relatives with breast/ovarian cancer
        if (relatives.length >= 2) {
          allRiskFactors.push("multiple relatives breast ovarian cancer")
          allRiskFactors.push("high risk breast cancer family history")
        }

        // Check for specific high-risk patterns
        const motherSisterBreast = relatives.filter(rel => 
          (rel.relationship === "mother" || rel.relationship === "sister") && 
          rel.cancerType?.includes("breast")
        )
        if (motherSisterBreast.length > 0) {
          allRiskFactors.push("first degree relative breast cancer")
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

      // Process cardiovascular family history
      if (detailedHistory.familyHistoryDetails.otherCancers.hasHistory || detailedHistory.familyHistoryDetails.lynch.suspectedLynchSyndrome) {
        allRiskFactors.push("family history premature CAD", "cardiovascular risk")
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
      
      // Auto-selected screenings are ready for provider search
      
    } catch (err) {
      setError("Failed to fetch recommendations")
    } finally {
      setIsLoading(false)
    }
  }

  // Auto search for providers based on recommendations


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

            {/* Breast/Ovarian Cancer Family History */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="family-breast-ovarian-cancer"
                  checked={detailedHistory.familyHistoryDetails.breastOvarianCancer.hasHistory}
                  onCheckedChange={(checked) => {
                    setDetailedHistory({
                      ...detailedHistory,
                      familyHistoryDetails: {
                        ...detailedHistory.familyHistoryDetails,
                        breastOvarianCancer: {
                          ...detailedHistory.familyHistoryDetails.breastOvarianCancer,
                          hasHistory: checked === true
                        }
                      }
                    })
                  }}
                />
                <Label htmlFor="family-breast-ovarian-cancer" className="font-medium">
                  Family history of breast or ovarian cancer
                </Label>
              </div>
              
              {detailedHistory.familyHistoryDetails.breastOvarianCancer.hasHistory && (
                <div className="ml-6 space-y-3 p-3 bg-pink-50 rounded-md">
                  <p className="text-sm text-pink-800">
                    Family history of breast/ovarian cancer, especially at young ages, affects breast cancer screening recommendations.
                  </p>
                  
                  {detailedHistory.familyHistoryDetails.breastOvarianCancer.relatives.map((relative, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-white rounded border">
                      <div>
                        <Label className="text-xs text-gray-600">Relationship</Label>
                        <Select
                          value={relative.relationship}
                          onValueChange={(value) => {
                            const newRelatives = [...detailedHistory.familyHistoryDetails.breastOvarianCancer.relatives]
                            newRelatives[index] = { ...relative, relationship: value }
                            setDetailedHistory({
                              ...detailedHistory,
                              familyHistoryDetails: {
                                ...detailedHistory.familyHistoryDetails,
                                breastOvarianCancer: {
                                  ...detailedHistory.familyHistoryDetails.breastOvarianCancer,
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
                            <SelectItem value="mother">Mother</SelectItem>
                            <SelectItem value="father">Father</SelectItem>
                            <SelectItem value="sister">Sister</SelectItem>
                            <SelectItem value="brother">Brother</SelectItem>
                            <SelectItem value="grandmother">Grandmother</SelectItem>
                            <SelectItem value="aunt">Aunt</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-600">Cancer Type</Label>
                        <Select
                          value={relative.cancerType}
                          onValueChange={(value) => {
                            const newRelatives = [...detailedHistory.familyHistoryDetails.breastOvarianCancer.relatives]
                            newRelatives[index] = { ...relative, cancerType: value }
                            setDetailedHistory({
                              ...detailedHistory,
                              familyHistoryDetails: {
                                ...detailedHistory.familyHistoryDetails,
                                breastOvarianCancer: {
                                  ...detailedHistory.familyHistoryDetails.breastOvarianCancer,
                                  relatives: newRelatives
                                }
                              }
                            })
                          }}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Cancer type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="breast">Breast cancer</SelectItem>
                            <SelectItem value="ovarian">Ovarian cancer</SelectItem>
                            <SelectItem value="both">Both breast & ovarian</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-600">Age at diagnosis</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 42"
                          value={relative.ageAtDiagnosis || ""}
                          onChange={(e) => {
                            const newRelatives = [...detailedHistory.familyHistoryDetails.breastOvarianCancer.relatives]
                            newRelatives[index] = { 
                              ...relative, 
                              ageAtDiagnosis: e.target.value ? parseInt(e.target.value) : null 
                            }
                            setDetailedHistory({
                              ...detailedHistory,
                              familyHistoryDetails: {
                                ...detailedHistory.familyHistoryDetails,
                                breastOvarianCancer: {
                                  ...detailedHistory.familyHistoryDetails.breastOvarianCancer,
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
                            const newRelatives = detailedHistory.familyHistoryDetails.breastOvarianCancer.relatives.filter((_, i) => i !== index)
                            setDetailedHistory({
                              ...detailedHistory,
                              familyHistoryDetails: {
                                ...detailedHistory.familyHistoryDetails,
                                breastOvarianCancer: {
                                  ...detailedHistory.familyHistoryDetails.breastOvarianCancer,
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
                        ...detailedHistory.familyHistoryDetails.breastOvarianCancer.relatives,
                        { relationship: "", ageAtDiagnosis: null, cancerType: "" }
                      ]
                      setDetailedHistory({
                        ...detailedHistory,
                        familyHistoryDetails: {
                          ...detailedHistory.familyHistoryDetails,
                          breastOvarianCancer: {
                            ...detailedHistory.familyHistoryDetails.breastOvarianCancer,
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

            {/* Heart Disease Family History */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-800">Family History of Early Heart Disease</h5>
              <p className="text-xs text-gray-600">Family history of premature coronary artery disease affects cardiovascular screening recommendations.</p>
              
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="family-cad-male"
                    checked={detailedHistory.familyHistoryDetails.otherCancers.hasHistory}
                    onCheckedChange={(checked) => {
                      setDetailedHistory({
                        ...detailedHistory,
                        familyHistoryDetails: {
                          ...detailedHistory.familyHistoryDetails,
                          otherCancers: {
                            ...detailedHistory.familyHistoryDetails.otherCancers,
                            hasHistory: checked === true
                          }
                        }
                      })
                    }}
                  />
                  <Label htmlFor="family-cad-male" className="text-sm">
                    Male relative with heart disease before age 55
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="family-cad-female"
                    checked={detailedHistory.familyHistoryDetails.lynch.suspectedLynchSyndrome}
                    onCheckedChange={(checked) => {
                      setDetailedHistory({
                        ...detailedHistory,
                        familyHistoryDetails: {
                          ...detailedHistory.familyHistoryDetails,
                          lynch: {
                            ...detailedHistory.familyHistoryDetails.lynch,
                            suspectedLynchSyndrome: checked === true
                          }
                        }
                      })
                    }}
                  />
                  <Label htmlFor="family-cad-female" className="text-sm">
                    Female relative with heart disease before age 65
                  </Label>
                </div>
              </div>
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

          {/* Find Providers Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mt-6">
            <div className="text-center">
              <h4 className="font-semibold text-blue-900 text-lg mb-2">Ready to Find Healthcare Providers?</h4>
              <p className="text-blue-700 mb-4">
                Search for healthcare providers in your area who can perform your recommended screenings.
                Use our comprehensive search with filters, maps, and detailed provider information.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter ZIP code (e.g., 90210)"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-48"
                  />
                </div>
                
                <Button 
                  onClick={() => {
                    const searchUrl = new URL('/providers/search', window.location.origin)
                    if (zipCode) {
                      searchUrl.searchParams.set('zipCode', zipCode)
                    }
                    if (selectedScreenings.length > 0) {
                      searchUrl.searchParams.set('screenings', selectedScreenings.join(','))
                    }
                    // Add specialty from most important recommendation
                    const primaryRecommendation = recommendations.find(r => r.importance === 'essential')
                    if (primaryRecommendation?.specialtyNeeded) {
                      searchUrl.searchParams.set('specialty', primaryRecommendation.specialtyNeeded)
                    }
                    window.open(searchUrl.toString(), '_blank')
                  }}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {zipCode ? 'Find Providers Nearby' : 'Find All Providers'}
                </Button>
              </div>
              
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-blue-600">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Filter by specialty & distance
                </div>
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  View on interactive map
                </div>
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Book appointments directly
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => {
                const searchUrl = new URL('/providers/search', window.location.origin)
                // Add ZIP code if available
                if (zipCode) {
                  searchUrl.searchParams.set('zipCode', zipCode)
                }
                // Add screening recommendations as parameters
                if (selectedScreenings.length > 0) {
                  searchUrl.searchParams.set('screenings', selectedScreenings.join(','))
                }
                // Add specialty from most important recommendation
                const primaryRecommendation = recommendations.find(r => r.importance === 'essential')
                if (primaryRecommendation?.specialtyNeeded) {
                  searchUrl.searchParams.set('specialty', primaryRecommendation.specialtyNeeded)
                }
                window.open(searchUrl.toString(), '_blank')
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {selectedScreenings.length > 0 ? 'Find Providers for Selected Screenings' : 'Find Healthcare Providers'}
            </Button>
          </div>
        </div>
      )}

      {selectedScreenings.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <div className="text-sm text-green-800">
            <strong>🎯 Excellent choice!</strong> You've selected {selectedScreenings.length} screening{selectedScreenings.length > 1 ? 's' : ''}. 
            {zipCode ? 'Click "Find Providers Nearby" to search in your area.' : 'Enter your ZIP code for location-based results, or click "Find All Providers" to explore options.'}
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Select the screenings you're most interested in above to get targeted provider recommendations, or click "Find Healthcare Providers" to explore all available providers in your area.
          </div>
        </div>
      )}
    </div>
  )
}