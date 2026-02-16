"use client"

/**
 * Onboarding Success Page - Palantir-Inspired Design
 */

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Mail, Clock, ArrowRight, Shield } from "lucide-react"

export default function OnboardingSuccessPage() {
  const searchParams = useSearchParams()
  const applicationId = searchParams.get("id")
  const statusHref = applicationId
    ? `/onboarding/status?id=${encodeURIComponent(applicationId)}`
    : "/onboarding/status"

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <main className="py-8 px-6">
        <div className="max-w-lg mx-auto text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 border border-border rounded-full flex items-center justify-center mx-auto mb-8 bg-background">
            <CheckCircle className="w-8 h-8 text-foreground" />
          </div>

          <h1 className="text-4xl font-light tracking-tight mb-4 text-foreground">
            Application Submitted
          </h1>
          <p className="text-lg mb-12 text-muted-foreground">
            Thank you for applying. We'll review your application and get back to you soon.
          </p>

          {/* Timeline */}
          <div className="bg-muted/20 border border-border rounded-xl p-6 text-left mb-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 border border-border rounded-full flex items-center justify-center flex-shrink-0 bg-background">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Check Your Email</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Confirmation sent with your application details
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 border border-border rounded-full flex items-center justify-center flex-shrink-0 bg-background">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Review Time</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    1-2 business days for credential verification
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 border border-border rounded-full flex items-center justify-center flex-shrink-0 bg-background">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Approval</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Email notification when your account is ready
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 border border-border rounded text-sm hover:bg-muted/30 transition-colors text-foreground"
            >
              Return Home
            </Link>
            <Link
              href={statusHref}
              className="px-6 py-3 border border-border rounded text-sm hover:bg-muted/30 transition-colors text-foreground flex items-center gap-2"
            >
              Track Status
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 bg-foreground text-background rounded text-sm hover:bg-foreground/90 transition-colors flex items-center gap-2"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Help */}
          <div className="mt-12 pt-6 border-t border-border">
            <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Need help? Contact support →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
