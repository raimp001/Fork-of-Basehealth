"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { LoadingSpinner } from "@/components/ui/loading"
import {
  Stethoscope,
  Heart,
  Globe,
  User,
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Search,
  Info,
  Clock,
  Loader2,
  Save,
} from "lucide-react"

// ============================================================================
// TYPES
// ============================================================================

interface StepConfig {
  id: number
  title: string
  description: string
  estimatedTime: string
}

const PROVIDER_STEPS: StepConfig[] = [
  { id: 0, title: "Role & Region", description: "Where will you practice?", estimatedTime: "1 min" },
  { id: 1, title: "Account", description: "Create your account", estimatedTime: "1 min" },
  { id: 2, title: "Profile", description: "Professional information", estimatedTime: "2 min" },
  { id: 3, title: "Verification", description: "License & credentials", estimatedTime: "2 min" },
  { id: 4, title: "Review", description: "Confirm & submit", estimatedTime: "1 min" },
]

const CAREGIVER_STEPS: StepConfig[] = [
  { id: 0, title: "Role & Region", description: "Where will you work?", estimatedTime: "1 min" },
  { id: 1, title: "Account", description: "Create your account", estimatedTime: "1 min" },
  { id: 2, title: "Profile", description: "Your experience", estimatedTime: "2 min" },
  { id: 3, title: "Review", description: "Confirm & submit", estimatedTime: "1 min" },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [step, setStep] = useState(0)
  const [role, setRole] = useState<"PROVIDER" | "CAREGIVER" | null>(null)
  const [country, setCountry] = useState("US")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  
  // NPI lookup state
  const [npiSearching, setNpiSearching] = useState(false)
  const [npiResult, setNpiResult] = useState<any>(null)

  // Handle role from URL query parameter
  useEffect(() => {
    const roleParam = searchParams.get("role")
    if (roleParam === "provider") {
      setRole("PROVIDER")
    } else if (roleParam === "caregiver") {
      setRole("CAREGIVER")
    }
  }, [searchParams])
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 0
    regions: [] as string[],
    
    // Step 1
    email: "",
    password: "",
    phone: "",
    firstName: "",
    lastName: "",
    fullName: "",
    
    // Step 2 - Provider
    providerType: "PHYSICIAN",
    professionType: "",
    specialty: "",
    organizationName: "",
    
    // Step 2 - Caregiver
    servicesOffered: [] as string[],
    experienceYears: "",
    bio: "",
    hasTransport: false,
    certifications: [] as string[],
    languages: [] as string[],
    
    // Step 3 - Provider Verification
    npiNumber: "",
    licenseNumber: "",
    licenseState: "",
    licenseExpiry: "",
    
    // Attestations
    attestedAccuracy: false,
    attestedLicenseScope: false,
    consentToVerification: false,
    consentToBackgroundCheck: false,
  })

  // Reference data
  const [referenceData, setReferenceData] = useState<any>({})

  // Load reference data
  useEffect(() => {
    if (role && country) {
      loadReferenceData()
    }
  }, [role, country])

  const loadReferenceData = async () => {
    try {
      const res = await fetch(`/api/onboarding/requirements?role=${role}&country=${country}`)
      const data = await res.json()
      if (data.success) {
        setReferenceData(data.referenceData)
      }
    } catch (e) {
      console.error("Failed to load reference data", e)
    }
  }

  // NPI Lookup
  const handleNPILookup = async () => {
    if (!formData.npiNumber || formData.npiNumber.length !== 10) {
      setError("Please enter a valid 10-digit NPI number")
      return
    }

    setNpiSearching(true)
    setError(null)

    try {
      const res = await fetch(`/api/onboarding/npi-lookup?npi=${formData.npiNumber}`)
      const data = await res.json()

      if (data.success && data.found) {
        setNpiResult(data.data)
        // Autofill fields
        setFormData(prev => ({
          ...prev,
          fullName: data.data.fullName || prev.fullName,
          firstName: data.data.firstName || prev.firstName,
          lastName: data.data.lastName || prev.lastName,
          specialty: data.data.specialty || prev.specialty,
          licenseState: data.data.licenseState || prev.licenseState,
          licenseNumber: data.data.licenseNumber || prev.licenseNumber,
        }))
      } else {
        setError("NPI not found. Please check the number or enter your information manually.")
      }
    } catch (e) {
      setError("Failed to lookup NPI. Please try again.")
    } finally {
      setNpiSearching(false)
    }
  }

  // Save application
  const saveApplication = async (submit = false) => {
    setIsSaving(true)
    setError(null)

    try {
      // Get or create application ID
      let currentAppId = applicationId
      
      if (!currentAppId) {
        // Create new application
        const createRes = await fetch("/api/onboarding/application", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role,
            country,
            email: formData.email,
          }),
        })
        const createData = await createRes.json()
        
        if (!createData.success) {
          throw new Error(createData.error || "Failed to create application")
        }
        
        // Use the returned ID directly (don't rely on async state update)
        currentAppId = createData.application.id
        setApplicationId(currentAppId)
        
        // If resuming an existing draft, we already have the data
        if (createData.resuming) {
          // Application already exists, just proceed to update
        }
      }

      // Update application with the ID we have
      const updateRes = await fetch("/api/onboarding/application", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: currentAppId,
          step,
          data: formData,
          submit,
        }),
      })
      const updateData = await updateRes.json()

      if (!updateData.success) {
        if (updateData.validationErrors) {
          setError(updateData.validationErrors.join(", "))
        } else {
          throw new Error(updateData.error || "Failed to update application")
        }
        return false
      }

      if (submit) {
        router.push("/onboarding/success")
      }
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save application")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const getAppId = async () => {
    // Helper to get or create app ID
    if (applicationId) return applicationId
    const res = await fetch("/api/onboarding/application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, country, email: formData.email }),
    })
    const data = await res.json()
    if (data.success) {
      setApplicationId(data.application.id)
      return data.application.id
    }
    throw new Error(data.error)
  }

  const handleNext = async () => {
    if (step === 0 && !role) {
      setError("Please select a role")
      return
    }
    
    // Save progress
    if (step >= 1) {
      const saved = await saveApplication()
      if (!saved) return
    }
    
    const steps = role === "PROVIDER" ? PROVIDER_STEPS : CAREGIVER_STEPS
    if (step < steps.length - 1) {
      setStep(step + 1)
      setError(null)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    await saveApplication(true)
  }

  const steps = role === "PROVIDER" ? PROVIDER_STEPS : (role === "CAREGIVER" ? CAREGIVER_STEPS : [])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />

      <main className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Join BaseHealth</h1>
            <p className="text-gray-600 mt-1">
              {role === "PROVIDER" 
                ? "Apply to join our provider network" 
                : role === "CAREGIVER"
                ? "Apply to join our caregiver network"
                : "Choose how you'd like to join"}
            </p>
          </div>

          {/* Progress */}
          {role && steps.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        step >= s.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step > s.id ? <CheckCircle className="w-5 h-5" /> : s.id + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`w-12 h-1 mx-1 transition-colors ${
                          step > s.id ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">{steps[step]?.title}</p>
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  ~{steps[step]?.estimatedTime}
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step Content */}
          <Card>
            <CardContent className="p-6">
              {/* Step 0: Role & Region Selection */}
              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-4 block">I want to join as a:</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setRole("PROVIDER")}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          role === "PROVIDER"
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Stethoscope className={`w-8 h-8 mb-3 ${role === "PROVIDER" ? "text-blue-600" : "text-gray-400"}`} />
                        <h3 className="font-semibold text-gray-900">Provider</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          MD, DO, NP, PA, RN, or other licensed clinician
                        </p>
                      </button>
                      <button
                        onClick={() => setRole("CAREGIVER")}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          role === "CAREGIVER"
                            ? "border-pink-600 bg-pink-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Heart className={`w-8 h-8 mb-3 ${role === "CAREGIVER" ? "text-pink-600" : "text-gray-400"}`} />
                        <h3 className="font-semibold text-gray-900">Caregiver</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Home care, companion care, or support services
                        </p>
                      </button>
                    </div>
                  </div>

                  {role && (
                    <>
                      <div>
                        <Label className="text-base font-semibold mb-2 block">Country</Label>
                        <Select value={country} onValueChange={setCountry}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {country === "US" && (
                        <div>
                          <Label className="text-base font-semibold mb-2 block">
                            {role === "PROVIDER" ? "State(s) where you'll practice" : "Service area"}
                          </Label>
                          <p className="text-sm text-gray-500 mb-2">
                            <Info className="w-3 h-3 inline mr-1" />
                            {role === "PROVIDER" 
                              ? "Select all states where you hold a valid license"
                              : "Select states where you'll provide services"}
                          </p>
                          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                            {(referenceData.states || []).map((state: any) => (
                              <label key={state.code} className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={formData.regions.includes(state.code)}
                                  onCheckedChange={(checked) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      regions: checked
                                        ? [...prev.regions, state.code]
                                        : prev.regions.filter(r => r !== state.code)
                                    }))
                                  }}
                                />
                                {state.code}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Step 1: Account Basics */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Create Your Account</h3>
                  
                  {role === "CAREGIVER" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>First Name *</Label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <Label>Last Name *</Label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                  )}

                  {role === "PROVIDER" && (
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Dr. John Smith"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="At least 8 characters"
                    />
                  </div>

                  <div>
                    <Label>Phone</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Profile - Provider */}
              {step === 2 && role === "PROVIDER" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Professional Information</h3>

                  <div>
                    <Label>Profession Type *</Label>
                    <Select 
                      value={formData.professionType} 
                      onValueChange={(v) => setFormData({ ...formData, professionType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your profession" />
                      </SelectTrigger>
                      <SelectContent>
                        {(referenceData.professionTypes || []).map((p: any) => (
                          <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Primary Specialty</Label>
                    <Input
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      placeholder="e.g., Internal Medicine, Family Medicine"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Profile - Caregiver */}
              {step === 2 && role === "CAREGIVER" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Your Experience</h3>

                  <div>
                    <Label className="mb-2 block">Services You Offer *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(referenceData.services || []).map((s: any) => (
                        <label key={s.code} className="flex items-center gap-2 text-sm p-2 border rounded hover:bg-gray-50">
                          <Checkbox
                            checked={formData.servicesOffered.includes(s.code)}
                            onCheckedChange={(checked) => {
                              setFormData(prev => ({
                                ...prev,
                                servicesOffered: checked
                                  ? [...prev.servicesOffered, s.code]
                                  : prev.servicesOffered.filter(x => x !== s.code)
                              }))
                            }}
                          />
                          {s.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Years of Experience *</Label>
                    <Input
                      type="number"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                      placeholder="e.g., 5"
                    />
                  </div>

                  <div>
                    <Label>Short Bio *</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell families about yourself and your caregiving approach..."
                      rows={3}
                    />
                  </div>

                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.hasTransport}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasTransport: !!checked })}
                    />
                    I have reliable transportation
                  </label>
                </div>
              )}

              {/* Step 3: Verification - Provider */}
              {step === 3 && role === "PROVIDER" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">License & Credentials</h3>

                  {/* NPI Lookup */}
                  {country === "US" && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <Label className="font-semibold">NPI Number (recommended)</Label>
                      <p className="text-sm text-gray-600 mb-2">
                        <Info className="w-3 h-3 inline mr-1" />
                        Enter your NPI to autofill your information
                      </p>
                      <div className="flex gap-2">
                        <Input
                          value={formData.npiNumber}
                          onChange={(e) => setFormData({ ...formData, npiNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                          placeholder="10-digit NPI"
                          maxLength={10}
                        />
                        <Button
                          type="button"
                          onClick={handleNPILookup}
                          disabled={npiSearching || formData.npiNumber.length !== 10}
                        >
                          {npiSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                          Lookup
                        </Button>
                      </div>
                      {npiResult && (
                        <div className="mt-2 p-2 bg-green-100 rounded text-sm text-green-800">
                          ✓ Found: {npiResult.fullName} - {npiResult.specialty}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Label>License Number *</Label>
                    <Input
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      placeholder="Your state medical license number"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>License State *</Label>
                      <Select
                        value={formData.licenseState}
                        onValueChange={(v) => setFormData({ ...formData, licenseState: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="State" />
                        </SelectTrigger>
                        <SelectContent>
                          {(referenceData.states || []).map((s: any) => (
                            <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Expiration Date *</Label>
                      <Input
                        type="date"
                        value={formData.licenseExpiry}
                        onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Final Step: Review & Attestations */}
              {((role === "PROVIDER" && step === 4) || (role === "CAREGIVER" && step === 3)) && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Review & Submit</h3>

                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <p><strong>Role:</strong> {role}</p>
                    <p><strong>Name:</strong> {formData.fullName || `${formData.firstName} ${formData.lastName}`}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    {role === "PROVIDER" && (
                      <>
                        <p><strong>Profession:</strong> {formData.professionType}</p>
                        <p><strong>License:</strong> {formData.licenseNumber} ({formData.licenseState})</p>
                        {formData.npiNumber && <p><strong>NPI:</strong> {formData.npiNumber}</p>}
                      </>
                    )}
                    {role === "CAREGIVER" && (
                      <>
                        <p><strong>Experience:</strong> {formData.experienceYears} years</p>
                        <p><strong>Services:</strong> {formData.servicesOffered.length} selected</p>
                      </>
                    )}
                  </div>

                  <div className="space-y-3 pt-4">
                    <label className="flex items-start gap-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={formData.attestedAccuracy}
                        onCheckedChange={(c) => setFormData({ ...formData, attestedAccuracy: !!c })}
                      />
                      <div>
                        <p className="font-medium">I attest that all information provided is accurate</p>
                        <p className="text-sm text-gray-500">Providing false information may result in rejection</p>
                      </div>
                    </label>

                    {role === "PROVIDER" && (
                      <label className="flex items-start gap-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={formData.attestedLicenseScope}
                          onCheckedChange={(c) => setFormData({ ...formData, attestedLicenseScope: !!c })}
                        />
                        <div>
                          <p className="font-medium">I will only practice in states where I'm licensed</p>
                          <p className="text-sm text-gray-500">You must hold a valid license in each state</p>
                        </div>
                      </label>
                    )}

                    <label className="flex items-start gap-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={formData.consentToVerification}
                        onCheckedChange={(c) => setFormData({ ...formData, consentToVerification: !!c })}
                      />
                      <div>
                        <p className="font-medium">I consent to credential verification</p>
                        <p className="text-sm text-gray-500">We'll verify your credentials with relevant authorities</p>
                      </div>
                    </label>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">What happens next?</p>
                      <ul className="text-sm text-blue-800 mt-1 space-y-1">
                        <li>• We'll verify your credentials (1-2 business days)</li>
                        <li>• You'll receive an email when your application is reviewed</li>
                        <li>• Once approved, you can start accepting patients</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 0 || isSaving}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {((role === "PROVIDER" && step < 4) || (role === "CAREGIVER" && step < 3)) ? (
                  <Button onClick={handleNext} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                ) : role && (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSaving || !formData.attestedAccuracy || !formData.consentToVerification}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Later */}
          {step > 0 && (
            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm" onClick={() => saveApplication()}>
                <Save className="w-4 h-4 mr-2" />
                Save & Continue Later
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
