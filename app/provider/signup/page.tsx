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
import { Loader2, Stethoscope, Building2 } from "lucide-react"

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
      const payload = {
        type: providerType,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        ...(providerType === "PHYSICIAN"
          ? {
              fullName: formData.fullName,
              npi: formData.npi || undefined,
              licenseState: formData.licenseState || undefined,
              specialties: formData.specialties,
            }
          : {
              organizationName: formData.organizationName,
            }),
      }

      const response = await fetch("/api/provider/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setSuccess(true)
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/provider/dashboard")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
    } finally {
      setIsSubmitting(false)
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50/30 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="border-2 border-stone-200 bg-white shadow-xl">
          <CardHeader className="border-b border-stone-200 bg-gradient-to-r from-stone-50 to-white">
            <CardTitle className="text-3xl font-bold text-center text-stone-900">Join BaseHealth</CardTitle>
            <CardDescription className="text-center text-stone-600 mt-2">
              Sign up as a healthcare provider or health app
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Provider Type Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-stone-900">I am a:</Label>
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
                  className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-stone-700 font-medium">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>

              {/* Physician-specific fields */}
              {providerType === "PHYSICIAN" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="npi" className="text-stone-700 font-medium">NPI Number (optional)</Label>
                    <Input
                      id="npi"
                      type="text"
                      placeholder="1234567890"
                      value={formData.npi}
                      onChange={(e) => setFormData({ ...formData, npi: e.target.value })}
                      className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:ring-blue-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseState" className="text-stone-700 font-medium">License State (optional)</Label>
                    <Input
                      id="licenseState"
                      type="text"
                      placeholder="CA"
                      value={formData.licenseState}
                      onChange={(e) => setFormData({ ...formData, licenseState: e.target.value })}
                      className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:ring-blue-600"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-stone-700 font-medium">Specialties (select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
                      {specialties.map((specialty) => (
                        <div key={specialty} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={specialty}
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
  )
}

