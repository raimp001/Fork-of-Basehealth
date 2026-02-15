"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { MessageSquare, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const CATEGORIES = [
  { value: "ux", label: "UX / Design" },
  { value: "agents", label: "Agents" },
  { value: "billing", label: "Billing / Receipts / Refunds" },
  { value: "payments", label: "Payments (Base)" },
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature request" },
  { value: "compliance", label: "Compliance / Safety" },
  { value: "other", label: "Other" },
]

export default function FeedbackPage() {
  const [category, setCategory] = useState<string>("ux")
  const [rating, setRating] = useState<string>("5")
  const [message, setMessage] = useState<string>("")
  const [page, setPage] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  const resolvedRating = useMemo(() => {
    const parsed = Number.parseInt(rating, 10)
    if (!Number.isFinite(parsed)) return undefined
    return Math.max(1, Math.min(5, parsed))
  }, [rating])

  const submit = async () => {
    const trimmed = message.trim()
    if (trimmed.length < 5) {
      toast.error("Please add a bit more detail.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          rating: resolvedRating,
          page: page.trim() || (typeof window !== "undefined" ? window.location.pathname : undefined),
          message: trimmed,
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Failed to submit feedback.")
      }

      toast.success("Feedback submitted. Thank you.")
      setMessage("")
      setPage("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit feedback.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-white">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 text-white text-sm font-semibold">
            <MessageSquare className="h-4 w-4" />
            Feedback
          </div>
          <h1 className="mt-5 text-3xl sm:text-4xl font-semibold text-stone-900">Help improve BaseHealth</h1>
          <p className="mt-3 text-stone-600 max-w-2xl mx-auto leading-7">
            Tell us what is confusing, broken, or missing. We review feedback and prioritize changes that show clear
            consensus.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Please do not include personal health information (PHI).
            </Badge>
          </div>
          <p className="mt-4 text-sm text-stone-600">
            Want to support development?{" "}
            <Link href="/support" className="text-blue-700 hover:underline">
              Tip here
            </Link>
            .
          </p>
        </div>

        <Card className="border-stone-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Submit feedback</CardTitle>
            <CardDescription>Short, specific feedback is easiest to act on.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-stone-900">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-stone-900">Rating (1-5)</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {["5", "4", "3", "2", "1"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-stone-900">Page (optional)</label>
              <Input
                value={page}
                onChange={(e) => setPage(e.target.value)}
                placeholder="e.g. /screening"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-stone-900">Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What should change? What did you expect to happen?"
                className="min-h-[140px]"
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={submit} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit feedback"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setMessage("")} disabled={submitting}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

