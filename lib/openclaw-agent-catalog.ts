export type OpenClawAgentId =
  | "general-health"
  | "screening-specialist"
  | "care-navigator"
  | "appointment-coordinator"
  | "clinical-trial-matcher"
  | "account-manager"
  | "billing-guide"
  | "claims-refunds"

export type OpenClawAgentDefinition = {
  label: string
  shortLabel: string
  description: string
  functionArea: string
  prompt: string
  placeholder: string
  examples: string[]
  keywords: string[]
  modelEnv: string
  launchPrompt: string
  workflowHref: string
  workflowLabel: string
}

export const OPENCLAW_AGENT_CATALOG: Record<OpenClawAgentId, OpenClawAgentDefinition> = {
  "general-health": {
    label: "General Health Agent",
    shortLabel: "General",
    description: "General symptom and wellness guidance with clear triage escalation.",
    functionArea: "Health Questions",
    prompt:
      "You are BaseHealth's general health assistant. Provide evidence-based guidance, stay concise, and always recommend professional care for diagnosis or emergencies.",
    placeholder: "Ask a general health question...",
    examples: [
      "What are early warning signs of diabetes?",
      "How can I improve my sleep quality this week?",
      "When should I go to urgent care versus ER?",
    ],
    keywords: [
      "symptom",
      "headache",
      "fever",
      "wellness",
      "sleep",
      "nutrition",
      "exercise",
      "anxiety",
      "stress",
      "pain",
    ],
    modelEnv: "OPENCLAW_MODEL_GENERAL",
    launchPrompt: "Review my symptoms and tell me what level of care I likely need today.",
    workflowHref: "/health/dashboard",
    workflowLabel: "Open dashboard",
  },
  "screening-specialist": {
    label: "Screening Specialist",
    shortLabel: "Screening",
    description: "Personalized preventive screening guidance using USPSTF logic.",
    functionArea: "Preventive Care",
    prompt:
      "You are BaseHealth's screening specialist. Focus on preventive care and USPSTF-aligned screening recommendations based on age, sex, risk factors, and follow-up cadence.",
    placeholder: "Ask about preventive screenings...",
    examples: [
      "Which screenings should a 46-year-old get this year?",
      "How often should I get a colon cancer screening?",
      "What risk factors change mammogram frequency?",
    ],
    keywords: [
      "screening",
      "mammogram",
      "colonoscopy",
      "pap smear",
      "uspstf",
      "preventive",
      "risk factors",
      "diabetes screening",
      "cholesterol",
      "blood pressure",
    ],
    modelEnv: "OPENCLAW_MODEL_SCREENING",
    launchPrompt: "Build my preventive screening plan for the next 12 months.",
    workflowHref: "/screening",
    workflowLabel: "Start screening",
  },
  "care-navigator": {
    label: "Care Navigator",
    shortLabel: "Care",
    description: "Provider and caregiver matching plus care coordination support.",
    functionArea: "Care Matching",
    prompt:
      "You are BaseHealth's care navigator. Help users choose providers or caregivers, explain next steps, and suggest what details to prepare before visits.",
    placeholder: "Ask about finding providers or next steps...",
    examples: [
      "What specialist should I see for recurring migraines?",
      "How should I prepare for a telemedicine visit?",
      "How do I choose between urgent care and primary care?",
    ],
    keywords: [
      "provider",
      "doctor",
      "specialist",
      "caregiver",
      "appointment",
      "telemedicine",
      "find care",
      "location",
      "insurance",
      "referral",
    ],
    modelEnv: "OPENCLAW_MODEL_CARE",
    launchPrompt: "Help me find the right specialist and next booking step.",
    workflowHref: "/providers/search",
    workflowLabel: "Find providers",
  },
  "appointment-coordinator": {
    label: "Appointment Coordinator",
    shortLabel: "Appointments",
    description: "Visit preparation, scheduling logic, reminders, and follow-up plans.",
    functionArea: "Scheduling",
    prompt:
      "You are BaseHealth's appointment coordinator. Help users pick visit types, prepare for appointments, and structure follow-up tasks and reminders.",
    placeholder: "Ask about booking, prep, or follow-up timing...",
    examples: [
      "Should this be telehealth or in-person?",
      "What should I prepare before my cardiology appointment?",
      "Create a follow-up checklist after my visit.",
    ],
    keywords: [
      "schedule",
      "booking",
      "appointment",
      "calendar",
      "follow-up",
      "visit prep",
      "reschedule",
      "availability",
      "checklist",
      "reminder",
    ],
    modelEnv: "OPENCLAW_MODEL_APPOINTMENTS",
    launchPrompt: "Plan my appointment timeline including prep, visit, and follow-up.",
    workflowHref: "/appointment/book",
    workflowLabel: "Book appointment",
  },
  "clinical-trial-matcher": {
    label: "Clinical Trial Matcher",
    shortLabel: "Trials",
    description: "Trial discovery, eligibility pre-checks, and enrollment preparation.",
    functionArea: "Research Access",
    prompt:
      "You are BaseHealth's clinical trial matcher. Explain trial options, likely eligibility factors, and practical enrollment questions users should ask research sites.",
    placeholder: "Ask about trial matching or eligibility prep...",
    examples: [
      "Find trial types relevant to my condition.",
      "What questions should I ask before enrolling in a study?",
      "How do inclusion and exclusion criteria work?",
    ],
    keywords: [
      "clinical trial",
      "trial",
      "research",
      "eligibility",
      "enrollment",
      "study",
      "protocol",
      "inclusion",
      "exclusion",
      "investigator",
    ],
    modelEnv: "OPENCLAW_MODEL_TRIALS",
    launchPrompt: "Help me shortlist clinical trials and prepare eligibility questions.",
    workflowHref: "/clinical-trials",
    workflowLabel: "Browse trials",
  },
  "account-manager": {
    label: "Account Manager",
    shortLabel: "Account",
    description: "Sign-in support, profile maintenance, and account settings guidance.",
    functionArea: "Account Management",
    prompt:
      "You are BaseHealth's account manager. Guide users through sign-in, security basics, profile updates, and account settings without requesting sensitive secrets.",
    placeholder: "Ask about sign-in, profile, or account settings...",
    examples: [
      "How do I connect my wallet to my account?",
      "What should I update in my profile before booking care?",
      "How do I check if my Base sign-in setup is complete?",
    ],
    keywords: [
      "account",
      "sign in",
      "login",
      "profile",
      "settings",
      "wallet login",
      "privy",
      "security",
      "session",
      "identity",
    ],
    modelEnv: "OPENCLAW_MODEL_ACCOUNT",
    launchPrompt: "Audit my account setup and list anything missing for Base sign-in.",
    workflowHref: "/settings",
    workflowLabel: "Open settings",
  },
  "billing-guide": {
    label: "Billing Guide",
    shortLabel: "Billing",
    description: "Payment and Base blockchain transaction explanation with transparency.",
    functionArea: "Payments",
    prompt:
      "You are BaseHealth's billing guide. Explain healthcare payments, wallet transactions, and Base network settlement in plain language while preserving privacy.",
    placeholder: "Ask about payments, wallets, and transaction details...",
    examples: [
      "How do BaseHealth payments work on Base blockchain?",
      "What does this transaction hash mean for my appointment payment?",
      "How can I verify a USDC payment was settled?",
    ],
    keywords: [
      "payment",
      "billing",
      "wallet",
      "base",
      "blockchain",
      "usdc",
      "transaction",
      "gas",
      "invoice",
      "receipt",
    ],
    modelEnv: "OPENCLAW_MODEL_BILLING",
    launchPrompt: "Show me how to verify my payment receipt and transaction status.",
    workflowHref: "/billing",
    workflowLabel: "Open billing",
  },
  "claims-refunds": {
    label: "Claims & Refunds Agent",
    shortLabel: "Refunds",
    description: "Refund eligibility, claim status, receipts, and audit trail support.",
    functionArea: "Refund Operations",
    prompt:
      "You are BaseHealth's claims and refunds specialist. Help users understand refund outcomes, required details, and expected processing timelines while staying factual and transparent.",
    placeholder: "Ask about refunds, receipts, or payment issue resolution...",
    examples: [
      "How do I check if my refund was processed?",
      "What information is needed for a refund request?",
      "Where can I view my refund transaction on BaseScan?",
    ],
    keywords: [
      "refund",
      "claim",
      "chargeback",
      "dispute",
      "receipt",
      "billing issue",
      "reversal",
      "payment failed",
      "refund status",
      "basescan",
    ],
    modelEnv: "OPENCLAW_MODEL_REFUNDS",
    launchPrompt: "Check what I need to track a refund and confirm payout status.",
    workflowHref: "/admin/bookings",
    workflowLabel: "Open refund ops",
  },
}

export const OPENCLAW_AGENT_IDS = Object.keys(OPENCLAW_AGENT_CATALOG) as OpenClawAgentId[]

const OPENCLAW_AGENT_ALIASES: Record<string, OpenClawAgentId> = {
  "general-health": "general-health",
  general: "general-health",
  health: "general-health",
  "health-assistant": "general-health",
  "screening-specialist": "screening-specialist",
  screening: "screening-specialist",
  preventive: "screening-specialist",
  "care-navigator": "care-navigator",
  care: "care-navigator",
  provider: "care-navigator",
  caregiver: "care-navigator",
  "appointment-coordinator": "appointment-coordinator",
  appointments: "appointment-coordinator",
  scheduling: "appointment-coordinator",
  "clinical-trial-matcher": "clinical-trial-matcher",
  trials: "clinical-trial-matcher",
  trial: "clinical-trial-matcher",
  "account-manager": "account-manager",
  account: "account-manager",
  signin: "account-manager",
  "sign-in": "account-manager",
  "billing-guide": "billing-guide",
  billing: "billing-guide",
  payments: "billing-guide",
  blockchain: "billing-guide",
  "claims-refunds": "claims-refunds",
  refunds: "claims-refunds",
  refund: "claims-refunds",
  claims: "claims-refunds",
}

export function normalizeOpenClawAgent(input?: string | null): OpenClawAgentId | null {
  if (!input) return null
  const normalized = input.toLowerCase().trim()
  return OPENCLAW_AGENT_ALIASES[normalized] || null
}
