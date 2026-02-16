"use client"

/**
 * Partner Landing Page
 * 
 * Targeted at healthcare organizations, clinics, and practices
 * wanting to join BaseHealth's provider network.
 * Includes referral code entry, regional demand data, and CTA.
 */

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  DollarSign,
  Globe,
  Heart,
  Loader2,
  Shield,
  Stethoscope,
  Users,
  Zap,
} from "lucide-react"

const BENEFITS = [
  {
    icon: Users,
    title: "Instant Patient Access",
    description:
      "Connect with patients actively seeking evidence-based care in your area. Our screening engine drives qualified, engaged patients directly to verified providers.",
  },
  {
    icon: Shield,
    title: "On-Chain Credential Verification",
    description:
      "Your NPI, license, and credentials are verified and attested on Base blockchain. Patients see a verified badge they can trust.",
  },
  {
    icon: DollarSign,
    title: "USDC Payments, No Insurance Hassle",
    description:
      "Get paid in USDC directly to your wallet. Transparent pricing, 2.5% platform fee, instant settlement. No insurance claims or 90-day wait.",
  },
  {
    icon: Zap,
    title: "Zero Setup Cost",
    description:
      "Free to apply and get listed. No monthly fees. You only pay the 2.5% platform fee when you earn.",
  },
]

const DEMAND_REGIONS = [
  { region: "New York Metro", demand: "High", providers: 12, patients: "2,400+" },
  { region: "Los Angeles", demand: "High", providers: 8, patients: "1,800+" },
  { region: "Chicago", demand: "Medium", providers: 5, patients: "950+" },
  { region: "Houston", demand: "High", providers: 3, patients: "1,200+" },
  { region: "Phoenix", demand: "Medium", providers: 2, patients: "600+" },
  { region: "Remote/Virtual", demand: "Very High", providers: 15, patients: "5,000+" },
]

export default function PartnerPage() {
  const [referralCode, setReferralCode] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<string | null>(null)

  const handleValidateCode = async () => {
    if (!referralCode.trim()) return
    setIsValidating(true)
    setValidationResult(null)

    try {
      const res = await fetch(`/api/referrals?code=${encodeURIComponent(referralCode.trim().toUpperCase())}`)
      const data = await res.json()

      if (data.success && data.referral?.isValid) {
        setValidationResult(`Valid code from ${data.referral.referrerName || data.referral.campaignName || "BaseHealth"}`)
      } else {
        setValidationResult("Code not found or expired")
      }
    } catch {
      setValidationResult("Unable to validate code")
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        {/* Hero */}
        <section className="py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-semibold text-foreground mb-6">
            <Building2 className="h-3.5 w-3.5" />
            For Healthcare Providers & Organizations
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
            Grow your practice on Base
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Join the healthcare network where verified providers connect with patients
            seeking evidence-based care. Get paid in USDC. No insurance paperwork.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/join?role=provider"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-base font-semibold text-background hover:bg-foreground/90 transition-colors"
            >
              Apply as Provider
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/join?role=caregiver"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-base font-semibold text-foreground hover:bg-muted/60 transition-colors"
            >
              <Heart className="h-5 w-5" />
              Apply as Caregiver
            </Link>
          </div>
        </section>

        {/* Benefits */}
        <section className="pb-16">
          <h2 className="text-2xl font-semibold tracking-tight text-center mb-8">
            Why providers choose BaseHealth
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <benefit.icon className="h-6 w-6 text-muted-foreground mb-3" />
                <h3 className="text-base font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Regional demand heatmap */}
        <section className="pb-16">
          <h2 className="text-2xl font-semibold tracking-tight text-center mb-2">
            Patient demand by region
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            See where patients are actively looking for providers
          </p>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="grid grid-cols-4 gap-0 border-b border-border bg-muted/30 px-4 py-2 text-xs font-semibold text-muted-foreground">
              <span>Region</span>
              <span>Demand</span>
              <span>Providers</span>
              <span>Patients</span>
            </div>
            {DEMAND_REGIONS.map((region) => (
              <div
                key={region.region}
                className="grid grid-cols-4 gap-0 border-b border-border last:border-0 px-4 py-3 text-sm"
              >
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  {region.region}
                </span>
                <span>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      region.demand === "Very High"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                        : region.demand === "High"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    }`}
                  >
                    {region.demand}
                  </span>
                </span>
                <span className="text-muted-foreground">{region.providers}</span>
                <span className="text-foreground font-medium">{region.patients}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Referral code */}
        <section className="pb-16">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-center">
            <Stethoscope className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-foreground">Have a referral code?</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Enter your code to connect with the referring provider or campaign
            </p>
            <div className="flex items-center gap-2 max-w-sm mx-auto">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="PRV-ABC123"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono uppercase tracking-wider"
              />
              <button
                onClick={handleValidateCode}
                disabled={isValidating || !referralCode.trim()}
                className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors"
              >
                {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
              </button>
            </div>
            {validationResult && (
              <p
                className={`mt-3 text-sm ${
                  validationResult.includes("Valid")
                    ? "text-emerald-600"
                    : "text-muted-foreground"
                }`}
              >
                {validationResult.includes("Valid") && (
                  <CheckCircle2 className="h-4 w-4 inline mr-1" />
                )}
                {validationResult}
              </p>
            )}
          </div>
        </section>

        {/* How it works */}
        <section className="pb-16">
          <h2 className="text-2xl font-semibold tracking-tight text-center mb-8">
            How it works
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Apply & Get Verified",
                description:
                  "Submit your NPI and license. We verify credentials, run OIG/SAM checks, and create your on-chain attestation.",
              },
              {
                step: "2",
                title: "Patients Find You",
                description:
                  "Our screening engine recommends patients see specific providers. Verified providers appear first in search results.",
              },
              {
                step: "3",
                title: "Get Paid in USDC",
                description:
                  "Patients pay in USDC on Base. You receive funds directly to your wallet minus a 2.5% platform fee. Instant settlement.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-border bg-card p-6 shadow-sm text-center"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background font-semibold">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-24 text-center">
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            Ready to grow your practice?
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/join?role=provider"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-base font-semibold text-background hover:bg-foreground/90 transition-colors"
            >
              Get started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/onboarding/status"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-base font-semibold text-foreground hover:bg-muted/60 transition-colors"
            >
              Check application status
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
