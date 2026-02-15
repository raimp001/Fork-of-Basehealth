"use client"

/**
 * Provider/Caregiver Onboarding - Palantir-Inspired Design
 * Clean, minimal, sophisticated
 */

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Stethoscope,
  Heart,
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Search,
  Info,
  Clock,
  Loader2,
  Save,
  AlertCircle,
  Menu,
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
// INNER COMPONENT
// ============================================================================

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [step, setStep] = useState(0)
  const [role, setRole] = useState<"PROVIDER" | "CAREGIVER" | null>(null)
  const [country, setCountry] = useState("US")
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
    regions: [] as string[],
    email: "",
    password: "",
    phone: "",
    firstName: "",
    lastName: "",
    fullName: "",
    providerType: "PHYSICIAN",
    professionType: "",
    specialty: "",
    organizationName: "",
    servicesOffered: [] as string[],
    experienceYears: "",
    bio: "",
    hasTransport: false,
    certifications: [] as string[],
    languages: [] as string[],
    npiNumber: "",
    licenseNumber: "",
    licenseState: "",
    licenseExpiry: "",
    attestedAccuracy: false,
    attestedLicenseScope: false,
    consentToVerification: false,
    consentToBackgroundCheck: false,
    // Payment settings for USDC settlements
    walletAddress: "",
    payoutPreference: "USDC_DIRECT",
  })

  // Reference data
  const [referenceData, setReferenceData] = useState<any>({})

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

  const saveApplication = async (submit = false) => {
    setIsSaving(true)
    setError(null)

    try {
      let currentAppId = applicationId
      
      if (!currentAppId) {
        const createRes = await fetch("/api/onboarding/application", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, country, email: formData.email }),
        })
        const createData = await createRes.json()
        
        if (!createData.success) {
          throw new Error(createData.error || "Failed to create application")
        }
        
        currentAppId = createData.application.id
        setApplicationId(currentAppId)
      }

      const updateRes = await fetch("/api/onboarding/application", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: currentAppId,
          step,
          data: { ...formData, role, country },
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

  const handleNext = async () => {
    if (step === 0) {
      if (!role) {
        setError("Please select a role")
        return
      }
      if (formData.regions.length === 0) {
        setError("Please select at least one state")
        return
      }
    }
    
    if (step === 1) {
      if (!formData.email || !formData.email.trim()) {
        setError("Please enter your email address")
        return
      }
      if (!formData.password || formData.password.length < 8) {
        setError("Please enter a password (at least 8 characters)")
        return
      }
      if (role === "PROVIDER" && !formData.fullName?.trim()) {
        setError("Please enter your full name")
        return
      }
    }
    
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
  const progressPercentage = steps.length > 0 ? ((step + 1) / steps.length) * 100 : 0

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <main className="py-8 px-6">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-normal tracking-tight mb-3">
              {role === "PROVIDER" 
                ? "Join as Provider" 
                : role === "CAREGIVER"
                ? "Join as Caregiver"
                : "Join BaseHealth"}
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              {role === "PROVIDER" 
                ? "Apply to our provider network" 
                : role === "CAREGIVER"
                ? "Become part of our care team"
                : "Select your role to begin"}
            </p>
          </div>

          {/* Progress */}
          {role && steps.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <span>Step {step + 1} of {steps.length}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {steps[step]?.estimatedTime}
                </span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%`, backgroundColor: 'hsl(var(--accent))' }}
                />
              </div>
              <p className="text-center mt-2" style={{ color: 'var(--text-secondary)' }}>{steps[step]?.title}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: 'rgba(220, 100, 100, 0.1)', border: '1px solid rgba(220, 100, 100, 0.2)' }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#dc6464' }} />
              <p className="text-sm" style={{ color: '#dc6464' }}>{error}</p>
            </div>
          )}

          {/* Content Card */}
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            
            {/* Step 0: Role & Region */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-sm mb-3 block" style={{ color: 'var(--text-secondary)' }}>I want to join as</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setRole("PROVIDER")}
                      className="p-5 rounded-lg border text-left transition-all"
                      style={role === "PROVIDER" ? { 
                        borderColor: 'hsl(var(--accent))', 
                        backgroundColor: 'rgba(212, 165, 116, 0.1)' 
                      } : { 
                        borderColor: 'var(--border-medium)' 
                      }}
                    >
                      <Stethoscope className="w-6 h-6 mb-3" style={{ color: role === "PROVIDER" ? 'hsl(var(--accent))' : 'var(--text-muted)' }} />
                      <h3 className="font-medium">Provider</h3>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Licensed clinician</p>
                    </button>
                    <button
                      onClick={() => setRole("CAREGIVER")}
                      className="p-5 rounded-lg border text-left transition-all"
                      style={role === "CAREGIVER" ? { 
                        borderColor: 'hsl(var(--accent))', 
                        backgroundColor: 'rgba(212, 165, 116, 0.1)' 
                      } : { 
                        borderColor: 'var(--border-medium)' 
                      }}
                    >
                      <Heart className="w-6 h-6 mb-3" style={{ color: role === "CAREGIVER" ? 'hsl(var(--accent))' : 'var(--text-muted)' }} />
                      <h3 className="font-medium">Caregiver</h3>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Home care services</p>
                    </button>
                  </div>
                </div>

                {role && (
                  <>
                    <div>
                      <Label className="text-sm mb-2 block text-muted-foreground">Country</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {country === "US" && (
                      <div>
                        <Label className="text-sm mb-2 block text-muted-foreground">
                          {role === "PROVIDER" ? "Licensed states" : "Service area"}
                        </Label>
                        <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-3 border border-border rounded-lg bg-background/40">
                          {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map((state) => (
                            <button
                              key={state}
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  regions: prev.regions.includes(state)
                                    ? prev.regions.filter(r => r !== state)
                                    : [...prev.regions, state]
                                }))
                              }}
                              className={`py-2 px-3 text-sm rounded-md border transition-colors ${
                                formData.regions.includes(state)
                                  ? 'bg-foreground text-background border-foreground font-medium'
                                  : 'bg-background text-muted-foreground border-border hover:bg-muted/60'
                              }`}
                            >
                              {state}
                            </button>
                          ))}
                        </div>
                        {formData.regions.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {formData.regions.length} selected
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Step 1: Account */}
            {step === 1 && (
              <div className="space-y-5">
                {role === "CAREGIVER" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm mb-2 block text-muted-foreground">First Name</Label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label className="text-sm mb-2 block text-muted-foreground">Last Name</Label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="h-12"
                      />
                    </div>
                  </div>
                )}

                {role === "PROVIDER" && (
                  <div>
                    <Label className="text-sm mb-2 block text-muted-foreground">Full Name</Label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Dr. Jane Smith"
                      className="h-12 placeholder:text-muted-foreground/70"
                    />
                  </div>
                )}

                <div>
                  <Label className="text-sm mb-2 block text-muted-foreground">Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div>
                  <Label className="text-sm mb-2 block text-muted-foreground">Password</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="8+ characters"
                    className="h-12 placeholder:text-muted-foreground/70"
                  />
                </div>

                <div>
                  <Label className="text-sm mb-2 block text-muted-foreground">Phone (optional)</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Profile - Provider */}
            {step === 2 && role === "PROVIDER" && (
              <div className="space-y-5">
                <div>
                  <Label className="text-sm mb-2 block text-muted-foreground">Profession</Label>
                  <Select 
                    value={formData.professionType} 
                    onValueChange={(v) => setFormData({ ...formData, professionType: v })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select profession" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MD">Physician (MD)</SelectItem>
                      <SelectItem value="DO">Physician (DO)</SelectItem>
                      <SelectItem value="NP">Nurse Practitioner</SelectItem>
                      <SelectItem value="PA">Physician Assistant</SelectItem>
                      <SelectItem value="RN">Registered Nurse</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm mb-2 block text-muted-foreground">Specialty</Label>
                  <Input
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="e.g., Internal Medicine"
                    className="h-12 placeholder:text-muted-foreground/70"
                  />
                </div>

                <div>
                  <Label className="text-sm mb-2 block text-muted-foreground">Organization (optional)</Label>
                  <Input
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Profile - Caregiver */}
            {step === 2 && role === "CAREGIVER" && (
              <div className="space-y-5">
                <div>
                  <Label className="text-sm mb-3 block text-muted-foreground">Services</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { code: 'COMPANION', name: 'Companion Care' },
                      { code: 'PERSONAL', name: 'Personal Care' },
                      { code: 'HOMEMAKER', name: 'Homemaker' },
                      { code: 'SKILLED', name: 'Skilled Nursing' },
                      { code: 'RESPITE', name: 'Respite Care' },
                      { code: 'TRANSPORT', name: 'Transportation' },
                    ].map((s) => (
                      <button
                        key={s.code}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            servicesOffered: prev.servicesOffered.includes(s.code)
                              ? prev.servicesOffered.filter(x => x !== s.code)
                              : [...prev.servicesOffered, s.code]
                          }))
                        }}
                        className={`p-3 text-sm text-left rounded-lg border transition-all ${
                          formData.servicesOffered.includes(s.code)
                            ? 'border-foreground/30 bg-muted text-foreground'
                            : 'border-border bg-background text-foreground hover:bg-muted/60'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm mb-2 block text-muted-foreground">Years of Experience</Label>
                  <Input
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div>
                  <Label className="text-sm mb-2 block text-muted-foreground">About You</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Brief introduction..."
                    rows={3}
                    className="placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Verification - Provider */}
            {step === 3 && role === "PROVIDER" && (
              <div className="space-y-5">
                {country === "US" && (
                  <div className="p-4 bg-muted/20 border border-border rounded-lg">
                    <Label className="text-sm mb-2 block text-muted-foreground">NPI Number</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.npiNumber}
                        onChange={(e) => setFormData({ ...formData, npiNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                        placeholder="10 digits"
                        maxLength={10}
                        className="h-12 placeholder:text-muted-foreground/70"
                      />
                      <Button
                        type="button"
                        onClick={handleNPILookup}
                        disabled={npiSearching || formData.npiNumber.length !== 10}
                        className="bg-foreground text-background hover:bg-foreground/90 h-12 px-6"
                      >
                        {npiSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lookup"}
                      </Button>
                    </div>
                    {npiResult && (
                      <p className="mt-2 text-sm text-emerald-700">
                        ✓ Found: {npiResult.fullName}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label className="text-sm mb-2 block text-muted-foreground">License Number</Label>
                  <Input
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm mb-2 block text-muted-foreground">State</Label>
                    <Select
                      value={formData.licenseState}
                      onValueChange={(v) => setFormData({ ...formData, licenseState: v })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block text-muted-foreground">Expires</Label>
                    <Input
                      type="date"
                      value={formData.licenseExpiry}
                      onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                      className="h-12"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Final Step: Review */}
            {((role === "PROVIDER" && step === 4) || (role === "CAREGIVER" && step === 3)) && (
              <div className="space-y-6">
                <div className="p-4 bg-muted/20 border border-border rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role</span>
                    <span>{role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span>{formData.fullName || `${formData.firstName} ${formData.lastName}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span>{formData.email}</span>
                  </div>
                  {role === "PROVIDER" && formData.licenseNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">License</span>
                      <span>{formData.licenseNumber} ({formData.licenseState})</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 rounded-lg border border-border cursor-pointer hover:bg-muted/20 transition-colors">
                    <Checkbox
                      checked={formData.attestedAccuracy}
                      onCheckedChange={(c) => setFormData({ ...formData, attestedAccuracy: !!c })}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-foreground">
                      I confirm all information is accurate
                    </span>
                  </label>

                  <label className="flex items-start gap-3 p-4 rounded-lg border border-border cursor-pointer hover:bg-muted/20 transition-colors">
                    <Checkbox
                      checked={formData.consentToVerification}
                      onCheckedChange={(c) => setFormData({ ...formData, consentToVerification: !!c })}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-foreground">
                      I consent to credential verification
                    </span>
                  </label>
                </div>

                {/* Payment Settings - USDC Payout */}
                <div className="p-4 bg-muted/20 border border-border rounded-lg">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border">
                      <span className="text-foreground font-bold text-sm">$</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">Payment Settings</p>
                      <p className="text-sm text-muted-foreground">Receive payments in USDC on Base blockchain</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Base Wallet Address (optional)</Label>
                      <Input
                        type="text"
                        placeholder="0x..."
                        value={formData.walletAddress}
                        onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                        className="mt-1 placeholder:text-muted-foreground/70"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Enter your Base wallet address to receive USDC payouts. You can add this later.</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-muted-foreground">Payout Preference</Label>
                      <Select
                        value={formData.payoutPreference}
                        onValueChange={(v) => setFormData({ ...formData, payoutPreference: v })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDC_DIRECT">USDC Direct (to wallet)</SelectItem>
                          <SelectItem value="COINBASE">Coinbase Account</SelectItem>
                          <SelectItem value="HOLD">Hold until threshold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/20 border border-border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Next Steps</p>
                      <p>Review takes 1-2 business days. You'll receive an email when approved.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === 0 || isSaving}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {((role === "PROVIDER" && step < 4) || (role === "CAREGIVER" && step < 3)) ? (
                <Button 
                  onClick={handleNext} 
                  disabled={isSaving}
                  className="bg-foreground text-background hover:bg-foreground/90 px-8"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : role && (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSaving || !formData.attestedAccuracy || !formData.consentToVerification}
                  className="bg-foreground text-background hover:bg-foreground/90 px-8"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Save Later */}
          {step > 0 && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => saveApplication()}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Save and continue later
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
