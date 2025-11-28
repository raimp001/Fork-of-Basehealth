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
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Registration Successful!</CardTitle>
            <CardDescription className="text-center">
              Your account is pending verification. Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl text-center">Join BaseHealth</CardTitle>
          <CardDescription className="text-center">
            Sign up as a healthcare provider or health app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Provider Type Selection */}
            <div className="space-y-4">
              <Label>I am a:</Label>
              <RadioGroup
                value={providerType}
                onValueChange={(value) => setProviderType(value as "PHYSICIAN" | "APP")}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="PHYSICIAN" id="physician" className="peer sr-only" />
                  <Label
                    htmlFor="physician"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Stethoscope className="mb-3 h-6 w-6" />
                    <span>Physician</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="APP" id="app" className="peer sr-only" />
                  <Label
                    htmlFor="app"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Building2 className="mb-3 h-6 w-6" />
                    <span>Health App/Clinic</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Common Fields */}
            <div className="space-y-4">
              {providerType === "PHYSICIAN" ? (
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Dr. John Smith"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="organizationName">
                    Organization Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="organizationName"
                    type="text"
                    placeholder="HealthApp Inc."
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {/* Physician-specific fields */}
              {providerType === "PHYSICIAN" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="npi">NPI Number (optional)</Label>
                    <Input
                      id="npi"
                      type="text"
                      placeholder="1234567890"
                      value={formData.npi}
                      onChange={(e) => setFormData({ ...formData, npi: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseState">License State (optional)</Label>
                    <Input
                      id="licenseState"
                      type="text"
                      placeholder="CA"
                      value={formData.licenseState}
                      onChange={(e) => setFormData({ ...formData, licenseState: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Specialties (select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-2">
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
                            className="rounded"
                          />
                          <Label htmlFor={specialty} className="text-sm font-normal cursor-pointer">
                            {specialty}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself or your organization..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
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

