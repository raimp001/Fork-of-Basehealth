"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  OPENCLAW_AGENT_CATALOG,
  type OpenClawAgentId,
} from "@/lib/openclaw-agent-catalog"
import {
  Bot,
  AlertTriangle,
  CalendarCheck2,
  CreditCard,
  DollarSign,
  FileText,
  FlaskConical,
  Pill,
  ReceiptText,
  Settings,
  Shield,
  Stethoscope,
  Users,
} from "lucide-react"

const AGENT_ICONS: Record<OpenClawAgentId, typeof Bot> = {
  "general-health": Bot,
  "screening-specialist": Stethoscope,
  "care-navigator": Users,
  "appointment-coordinator": CalendarCheck2,
  "clinical-trial-matcher": FlaskConical,
  "records-specialist": FileText,
  "medication-coach": Pill,
  "account-manager": Settings,
  "billing-guide": CreditCard,
  "claims-refunds": ReceiptText,
  "provider-ops": Users,
  "admin-ops": Shield,
  "treasury-operator": DollarSign,
  "emergency-triage": AlertTriangle,
}

export function FunctionAgentCTA({
  agentId,
  title,
  prompt,
  className = "",
}: {
  agentId: OpenClawAgentId
  title?: string
  prompt?: string
  className?: string
}) {
  const agent = OPENCLAW_AGENT_CATALOG[agentId]
  const Icon = AGENT_ICONS[agentId]
  const q = encodeURIComponent(prompt || agent.launchPrompt)

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Icon className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">{title || agent.label}</CardTitle>
              <CardDescription>{agent.description}</CardDescription>
            </div>
          </div>
          <Badge variant="secondary">{agent.functionArea}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Prefer a guided workflow? This page has a dedicated OpenClaw specialist for it.
        </p>
        <Button asChild>
          <Link href={`/chat?agent=${agentId}&q=${q}`}>Ask this agent</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
