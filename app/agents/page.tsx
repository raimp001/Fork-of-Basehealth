"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OPENCLAW_AGENT_CATALOG, OPENCLAW_AGENT_IDS } from "@/lib/openclaw-agent-catalog"

function isOpsEnabledFromParams(searchParams: ReturnType<typeof useSearchParams>) {
  const ops = searchParams.get("ops")
  return ops === "1"
}

function isOpsEnabledFromStorage() {
  try {
    return window.localStorage.getItem("basehealth_ops") === "1"
  } catch {
    return false
  }
}

export default function AgentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [opsEnabled, setOpsEnabled] = useState(false)

  useEffect(() => {
    const enabled = isOpsEnabledFromParams(searchParams) || isOpsEnabledFromStorage()
    setOpsEnabled(enabled)
  }, [searchParams])

  const agents = useMemo(() => {
    return OPENCLAW_AGENT_IDS.map((id) => ({ id, ...OPENCLAW_AGENT_CATALOG[id] }))
  }, [])

  if (!opsEnabled) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Operator hub</CardTitle>
                  <CardDescription>
                    This page is hidden for normal users. Patients should use the Assistant, which automatically routes
                    requests to the right internal specialist.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Lock className="h-3.5 w-3.5" />
                  Ops only
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/chat">Go to Assistant</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  try {
                    window.localStorage.setItem("basehealth_ops", "1")
                  } catch {
                    // ignore
                  }
                  router.replace("/agents?ops=1")
                }}
              >
                Enable ops mode
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10">
        <header className="mb-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Operator hub</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Internal tools. Patients should stay in <Link href="/chat" className="text-primary hover:underline underline-offset-4">Assistant</Link>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/chat?ops=1">Open Assistant (ops)</Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  try {
                    window.localStorage.removeItem("basehealth_ops")
                  } catch {
                    // ignore
                  }
                  router.replace("/chat")
                }}
              >
                Exit ops mode
              </Button>
            </div>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {agents.map((agent) => {
            const launchHref = `/chat?ops=1&agent=${agent.id}&q=${encodeURIComponent(agent.launchPrompt)}`
            return (
              <Card key={agent.id} className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{agent.label}</CardTitle>
                      <CardDescription>{agent.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{agent.functionArea}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-2">
                  <Button asChild className="sm:flex-1">
                    <Link href={launchHref}>
                      Launch <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="sm:flex-1">
                    <Link href={agent.workflowHref}>{agent.workflowLabel}</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}

