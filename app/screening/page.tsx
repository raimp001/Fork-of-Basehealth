"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Heart, 
  Shield, 
  Brain, 
  Activity,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Star,
  Clock,
  Target,
  Users,
  Zap
} from "lucide-react"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"

interface ScreeningRecommendation {
  id: string
  name: string
  description: string
  ageRange: { min: number; max: number }
  gender: string
  frequency: string
  importance: string
  specialtyNeeded: string
  riskFactors: string[]
  grade: string
}

export default function ScreeningPage() {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    smokingStatus: '',
    alcoholConsumption: '',
    bmiCategory: '',
    
    // Medical History & Risk Factors
    medicalHistory: [] as string[],
    reproductiveHistory: [] as string[],
    sexualHealth: [] as string[],
    substanceUse: [] as string[],
    environmentalExposures: [] as string[],
    mentalHealth: [] as string[],
    currentMedications: [] as string[],
    familyHistory: [] as string[]
  })

  const [recommendations, setRecommendations] = useState<ScreeningRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const medicalHistoryOptions = [
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

  const reproductiveHistoryOptions = [
    "Age at first menstrual period (before 12 or after 15)",
    "Never been pregnant or first pregnancy after age 30",
    "History of gestational diabetes or pre-eclampsia",
    "Currently taking or previously taken hormone replacement therapy",
    "Taking oral contraceptives for >5 years",
    "History of infertility or fertility treatments",
    "Early menopause (before age 45)",
    "History of DES (diethylstilbestrol) exposure"
  ]

  const sexualHealthOptions = [
    "Multiple sexual partners (>4 lifetime)",
    "History of sexually transmitted infections",
    "Currently sexually active",
    "New sexual partner in past year",
    "Partner with STI history",
    "Never use barrier protection",
    "Men who have sex with men"
  ]

  const substanceUseOptions = [
    "Current or former injection drug use",
    "Unhealthy alcohol use (binge drinking or daily use)",
    "History of blood transfusion before 1992",
    "History of sharing needles or drug equipment",
    "Regular prescription opioid use"
  ]

  const environmentalExposuresOptions = [
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

  const mentalHealthOptions = [
    "History of depression or anxiety",
    "Current or past intimate partner violence",
    "Food insecurity or housing instability",
    "Social isolation or lack of support",
    "History of suicide attempt or ideation",
    "High stress levels or major life changes"
  ]

  const currentMedicationsOptions = [
    "Daily aspirin or regular NSAID use",
    "Tamoxifen or raloxifene (breast cancer prevention)",
    "Bisphosphonates for bone health",
    "Immunosuppressive medications",
    "Anticoagulant medications (blood thinners)",
    "History of thoracic radiation therapy"
  ]

  const familyHistoryOptions = [
    "Family history of colorectal cancer",
    "Family history of breast or ovarian cancer",
    "Male relative with heart disease before age 55",
    "Female relative with heart disease before age 65",
    "3+ relatives with colorectal cancer (any age)",
    "Family member with colorectal cancer diagnosed before age 45",
    "Family history of endometrial cancer before age 50"
  ]

  const handleCheckboxChange = (category: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.age || !formData.gender) {
      setError('Please enter your age and select gender to see screening recommendations.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Build risk factors array
      const riskFactors = [
        ...formData.medicalHistory,
        ...formData.reproductiveHistory,
        ...formData.sexualHealth,
        ...formData.substanceUse,
        ...formData.environmentalExposures,
        ...formData.mentalHealth,
        ...formData.currentMedications,
        ...formData.familyHistory
      ]

      // Add lifestyle factors
      if (formData.smokingStatus === 'current') riskFactors.push('Current smoking')
      if (formData.alcoholConsumption === 'heavy') riskFactors.push('Heavy alcohol use')
      if (formData.bmiCategory === 'obese') riskFactors.push('Obesity')

      // Fetch recommendations
      const params = new URLSearchParams({
        age: formData.age,
        gender: formData.gender,
        riskFactors: riskFactors.join(',')
      })

      const response = await fetch(`/api/screening/recommendations?${params}`)
      if (!response.ok) throw new Error('Failed to fetch recommendations')
      
      const data = await response.json()
      setRecommendations(data.recommendations || [])
      setIsSubmitted(true)
    } catch (err) {
      console.error('Error submitting screening:', err)
      setError('Failed to process screening. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
  return (
      <div className="min-h-screen bg-gray-50">
        <MinimalNavigation />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pt-20">
          {/* Success Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-3">
              <CheckCircle className="h-4 w-4" />
              Assessment Complete
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Your Personalized Screening Recommendations
            </h1>
            <p className="text-gray-600 text-sm">
              Based on your health profile, here are your personalized screening recommendations.
            </p>
          </div>

          {/* Provider Search Examples */}
          <Card className="p-4 border-blue-100 bg-blue-50 mb-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Finding the Right Provider</h3>
            <p className="text-sm text-blue-800 mb-3">
              Use these examples to find providers who can order your recommended screenings:
            </p>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => window.open('/providers/search?query=primary+care+for+colonoscopy+screening+in+Seattle', '_blank')}
                className="text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors"
              >
                "primary care for colonoscopy screening in Seattle"
              </button>
              <button 
                onClick={() => window.open('/providers/search?query=primary+care+for+mammogram+in+Chicago', '_blank')}
                className="text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors"
              >
                "primary care for mammogram in Chicago"
              </button>
              <button 
                onClick={() => window.open('/providers/search?query=gastroenterologist+for+colonoscopy+in+Miami', '_blank')}
                className="text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors"
              >
                "gastroenterologist for colonoscopy in Miami"
              </button>
              <button 
                onClick={() => window.open('/providers/search?query=gynecologist+for+pap+smear+in+Boston', '_blank')}
                className="text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors"
              >
                "gynecologist for pap smear in Boston"
              </button>
              <button 
                onClick={() => window.open('/providers/search?query=primary+care+for+blood+pressure+screening+in+Denver', '_blank')}
                className="text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors"
              >
                "primary care for blood pressure screening in Denver"
              </button>
              <button 
                onClick={() => window.open('/providers/search?query=cardiologist+for+cholesterol+screening+in+Phoenix', '_blank')}
                className="text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors"
              >
                "cardiologist for cholesterol screening in Phoenix"
              </button>
            </div>
          </Card>

          {/* Health Summary */}
          <Card className="p-4 border-gray-100 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Health Profile Summary</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{formData.age}</div>
                <div className="text-sm text-gray-600">Age</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{formData.gender}</div>
                <div className="text-sm text-gray-600">Gender</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{formData.medicalHistory.length + formData.familyHistory.length}</div>
                <div className="text-sm text-gray-600">Risk Factors Identified</div>
              </div>
            </div>
          </Card>

          {/* Recommendations */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Recommended Screenings</h2>
            
            {(recommendations || []).map((recommendation) => (
              <Card key={recommendation.id} className="p-4 border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        {recommendation.name}
                      </h3>
                      <Badge variant="secondary" className={
                        recommendation.grade === 'A' ? 'bg-green-100 text-green-800' :
                        recommendation.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        Grade {recommendation.grade}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{recommendation.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Target className="h-4 w-4" />
                    {recommendation.specialtyNeeded}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Frequency:</span>
                    <p className="text-gray-600">{recommendation.frequency}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Age Range:</span>
                    <p className="text-gray-600">{recommendation.ageRange.min}-{recommendation.ageRange.max} years</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white">
                    <a href={`/providers/search?query=${encodeURIComponent(`${recommendation.specialtyNeeded} for ${recommendation.name.toLowerCase()} screening`)}`} className="flex items-center gap-2">
                      Find {recommendation.specialtyNeeded}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
              </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsSubmitted(false)}
              className="border-gray-200"
              size="sm"
            >
              Edit Assessment
            </Button>
            <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white" size="sm">
              <a href="/providers/search">
                Find Healthcare Providers
              </a>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <Brain className="h-4 w-4" />
            Health Screening
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">
            Personalized Health Assessment
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get personalized health screening recommendations based on your unique profile and risk factors.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-4 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-4 border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Health Screening Assessment</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Help us understand your health profile to provide personalized screening recommendations.
            </p>
            
            <div className="grid md:grid-cols-3 gap-3 mb-4">
              <div>
                <Label htmlFor="age" className="text-sm font-medium text-gray-700 mb-2 block">
                  Age *
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Enter your age"
                  className="border-2 border-gray-400 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <Label htmlFor="gender" className="text-sm font-medium text-gray-700 mb-2 block">
                  Gender *
                </Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger className="border-2 border-gray-400 bg-white text-gray-900 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-300 shadow-lg max-h-60 overflow-y-auto">
                    <SelectItem value="male" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Male</SelectItem>
                    <SelectItem value="female" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Female</SelectItem>
                    <SelectItem value="other" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="smokingStatus" className="text-sm font-medium text-gray-700 mb-2 block">
                  Smoking Status
                </Label>
                <Select value={formData.smokingStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, smokingStatus: value }))}>
                  <SelectTrigger className="border-2 border-gray-400 bg-white text-gray-900 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue placeholder="Select smoking status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-300 shadow-lg max-h-60 overflow-y-auto">
                    <SelectItem value="never" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Never smoked</SelectItem>
                    <SelectItem value="former" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Former smoker</SelectItem>
                    <SelectItem value="current" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Current smoker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="alcoholConsumption" className="text-sm font-medium text-gray-700 mb-2 block">
                  Weekly alcohol consumption
                </Label>
                <Select value={formData.alcoholConsumption} onValueChange={(value) => setFormData(prev => ({ ...prev, alcoholConsumption: value }))}>
                  <SelectTrigger className="border-2 border-gray-400 bg-white text-gray-900 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue placeholder="Select alcohol consumption" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-300 shadow-lg max-h-60 overflow-y-auto">
                    <SelectItem value="none" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">None</SelectItem>
                    <SelectItem value="light" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Light (1-7 drinks/week)</SelectItem>
                    <SelectItem value="moderate" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Moderate (8-14 drinks/week)</SelectItem>
                    <SelectItem value="heavy" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Heavy (15+ drinks/week)</SelectItem>
                  </SelectContent>
                </Select>
                </div>
              <div>
                <Label htmlFor="bmiCategory" className="text-sm font-medium text-gray-700 mb-2 block">
                  Body Mass Index (BMI) Category
                </Label>
                <Select value={formData.bmiCategory} onValueChange={(value) => setFormData(prev => ({ ...prev, bmiCategory: value }))}>
                  <SelectTrigger className="border-2 border-gray-400 bg-white text-gray-900 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue placeholder="Select BMI category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-300 shadow-lg max-h-60 overflow-y-auto">
                    <SelectItem value="underweight" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Underweight (&lt; 18.5)</SelectItem>
                    <SelectItem value="normal" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Normal (18.5 - 24.9)</SelectItem>
                    <SelectItem value="overweight" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Overweight (25 - 29.9)</SelectItem>
                    <SelectItem value="obese" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Obese (≥ 30)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">Important for diabetes and other screening recommendations</p>
              </div>
            </div>
          </Card>

          {/* Medical History & Risk Factors */}
          <Card className="p-4 border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Medical History & Risk Factors</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Select all that apply to help us provide accurate screening recommendations.
            </p>

            {/* Personal Medical History */}
            <div className="mb-4">
              <h3 className="text-base font-medium text-gray-900 mb-2">Personal Medical History</h3>
              <div className="grid md:grid-cols-3 gap-1">
                {medicalHistoryOptions.map((option) => (
                  <label key={option} className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.medicalHistory.includes(option) 
                      ? 'border-blue-500 bg-blue-50 shadow-sm' 
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                  }`}>
                    <Checkbox
                      checked={formData.medicalHistory.includes(option)}
                      onCheckedChange={() => handleCheckboxChange('medicalHistory', option)}
                      className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <span className={`text-sm font-medium ${
                      formData.medicalHistory.includes(option) ? 'text-blue-900' : 'text-gray-700'
                    }`}>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reproductive & Hormonal History (Women) */}
            {formData.gender === 'female' && (
              <div className="mb-4">
                <h3 className="text-base font-medium text-gray-900 mb-2">Reproductive & Hormonal History (Women)</h3>
                <div className="grid md:grid-cols-3 gap-1">
                  {reproductiveHistoryOptions.map((option) => (
                    <label key={option} className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.reproductiveHistory.includes(option) 
                        ? 'border-pink-500 bg-pink-50 shadow-sm' 
                        : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                    }`}>
                      <Checkbox
                        checked={formData.reproductiveHistory.includes(option)}
                        onCheckedChange={() => handleCheckboxChange('reproductiveHistory', option)}
                        className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600"
                      />
                      <span className={`text-sm font-medium ${
                        formData.reproductiveHistory.includes(option) ? 'text-pink-900' : 'text-gray-700'
                      }`}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sexual Health & STI History */}
            <div className="mb-4">
              <h3 className="text-base font-medium text-gray-900 mb-2">Sexual Health & STI History</h3>
              <div className="grid md:grid-cols-3 gap-1">
                {sexualHealthOptions.map((option) => (
                  <label key={option} className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.sexualHealth.includes(option) 
                      ? 'border-green-500 bg-green-50 shadow-sm' 
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                  }`}>
                    <Checkbox
                      checked={formData.sexualHealth.includes(option)}
                      onCheckedChange={() => handleCheckboxChange('sexualHealth', option)}
                      className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <span className={`text-sm font-medium ${
                      formData.sexualHealth.includes(option) ? 'text-green-900' : 'text-gray-700'
                    }`}>{option}</span>
                  </label>
                ))}
              </div>
                </div>

            {/* Substance Use History */}
            <div className="mb-4">
              <h3 className="text-base font-medium text-gray-900 mb-2">Substance Use History</h3>
              <div className="grid md:grid-cols-3 gap-1">
                {substanceUseOptions.map((option) => (
                  <label key={option} className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.substanceUse.includes(option) 
                      ? 'border-orange-500 bg-orange-50 shadow-sm' 
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                  }`}>
                    <Checkbox
                      checked={formData.substanceUse.includes(option)}
                      onCheckedChange={() => handleCheckboxChange('substanceUse', option)}
                      className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                    />
                    <span className={`text-sm font-medium ${
                      formData.substanceUse.includes(option) ? 'text-orange-900' : 'text-gray-700'
                    }`}>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Environmental & Occupational Exposures */}
            <div className="mb-4">
              <h3 className="text-base font-medium text-gray-900 mb-2">Environmental & Occupational Exposures</h3>
              <div className="grid md:grid-cols-3 gap-1">
                {environmentalExposuresOptions.map((option) => (
                  <label key={option} className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.environmentalExposures.includes(option) 
                      ? 'border-purple-500 bg-purple-50 shadow-sm' 
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                  }`}>
                    <Checkbox
                      checked={formData.environmentalExposures.includes(option)}
                      onCheckedChange={() => handleCheckboxChange('environmentalExposures', option)}
                      className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <span className={`text-sm font-medium ${
                      formData.environmentalExposures.includes(option) ? 'text-purple-900' : 'text-gray-700'
                    }`}>{option}</span>
                  </label>
                ))}
              </div>
                    </div>

            {/* Mental Health & Social Factors */}
            <div className="mb-4">
              <h3 className="text-base font-medium text-gray-900 mb-2">Mental Health & Social Factors</h3>
              <div className="grid md:grid-cols-3 gap-1">
                {mentalHealthOptions.map((option) => (
                  <label key={option} className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.mentalHealth.includes(option) 
                      ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                  }`}>
                    <Checkbox
                      checked={formData.mentalHealth.includes(option)}
                      onCheckedChange={() => handleCheckboxChange('mentalHealth', option)}
                      className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                    <span className={`text-sm font-medium ${
                      formData.mentalHealth.includes(option) ? 'text-indigo-900' : 'text-gray-700'
                    }`}>{option}</span>
                  </label>
                ))}
                  </div>
                </div>
                
            {/* Current Medications & Therapies */}
            <div className="mb-4">
              <h3 className="text-base font-medium text-gray-900 mb-2">Current Medications & Therapies</h3>
              <div className="grid md:grid-cols-3 gap-1">
                {currentMedicationsOptions.map((option) => (
                  <label key={option} className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.currentMedications.includes(option) 
                      ? 'border-teal-500 bg-teal-50 shadow-sm' 
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                  }`}>
                    <Checkbox
                      checked={formData.currentMedications.includes(option)}
                      onCheckedChange={() => handleCheckboxChange('currentMedications', option)}
                      className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                    />
                    <span className={`text-sm font-medium ${
                      formData.currentMedications.includes(option) ? 'text-teal-900' : 'text-gray-700'
                    }`}>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Family History */}
            <div className="mb-4">
              <h3 className="text-base font-medium text-gray-900 mb-2">Family History</h3>
              <div className="grid md:grid-cols-3 gap-1">
                {familyHistoryOptions.map((option) => (
                  <label key={option} className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.familyHistory.includes(option) 
                      ? 'border-red-500 bg-red-50 shadow-sm' 
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                  }`}>
                    <Checkbox
                      checked={formData.familyHistory.includes(option)}
                      onCheckedChange={() => handleCheckboxChange('familyHistory', option)}
                      className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                    />
                    <span className={`text-sm font-medium ${
                      formData.familyHistory.includes(option) ? 'text-red-900' : 'text-gray-700'
                    }`}>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="text-center">
            <Button 
              type="submit" 
              disabled={isLoading || !formData.age || !formData.gender}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 disabled:bg-gray-300"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing Assessment...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Get Screening Recommendations
                </div>
              )}
            </Button>
            {(!formData.age || !formData.gender) && (
              <p className="text-sm text-gray-500 mt-3">
                Please enter your age and select gender to see screening recommendations.
              </p>
            )}
          </div>
        </form>

        {/* Benefits Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Preventive Care Benefits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Early detection</h3>
              <p className="text-sm text-gray-600">Early detection of health conditions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Reduced costs</h3>
              <p className="text-sm text-gray-600">Reduced healthcare costs over time</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Better outcomes</h3>
              <p className="text-sm text-gray-600">Better long-term health outcomes</p>
                </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Peace of mind</h3>
              <p className="text-sm text-gray-600">Peace of mind and health confidence</p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trusted by Millions</h3>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              USPSTF Grade A & B recommendations
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Clinically validated guidelines
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Regular updates with new research
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Privacy-first approach
              </div>
            </div>
          </div>
        </main>
    </div>
  )
}