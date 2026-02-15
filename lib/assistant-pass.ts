import "server-only"

import { prisma } from "@/lib/prisma"

export const ASSISTANT_PASS = {
  serviceType: "assistant-pass-chat",
  hours: (() => {
    const raw = process.env.BASEHEALTH_ASSISTANT_PASS_HOURS || process.env.ASSISTANT_PASS_HOURS
    const parsed = raw ? Number.parseFloat(raw) : Number.NaN
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 24
  })(),
  usd: (() => {
    const raw = process.env.BASEHEALTH_ASSISTANT_PASS_USD || process.env.ASSISTANT_PASS_USD
    const parsed = raw ? Number.parseFloat(raw) : Number.NaN
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0.25
  })(),
}

export function isWalletAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value)
}

type AssistantPassStatus = {
  active: boolean
  walletAddress: string
  validUntil: Date | null
  lastPayment?: {
    provider: string
    txHash: string | null
    amount: string
    paidAt: Date
  } | null
}

export async function getAssistantPassStatus(walletAddress: string): Promise<AssistantPassStatus> {
  const wallet = walletAddress.trim().toLowerCase()
  if (!wallet || !isWalletAddress(wallet)) {
    return { active: false, walletAddress: walletAddress, validUntil: null, lastPayment: null }
  }

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const tx = await prisma.transaction.findFirst({
    where: {
      status: "PAID",
      provider: "BASE_USDC",
      completedAt: { not: null, gte: cutoff },
      AND: [
        { metadata: { path: ["sender"], equals: wallet } as any },
        { metadata: { path: ["serviceType"], equals: ASSISTANT_PASS.serviceType } as any },
      ],
    },
    orderBy: { completedAt: "desc" },
  })

  if (!tx?.completedAt) {
    return { active: false, walletAddress: wallet, validUntil: null, lastPayment: null }
  }

  const amountNumber = typeof tx.amount === "object" && "toString" in tx.amount ? Number(tx.amount.toString()) : Number(tx.amount)
  const amount = Number.isFinite(amountNumber) ? amountNumber : 0
  const paidAt = tx.completedAt
  const validUntil = new Date(paidAt.getTime() + ASSISTANT_PASS.hours * 60 * 60 * 1000)
  const active = amount >= ASSISTANT_PASS.usd && Date.now() < validUntil.getTime()

  return {
    active,
    walletAddress: wallet,
    validUntil,
    lastPayment: {
      provider: tx.provider,
      txHash: tx.transactionHash,
      amount: amount.toFixed(2),
      paidAt,
    },
  }
}

