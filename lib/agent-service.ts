import { createOpenAI } from "@ai-sdk/openai"
import type { CoreMessage } from "ai"
import { logger } from "@/lib/logger"
import {
  OPENCLAW_AGENT_CATALOG,
  OPENCLAW_AGENT_IDS,
  normalizeOpenClawAgent,
  type OpenClawAgentId,
} from "@/lib/openclaw-agent-catalog"

type AgentDefinition = (typeof OPENCLAW_AGENT_CATALOG)[OpenClawAgentId]

const OPENCLAW_AGENTS = OPENCLAW_AGENT_CATALOG

const OPENCLAW_GATEWAY_URL = (process.env.OPENCLAW_GATEWAY_URL || "https://gateway.openclaw.ai").replace(
  /\/$/,
  "",
)

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
  const explicitlySelected = normalizeOpenClawAgent(requestedAgent)
  if (explicitlySelected) return explicitlySelected

  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message?.role === "user" && typeof message?.content === "string")

  if (!lastUserMessage || typeof lastUserMessage.content !== "string") return fallback

  const ranking = OPENCLAW_AGENT_IDS
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
