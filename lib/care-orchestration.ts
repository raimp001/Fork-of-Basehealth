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

export async function getCareSnapshot(patientId = "demo-patient"): Promise<CareSnapshot> {
  return {
    partners: [
      { id: "ph-1", name: "CityCare Pharmacy", type: "pharmacy", address: "120 Main St", phone: "(555) 100-2001", acceptsEScripts: true },
      { id: "lab-1", name: "Precision Labs", type: "lab", address: "89 Clinic Ave", phone: "(555) 100-3333", turnaround: "24-48h" },
      { id: "img-1", name: "Radiant Imaging Center", type: "imaging", address: "42 Health Blvd", phone: "(555) 100-4444", turnaround: "Same week" },
    ],
    priorAuth: [
      { id: "pa-1", patientId, medicationOrService: "GLP-1 medication", status: "submitted", payer: "Aetna" },
      { id: "pa-2", patientId, medicationOrService: "MRI lumbar spine", status: "draft", payer: "BCBS" },
    ],
    receipts: [
      { id: "rcpt-1", patientId, amountUsd: 145, status: "paid", description: "Telehealth follow-up", createdAt: new Date().toISOString() },
      { id: "rcpt-2", patientId, amountUsd: 85, status: "pending", description: "Lab coordination fee", createdAt: new Date().toISOString() },
    ],
    updates: [
      { id: "up-1", title: "USPSTF update: Hypertension screening", summary: "Annual blood pressure screening remains a high-priority preventive recommendation.", audience: "provider", publishedAt: new Date().toISOString() },
      { id: "up-2", title: "Patient article: Sleep and heart health", summary: "How sleep consistency reduces long-term cardiovascular risk.", audience: "patient", publishedAt: new Date().toISOString() },
    ],
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
  return { ...action, openCloud, routedPlan }
}
