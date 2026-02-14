import Link from "next/link"
import {
  ArrowRight,
  Bot,
  CalendarCheck2,
  CreditCard,
  FlaskConical,
  ReceiptText,
  Settings,
  Stethoscope,
  Users,
} from "lucide-react"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { OPENCLAW_AGENT_CATALOG, OPENCLAW_AGENT_IDS, type OpenClawAgentId } from "@/lib/openclaw-agent-catalog"

const AGENT_ICONS: Record<OpenClawAgentId, typeof Bot> = {
  "general-health": Bot,
  "screening-specialist": Stethoscope,
  "care-navigator": Users,
  "appointment-coordinator": CalendarCheck2,
  "clinical-trial-matcher": FlaskConical,
  "account-manager": Settings,
  "billing-guide": CreditCard,
  "claims-refunds": ReceiptText,
}

const AGENT_ACCENTS: Record<OpenClawAgentId, string> = {
  "general-health": "#0f766e",
  "screening-specialist": "#1d4ed8",
  "care-navigator": "#7c3aed",
  "appointment-coordinator": "#b45309",
  "clinical-trial-matcher": "#be123c",
  "account-manager": "#334155",
  "billing-guide": "#0369a1",
  "claims-refunds": "#9f1239",
}

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] via-white to-[#f8fafc]">
      <MinimalNavigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pt-24">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm mb-8">
          <p className="text-xs tracking-[0.2em] uppercase text-slate-500 mb-3">OpenClaw Agent Mesh</p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-3">Function-Specific Agent Hub</h1>
          <p className="text-slate-600 max-w-3xl leading-7">
            Each operational function now has a dedicated OpenClaw specialist. Launch a focused agent for care guidance,
            account setup, appointments, billing, or refunds instead of using one generic assistant.
          </p>
        </section>

        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {OPENCLAW_AGENT_IDS.map((agentId) => {
            const agent = OPENCLAW_AGENT_CATALOG[agentId]
            const Icon = AGENT_ICONS[agentId]
            const accent = AGENT_ACCENTS[agentId]
            const launchHref = `/chat?agent=${agentId}&q=${encodeURIComponent(agent.launchPrompt)}`

            return (
              <article key={agentId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}1a` }}>
                    <Icon className="h-5 w-5" style={{ color: accent }} />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{agent.functionArea}</span>
                </div>

                <h2 className="text-base font-semibold text-slate-900 mb-2">{agent.label}</h2>
                <p className="text-sm text-slate-600 leading-6 min-h-[72px]">{agent.description}</p>

                <div className="mt-5 space-y-2">
                  <Link
                    href={launchHref}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white"
                    style={{ backgroundColor: accent }}
                  >
                    Launch Agent
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={agent.workflowHref}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {agent.workflowLabel}
                  </Link>
                </div>
              </article>
            )
          })}
        </section>
      </main>
    </div>
  )
}
