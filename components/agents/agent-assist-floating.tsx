"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bot, Brain, Search, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  OPENCLAW_AGENT_CATALOG,
  OPENCLAW_AGENT_IDS,
  type OpenClawAgentId,
} from "@/lib/openclaw-agent-catalog"
import { recommendOpenClawAgent } from "@/lib/openclaw-recommendation"

type AgentAssistFloatingProps = {
  className?: string
}

export function AgentAssistFloating({ className }: AgentAssistFloatingProps) {
  const pathname = usePathname()
  const [query, setQuery] = useState("")
  const [actingWallet, setActingWallet] = useState("")

  // Avoid stacking agent UI on the agent console itself.
  if (pathname?.startsWith("/chat")) return null

  const recommended = useMemo(() => recommendOpenClawAgent(pathname), [pathname])
  const recommendedAgent = OPENCLAW_AGENT_CATALOG[recommended]

  const filteredAgents = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return OPENCLAW_AGENT_IDS
    return OPENCLAW_AGENT_IDS.filter((id) => {
      const agent = OPENCLAW_AGENT_CATALOG[id]
      return (
        agent.label.toLowerCase().includes(q) ||
        agent.shortLabel.toLowerCase().includes(q) ||
        agent.description.toLowerCase().includes(q) ||
        agent.functionArea.toLowerCase().includes(q) ||
        agent.keywords.some((kw) => kw.toLowerCase().includes(q))
      )
    })
  }, [query])

  const launchHref = (agentId: OpenClawAgentId) => {
    const agent = OPENCLAW_AGENT_CATALOG[agentId]
    return `/chat?agent=${agentId}&q=${encodeURIComponent(agent.launchPrompt)}`
  }

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("basehealth_acting_wallet") || ""
      setActingWallet(saved)
    } catch {
      // ignore
    }
  }, [])

  const saveActingWallet = () => {
    try {
      const value = actingWallet.trim()
      if (!value) {
        window.localStorage.removeItem("basehealth_acting_wallet")
      } else {
        window.localStorage.setItem("basehealth_acting_wallet", value)
      }
    } catch {
      // ignore
    }
  }

  const clearActingWallet = () => {
    setActingWallet("")
    try {
      window.localStorage.removeItem("basehealth_acting_wallet")
    } catch {
      // ignore
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="default"
          className={cn(
            "fixed bottom-20 right-4 z-50 h-12 rounded-full shadow-lg gap-2 md:bottom-6 md:right-6",
            className,
          )}
          aria-label="Open agent assist"
        >
          <Brain className="h-5 w-5" />
          <span className="hidden sm:inline">Agent Assist</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            OpenClaw Agents
          </SheetTitle>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          <Card className="border-border bg-muted/20">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Recommended for this page</p>
                  <p className="text-base font-semibold text-foreground truncate">{recommendedAgent.label}</p>
                  <p className="text-sm text-muted-foreground leading-6">{recommendedAgent.description}</p>
                </div>
                <Badge variant="secondary">{recommendedAgent.functionArea}</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link href={launchHref(recommended)}>
                    Launch
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={recommendedAgent.workflowHref}>{recommendedAgent.workflowLabel}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1">
                <Label htmlFor="acting-wallet">Acting for (optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Set a client wallet to load context in the agent console. This does not change your sign-in.
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  id="acting-wallet"
                  value={actingWallet}
                  onChange={(e) => setActingWallet(e.target.value)}
                  onBlur={saveActingWallet}
                  placeholder="0x… (client wallet address)"
                />
                <Button type="button" variant="outline" onClick={clearActingWallet}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search agents..."
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Each function has a dedicated specialist. Pick the one that matches your task.
            </p>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[55vh] pr-1">
            {filteredAgents.map((agentId) => {
              const agent = OPENCLAW_AGENT_CATALOG[agentId]
              return (
                <Card key={agentId} className="border-border">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{agent.label}</p>
                        <p className="text-xs text-muted-foreground">{agent.functionArea}</p>
                        <p className="text-sm text-muted-foreground leading-6 mt-2">{agent.description}</p>
                      </div>
                      {agentId === recommended ? (
                        <Badge variant="default" className="shrink-0">
                          Suggested
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="shrink-0">
                          Agent
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm">
                        <Link href={launchHref(agentId)}>Launch</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={agent.workflowHref}>{agent.workflowLabel}</Link>
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/agents/${agentId}`}>Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="border-border bg-muted/10">
            <CardContent className="p-4 text-sm text-muted-foreground leading-6">
              Building AI-agent billing? Use HTTP 402 (x402) endpoints in{" "}
              <Link href="/agents/billing" className="underline">
                Agent Billing
              </Link>
              .
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
