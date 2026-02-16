"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Calendar, Pill, FileText, Stethoscope } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageLoading } from "@/components/ui/loading"
import Link from "next/link"
import { logger } from "@/lib/logger"

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
  const router = useRouter()
  const { status: sessionStatus } = useSession()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionStatus === "loading") {
      return
    }

    if (sessionStatus !== "authenticated") {
      router.replace(`/login?redirect=${encodeURIComponent("/provider/dashboard")}`)
      return
    }

    let cancelled = false

    const loadProvider = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch("/api/provider/me", { cache: "no-store" })
        const data = await res.json().catch(() => null)

        if (!res.ok || !data?.success) {
          const errorMessage = data?.error || "Failed to load provider data"
          if (!cancelled) {
            setError(errorMessage)
            logger.warn("Failed to load provider data", { error: errorMessage })
          }
          return
        }

        if (!cancelled) {
          setProvider(data.provider)
        } else {
          return
        }
      } catch (err) {
        const errorMessage = "Failed to load provider data"
        if (!cancelled) {
          setError(errorMessage)
        }
        logger.error("Error fetching provider data", err)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProvider()

    return () => {
      cancelled = true
    }
  }, [sessionStatus, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageLoading 
          title="Loading Dashboard"
          description="Fetching your provider information..."
        />
      </div>
    )
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 max-w-2xl">
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
            <CardDescription>Order labs/prescriptions and coordinate patient logistics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Use integrated care orchestration to route to lab and pharmacy partners.</p>
            <div className="mt-4 space-y-2">
              <Link href="/provider/practice-hub"><Button variant="outline" size="sm">Open Practice Hub</Button></Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Imaging Orders
            </CardTitle>
            <CardDescription>Coordinate radiology/imaging studies and follow-up</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Route imaging orders through network centers with prior-auth tracking.</p>
            <div className="mt-4">
              <Link href="/provider/practice-hub"><Button variant="outline" size="sm">Manage Imaging Orders</Button></Link>
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
            <CardDescription>Scheduling, billing, prior auth and logistics through OpenCloud agent</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Operate independently with a single workflow console.</p>
            <div className="mt-4">
              <Link href="/provider/practice-hub"><Button variant="outline" size="sm">Launch Practice Operations</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
