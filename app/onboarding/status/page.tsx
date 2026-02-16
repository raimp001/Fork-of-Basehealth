"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  FileText,
  Loader2,
  Mail,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ApplicationStatusValue =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "PENDING_INFO"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED"

interface ApplicationRecord {
  id: string
  role?: string | null
  status: string
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  currentStep?: number | null
  stepsCompleted?: Record<string, boolean> | null
  submittedAt?: string | null
  reviewedAt?: string | null
  updatedAt?: string | null
  createdAt?: string | null
  reviewNotes?: string | null
  country?: string | null
  specialty?: string | null
  npiVerified?: boolean | null
  licenseVerified?: boolean | null
  verifications?: Array<{
    type: string
    status: string
    checkedAt: string
  }> | null
}

interface StatusMeta {
  label: string
  detail: string
  pillClass: string
  icon: typeof CheckCircle2
  sla: string
  nextSteps: string[]
}

const STATUS_META: Record<ApplicationStatusValue, StatusMeta> = {
  DRAFT: {
    label: "Draft",
    detail: "Your application is saved but not submitted yet.",
    pillClass: "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
    icon: FileText,
    sla: "Complete at your own pace",
    nextSteps: [
      "Resume your application and fill out remaining steps",
      "You can save and return anytime",
      "Submit when ready for review",
    ],
  },
  SUBMITTED: {
    label: "Submitted",
    detail: "Your application has been received and is queued for review.",
    pillClass: "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-600 dark:bg-cyan-900 dark:text-cyan-300",
    icon: Clock3,
    sla: "Typical review: 1-3 business days",
    nextSteps: [
      "We are running automated credential checks",
      "An admin reviewer will evaluate your application",
      "You will be notified by email when a decision is made",
    ],
  },
  UNDER_REVIEW: {
    label: "Under review",
    detail: "A reviewer is currently evaluating your credentials.",
    pillClass: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900 dark:text-blue-300",
    icon: Shield,
    sla: "Estimated: 1-2 business days remaining",
    nextSteps: [
      "NPI and license verification in progress",
      "OIG exclusion list check running",
      "A decision will be shared shortly",
    ],
  },
  PENDING_INFO: {
    label: "Action needed",
    detail: "Additional details are required before approval. Check reviewer notes below.",
    pillClass: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-900 dark:text-amber-300",
    icon: Mail,
    sla: "Please respond within 5 business days",
    nextSteps: [
      "Review the feedback in 'Reviewer notes'",
      "Update your application with the requested information",
      "Resubmit to continue the process",
    ],
  },
  APPROVED: {
    label: "Approved",
    detail: "Congratulations! You are approved and can start receiving patients.",
    pillClass: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900 dark:text-emerald-300",
    icon: UserCheck,
    sla: "Active",
    nextSteps: [
      "Your provider profile is now visible to patients",
      "On-chain attestation has been created for your credentials",
      "Set up your payout wallet to receive USDC payments",
    ],
  },
  REJECTED: {
    label: "Not approved",
    detail: "This application was not approved. See reviewer notes for details.",
    pillClass: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-600 dark:bg-rose-900 dark:text-rose-300",
    icon: ShieldAlert,
    sla: "You may reapply after addressing feedback",
    nextSteps: [
      "Review the rejection reason below",
      "Address any credential issues identified",
      "Submit a new application when ready",
    ],
  },
  SUSPENDED: {
    label: "Suspended",
    detail: "Access is temporarily paused pending review.",
    pillClass: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-600 dark:bg-orange-900 dark:text-orange-300",
    icon: ShieldAlert,
    sla: "Under administrative review",
    nextSteps: [
      "Contact support for details about the suspension",
      "Provide any requested documentation",
    ],
  },
}

function getStatusMeta(status: string): StatusMeta {
  const normalized = (status || "").toUpperCase() as ApplicationStatusValue
  return (
    STATUS_META[normalized] || {
      label: normalized || "Unknown",
      detail: "Status unavailable.",
      pillClass: "border-slate-300 bg-slate-50 text-slate-700",
      icon: Circle,
      sla: "",
      nextSteps: [],
    }
  )
}

// Visual progress pipeline
const PIPELINE_STEPS = [
  { key: "DRAFT", label: "Draft" },
  { key: "SUBMITTED", label: "Submitted" },
  { key: "UNDER_REVIEW", label: "Under Review" },
  { key: "APPROVED", label: "Approved" },
]

const STATUS_ORDER: Record<string, number> = {
  DRAFT: 0,
  SUBMITTED: 1,
  UNDER_REVIEW: 2,
  PENDING_INFO: 2,
  APPROVED: 3,
  REJECTED: -1,
  SUSPENDED: -1,
}

function formatDateTime(value?: string | null): string {
  if (!value) return "Not available"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Not available"
  return parsed.toLocaleString()
}

function getApplicantName(application: ApplicationRecord): string {
  const full = String(application.fullName || "").trim()
  if (full) return full
  const split = [application.firstName, application.lastName]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ")
  return split || "Applicant"
}

function buildResumeHref(application: ApplicationRecord): string {
  const params = new URLSearchParams({ applicationId: application.id })
  const role = String(application.role || "").toUpperCase()
  if (role === "PROVIDER") params.set("role", "provider")
  if (role === "CAREGIVER") params.set("role", "caregiver")
  if (application.email) params.set("email", application.email)
  return `/onboarding?${params.toString()}`
}

function getCompletionPercent(app: ApplicationRecord): number {
  const totalSteps = String(app.role || "").toUpperCase() === "PROVIDER" ? 6 : 5
  const completed = app.stepsCompleted ? Object.values(app.stepsCompleted).filter(Boolean).length : 0
  return Math.round((completed / totalSteps) * 100)
}

function getTimeSince(dateStr?: string | null): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ""
  const diff = Date.now() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return "just now"
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

export default function OnboardingStatusPage() {
  const searchParams = useSearchParams()

  const initialId = searchParams.get("id") || ""
  const initialEmail = searchParams.get("email") || ""

  const [lookupId, setLookupId] = useState(initialId)
  const [lookupEmail, setLookupEmail] = useState(initialEmail)
  const [application, setApplication] = useState<ApplicationRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async (params: { id?: string; email?: string }) => {
    const id = String(params.id || "").trim()
    const email = String(params.email || "").trim()

    if (!id && !email) {
      setError("Enter an application ID or email")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const query = id ? `id=${encodeURIComponent(id)}` : `email=${encodeURIComponent(email)}`
      const response = await fetch(`/api/onboarding/application?${query}`, { cache: "no-store" })
      const data = await response.json()

      if (!response.ok || !data.success || !data.application) {
        setApplication(null)
        setError(data.error || "Application not found")
        return
      }

      setApplication(data.application as ApplicationRecord)
      setLookupId(String(data.application.id || id))
      setLookupEmail(String(data.application.email || email))
    } catch {
      setApplication(null)
      setError("Unable to fetch application status")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!initialId && !initialEmail) return
    fetchStatus({ id: initialId, email: initialEmail })
  }, [initialId, initialEmail])

  const statusMeta = useMemo(() => (application ? getStatusMeta(application.status) : null), [application])
  const canResume = application && ["DRAFT", "PENDING_INFO"].includes(String(application.status || "").toUpperCase())
  const currentStepIndex = application ? (STATUS_ORDER[application.status?.toUpperCase() || ""] ?? -1) : -1
  const completionPercent = application ? getCompletionPercent(application) : 0

  const handleLookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await fetchStatus({ id: lookupId, email: lookupEmail })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Application Status</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Check your provider or caregiver application progress, resume drafts, or start a new application.
          </p>
        </header>

        {/* Lookup Form */}
        <form onSubmit={handleLookup} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div>
            <Label className="text-sm mb-2 block text-muted-foreground">Email (recommended)</Label>
            <Input
              type="email"
              value={lookupEmail}
              onChange={(event) => setLookupEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-11"
            />
          </div>

          <div>
            <Label className="text-sm mb-2 block text-muted-foreground">Or Application ID</Label>
            <Input
              value={lookupId}
              onChange={(event) => setLookupId(event.target.value)}
              placeholder="clx..."
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-foreground text-background hover:bg-foreground/90"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            {isLoading ? "Checking..." : "Check status"}
          </Button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {application && statusMeta && (
          <>
            {/* Pipeline Progress */}
            <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Application pipeline
              </p>
              <div className="flex items-center gap-1">
                {PIPELINE_STEPS.map((step, idx) => {
                  const isComplete = currentStepIndex > idx
                  const isCurrent = currentStepIndex === idx
                  const isRejected = application.status?.toUpperCase() === "REJECTED"
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="flex items-center w-full">
                        {idx > 0 && (
                          <div
                            className={`h-0.5 flex-1 ${
                              isComplete ? "bg-emerald-500" : isCurrent ? "bg-blue-400" : "bg-border"
                            }`}
                          />
                        )}
                        <div
                          className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                            isComplete
                              ? "bg-emerald-500 text-white"
                              : isCurrent
                              ? isRejected
                                ? "bg-rose-500 text-white"
                                : "bg-blue-500 text-white ring-4 ring-blue-500/20"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        {idx < PIPELINE_STEPS.length - 1 && (
                          <div
                            className={`h-0.5 flex-1 ${
                              isComplete ? "bg-emerald-500" : "bg-border"
                            }`}
                          />
                        )}
                      </div>
                      <span className={`text-[10px] sm:text-xs text-center ${
                        isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Completion bar for drafts */}
              {application.status?.toUpperCase() === "DRAFT" && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Form completion</span>
                    <span className="font-semibold text-foreground">{completionPercent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Status Card */}
            <section className="mt-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{getApplicantName(application)}</p>
                  <h2 className="text-lg font-semibold text-foreground capitalize">
                    {(application.role || "Application").toLowerCase()} application
                  </h2>
                  {application.specialty && (
                    <p className="text-xs text-muted-foreground mt-0.5">{application.specialty}</p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.pillClass}`}
                >
                  <statusMeta.icon className="h-3 w-3" />
                  {statusMeta.label}
                </span>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">{statusMeta.detail}</p>

              {/* SLA */}
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                <span>{statusMeta.sla}</span>
                {application.submittedAt && (
                  <span className="ml-auto">Submitted {getTimeSince(application.submittedAt)}</span>
                )}
              </div>

              {/* Key dates */}
              <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <dt className="text-xs text-muted-foreground">Application ID</dt>
                  <dd className="mt-1 font-mono text-foreground text-xs break-all">{application.id}</dd>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <dt className="text-xs text-muted-foreground">Last updated</dt>
                  <dd className="mt-1 text-foreground text-xs">{formatDateTime(application.updatedAt)}</dd>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <dt className="text-xs text-muted-foreground">Started</dt>
                  <dd className="mt-1 text-foreground text-xs">{formatDateTime(application.createdAt)}</dd>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <dt className="text-xs text-muted-foreground">Reviewed</dt>
                  <dd className="mt-1 text-foreground text-xs">{formatDateTime(application.reviewedAt)}</dd>
                </div>
              </dl>

              {/* Verification checks */}
              {application.verifications && application.verifications.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Credential checks
                  </p>
                  <div className="space-y-2">
                    {application.verifications.map((v, idx) => (
                      <div
                        key={`${v.type}-${idx}`}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          {v.status === "VERIFIED" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : v.status === "FAILED" ? (
                            <ShieldAlert className="h-4 w-4 text-rose-500" />
                          ) : (
                            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                          )}
                          <span className="text-sm text-foreground">{v.type.replace(/_/g, " ")}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {v.status === "VERIFIED" ? "Passed" : v.status === "FAILED" ? "Failed" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviewer notes */}
              {application.reviewNotes && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Reviewer notes</p>
                  <p className="mt-1 text-sm text-foreground">{application.reviewNotes}</p>
                </div>
              )}
            </section>

            {/* What happens next */}
            {statusMeta.nextSteps.length > 0 && (
              <section className="mt-4 rounded-xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-foreground">What happens next</h3>
                <ol className="mt-3 space-y-2">
                  {statusMeta.nextSteps.map((step, idx) => (
                    <li key={`step-${idx}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {idx + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Actions */}
            <div className="mt-5 flex flex-wrap gap-3">
              {canResume && (
                <Link
                  href={buildResumeHref(application)}
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
                >
                  Resume application
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              <Link
                href="/join"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/60 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Start new application
              </Link>
            </div>
          </>
        )}

        {/* Quick links when no application loaded */}
        {!application && !isLoading && (
          <section className="mt-8 rounded-xl border border-border bg-card p-5 shadow-sm text-center">
            <h3 className="text-base font-semibold text-foreground">New here?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Join BaseHealth as a provider or caregiver and start seeing patients.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/join?role=provider"
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
              >
                Apply as Provider
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/join?role=caregiver"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/60 transition-colors"
              >
                Apply as Caregiver
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
