export type AgentRole =
  | "billing"
  | "coordinator"
  | "pcp_finder"
  | "pcp_copilot"
  | "prior_auth"
  | "formulary_optimizer"
  | "research"

export interface CareAgent {
  id: string
  name: string
  role: AgentRole
  objective: string
  tools: string[]
}

export interface AgentTask {
  id: string
  role: AgentRole
  goal: string
  status: "queued" | "in_progress" | "completed"
}

export interface AgentPlan {
  intake: string
  tasks: AgentTask[]
}

export const CARE_AGENTS: CareAgent[] = [
  {
    id: "agent-billing-01",
    name: "Revenue Integrity Agent",
    role: "billing",
    objective: "Maximize clean claims, denial prevention, and compliant reimbursement.",
    tools: ["CPT/ICD coding hints", "denial pattern checks", "receipt generation"],
  },
  {
    id: "agent-coordinator-01",
    name: "Workflow Coordinator Agent",
    role: "coordinator",
    objective: "Coordinate all specialist agents and keep one patient timeline.",
    tools: ["task routing", "handoff summaries", "audit trail"],
  },
  {
    id: "agent-pcp-finder-01",
    name: "PCP Network Finder Agent",
    role: "pcp_finder",
    objective: "Find high-quality and geographically convenient PCP options.",
    tools: ["provider quality ranking", "distance filters", "availability search"],
  },
  {
    id: "agent-pcp-copilot-01",
    name: "Virtual PCP Copilot Agent",
    role: "pcp_copilot",
    objective: "Guide preventive care, triage risk, and suggest follow-up actions.",
    tools: ["USPSTF logic", "CDC logic", "device trend summarization"],
  },
  {
    id: "agent-prior-auth-01",
    name: "Prior Authorization Navigator",
    role: "prior_auth",
    objective: "Prepare and submit complete prior-auth packets with payer-specific rules.",
    tools: ["payer checklist", "document tracking", "escalation reminders"],
  },
  {
    id: "agent-formulary-01",
    name: "Lowest-Cost Formulary Agent",
    role: "formulary_optimizer",
    objective: "Find affordable therapeutic alternatives based on formulary tier and copay.",
    tools: ["tier lookup", "generic alternatives", "pharmacy pricing"],
  },
  {
    id: "agent-research-01",
    name: "Clinical Research Agent",
    role: "research",
    objective: "Aggregate evidence from NCCN, UpToDate-style summaries, and key clinical papers.",
    tools: ["paper search", "guideline extraction", "evidence grading"],
  },
]

function hasAny(text: string, terms: string[]) {
  const value = text.toLowerCase()
  return terms.some((term) => value.includes(term))
}

export function buildAgentPlan(intake: string): AgentPlan {
  const tasks: AgentTask[] = [
    {
      id: `task-${Date.now()}-coord`,
      role: "coordinator",
      goal: "Create shared care timeline and route downstream agent tasks.",
      status: "queued",
    },
  ]

  if (hasAny(intake, ["bill", "claim", "denial", "receipt"])) {
    tasks.push({ id: `task-${Date.now()}-bill`, role: "billing", goal: "Run billing QA and clean-claim checks.", status: "queued" })
  }

  if (hasAny(intake, ["pcp", "primary care", "doctor near", "find provider"])) {
    tasks.push({ id: `task-${Date.now()}-pcp-find`, role: "pcp_finder", goal: "Find best PCP matches by location and quality.", status: "queued" })
  }

  if (hasAny(intake, ["screening", "risk", "guideline", "preventive"])) {
    tasks.push({ id: `task-${Date.now()}-pcp-copilot`, role: "pcp_copilot", goal: "Generate preventive and risk-aware PCP action plan.", status: "queued" })
  }

  if (hasAny(intake, ["prior auth", "authorization", "payer", "approval"])) {
    tasks.push({ id: `task-${Date.now()}-pa`, role: "prior_auth", goal: "Prepare prior-auth packet and payer-specific documentation.", status: "queued" })
  }

  if (hasAny(intake, ["drug", "medication", "cheapest", "copay", "formulary"])) {
    tasks.push({ id: `task-${Date.now()}-rx`, role: "formulary_optimizer", goal: "Compare formulary options and identify lowest-cost therapeutic path.", status: "queued" })
  }

  if (hasAny(intake, ["nccn", "paper", "research", "evidence", "uptodate"])) {
    tasks.push({ id: `task-${Date.now()}-research`, role: "research", goal: "Build evidence brief from guidelines and research corpus.", status: "queued" })
  }

  return { intake, tasks }
}
