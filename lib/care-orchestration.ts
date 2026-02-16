export type NetworkPartner = {
  id: string
  name: string
  type: "pharmacy" | "lab" | "imaging"
  address: string
  phone: string
  acceptsEScripts?: boolean
  turnaround?: string
}

export type BillingReceipt = {
  id: string
  patientId: string
  amountUsd: number
  status: "paid" | "pending"
  description: string
  createdAt: string
}

export type PriorAuthItem = {
  id: string
  patientId: string
  medicationOrService: string
  status: "draft" | "submitted" | "approved"
  payer: string
}

export type ClinicalUpdate = {
  id: string
  title: string
  summary: string
  audience: "patient" | "provider"
  publishedAt: string
}

export type OpenCloudAgentStatus = {
  enabled: boolean
  version: string
  capabilities: string[]
}

export type CareSnapshot = {
  partners: NetworkPartner[]
  priorAuth: PriorAuthItem[]
  receipts: BillingReceipt[]
  updates: ClinicalUpdate[]
  openCloud: OpenCloudAgentStatus
  agents: { enabled: boolean; total: number; roles: string[] }
}

import { getOpenCloudStatus, runOpenCloudTask } from "@/lib/opencloud-agent"
import { CARE_AGENTS, buildAgentPlan } from "@/lib/agent-mesh"

const ACTION_LOG: Array<{ id: string; type: string; createdAt: string; payload?: Record<string, unknown>; openCloudResult?: string; routedTasks?: number }> = []
const MAX_ACTION_LOG_ENTRIES = 500

export async function getCareSnapshot(patientId?: string): Promise<CareSnapshot> {
  // NOTE: Do not return mock/demo patient data. This endpoint is intended to surface
  // real operational signals once integrations exist (billing, prior auth, labs, etc.).
  void patientId

  return {
    partners: [],
    priorAuth: [],
    receipts: [],
    updates: [],
    openCloud: getOpenCloudStatus(),
    agents: {
      enabled: true,
      total: CARE_AGENTS.length,
      roles: [...new Set(CARE_AGENTS.map((agent) => agent.role))],
    },
  }
}

export async function createCareAction(type: string, payload?: Record<string, unknown>) {
  const safePayload = payload || {}
  const intake = typeof safePayload.intake === "string" ? safePayload.intake : type
  const routedPlan = buildAgentPlan(intake)

  const openCloud = await runOpenCloudTask(type, {
    ...safePayload,
    routedPlan,
  })

  const action = {
    id: `act-${Date.now()}`,
    type,
    createdAt: new Date().toISOString(),
    payload: safePayload,
    openCloudResult: openCloud.message,
    routedTasks: routedPlan.tasks.length,
  }

  ACTION_LOG.push(action)
  if (ACTION_LOG.length > MAX_ACTION_LOG_ENTRIES) ACTION_LOG.shift()
  return { ...action, openCloud, routedPlan }
}
