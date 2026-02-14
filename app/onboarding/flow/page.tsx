"use client"

/**
 * BaseHealth Onboarding Flow
 * A guided experience for new users to set up their health profile
 */

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  User,
  MapPin,
  Shield,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Activity,
  FlaskConical,
  Search,
  Bell,
  Calendar
} from "lucide-react"

interface OnboardingData {
  // Step 1: Intent
  intent: string
  
  // Step 2: Basic Info
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  
  // Step 3: Location
  zipCode: string
  state: string
  
  // Step 4: Health Priorities
  healthPriorities: string[]
  
  // Step 5: Preferences
  notificationPreferences: {
    appointments: boolean
    screenings: boolean
    trials: boolean
    tips: boolean
  }
}

const INTENTS = [
  { 
    id: "screening", 
    icon: Activity, 
    title: "Get health screenings",
    description: "Find out which preventive tests you need",
    color: "bg-blue-500"
  },
  { 
    id: "provider", 
    icon: Search, 
    title: "Find a doctor",
    description: "Search for specialists and primary care",
    color: "bg-green-500"
  },
  { 
    id: "trial", 
    icon: FlaskConical, 
    title: "Join clinical trials",
    description: "Find research studies that match your profile",
    color: "bg-purple-500"
  },
  { 
    id: "explore", 
    icon: Sparkles, 
    title: "Just exploring",
    description: "I want to see what BaseHealth offers",
    color: "bg-amber-500"
  },
]

const HEALTH_PRIORITIES = [
  { id: "heart", label: "Heart Health", icon: "❤️" },
  { id: "cancer", label: "Cancer Prevention", icon: "🎗️" },
  { id: "diabetes", label: "Diabetes Management", icon: "💉" },
  { id: "mental", label: "Mental Health", icon: "🧠" },
  { id: "weight", label: "Weight Management", icon: "⚖️" },
  { id: "fitness", label: "Fitness & Exercise", icon: "🏃" },
  { id: "sleep", label: "Sleep Quality", icon: "😴" },
  { id: "nutrition", label: "Nutrition", icon: "🥗" },
  { id: "aging", label: "Healthy Aging", icon: "🌟" },
  { id: "women", label: "Women's Health", icon: "👩" },
  { id: "men", label: "Men's Health", icon: "👨" },
  { id: "chronic", label: "Chronic Conditions", icon: "📋" },
]

const STEPS = [
  { id: 1, title: "Welcome", subtitle: "What brings you here?" },
  { id: 2, title: "About You", subtitle: "Basic information" },
  { id: 3, title: "Location", subtitle: "Find care near you" },
  { id: 4, title: "Priorities", subtitle: "Your health focus" },
  { id: 5, title: "Notifications", subtitle: "Stay informed" },
]

export default function OnboardingFlowPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const [data, setData] = useState<OnboardingData>({
    intent: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    zipCode: "",
    state: "",
    healthPriorities: [],
    notificationPreferences: {
      appointments: true,
      screenings: true,
      trials: false,
      tips: true,
    }
  })

  useEffect(() => {
    setMounted(true)
    // Check if user has already completed onboarding
    const completed = localStorage.getItem('onboarding_completed')
    if (completed === 'true') {
      router.push('/patient-portal')
    }
  }, [router])

  const progress = (currentStep / STEPS.length) * 100

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(prev => prev + 1)
        setIsAnimating(false)
      }, 200)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(prev => prev - 1)
        setIsAnimating(false)
      }, 200)
    }
  }

  const completeOnboarding = () => {
    // Save onboarding data
    localStorage.setItem('onboarding_completed', 'true')
    localStorage.setItem('onboarding_data', JSON.stringify(data))
    localStorage.setItem('patient_authenticated', 'true')
    
    // Redirect based on intent
    switch (data.intent) {
      case 'screening':
        router.push('/screening')
        break
      case 'provider':
        router.push('/providers/search')
        break
      case 'trial':
        router.push('/clinical-trials')
        break
      default:
        router.push('/patient-portal')
    }
  }

  const togglePriority = (id: string) => {
    setData(prev => ({
      ...prev,
      healthPriorities: prev.healthPriorities.includes(id)
        ? prev.healthPriorities.filter(p => p !== id)
        : [...prev.healthPriorities, id]
    }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!data.intent
      case 2:
        return !!data.firstName && !!data.gender
      case 3:
        return !!data.zipCode
      case 4:
        return data.healthPriorities.length > 0
      case 5:
        return true
      default:
        return false
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-rose-50/30">
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="rounded-2xl border border-stone-200 bg-white/70 backdrop-blur p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-stone-600">
              Step {currentStep} of {STEPS.length}
            </span>
            <button
              onClick={() => router.push("/")}
              className="text-sm text-stone-500 hover:text-stone-700"
            >
              Skip for now
            </button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <main className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Step Title */}
          <div className={`text-center mb-8 transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2">
              {STEPS[currentStep - 1].title}
            </h1>
            <p className="text-lg text-stone-600">
              {STEPS[currentStep - 1].subtitle}
            </p>
          </div>

          {/* Step Content */}
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}>
            
            {/* Step 1: Intent Selection */}
            {currentStep === 1 && (
              <div className="grid gap-4">
                {INTENTS.map((intent) => (
                  <button
                    key={intent.id}
                    onClick={() => setData(prev => ({ ...prev, intent: intent.id }))}
                    className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                      data.intent === intent.id
                        ? 'border-stone-900 bg-stone-50 shadow-lg'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${intent.color} rounded-xl flex items-center justify-center`}>
                        <intent.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-stone-900">{intent.title}</h3>
                        <p className="text-stone-600">{intent.description}</p>
                      </div>
                      {data.intent === intent.id && (
                        <div className="w-6 h-6 bg-stone-900 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Basic Information */}
            {currentStep === 2 && (
              <Card className="p-8 border-2 border-stone-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">Personal Information</h3>
                    <p className="text-sm text-stone-600">This helps us personalize your experience</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-stone-700">First Name *</Label>
                      <Input
                        value={data.firstName}
                        onChange={(e) => setData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter your first name"
                        className="mt-1.5 h-11 border-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-stone-700">Last Name</Label>
                      <Input
                        value={data.lastName}
                        onChange={(e) => setData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter your last name"
                        className="mt-1.5 h-11 border-2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-stone-700">Date of Birth</Label>
                    <Input
                      type="date"
                      value={data.dateOfBirth}
                      onChange={(e) => setData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="mt-1.5 h-11 border-2"
                    />
                    <p className="text-xs text-stone-500 mt-1">Used for age-appropriate screening recommendations</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-stone-700">Gender *</Label>
                    <Select 
                      value={data.gender} 
                      onValueChange={(value) => setData(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger className="mt-1.5 h-11 border-2">
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="other">Other / Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-stone-500 mt-1">Important for gender-specific health screenings</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-900">
                      Your information is protected by HIPAA and never shared without your consent.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <Card className="p-8 border-2 border-stone-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">Your Location</h3>
                    <p className="text-sm text-stone-600">Find providers and trials near you</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <Label className="text-sm font-medium text-stone-700">ZIP Code *</Label>
                    <Input
                      value={data.zipCode}
                      onChange={(e) => setData(prev => ({ ...prev, zipCode: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                      placeholder="Enter your ZIP code"
                      className="mt-1.5 h-11 border-2 text-lg tracking-wider"
                      maxLength={5}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-stone-700">State</Label>
                    <Select 
                      value={data.state} 
                      onValueChange={(value) => setData(prev => ({ ...prev, state: value }))}
                    >
                      <SelectTrigger className="mt-1.5 h-11 border-2">
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        <SelectItem value="IL">Illinois</SelectItem>
                        <SelectItem value="PA">Pennsylvania</SelectItem>
                        <SelectItem value="OH">Ohio</SelectItem>
                        <SelectItem value="GA">Georgia</SelectItem>
                        <SelectItem value="NC">North Carolina</SelectItem>
                        <SelectItem value="MI">Michigan</SelectItem>
                        {/* Add more states as needed */}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-sm text-stone-700">
                    💡 We'll show you providers within 25 miles and clinical trials in your region.
                  </p>
                </div>
              </Card>
            )}

            {/* Step 4: Health Priorities */}
            {currentStep === 4 && (
              <Card className="p-8 border-2 border-stone-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">What matters most to you?</h3>
                    <p className="text-sm text-stone-600">Select at least one priority</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {HEALTH_PRIORITIES.map((priority) => (
                    <button
                      key={priority.id}
                      onClick={() => togglePriority(priority.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        data.healthPriorities.includes(priority.id)
                          ? 'border-stone-900 bg-stone-50 shadow-md'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{priority.icon}</span>
                      <span className={`text-sm font-medium ${
                        data.healthPriorities.includes(priority.id) ? 'text-stone-900' : 'text-stone-700'
                      }`}>
                        {priority.label}
                      </span>
                      {data.healthPriorities.includes(priority.id) && (
                        <Check className="h-4 w-4 text-stone-900 absolute top-2 right-2" />
                      )}
                    </button>
                  ))}
                </div>

                {data.healthPriorities.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {data.healthPriorities.map((id) => {
                      const priority = HEALTH_PRIORITIES.find(p => p.id === id)
                      return priority && (
                        <Badge key={id} variant="secondary" className="text-sm py-1 px-3">
                          {priority.icon} {priority.label}
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </Card>
            )}

            {/* Step 5: Notification Preferences */}
            {currentStep === 5 && (
              <Card className="p-8 border-2 border-stone-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Bell className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">Stay Informed</h3>
                    <p className="text-sm text-stone-600">Choose how we keep you updated</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { key: 'appointments', icon: Calendar, label: 'Appointment Reminders', description: 'Get notified before upcoming appointments' },
                    { key: 'screenings', icon: Activity, label: 'Screening Alerts', description: 'Know when you\'re due for health screenings' },
                    { key: 'trials', icon: FlaskConical, label: 'Clinical Trial Matches', description: 'Learn about new trials that match your profile' },
                    { key: 'tips', icon: Sparkles, label: 'Health Tips', description: 'Personalized wellness recommendations' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setData(prev => ({
                        ...prev,
                        notificationPreferences: {
                          ...prev.notificationPreferences,
                          [item.key]: !prev.notificationPreferences[item.key as keyof typeof prev.notificationPreferences]
                        }
                      }))}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4 ${
                        data.notificationPreferences[item.key as keyof typeof data.notificationPreferences]
                          ? 'border-stone-900 bg-stone-50'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        data.notificationPreferences[item.key as keyof typeof data.notificationPreferences]
                          ? 'bg-stone-900'
                          : 'bg-stone-100'
                      }`}>
                        <item.icon className={`h-5 w-5 ${
                          data.notificationPreferences[item.key as keyof typeof data.notificationPreferences]
                            ? 'text-white'
                            : 'text-stone-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-stone-900">{item.label}</h4>
                        <p className="text-sm text-stone-600">{item.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        data.notificationPreferences[item.key as keyof typeof data.notificationPreferences]
                          ? 'border-stone-900 bg-stone-900'
                          : 'border-stone-300'
                      }`}>
                        {data.notificationPreferences[item.key as keyof typeof data.notificationPreferences] && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-stone-900 to-stone-800 rounded-xl text-white">
                  <h4 className="font-semibold text-lg mb-2">🎉 You're all set!</h4>
                  <p className="text-stone-300 text-sm">
                    {data.firstName ? `Welcome, ${data.firstName}! ` : 'Welcome! '}
                    Your personalized health experience is ready.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="border-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {currentStep < STEPS.length ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-stone-900 hover:bg-stone-800 text-white px-8"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={completeOnboarding}
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
