"use client"

/**
 * Health Screening - Palantir-Inspired Design
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { Activity, ArrowRight, ArrowLeft, Loader2, CheckCircle, ChevronDown } from "lucide-react"

interface ScreeningRecommendation {
  id: string
  name: string
  description: string
  frequency: string
  specialtyNeeded: string
  grade: string
}

export default function ScreeningPage() {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    smokingStatus: '',
  })

  const [recommendations, setRecommendations] = useState<ScreeningRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.age || !formData.gender) {
      setError('Please enter your age and select gender.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        age: formData.age,
        gender: formData.gender,
        riskFactors: formData.smokingStatus === 'current' ? 'Current smoking' : ''
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
      <div className="min-h-screen bg-black text-white">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-black" />
                </div>
                <span className="text-xl font-medium">BaseHealth</span>
              </Link>
            </div>
          </div>
        </nav>

        <main className="pt-32 pb-24">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className={`mb-12 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium mb-6">
                <CheckCircle className="h-4 w-4" />
                Assessment Complete
              </div>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
                Your Screening Recommendations
              </h1>
              <p className="text-xl text-neutral-400">
                Based on your profile and USPSTF guidelines.
              </p>
            </div>

            {/* Profile Summary */}
            <div className="p-6 bg-neutral-950 border border-white/5 rounded-2xl mb-8">
              <p className="text-sm text-neutral-500 uppercase tracking-wider mb-4">Profile Summary</p>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-medium">{formData.age}</p>
                  <p className="text-neutral-500">Age</p>
                </div>
                <div>
                  <p className="text-3xl font-medium capitalize">{formData.gender}</p>
                  <p className="text-neutral-500">Gender</p>
                </div>
                <div>
                  <p className="text-3xl font-medium">{recommendations.length}</p>
                  <p className="text-neutral-500">Recommendations</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div 
                  key={rec.id} 
                  className={`p-6 bg-neutral-950 border border-white/5 rounded-2xl hover:border-white/10 transition-all ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-medium">{rec.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          rec.grade === 'A' ? 'bg-green-500/10 text-green-400' :
                          rec.grade === 'B' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-neutral-500/10 text-neutral-400'
                        }`}>
                          Grade {rec.grade}
                        </span>
                      </div>
                      <p className="text-neutral-400 mb-4">{rec.description}</p>
                      <div className="flex gap-6 text-sm text-neutral-500">
                        <span>Frequency: {rec.frequency}</span>
                        <span>Specialist: {rec.specialtyNeeded}</span>
                      </div>
                    </div>
                    <Link
                      href={`/providers/search?query=${encodeURIComponent(rec.specialtyNeeded)}`}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      Find Provider
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-3 text-white border border-white/20 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Edit Assessment
              </button>
              <Link
                href="/providers/search"
                className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                Find Healthcare Providers
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
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-medium">BaseHealth</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/providers/search" className="text-sm text-neutral-400 hover:text-white transition-colors">
                Find Providers
              </Link>
              <Link href="/clinical-trials" className="text-sm text-neutral-400 hover:text-white transition-colors">
                Clinical Trials
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <div className={`text-center mb-16 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-6">
              Health Screening
              <br />
              <span className="text-neutral-500">Assessment</span>
            </h1>
            <p className="text-xl text-neutral-400 max-w-xl mx-auto">
              Get personalized screening recommendations based on USPSTF guidelines.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={`space-y-8 ${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
            <div className="p-8 bg-neutral-950 border border-white/5 rounded-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Age *</label>
                <input
                  type="number"
                  min="18"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Enter your age"
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Gender *</label>
                <div className="relative">
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white appearance-none focus:outline-none focus:border-white/30 transition-colors"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Smoking Status</label>
                <div className="relative">
                  <select
                    value={formData.smokingStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, smokingStatus: e.target.value }))}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white appearance-none focus:outline-none focus:border-white/30 transition-colors"
                  >
                    <option value="">Select status</option>
                    <option value="never">Never smoked</option>
                    <option value="former">Former smoker</option>
                    <option value="current">Current smoker</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.age || !formData.gender}
              className="w-full py-4 bg-white text-black text-lg font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Get Recommendations
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-600">
            Your data is encrypted and HIPAA compliant. We never share your health information.
          </p>
        </div>
      </main>
    </div>
  )
}
