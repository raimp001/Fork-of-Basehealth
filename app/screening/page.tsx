"use client"

/**
 * Health Screening - Palantir-Grade Enterprise UI
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  Activity,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Target,
  Shield,
  Lock,
  ChevronRight,
  Sparkles,
  Heart,
  Brain,
  Dna,
} from "lucide-react"

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

const medicalHistoryOptions = [
  "High blood pressure (hypertension)",
  "Diabetes or pre-diabetes",
  "High cholesterol or lipid disorders",
  "Personal history of any cancer",
  "Personal history of colon polyps",
  "Inflammatory bowel disease",
  "Osteoporosis or previous fracture after age 50",
  "HIV positive",
  "Immune suppression",
  "Previous abnormal screening results"
]

const familyHistoryOptions = [
  "Family history of colorectal cancer",
  "Family history of breast or ovarian cancer",
  "Male relative with heart disease before age 55",
  "Female relative with heart disease before age 65",
  "3+ relatives with colorectal cancer (any age)",
  "Family member with colorectal cancer before age 45",
  "Family history of endometrial cancer before age 50"
]

export default function ScreeningPage() {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    smokingStatus: '',
    medicalHistory: [] as string[],
    familyHistory: [] as string[]
  })

  const [recommendations, setRecommendations] = useState<ScreeningRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCheckboxChange = (category: 'medicalHistory' | 'familyHistory', value: string) => {
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
      setError('Please enter your age and select gender.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const riskFactors = [...formData.medicalHistory, ...formData.familyHistory]
      if (formData.smokingStatus === 'current') riskFactors.push('Current smoking')

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
      setError('Failed to process screening. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Results view
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#07070c] text-white">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#07070c]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-black" />
                </div>
                <span className="text-lg font-semibold">BaseHealth</span>
              </Link>
            </div>
          </div>
        </nav>

        <main className="pt-24 pb-20">
          <div className="max-w-4xl mx-auto px-6">
            {/* Success header */}
            <div className={`mb-8 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium mb-6">
                <CheckCircle className="h-3.5 w-3.5" />
                Assessment Complete
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                Your Screening Recommendations
              </h1>
              <p className="text-zinc-400">
                Personalized recommendations based on your health profile and USPSTF guidelines.
              </p>
            </div>

            {/* Profile Summary */}
            <Card className="p-6 bg-white/[0.02] border-white/5 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Profile Summary</div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-mono font-semibold text-white">{formData.age}</div>
                  <div className="text-xs text-zinc-500">Age</div>
                </div>
                <div>
                  <div className="text-2xl font-mono font-semibold text-white capitalize">{formData.gender}</div>
                  <div className="text-xs text-zinc-500">Gender</div>
                </div>
                <div>
                  <div className="text-2xl font-mono font-semibold text-white">{formData.medicalHistory.length + formData.familyHistory.length}</div>
                  <div className="text-xs text-zinc-500">Risk Factors</div>
                </div>
              </div>
            </Card>

            {/* Recommendations */}
            <div className="space-y-4">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-4">
                Recommended Screenings ({recommendations.length})
              </div>
              
              {recommendations.map((rec, index) => (
                <Card 
                  key={rec.id} 
                  className={`p-6 bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-white">{rec.name}</h3>
                        <Badge className={`text-xs font-mono ${
                          rec.grade === 'A' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          rec.grade === 'B' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                          'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        }`}>
                          Grade {rec.grade}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-400 mb-4">{rec.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-zinc-500">Frequency:</span>
                          <span className="text-zinc-300 ml-2">{rec.frequency}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Specialist:</span>
                          <span className="text-zinc-300 ml-2">{rec.specialtyNeeded}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Link
                      href={`/providers/search?query=${encodeURIComponent(rec.specialtyNeeded)}`}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                    >
                      Find Provider
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setIsSubmitted(false)}
                className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Edit Assessment
              </Button>
              <Link href="/providers/search">
                <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
                  Find Healthcare Providers
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Form view
  return (
    <div className="min-h-screen bg-[#07070c] text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#07070c]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-black" />
              </div>
              <span className="text-lg font-semibold">BaseHealth</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/providers/search" className="text-sm text-zinc-400 hover:text-white">
                Find Providers
              </Link>
              <Link href="/clinical-trials" className="text-sm text-zinc-400 hover:text-white">
                Clinical Trials
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          {/* Header */}
          <div className={`text-center mb-12 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-medium mb-6">
              <Brain className="h-3.5 w-3.5" />
              Health Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              Health Screening Assessment
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Get personalized screening recommendations based on USPSTF Grade A & B guidelines. 
              Takes approximately 3 minutes.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 bg-red-500/10 border-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className={`p-6 bg-white/[0.02] border-white/5 ${mounted ? 'animate-fade-in-up animation-delay-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white">Basic Information</h2>
                  <p className="text-xs text-zinc-500">Required fields</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-zinc-400 mb-2 block">Age *</Label>
                  <Input
                    type="number"
                    min="18"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Enter age"
                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-cyan-500/50"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm text-zinc-400 mb-2 block">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f0f17] border-white/10">
                      <SelectItem value="male" className="text-white hover:bg-white/5">Male</SelectItem>
                      <SelectItem value="female" className="text-white hover:bg-white/5">Female</SelectItem>
                      <SelectItem value="other" className="text-white hover:bg-white/5">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-zinc-400 mb-2 block">Smoking Status</Label>
                  <Select value={formData.smokingStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, smokingStatus: value }))}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f0f17] border-white/10">
                      <SelectItem value="never" className="text-white hover:bg-white/5">Never smoked</SelectItem>
                      <SelectItem value="former" className="text-white hover:bg-white/5">Former smoker</SelectItem>
                      <SelectItem value="current" className="text-white hover:bg-white/5">Current smoker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick submit */}
              <div className="mt-6 pt-6 border-t border-white/5">
                <Button
                  type="submit"
                  disabled={isLoading || !formData.age || !formData.gender}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Get Screening Recommendations
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
                {(!formData.age || !formData.gender) && (
                  <p className="text-xs text-zinc-500 mt-2 text-center">
                    Enter age and gender to see recommendations
                  </p>
                )}
              </div>
            </Card>

            {/* Risk Factors */}
            <Card className={`p-6 bg-white/[0.02] border-white/5 ${mounted ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Dna className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white">Risk Factors</h2>
                  <p className="text-xs text-zinc-500">Optional - improves accuracy</p>
                </div>
              </div>

              <Accordion type="multiple" className="space-y-2">
                <AccordionItem value="medical" className="border-white/5 bg-white/[0.02] rounded-lg px-4">
                  <AccordionTrigger className="text-white hover:no-underline py-4">
                    <span className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-rose-400" />
                      Personal Medical History
                      {formData.medicalHistory.length > 0 && (
                        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-xs">
                          {formData.medicalHistory.length} selected
                        </Badge>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="grid md:grid-cols-2 gap-2">
                      {medicalHistoryOptions.map((option) => (
                        <label
                          key={option}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            formData.medicalHistory.includes(option)
                              ? 'bg-cyan-500/10 border border-cyan-500/20'
                              : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04]'
                          }`}
                        >
                          <Checkbox
                            checked={formData.medicalHistory.includes(option)}
                            onCheckedChange={() => handleCheckboxChange('medicalHistory', option)}
                            className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                          />
                          <span className="text-sm text-zinc-300">{option}</span>
                        </label>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="family" className="border-white/5 bg-white/[0.02] rounded-lg px-4">
                  <AccordionTrigger className="text-white hover:no-underline py-4">
                    <span className="flex items-center gap-2">
                      <Dna className="h-4 w-4 text-purple-400" />
                      Family History
                      {formData.familyHistory.length > 0 && (
                        <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                          {formData.familyHistory.length} selected
                        </Badge>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="grid md:grid-cols-2 gap-2">
                      {familyHistoryOptions.map((option) => (
                        <label
                          key={option}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            formData.familyHistory.includes(option)
                              ? 'bg-purple-500/10 border border-purple-500/20'
                              : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04]'
                          }`}
                        >
                          <Checkbox
                            checked={formData.familyHistory.includes(option)}
                            onCheckedChange={() => handleCheckboxChange('familyHistory', option)}
                            className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                          />
                          <span className="text-sm text-zinc-300">{option}</span>
                        </label>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>

            {/* Privacy Notice */}
            <div className={`flex items-start gap-3 p-4 bg-white/[0.02] rounded-lg border border-white/5 ${mounted ? 'animate-fade-in-up animation-delay-300' : 'opacity-0'}`}>
              <Shield className="h-5 w-5 text-cyan-400 mt-0.5" />
              <div>
                <p className="text-sm text-zinc-300">Your data is encrypted and HIPAA compliant</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Health information is never shared with employers or insurers.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !formData.age || !formData.gender}
              className="w-full py-6 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing Your Health Profile...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Get Personalized Recommendations
                </>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
