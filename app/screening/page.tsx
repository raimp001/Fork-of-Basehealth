"use client"

/**
 * Health Screening Assessment - Claude.ai Design
 * 
 * Flow: Form (4 steps) → Pay $0.25 → Get USPSTF Recommendations
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  ArrowRight, ArrowLeft, Loader2, CheckCircle, 
  AlertCircle, Shield, Heart, Brain, User, CreditCard, X, Lock
} from "lucide-react"
import { BasePayCheckout } from "@/components/checkout/base-pay-checkout"

const ASSESSMENT_FEE_USD = 0.25

interface ScreeningRecommendation {
  id: string
  name: string
  description: string
  frequency: string
  grade: string
  importance: string
  primaryProvider: string
  alternativeProviders: string[]
  canBeDoneBy: 'primary' | 'specialist' | 'either'
  providerNote: string
}

interface RiskProfile {
  factors: string[]
  level: 'low' | 'moderate' | 'elevated'
}

interface ClinicalReviewFlag {
  id: string
  title: string
  why: string
  nextStep: string
}

interface Summary {
  totalScreenings: number
  gradeACount: number
  gradeBCount: number
  primaryCareScreenings: number
  specialistReferralsNeeded: number
  specialistsNeeded: string[]
}

export default function ScreeningPage() {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<ScreeningRecommendation[]>([])
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [clinicalReviewFlags, setClinicalReviewFlags] = useState<ClinicalReviewFlag[]>([])
  const [personalizationNotes, setPersonalizationNotes] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    smokingStatus: '',
    bmiCategory: '',
    isPregnant: false,
    sexuallyActive: false,
    medicalHistory: [] as string[],
    familyHistory: [] as string[],
    additionalContext: '',
  })
  
  // Payment state - fee required before showing recommendations
  const [hasPaid, setHasPaid] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [screeningOrderId, setScreeningOrderId] = useState(() => `screening-assessment-${Date.now()}`)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Steps: 1-4 = Form, 5 = Payment, 6 = Results
  const totalSteps = 4

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item]
  }

  // After form is complete, show payment modal
  const handleFormComplete = () => {
    setScreeningOrderId(`screening-assessment-${Date.now()}`)
    setShowPaymentModal(true)
  }

  // After payment is successful, fetch recommendations
  const handlePaymentSuccess = async () => {
    setHasPaid(true)
    setShowPaymentModal(false)
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/screening/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setRecommendations(data.recommendations || [])
        setRiskProfile(data.riskProfile || null)
        setSummary(data.summary || null)
        setClinicalReviewFlags(Array.isArray(data.clinicalReviewFlags) ? data.clinicalReviewFlags : [])
        setPersonalizationNotes(Array.isArray(data.personalizationNotes) ? data.personalizationNotes : [])
        setStep(5) // Show results
      } else {
        setError(data.error || 'Failed to get recommendations')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return formData.age && formData.gender
      case 2: return true
      case 3: return true
      case 4: return true
      default: return true
    }
  }

  // Results view
  if (step === 5) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-10">
          <header className={`mb-8 ${mounted ? "animate-fade-in-up" : "opacity-0"}`}>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-semibold text-foreground">
                <CheckCircle className="h-4 w-4" />
                Assessment complete
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-semibold text-foreground">
                <CreditCard className="h-4 w-4" />
                Paid
              </div>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Your screening recommendations</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Based on USPSTF Grade A &amp; B guidelines for your profile.
            </p>
          </header>

          {riskProfile && (
            <section className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Risk profile</h2>
                <span className="text-sm text-muted-foreground capitalize">{riskProfile.level}</span>
              </div>
              {riskProfile.factors.length > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Identified factors: {riskProfile.factors.slice(0, 5).join(", ")}
                </p>
              )}
            </section>
          )}

          {clinicalReviewFlags.length > 0 && (
            <section className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-semibold text-foreground">Needs clinician review</h2>
              </div>
              <div className="mt-3 space-y-3">
                {clinicalReviewFlags.map((flag) => (
                  <div key={flag.id} className="rounded-lg border border-amber-500/30 bg-background/80 p-3">
                    <p className="text-sm font-semibold text-foreground">{flag.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{flag.why}</p>
                    <p className="mt-1 text-xs text-foreground">{flag.nextStep}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {personalizationNotes.length > 0 && (
            <section className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">Personalization notes</h2>
              <div className="mt-3 space-y-2">
                {personalizationNotes.map((note, idx) => (
                  <p key={`${note}-${idx}`} className="text-sm text-muted-foreground">
                    • {note}
                  </p>
                ))}
              </div>
            </section>
          )}

          <section className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your profile</p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-2xl font-semibold text-foreground">{formData.age}</p>
                <p className="text-sm text-muted-foreground">Age</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground capitalize">{formData.gender}</p>
                <p className="text-sm text-muted-foreground">Sex</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{recommendations.length}</p>
                <p className="text-sm text-muted-foreground">Screenings</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {recommendations.filter((r) => r.grade === "A").length}
                </p>
                <p className="text-sm text-muted-foreground">Grade A</p>
              </div>
            </div>
          </section>

          {recommendations.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-foreground">Recommended screenings</h2>
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={`rounded-xl border border-border bg-card p-5 shadow-sm ${mounted ? "animate-fade-in-up" : "opacity-0"}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">{rec.name}</h3>
                        <span className="inline-flex items-center rounded-full border border-border bg-muted/30 px-2 py-0.5 text-xs font-semibold text-foreground">
                          Grade {rec.grade}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground">{rec.description}</p>

                      <div className="rounded-lg border border-border bg-muted/20 p-3">
                        <p className="text-sm text-foreground">
                          <span className="font-semibold">Provider:</span> {rec.primaryProvider}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{rec.providerNote}</p>
                      </div>

                      <p className="text-xs text-muted-foreground">Frequency: {rec.frequency}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/providers/search?query=${encodeURIComponent(rec.primaryProvider)}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        Find provider
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/appointment/book?screening=${encodeURIComponent(rec.name)}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60"
                      >
                        <CreditCard className="h-4 w-4" />
                        Book appointment
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          ) : (
            <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/30">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">No urgent screenings required</h2>
              <p className="mt-2 text-sm text-muted-foreground">Continue maintaining your health with regular check-ups.</p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60"
            >
              <ArrowLeft className="h-5 w-5" />
              Start over
            </button>
            <Link
              href="/providers/search"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              Find care
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // Form view
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-xl px-4 sm:px-6 py-10">
        <header className={`text-center mb-8 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Health screening assessment</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Get personalized USPSTF Grade A &amp; B recommendations.
          </p>
        </header>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
            <span>
              Step {step} of {totalSteps}
            </span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden bg-muted">
            <div
              className="h-full bg-foreground transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div className={`${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
            {/* Step 1: Basic Info */}
	            {step === 1 && (
	              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
	                <div className="flex items-start gap-3 mb-2">
	                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/40">
	                    <User className="h-4 w-4 text-muted-foreground" />
	                  </div>
	                  <div>
	                    <h2 className="text-base font-semibold">Basic information</h2>
	                    <p className="text-sm text-muted-foreground">Tell us about yourself</p>
	                  </div>
	                </div>

                <div>
	                  <label className="block text-sm font-semibold text-foreground mb-2">Age *</label>
	                  <input
	                    type="number"
	                    min="18"
	                    max="120"
	                    value={formData.age}
	                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
	                    placeholder="Enter your age"
	                    className="w-full h-11 px-4 rounded-lg border border-input bg-background text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
	                    required
	                  />
	                </div>

                <div>
	                  <label className="block text-sm font-semibold text-foreground mb-2">Biological sex *</label>
	                  <div className="grid grid-cols-2 gap-3">
	                    {['male', 'female'].map((g) => (
	                      <button
	                        key={g}
	                        type="button"
	                        onClick={() => setFormData(prev => ({ ...prev, gender: g }))}
	                        className={`h-11 rounded-lg border px-3 text-sm font-semibold transition-colors ${
	                          formData.gender === g
	                            ? "border-foreground bg-foreground text-background"
	                            : "border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground"
	                        }`}
	                      >
	                        <span className="capitalize font-medium">{g}</span>
	                      </button>
	                    ))}
	                  </div>
	                </div>

	                {formData.gender === 'female' && (
	                  <div>
	                    <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/40">
	                      <input
	                        type="checkbox"
	                        checked={formData.isPregnant}
	                        onChange={(e) => setFormData(prev => ({ ...prev, isPregnant: e.target.checked }))}
	                        className="h-4 w-4 rounded border-border"
	                      />
	                      <span>I am currently pregnant or planning pregnancy</span>
	                    </label>
	                  </div>
	                )}
	              </div>
	            )}

	            {/* Step 2: Lifestyle */}
	            {step === 2 && (
	              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
	                <div className="flex items-start gap-3 mb-2">
	                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/40">
	                    <Heart className="h-4 w-4 text-muted-foreground" />
	                  </div>
	                  <div>
	                    <h2 className="text-base font-semibold">Lifestyle</h2>
	                    <p className="text-sm text-muted-foreground">These affect your screening needs</p>
	                  </div>
	                </div>

                <div>
	                  <label className="block text-sm font-semibold text-foreground mb-2">Smoking status</label>
	                  <div className="space-y-2">
                    {[
                      { value: 'never', label: 'Never smoked' },
                      { value: 'former', label: 'Former smoker (quit)' },
                      { value: 'current', label: 'Current smoker' },
                    ].map((option) => (
	                      <button
	                        key={option.value}
	                        type="button"
	                        onClick={() => setFormData(prev => ({ ...prev, smokingStatus: option.value }))}
	                        className={`w-full rounded-lg border px-3 py-3 text-left text-sm font-medium transition-colors ${
	                          formData.smokingStatus === option.value
	                            ? "border-foreground bg-muted text-foreground"
	                            : "border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground"
	                        }`}
	                      >
	                        {option.label}
	                      </button>
                    ))}
                  </div>
                </div>

                <div>
	                  <label className="block text-sm font-semibold text-foreground mb-2">Body mass index (BMI)</label>
	                  <div className="space-y-2">
                    {[
                      { value: 'normal', label: 'Normal weight (BMI < 25)' },
                      { value: 'overweight', label: 'Overweight (BMI 25-29.9)' },
                      { value: 'obese', label: 'Obese (BMI 30+)' },
                    ].map((option) => (
	                      <button
	                        key={option.value}
	                        type="button"
	                        onClick={() => setFormData(prev => ({ ...prev, bmiCategory: option.value }))}
	                        className={`w-full rounded-lg border px-3 py-3 text-left text-sm font-medium transition-colors ${
	                          formData.bmiCategory === option.value
	                            ? "border-foreground bg-muted text-foreground"
	                            : "border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground"
	                        }`}
	                      >
	                        {option.label}
	                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

	            {/* Step 3: Medical History */}
	            {step === 3 && (
	              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
	                <div className="flex items-start gap-3 mb-2">
	                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/40">
	                    <Brain className="h-4 w-4 text-muted-foreground" />
	                  </div>
	                  <div>
	                    <h2 className="text-base font-semibold">Medical history</h2>
	                    <p className="text-sm text-muted-foreground">Select any conditions you have</p>
	                  </div>
	                </div>

                <div className="space-y-2">
                  {[
                    { value: 'hypertension', label: 'High Blood Pressure (Hypertension)' },
                    { value: 'diabetes', label: 'Diabetes or Prediabetes' },
                    { value: 'high-cholesterol', label: 'High Cholesterol' },
                    { value: 'heart-disease', label: 'Heart Disease' },
                    { value: 'cancer-history', label: 'Personal History of Cancer' },
                    { value: 'depression', label: 'Depression or Anxiety' },
	                  ].map((condition) => (
	                    <button
	                      key={condition.value}
	                      type="button"
	                      onClick={() => setFormData(prev => ({
	                        ...prev,
	                        medicalHistory: toggleArrayItem(prev.medicalHistory, condition.value)
	                      }))}
	                      className={`w-full rounded-lg border px-3 py-3 text-left text-sm font-medium transition-colors flex items-center justify-between ${
	                        formData.medicalHistory.includes(condition.value)
	                          ? "border-foreground bg-muted text-foreground"
	                          : "border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground"
	                      }`}
	                    >
	                      {condition.label}
	                      {formData.medicalHistory.includes(condition.value) && (
	                        <CheckCircle className="h-5 w-5 text-foreground" />
	                      )}
	                    </button>
	                  ))}
	                </div>

	                <p className="text-sm text-center text-muted-foreground">
	                  Select all that apply, or skip if none
	                </p>
	              </div>
	            )}

	            {/* Step 4: Family History + Additional Context */}
	            {step === 4 && (
	              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
	                <div className="flex items-start gap-3 mb-2">
	                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/40">
	                    <Shield className="h-4 w-4 text-muted-foreground" />
	                  </div>
	                  <div>
	                    <h2 className="text-base font-semibold">Family history</h2>
	                    <p className="text-sm text-muted-foreground">Conditions in immediate family members</p>
	                  </div>
	                </div>

                <div className="space-y-2">
                  {[
                    { value: 'cancer', label: 'Cancer (any type)' },
                    { value: 'heart-disease', label: 'Heart Disease' },
                    { value: 'diabetes', label: 'Diabetes' },
                    { value: 'stroke', label: 'Stroke' },
                    { value: 'hypertension', label: 'High Blood Pressure' },
	                  ].map((condition) => (
	                    <button
	                      key={condition.value}
	                      type="button"
	                      onClick={() => setFormData(prev => ({
	                        ...prev,
	                        familyHistory: toggleArrayItem(prev.familyHistory, condition.value)
	                      }))}
	                      className={`w-full rounded-lg border px-3 py-3 text-left text-sm font-medium transition-colors flex items-center justify-between ${
	                        formData.familyHistory.includes(condition.value)
	                          ? "border-foreground bg-muted text-foreground"
	                          : "border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground"
	                      }`}
	                    >
	                      {condition.label}
	                      {formData.familyHistory.includes(condition.value) && (
	                        <CheckCircle className="h-5 w-5 text-foreground" />
	                      )}
	                    </button>
	                  ))}
	                </div>

	                <p className="text-sm text-center text-muted-foreground">
	                  Select all that apply, or skip if none
	                </p>

                  <div className="border-t border-border pt-4">
                    <label className="block text-sm font-semibold text-foreground mb-2">Additional context (optional)</label>
                    <textarea
                      value={formData.additionalContext}
                      onChange={(e) => setFormData((prev) => ({ ...prev, additionalContext: e.target.value }))}
                      rows={5}
                      maxLength={1200}
                      placeholder="Example: My sister tested BRCA1 positive. I had chest radiation for Hodgkin lymphoma at age 22. Prior abnormal mammogram in 2023."
                      className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Add anything important that might change screening timing or modality. We will flag items for clinician review.
                    </p>
                  </div>

	                {/* Payment notice */}
	                <div className="rounded-lg border border-border bg-muted/20 p-4">
	                  <div className="flex items-start gap-3">
	                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background">
	                      <Lock className="h-4 w-4 text-primary" />
	                    </div>
	                    <div>
	                      <p className="text-sm font-semibold text-foreground">${ASSESSMENT_FEE_USD.toFixed(2)} assessment fee</p>
	                      <p className="mt-1 text-xs text-muted-foreground">
	                        One-time payment to unlock your personalized USPSTF screening recommendations
	                      </p>
	                    </div>
	                  </div>
	                </div>
              </div>
            )}

	            {/* Navigation Buttons */}
	            <div className="flex gap-4 mt-6">
	              {step > 1 && (
	                <button
	                  onClick={() => setStep(step - 1)}
	                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60"
	                >
	                  <ArrowLeft className="h-5 w-5" />
	                  Back
	                </button>
	              )}
              
	              {step < totalSteps ? (
	                <button
	                  onClick={() => setStep(step + 1)}
	                  disabled={!canProceed()}
	                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
	                >
	                  Continue
	                  <ArrowRight className="h-5 w-5" />
	                </button>
	              ) : (
	                <button
	                  onClick={handleFormComplete}
	                  disabled={isLoading}
	                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
	                >
	                  {isLoading ? (
	                    <>
	                      <Loader2 className="h-5 w-5 animate-spin" />
	                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pay ${ASSESSMENT_FEE_USD.toFixed(2)} & Get Recommendations
                    </>
                  )}
                </button>
              )}
	            </div>
	          
	            <p className="mt-6 text-center text-xs text-muted-foreground">
	              Avoid entering personal identifiers. This tool provides general information, not a medical diagnosis.
	            </p>
	          </div>
	      </main>

	      {/* Payment Modal - Required before showing recommendations */}
	      {showPaymentModal && (
	        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
	          <div className="relative w-full max-w-md">
	            <button
	              onClick={() => setShowPaymentModal(false)}
	              className="absolute -top-10 right-0 p-2 rounded-full text-white/90 transition-colors hover:text-white"
	              aria-label="Close payment"
	            >
	              <X className="h-6 w-6" />
	            </button>
            <BasePayCheckout
              amount={ASSESSMENT_FEE_USD}
              serviceName="Screening Assessment"
              serviceDescription="USPSTF Grade A & B personalized recommendations based on your health profile"
              providerName="BaseHealth"
              orderId={screeningOrderId}
              providerId="screening-assessment"
              collectEmail={false}
              onSuccess={handlePaymentSuccess}
              onError={(_error) => {}}
            />
          </div>
        </div>
      )}
    </div>
  )
}
