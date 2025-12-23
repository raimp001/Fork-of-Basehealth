"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Stethoscope, Building2, Shield } from "lucide-react"
import { toastSuccess, toastError } from "@/lib/toast-helper"
import { LoadingSpinner } from "@/components/ui/loading"

export default function ProviderSignupPage() {
  const router = useRouter()
  const [providerType, setProviderType] = useState<"PHYSICIAN" | "APP">("PHYSICIAN")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    // Common fields
    email: "",
    password: "",
    phone: "",
    bio: "",
    // Physician fields
    fullName: "",
    npi: "",
    licenseNumber: "",
    licenseState: "",
    specialties: [] as string[],
    // App fields
    organizationName: "",
  })

  const specialties = [
    "Family Medicine",
    "Internal Medicine",
    "Cardiology",
    "Dermatology",
    "Orthopedics",
    "Neurology",
    "Psychiatry",
    "Pediatrics",
    "Oncology",
    "Other",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Client-side validation
      if (providerType === "PHYSICIAN") {
        if (!formData.fullName || formData.fullName.trim() === "") {
          setError("Full name is required")
          setIsSubmitting(false)
          return
        }
        
        // NPI is MANDATORY - cannot be empty
        if (!formData.npi || formData.npi.trim() === "") {
          setError("NPI number is required and cannot be empty")
          setIsSubmitting(false)
          return
        }
        
        // NPI must be exactly 10 digits
        const npiClean = formData.npi.replace(/\D/g, '')
        if (npiClean.length !== 10) {
          setError("NPI number must be exactly 10 digits")
          setIsSubmitting(false)
          return
        }
        
        if (!/^\d{10}$/.test(npiClean)) {
          setError("NPI number must contain only digits")
          setIsSubmitting(false)
          return
        }
        
        if (!formData.licenseNumber || formData.licenseNumber.trim() === "") {
          setError("State medical board number is required")
          setIsSubmitting(false)
          return
        }
        
        // License state is MANDATORY - cannot be empty
        if (!formData.licenseState || formData.licenseState.trim() === "") {
          setError("License state is required and cannot be empty")
          setIsSubmitting(false)
          return
        }
        
        // License state must be exactly 2 uppercase letters
        const licenseStateClean = formData.licenseState.toUpperCase().trim()
        if (licenseStateClean.length !== 2) {
          setError("License state must be exactly 2 letters")
          setIsSubmitting(false)
          return
        }
        
        if (!/^[A-Z]{2}$/.test(licenseStateClean)) {
          setError("License state must be a 2-letter state code (e.g., CA, NY, TX)")
          setIsSubmitting(false)
          return
        }
      }

      // Build payload with proper validation
      const payload: any = {
        type: providerType,
        email: formData.email.trim(),
        password: formData.password,
      }

      // Add optional fields only if they have values
      if (formData.phone && formData.phone.trim()) {
        payload.phone = formData.phone.trim()
      }
      if (formData.bio && formData.bio.trim()) {
        payload.bio = formData.bio.trim()
      }

      // Add physician-specific fields
      if (providerType === "PHYSICIAN") {
        payload.fullName = formData.fullName.trim()
        payload.npi = formData.npi.replace(/\D/g, '') // Ensure only digits
        payload.licenseNumber = formData.licenseNumber.trim()
        payload.licenseState = formData.licenseState.toUpperCase().trim() // Ensure uppercase and trimmed
        payload.specialties = formData.specialties || []
      } else {
        payload.organizationName = formData.organizationName.trim()
      }

      const response = await fetch("/api/provider/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        // If response is not JSON, get text
        const text = await response.text()
        throw new Error(text || "Registration failed. Invalid server response.")
      }

      if (!response.ok) {
        const errorMsg = data?.error || `Registration failed (${response.status})`
        const errorCode = data?.errorCode || "UNKNOWN"
        const errorDetails = data?.details || ""
        
        // Show more helpful error messages based on error code
        let displayError = errorMsg
        if (errorCode === "DATABASE_ERROR" || errorCode === "DATABASE_CONNECTION_ERROR") {
          displayError = "Database connection error. Please ensure DATABASE_URL is configured in Vercel settings."
        } else if (errorCode === "CREATE_ERROR") {
          displayError = "Failed to create account. Please check database configuration or contact support."
        } else if (response.status === 409) {
          displayError = errorMsg // Already registered error
        } else if (response.status === 400) {
          displayError = errorMsg // Validation error
        } else if (response.status === 429) {
          displayError = "Too many registration attempts. Please wait and try again later."
        } else if (response.status === 500) {
          displayError = errorMsg || "Server error. Please try again or contact support."
        }
        
        // Log error details for debugging
        console.error("Registration error:", {
          status: response.status,
          errorCode,
          errorMsg,
          details: errorDetails
        })
        
        setError(displayError)
        toastError({
          title: "Registration Failed",
          description: displayError,
        })
        setIsSubmitting(false)
        return
      }

      // Success!
      setSuccess(true)
      toastSuccess({
        title: "Registration Successful!",
        description: "Your account is pending verification. Redirecting to login...",
      })
      
      // Redirect to provider login page after 2 seconds with success message
      setTimeout(() => {
        router.push("/login?provider=true&message=Registration successful. Please sign in to continue.")
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed. Please try again."
      
      // Provide more helpful error messages
      let displayError = errorMessage
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        displayError = "Network error. Please check your internet connection and try again."
      } else if (errorMessage.includes("Invalid server response")) {
        displayError = "Server error. Please try again or contact support."
      }
      
      setError(displayError)
      toastError({
        title: "Registration Failed",
        description: displayError,
      })
    } finally {
      // Only reset submitting if we're not redirecting
      if (!success) {
        setIsSubmitting(false)
      }
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50/30 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-2 border-green-200 bg-white shadow-xl">
            <CardHeader className="border-b border-green-200 bg-gradient-to-r from-green-50 to-white">
              <CardTitle className="text-2xl font-bold text-center text-green-900">Registration Successful!</CardTitle>
              <CardDescription className="text-center text-stone-600 mt-2">
                Your account is pending verification. Redirecting to dashboard...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Prevent browser theme color from showing yellow */}
      <style jsx global>{`
        input, textarea, select {
          background-color: white !important;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px white inset !important;
          box-shadow: 0 0 0 1000px white inset !important;
          -webkit-text-fill-color: rgb(23, 23, 23) !important;
          background-color: white !important;
          border-color: rgb(229, 229, 229) !important;
        }
      `}</style>
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border border-stone-200 bg-white shadow-lg">
            <CardHeader className="border-b border-stone-200 bg-white">
            <CardTitle className="text-3xl font-bold text-center text-stone-900">Join BaseHealth</CardTitle>
            <CardDescription className="text-center text-stone-600 mt-2">
              Sign up as a healthcare provider or health app
            </CardDescription>
            <p className="text-center text-stone-600 mt-4 text-sm">
              Join in under 5 minutes. We'll verify your credentials and notify you within 2 business days.
            </p>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Provider Type Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-stone-900">I am a:</Label>
                <p className="text-xs text-stone-500 mb-2">Health App/Clinic includes telehealth platforms, EHR vendors, and care navigation apps.</p>
                <RadioGroup
                  value={providerType}
                  onValueChange={(value) => setProviderType(value as "PHYSICIAN" | "APP")}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="PHYSICIAN" id="physician" className="peer sr-only" />
                    <Label
                      htmlFor="physician"
                      className={`flex flex-col items-center justify-center rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 ${
                        providerType === "PHYSICIAN"
                          ? "border-blue-600 bg-blue-50 text-blue-900 shadow-md"
                          : "border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50"
                      }`}
                    >
                      <Stethoscope className={`mb-3 h-8 w-8 ${providerType === "PHYSICIAN" ? "text-blue-600" : "text-stone-500"}`} />
                      <span className="font-semibold">Physician</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="APP" id="app" className="peer sr-only" />
                    <Label
                      htmlFor="app"
                      className={`flex flex-col items-center justify-center rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 ${
                        providerType === "APP"
                          ? "border-blue-600 bg-blue-50 text-blue-900 shadow-md"
                          : "border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50"
                      }`}
                    >
                      <Building2 className={`mb-3 h-8 w-8 ${providerType === "APP" ? "text-blue-600" : "text-stone-500"}`} />
                      <span className="font-semibold">Health App/Clinic</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

            {/* Common Fields */}
            <div className="space-y-5">
              {providerType === "PHYSICIAN" ? (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-stone-900 font-semibold">
                    Full Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Dr. John Smith"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    autoComplete="name"
                    className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:ring-blue-600"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="organizationName" className="text-stone-900 font-semibold">
                    Organization Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="organizationName"
                    type="text"
                    placeholder="HealthApp Inc."
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    required
                    className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:ring-blue-600"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-stone-900 font-semibold">
                  Email <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-stone-900 font-semibold">
                  Password <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:ring-blue-600"
                />
                <p className="text-xs text-stone-500 mt-1">Must be at least 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-stone-700 font-medium">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  autoComplete="tel"
                  className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>

              {/* Physician-specific fields */}
              {providerType === "PHYSICIAN" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="npi" className="text-stone-900 font-semibold">
                      NPI Number <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="npi"
                      type="text"
                      inputMode="numeric"
                      placeholder="1234567890"
                      value={formData.npi}
                      onChange={(e) => {
                        // Only allow digits
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                        setFormData({ ...formData, npi: value })
                      }}
                      required
                      maxLength={10}
                      minLength={10}
                      pattern="[0-9]{10}"
                      autoComplete="off"
                      className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:ring-blue-600"
                    />
                    <p className="text-xs text-stone-500 mt-1">10-digit National Provider Identifier (Required)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber" className="text-stone-900 font-semibold">
                      State Medical Board Number <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="licenseNumber"
                      type="text"
                      placeholder="Enter your medical license number"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      required
                      className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:ring-blue-600"
                    />
                    <p className="text-xs text-stone-500 mt-1">Your state medical board license number</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseState" className="text-stone-900 font-semibold">
                      License State <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="licenseState"
                      type="text"
                      placeholder="CA"
                      value={formData.licenseState}
                      onChange={(e) => {
                        // Only allow letters, convert to uppercase, max 2 characters
                        const value = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2)
                        setFormData({ ...formData, licenseState: value })
                      }}
                      required
                      maxLength={2}
                      minLength={2}
                      pattern="[A-Z]{2}"
                      autoComplete="off"
                      className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:ring-blue-600"
                    />
                    <p className="text-xs text-stone-500 mt-1">2-letter state code (e.g., CA, NY, TX) - Required</p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-stone-700 font-medium">Specialties (select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
                      {specialties.map((specialty) => (
                        <div key={specialty} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={specialty}
                            title={`Select ${specialty} specialty`}
                            aria-label={`Select ${specialty} specialty`}
                            checked={formData.specialties.includes(specialty)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  specialties: [...formData.specialties, specialty],
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  specialties: formData.specialties.filter((s) => s !== specialty),
                                })
                              }
                            }}
                            className="w-4 h-4 rounded border-stone-300 text-blue-600 focus:ring-blue-600 focus:ring-2 cursor-pointer"
                          />
                          <Label htmlFor={specialty} className="text-sm font-normal text-stone-700 cursor-pointer">
                            {specialty}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-stone-700 font-medium">Bio (optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself or your organization..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-300 bg-red-50">
                <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-900">Your information is HIPAA-compliant and never sold.</p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all duration-200" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

