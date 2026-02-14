import { type OpenClawAgentId } from "@/lib/openclaw-agent-catalog"

type RouteRecommendation = {
  prefix: string
  agentId: OpenClawAgentId
}

const RECOMMENDATIONS: RouteRecommendation[] = [
  { prefix: "/screening", agentId: "screening-specialist" },
  { prefix: "/providers", agentId: "care-navigator" },
  { prefix: "/caregivers", agentId: "care-navigator" },
  { prefix: "/appointment", agentId: "appointment-coordinator" },
  { prefix: "/clinical-trials", agentId: "clinical-trial-matcher" },
  { prefix: "/medical-records", agentId: "records-specialist" },
  { prefix: "/medical-profile", agentId: "records-specialist" },
  { prefix: "/medication", agentId: "medication-coach" },
  { prefix: "/billing", agentId: "billing-guide" },
  { prefix: "/payment", agentId: "billing-guide" },
  { prefix: "/checkout", agentId: "billing-guide" },
  { prefix: "/settings", agentId: "account-manager" },
  { prefix: "/wallet", agentId: "account-manager" },
  { prefix: "/login", agentId: "account-manager" },
  { prefix: "/register", agentId: "account-manager" },
  { prefix: "/onboarding", agentId: "account-manager" },
  { prefix: "/admin", agentId: "admin-ops" },
  { prefix: "/treasury", agentId: "treasury-operator" },
  { prefix: "/provider", agentId: "provider-ops" },
  { prefix: "/emergency", agentId: "emergency-triage" },
]

export function recommendOpenClawAgent(pathname: string | null | undefined): OpenClawAgentId {
  const path = (pathname || "/").toLowerCase()
  for (const item of RECOMMENDATIONS) {
    if (path === item.prefix || path.startsWith(`${item.prefix}/`) || path.startsWith(`${item.prefix}?`)) {
      return item.agentId
    }
  }
  return "general-health"
}

