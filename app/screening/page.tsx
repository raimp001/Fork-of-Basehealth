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
  
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    smokingStatus: '',
    bmiCategory: '',
    isPregnant: false,
    sexuallyActive: false,
    medicalHistory: [] as string[],
    familyHistory: [] as string[],
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
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <main className="py-8">
          <div className="max-w-3xl mx-auto px-6">
            {/* Header */}
            <div className={`mb-10 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgba(107, 155, 107, 0.15)', color: '#6b9b6b' }}>
                  <CheckCircle className="h-4 w-4" />
                  Assessment Complete
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgba(0, 82, 255, 0.1)', color: '#0052FF' }}>
                  <CreditCard className="h-4 w-4" />
                  Paid
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-normal tracking-tight mb-3">
                Your Screening Recommendations
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                Based on USPSTF Grade A & B guidelines for your profile.
              </p>
            </div>

            {/* Risk Profile */}
            {riskProfile && (
              <div className="p-5 mb-6 rounded-xl border" style={{ 
                backgroundColor: riskProfile.level === 'elevated' ? 'rgba(212, 165, 116, 0.1)' : 'rgba(107, 155, 107, 0.1)',
                borderColor: riskProfile.level === 'elevated' ? 'rgba(212, 165, 116, 0.2)' : 'rgba(107, 155, 107, 0.2)'
              }}>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-5 w-5" style={{ color: riskProfile.level === 'elevated' ? 'hsl(var(--accent))' : '#6b9b6b' }} />
                  <h3 className="font-medium">Risk Profile: <span className="capitalize">{riskProfile.level}</span></h3>
                </div>
                {riskProfile.factors.length > 0 && (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Identified factors: {riskProfile.factors.slice(0, 5).join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Profile Summary */}
            <div className="p-5 rounded-xl border mb-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <p className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Your Profile</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-2xl font-medium">{formData.age}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Age</p>
                </div>
                <div>
                  <p className="text-2xl font-medium capitalize">{formData.gender}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Gender</p>
                </div>
                <div>
                  <p className="text-2xl font-medium">{recommendations.length}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Screenings</p>
                </div>
                <div>
                  <p className="text-2xl font-medium">{recommendations.filter(r => r.grade === 'A').length}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Priority</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-xl font-medium mb-4">Recommended Screenings</h2>
                {recommendations.map((rec, index) => (
                  <div 
                    key={rec.id} 
                    className={`p-5 rounded-xl border transition-all ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <h3 className="text-lg font-medium">{rec.name}</h3>
                          <span className="px-2 py-0.5 text-xs font-medium rounded" style={{ 
                            backgroundColor: rec.grade === 'A' ? 'rgba(107, 155, 107, 0.15)' : 'rgba(212, 165, 116, 0.15)',
                            color: rec.grade === 'A' ? '#6b9b6b' : 'hsl(var(--accent))'
                          }}>
                            Grade {rec.grade}
                          </span>
                        </div>
                        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{rec.description}</p>
                        
                        <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <strong>Provider:</strong> {rec.primaryProvider}
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{rec.providerNote}</p>
                        </div>

                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>📅 {rec.frequency}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/providers/search?query=${encodeURIComponent(rec.primaryProvider)}`}
                          className="px-4 py-2 font-medium rounded-lg text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
                          style={{ backgroundColor: '#0052FF', color: 'white' }}
                        >
                          Find Provider
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/appointment/book?screening=${encodeURIComponent(rec.name)}`}
                          className="px-4 py-2 font-medium rounded-lg text-sm transition-colors flex items-center gap-2 whitespace-nowrap border"
                          style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
                        >
                          <CreditCard className="h-4 w-4" />
                          Book Appointment
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl border text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: '#6b9b6b' }} />
                <h3 className="text-xl font-medium mb-2">No Urgent Screenings Required</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Continue maintaining your health with regular check-ups.
                </p>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 border"
                style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
              >
                <ArrowLeft className="h-5 w-5" />
                Start Over
              </button>
              <Link
                href="/providers/search"
                className="px-5 py-2.5 font-medium rounded-lg transition-colors flex items-center gap-2"
                style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
              >
                Find Providers
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </main>

      </div>
    )
  }

  // Form view
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <main className="py-8">
        <div className="max-w-xl mx-auto px-6">
          {/* Header */}
          <div className={`text-center mb-10 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">Health screening assessment</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Personalized USPSTF Grade A & B recommendations.
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Step {step} of {totalSteps}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div 
                className="h-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%`, backgroundColor: 'hsl(var(--accent))' }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'rgba(220, 100, 100, 0.1)', color: '#dc6464', border: '1px solid rgba(220, 100, 100, 0.2)' }}>
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          <div className={`${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="p-5 rounded-xl border space-y-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <User className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Basic Information</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tell us about yourself</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Age *</label>
                  <input
                    type="number"
                    min="18"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Enter your age"
                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-colors"
                    style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Biological Sex *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['male', 'female'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, gender: g }))}
                        className="px-3 py-2.5 border rounded-lg text-center transition-all"
                        style={formData.gender === g ? { 
                          backgroundColor: 'rgba(212, 165, 116, 0.1)', 
                          borderColor: 'hsl(var(--accent))',
                          color: 'var(--text-primary)'
                        } : { 
                          borderColor: 'var(--border-medium)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <span className="capitalize font-medium">{g}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {formData.gender === 'female' && (
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg transition-colors" style={{ borderColor: 'var(--border-medium)' }}>
                      <input
                        type="checkbox"
                        checked={formData.isPregnant}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPregnant: e.target.checked }))}
                        className="w-5 h-5 rounded"
                      />
                      <span>I am currently pregnant or planning pregnancy</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Lifestyle */}
            {step === 2 && (
              <div className="p-5 rounded-xl border space-y-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <Heart className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Lifestyle Factors</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>These affect your screening needs</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Smoking Status</label>
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
                        className="w-full p-3 border rounded-lg text-left transition-all"
                        style={formData.smokingStatus === option.value ? { 
                          backgroundColor: 'rgba(212, 165, 116, 0.1)', 
                          borderColor: 'hsl(var(--accent))',
                          color: 'var(--text-primary)'
                        } : { 
                          borderColor: 'var(--border-medium)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Body Mass Index (BMI)</label>
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
                        className="w-full p-3 border rounded-lg text-left transition-all"
                        style={formData.bmiCategory === option.value ? { 
                          backgroundColor: 'rgba(212, 165, 116, 0.1)', 
                          borderColor: 'hsl(var(--accent))',
                          color: 'var(--text-primary)'
                        } : { 
                          borderColor: 'var(--border-medium)',
                          color: 'var(--text-secondary)'
                        }}
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
              <div className="p-5 rounded-xl border space-y-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <Brain className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Medical History</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select any conditions you have</p>
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
                      className="w-full p-3 border rounded-lg text-left transition-all flex items-center justify-between"
                      style={formData.medicalHistory.includes(condition.value) ? { 
                        backgroundColor: 'rgba(212, 165, 116, 0.1)', 
                        borderColor: 'hsl(var(--accent))',
                        color: 'var(--text-primary)'
                      } : { 
                        borderColor: 'var(--border-medium)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {condition.label}
                      {formData.medicalHistory.includes(condition.value) && (
                        <CheckCircle className="h-5 w-5" style={{ color: '#6b9b6b' }} />
                      )}
                    </button>
                  ))}
                </div>

                <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                  Select all that apply, or skip if none
                </p>
              </div>
            )}

            {/* Step 4: Family History */}
            {step === 4 && (
              <div className="p-5 rounded-xl border space-y-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <Shield className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Family History</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Conditions in immediate family members</p>
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
                      className="w-full p-3 border rounded-lg text-left transition-all flex items-center justify-between"
                      style={formData.familyHistory.includes(condition.value) ? { 
                        backgroundColor: 'rgba(212, 165, 116, 0.1)', 
                        borderColor: 'hsl(var(--accent))',
                        color: 'var(--text-primary)'
                      } : { 
                        borderColor: 'var(--border-medium)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {condition.label}
                      {formData.familyHistory.includes(condition.value) && (
                        <CheckCircle className="h-5 w-5" style={{ color: '#6b9b6b' }} />
                      )}
                    </button>
                  ))}
                </div>

                <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                  Select all that apply, or skip if none
                </p>

                {/* Payment notice */}
                <div className="p-3 rounded-lg border" style={{ backgroundColor: 'rgba(0, 82, 255, 0.05)', borderColor: 'rgba(0, 82, 255, 0.2)' }}>
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5" style={{ color: '#0052FF' }} />
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        ${ASSESSMENT_FEE_USD.toFixed(2)} Assessment Fee
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
                  className="px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 border"
                  style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </button>
              )}
              
              {step < totalSteps ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="flex-1 py-2.5 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                >
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={handleFormComplete}
                  disabled={isLoading}
                  className="flex-1 py-2.5 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#0052FF', color: 'white' }}
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
          
            <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Your data is encrypted and HIPAA compliant. We never share your health information.
            </p>
          </div>
        </div>
      </main>

      {/* Payment Modal - Required before showing recommendations */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute -top-10 right-0 p-2 rounded-full transition-colors"
              style={{ color: 'white' }}
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
