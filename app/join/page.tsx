"use client"

import Link from "next/link"
import { ArrowRight, Heart, Stethoscope } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-10">
        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Join BaseHealth</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Apply as a provider or caregiver. We verify credentials before listing you for patients.
              </p>
            </div>
            <Badge variant="outline">Applications</Badge>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                Provider
              </CardTitle>
              <CardDescription>Physicians, NPs/PAs, therapists, and other licensed clinicians.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm text-muted-foreground list-disc pl-5">
                <li>License verification and basic credential checks</li>
                <li>Optional wallet payouts for USDC settlements</li>
                <li>Appear in search once approved</li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/onboarding?role=provider">
                  Start provider application <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                Caregiver
              </CardTitle>
              <CardDescription>Home care, post-surgery support, companionship, and other services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm text-muted-foreground list-disc pl-5">
                <li>Experience review and (optional) background checks</li>
                <li>Get matched to local care requests</li>
                <li>Managed scheduling and payments</li>
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link href="/onboarding?role=caregiver">
                  Start caregiver application <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-muted/20 p-5">
          <p className="text-sm text-muted-foreground">
            Patients: use the{" "}
            <Link href="/chat" className="text-foreground hover:underline underline-offset-4">
              BaseHealth Assistant
            </Link>{" "}
            to ask questions. We route each request to the right internal specialist automatically.
          </p>
        </div>
      </main>
    </div>
  )
}

