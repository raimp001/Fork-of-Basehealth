"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, User, Calendar, Pill, FileText, Stethoscope } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import Link from "next/link"

interface Provider {
  id: string
  type: "PHYSICIAN" | "APP"
  fullName?: string
  organizationName?: string
  email: string
  phone?: string
  specialties?: string[]
  isVerified: boolean
}

export default function ProviderDashboard() {
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Get token from localStorage or cookie
    const token = localStorage.getItem("providerToken")

    if (!token) {
      setError("Please log in to access your dashboard")
      setLoading(false)
      return
    }

    fetch("/api/provider/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProvider(data.provider)
        } else {
          setError(data.error || "Failed to load provider data")
        }
      })
      .catch((err) => {
        setError("Failed to load provider data")
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MinimalNavigation />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MinimalNavigation />
        <div className="container mx-auto px-4 py-16 max-w-2xl pt-24">
          <Alert variant="destructive">
            <AlertDescription>{error || "Provider not found"}</AlertDescription>
          </Alert>
          <div className="mt-6">
            <Link href="/provider/signup">
              <Button>Sign Up as Provider</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />
      <div className="container mx-auto px-4 py-8 max-w-6xl pt-24">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">
          Welcome, {provider.fullName || provider.organizationName || "Provider"}!
        </h1>
        <p className="text-gray-600 mt-2">
          {provider.isVerified ? (
            <span className="text-green-600 font-medium">✓ Verified Account</span>
          ) : (
            <span className="text-yellow-600 font-medium">⏳ Account Pending Verification</span>
          )}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Type:</span>
              <p className="text-sm">{provider.type === "PHYSICIAN" ? "Physician" : "Health App/Clinic"}</p>
            </div>
            {provider.fullName && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Name:</span>
                <p className="text-sm">{provider.fullName}</p>
              </div>
            )}
            {provider.organizationName && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Organization:</span>
                <p className="text-sm">{provider.organizationName}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-muted-foreground">Email:</span>
              <p className="text-sm">{provider.email}</p>
            </div>
            {provider.phone && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                <p className="text-sm">{provider.phone}</p>
              </div>
            )}
            {provider.specialties && provider.specialties.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Specialties:</span>
                <p className="text-sm">{provider.specialties.join(", ")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Future Features Placeholders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Patient Requests
            </CardTitle>
            <CardDescription>Future: View and manage patient appointment requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Lab & Prescription Orders
            </CardTitle>
            <CardDescription>Future: Order labs, send prescriptions, and view results</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
            <div className="mt-4 space-y-2">
              <Button variant="outline" size="sm" disabled>
                Order Lab Test
              </Button>
              <Button variant="outline" size="sm" disabled>
                Send Prescription
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Imaging Orders
            </CardTitle>
            <CardDescription>Future: Order imaging studies and view reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
            <div className="mt-4">
              <Button variant="outline" size="sm" disabled>
                Order Imaging Study
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              EMR Integration
            </CardTitle>
            <CardDescription>Future: Push clinical summaries and sync patient records</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
            <div className="mt-4">
              <Button variant="outline" size="sm" disabled>
                Push Clinical Summary
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Availability & Scheduling
            </CardTitle>
            <CardDescription>Future: Set your availability and manage your schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
            <div className="mt-4">
              <Button variant="outline" size="sm" disabled>
                Update Availability
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}

