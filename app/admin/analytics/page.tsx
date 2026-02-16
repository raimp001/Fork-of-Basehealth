"use client"

/**
 * Admin Onboarding Analytics Dashboard
 * 
 * Shows step-level conversion funnel, drop-off rates, and daily trends
 * for provider and caregiver onboarding.
 */

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BarChart3,
  Loader2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react"

interface StepMetric {
  step: number
  label: string
  started: number
  completed: number
  dropoffRate: number
}

interface FunnelMetrics {
  role: string
  totalStarted: number
  totalSubmitted: number
  totalApproved: number
  totalRejected: number
  totalPending: number
  overallConversionRate: number
  averageCompletionTimeHours: number | null
  stepMetrics: StepMetric[]
}

interface Analytics {
  period: { days: number; since: string }
  aggregate: {
    totalStarted: number
    totalSubmitted: number
    totalApproved: number
    overallConversionRate: number
    approvalRate: number
  }
  providerFunnel: FunnelMetrics
  caregiverFunnel: FunnelMetrics
  dailyTrend: Array<{ date: string; started: number; submitted: number }>
}

function FunnelCard({ funnel }: { funnel: FunnelMetrics }) {
  const maxStarted = Math.max(...funnel.stepMetrics.map((s) => s.started), 1)
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground capitalize">
          {funnel.role.toLowerCase()} funnel
        </h3>
        <span className="text-xs text-muted-foreground">
          {funnel.totalStarted} started
        </span>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="text-center">
          <p className="text-2xl font-semibold text-foreground">{funnel.totalStarted}</p>
          <p className="text-[10px] text-muted-foreground">Started</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-foreground">{funnel.totalSubmitted}</p>
          <p className="text-[10px] text-muted-foreground">Submitted</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-emerald-600">{funnel.totalApproved}</p>
          <p className="text-[10px] text-muted-foreground">Approved</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-foreground">{funnel.overallConversionRate}%</p>
          <p className="text-[10px] text-muted-foreground">Conversion</p>
        </div>
      </div>

      {funnel.averageCompletionTimeHours !== null && (
        <p className="text-xs text-muted-foreground mb-4">
          Avg time to submit: {funnel.averageCompletionTimeHours}h
        </p>
      )}

      {/* Step-by-step funnel */}
      <div className="space-y-2">
        {funnel.stepMetrics.map((step) => {
          const widthPercent = maxStarted > 0 ? (step.started / maxStarted) * 100 : 0
          const isHighDropoff = step.dropoffRate > 40
          return (
            <div key={step.step}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">
                  Step {step.step + 1}: {step.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-medium">
                    {step.completed}/{step.started}
                  </span>
                  {step.dropoffRate > 0 && (
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${
                        isHighDropoff ? "text-rose-500" : "text-amber-500"
                      }`}
                    >
                      <TrendingDown className="h-3 w-3" />
                      {step.dropoffRate}%
                    </span>
                  )}
                </div>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isHighDropoff ? "bg-rose-400" : "bg-blue-500"
                  }`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function OnboardingAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)

  const fetchAnalytics = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/analytics/onboarding?days=${days}`, {
        cache: "no-store",
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to load analytics")
        return
      }
      setAnalytics(data)
    } catch {
      setError("Failed to load analytics")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [days])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-10">
        <header className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Onboarding Analytics</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Step-level conversion, drop-off rates, and trends
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
              >
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
              </select>
              <button
                onClick={fetchAnalytics}
                disabled={isLoading}
                className="rounded-lg border border-border bg-background p-2 hover:bg-muted/60"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading && !analytics && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {analytics && (
          <>
            {/* Aggregate metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {[
                { label: "Started", value: analytics.aggregate.totalStarted, icon: Users },
                { label: "Submitted", value: analytics.aggregate.totalSubmitted, icon: BarChart3 },
                { label: "Approved", value: analytics.aggregate.totalApproved, icon: TrendingUp },
                { label: "Conversion", value: `${analytics.aggregate.overallConversionRate}%`, icon: BarChart3 },
                { label: "Approval Rate", value: `${analytics.aggregate.approvalRate}%`, icon: TrendingUp },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm text-center"
                >
                  <metric.icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xl font-semibold text-foreground">{metric.value}</p>
                  <p className="text-[10px] text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </div>

            {/* Funnels */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <FunnelCard funnel={analytics.providerFunnel} />
              <FunnelCard funnel={analytics.caregiverFunnel} />
            </div>

            {/* Daily trend */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-4">Daily trend</h3>
              <div className="space-y-2">
                {analytics.dailyTrend.map((day) => {
                  const maxDay = Math.max(
                    ...analytics.dailyTrend.map((d) => d.started),
                    1,
                  )
                  return (
                    <div key={day.date} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-20 shrink-0">
                        {new Date(day.date + "T12:00:00").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <div className="flex-1 flex items-center gap-1 h-5">
                        <div
                          className="h-full rounded bg-blue-500"
                          style={{ width: `${(day.started / maxDay) * 100}%`, minWidth: day.started > 0 ? 4 : 0 }}
                          title={`${day.started} started`}
                        />
                        <div
                          className="h-full rounded bg-emerald-500"
                          style={{ width: `${(day.submitted / maxDay) * 100}%`, minWidth: day.submitted > 0 ? 4 : 0 }}
                          title={`${day.submitted} submitted`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-16 text-right shrink-0">
                        {day.started} / {day.submitted}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded bg-blue-500" /> Started
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded bg-emerald-500" /> Submitted
                </span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
