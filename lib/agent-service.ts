import { createOpenAI } from "@ai-sdk/openai"
import type { CoreMessage } from "ai"
import { logger } from "@/lib/logger"

export type OpenClawAgentId =
  | "general-health"
  | "screening-specialist"
  | "care-navigator"
  | "billing-guide"

type AgentDefinition = {
  label: string
  description: string
  prompt: string
  keywords: string[]
  modelEnv: string
}

const OPENCLAW_AGENTS: Record<OpenClawAgentId, AgentDefinition> = {
  "general-health": {
    label: "General Health Agent",
    description: "General symptom and wellness guidance with clear triage escalation.",
    prompt:
      "You are BaseHealth's general health assistant. Provide evidence-based guidance, stay concise, and always recommend professional care for diagnosis or emergencies.",
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
  },
  "screening-specialist": {
    label: "Screening Specialist",
    description: "Personalized preventive screening guidance using USPSTF logic.",
    prompt:
      "You are BaseHealth's screening specialist. Focus on preventive care and USPSTF-aligned screening recommendations based on age, sex, risk factors, and follow-up cadence.",
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
  },
  "care-navigator": {
    label: "Care Navigator",
    description: "Provider/caregiver matching and care coordination support.",
    prompt:
      "You are BaseHealth's care navigator. Help users choose providers or caregivers, explain next steps, and suggest what details to prepare before visits.",
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
  },
  "billing-guide": {
    label: "Billing Guide",
    description: "Payment and Base blockchain transaction explanation with transparency.",
    prompt:
      "You are BaseHealth's billing guide. Explain healthcare payments, wallet transactions, and Base network settlement in plain language while preserving privacy.",
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
  },
}

const OPENCLAW_GATEWAY_URL = (process.env.OPENCLAW_GATEWAY_URL || "https://gateway.openclaw.ai").replace(
  /\/$/,
  "",
)

function normalizeAgent(input?: string | null): OpenClawAgentId | null {
  if (!input) return null

  const normalized = input.toLowerCase().trim()
  if (
    normalized === "general-health" ||
    normalized === "general" ||
    normalized === "health" ||
    normalized === "health-assistant"
  ) {
    return "general-health"
  }
  if (normalized === "screening-specialist" || normalized === "screening" || normalized === "preventive") {
    return "screening-specialist"
  }
  if (normalized === "care-navigator" || normalized === "care" || normalized === "provider" || normalized === "caregiver") {
    return "care-navigator"
  }
  if (normalized === "billing-guide" || normalized === "billing" || normalized === "payments" || normalized === "blockchain") {
    return "billing-guide"
  }

  return null
}

function scoreMessageForAgent(content: string, agent: OpenClawAgentId): number {
  const lower = content.toLowerCase()
  const keywords = OPENCLAW_AGENTS[agent].keywords
  return keywords.reduce((score, keyword) => (lower.includes(keyword) ? score + 1 : score), 0)
}

export function resolveAgent(
  messages: Array<{ role?: string; content?: unknown }>,
  requestedAgent?: string | null,
  fallback: OpenClawAgentId = "general-health",
): OpenClawAgentId {
  const explicitlySelected = normalizeAgent(requestedAgent)
  if (explicitlySelected) return explicitlySelected

  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message?.role === "user" && typeof message?.content === "string")

  if (!lastUserMessage || typeof lastUserMessage.content !== "string") return fallback

  const ranking = (Object.keys(OPENCLAW_AGENTS) as OpenClawAgentId[])
    .map((agent) => ({ agent, score: scoreMessageForAgent(lastUserMessage.content as string, agent) }))
    .sort((a, b) => b.score - a.score)

  return ranking[0].score > 0 ? ranking[0].agent : fallback
}

export function getAgentDefinition(agent: OpenClawAgentId): AgentDefinition {
  return OPENCLAW_AGENTS[agent]
}

export function isOpenClawConfigured(): boolean {
  return Boolean(process.env.OPENCLAW_API_KEY)
}

function resolveOpenClawModel(agent: OpenClawAgentId): string {
  return (
    process.env[OPENCLAW_AGENTS[agent].modelEnv] ||
    process.env.OPENCLAW_MODEL ||
    "gpt-4o-mini"
  )
}

export function getOpenClawModel(agent: OpenClawAgentId) {
  const apiKey = process.env.OPENCLAW_API_KEY
  if (!apiKey) return null

  const openclaw = createOpenAI({
    apiKey,
    baseURL: `${OPENCLAW_GATEWAY_URL}/v1`,
  })

  return openclaw(resolveOpenClawModel(agent))
}

function serializeContext(context?: Record<string, unknown> | null): string {
  if (!context) return ""

  try {
    return JSON.stringify(context, null, 2)
  } catch (error) {
    logger.warn("Failed to serialize agent context", error)
    return "{}"
  }
}

export function buildAgentSystemPrompt(
  agent: OpenClawAgentId,
  basePrompt: string,
  context?: Record<string, unknown> | null,
): string {
  const agentDef = OPENCLAW_AGENTS[agent]
  const contextBlock = context
    ? `\n\nContext you can use when relevant:\n${serializeContext(context)}`
    : ""

  return `${basePrompt}

Active OpenClaw agent: ${agentDef.label}
Agent purpose: ${agentDef.description}
Agent directive: ${agentDef.prompt}${contextBlock}`
}

type AgentEnhanceOptions = {
  agent?: OpenClawAgentId
  context?: Record<string, unknown> | null
}

const agentKit = {
  enhanceMessages: (messages: CoreMessage[], options?: AgentEnhanceOptions): CoreMessage[] => {
    const enhancedMessages = [...messages]

    if (options?.agent) {
      const agent = OPENCLAW_AGENTS[options.agent]
      enhancedMessages.unshift({
        role: "system",
        content: `Active agent focus: ${agent.label}. ${agent.description}`,
      })
    }

    if (options?.context) {
      enhancedMessages.unshift({
        role: "system",
        content: `Trusted context (do not expose private identifiers unless user asks): ${serializeContext(options.context)}`,
      })
    }

    return enhancedMessages
  },
}

const getWalletContext = async (walletAddress: string) => {
  return {
    walletAddress,
    network: process.env.NODE_ENV === "production" ? "base-mainnet" : "base-sepolia",
    mockContext: true,
    generatedAt: new Date().toISOString(),
  }
}

const getTransactionContext = async (txHash: string) => {
  return {
    txHash,
    explorerUrl: `https://${process.env.NODE_ENV === "production" ? "" : "sepolia."}basescan.org/tx/${txHash}`,
    mockContext: true,
    generatedAt: new Date().toISOString(),
  }
}

const getHealthcarePaymentContext = async (appointmentId: string, walletAddress: string) => {
  return {
    appointmentId,
    walletAddress,
    network: process.env.NODE_ENV === "production" ? "base-mainnet" : "base-sepolia",
    mockContext: true,
    generatedAt: new Date().toISOString(),
  }
}

export { agentKit, getWalletContext, getTransactionContext, getHealthcarePaymentContext }
