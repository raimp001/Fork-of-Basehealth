import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  OPENCLAW_AGENT_CATALOG,
  normalizeOpenClawAgent,
} from "@/lib/openclaw-agent-catalog"
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CreditCard,
  DollarSign,
  FileText,
  Pill,
  ReceiptText,
  Settings,
  Shield,
  Users,
} from "lucide-react"

const ICONS = {
  "general-health": Bot,
  "screening-specialist": Bot,
  "care-navigator": Users,
  "appointment-coordinator": Bot,
  "clinical-trial-matcher": Bot,
  "records-specialist": FileText,
  "medication-coach": Pill,
  "account-manager": Settings,
  "billing-guide": CreditCard,
  "claims-refunds": ReceiptText,
  "provider-ops": Users,
  "admin-ops": Shield,
  "treasury-operator": DollarSign,
  "emergency-triage": AlertTriangle,
} as const

export default function AgentDetailPage({
  params,
}: {
  params: { agentId: string }
}) {
  const { agentId: rawAgentId } = params
  const agentId = normalizeOpenClawAgent(rawAgentId)
  if (!agentId) notFound()

  const agent = OPENCLAW_AGENT_CATALOG[agentId]
  const Icon = ICONS[agentId] || Bot

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="secondary">{agent.functionArea}</Badge>
            <Badge variant="outline">OpenClaw</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-stone-900 mb-2">{agent.label}</h1>
          <p className="text-stone-600 max-w-3xl">{agent.description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-stone-700" />
                What This Agent Does
              </CardTitle>
              <CardDescription>Purpose-built prompts and guardrails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <p className="text-xs font-semibold text-stone-500 mb-2">Directive</p>
                <p className="text-sm text-stone-700 whitespace-pre-wrap">{agent.prompt}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <Link href={`/chat?agent=${agentId}&q=${encodeURIComponent(agent.launchPrompt)}`}>
                    Open Console <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/agents/billing">Agent billing</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle>Examples</CardTitle>
              <CardDescription>Good starter questions for this function</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {agent.examples.map((example) => (
                <div key={example} className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white p-3">
                  <p className="text-sm text-stone-700">{example}</p>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/chat?agent=${agentId}&q=${encodeURIComponent(example)}`}>Ask</Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-stone-200">
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
            <CardDescription>Jump to other agent surfaces</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="outline">
              <Link href="/agents">Agent hub</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/chat">Agent console</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/treasury">Treasury</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
