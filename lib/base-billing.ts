import { createHash } from "crypto"
import { ACTIVE_CHAIN, getTxExplorerUrl } from "@/lib/network-config"

type NullableDate = Date | null | undefined

export interface ReceiptBookingShape {
  id: string
  amount: number | string | { toString(): string } | null | undefined
  currency?: string | null
  status: string
  paymentStatus: string
  paymentProvider?: string | null
  paymentProviderId?: string | null
  paymentMetadata?: any
  createdAt: Date
  paidAt?: NullableDate
  cancelledAt?: NullableDate
  caregiver?:
    | {
        name?: string | null
        firstName?: string | null
        lastName?: string | null
      }
    | null
  user?: { name?: string | null; email?: string | null } | null
}

export interface BillingReceipt {
  receiptId: string
  bookingId: string
  amount: string
  currency: string
  network: string
  bookingStatus: string
  paymentStatus: string
  paymentProvider: string
  issuedAt: string
  paidAt?: string
  refundedAt?: string
  patientName?: string
  patientEmail?: string
  providerName?: string
  paymentTxHash?: string
  paymentExplorerUrl?: string
  refundTxHash?: string
  refundExplorerUrl?: string
  refundAmount?: string
  refundReason?: string
}

function formatCaregiverName(caregiver: ReceiptBookingShape["caregiver"]): string | undefined {
  if (!caregiver) return undefined
  if (caregiver.name) return caregiver.name

  const first = caregiver.firstName || ""
  const last = caregiver.lastName || ""
  const full = `${first} ${last}`.trim()
  return full || undefined
}

function toAmountString(amount: ReceiptBookingShape["amount"]): string {
  if (typeof amount === "number") return amount.toFixed(2)
  if (typeof amount === "string") {
    const parsed = Number.parseFloat(amount)
    return Number.isFinite(parsed) ? parsed.toFixed(2) : "0.00"
  }
  if (amount && typeof amount === "object" && "toString" in amount) {
    const parsed = Number.parseFloat(amount.toString())
    return Number.isFinite(parsed) ? parsed.toFixed(2) : "0.00"
  }
  return "0.00"
}

function isTxHash(value?: string | null): value is string {
  return Boolean(value && /^0x[a-fA-F0-9]{64}$/.test(value))
}

function maybeExplorerUrl(txHash?: string | null): string | undefined {
  if (!isTxHash(txHash)) return undefined
  return getTxExplorerUrl(txHash)
}

function getPaymentTxHash(booking: ReceiptBookingShape): string | undefined {
  const metadata = (booking.paymentMetadata || {}) as any
  const paymentFromMetadata = metadata?.payment?.txHash
  if (isTxHash(paymentFromMetadata)) return paymentFromMetadata
  if (isTxHash(booking.paymentProviderId)) return booking.paymentProviderId
  return undefined
}

function getRefundData(booking: ReceiptBookingShape): {
  txHash?: string
  amount?: string
  reason?: string
  processedAt?: string
} {
  const metadata = (booking.paymentMetadata || {}) as any
  const refund = metadata?.refund || {}
  const txHash = isTxHash(refund.txHash) ? refund.txHash : undefined

  let amount: string | undefined
  if (refund.amount !== undefined && refund.amount !== null) {
    const parsed = Number.parseFloat(String(refund.amount))
    if (Number.isFinite(parsed)) {
      amount = parsed.toFixed(2)
    }
  }

  return {
    txHash,
    amount,
    reason: typeof refund.reason === "string" ? refund.reason : undefined,
    processedAt: typeof refund.processedAt === "string" ? refund.processedAt : undefined,
  }
}

export function generateMockBaseTxHash(seed: string): string {
  const hash = createHash("sha256").update(seed).digest("hex")
  return `0x${hash}`
}

export function createBillingReceipt(booking: ReceiptBookingShape): BillingReceipt {
  const paymentTxHash = getPaymentTxHash(booking)
  const refund = getRefundData(booking)
  const metadata = (booking.paymentMetadata || {}) as any
  const receiptSeed = `${booking.id}:${booking.createdAt.toISOString()}:${paymentTxHash || "no-tx"}`
  const receiptId = `rcpt_${createHash("sha1").update(receiptSeed).digest("hex").slice(0, 16)}`

  return {
    receiptId,
    bookingId: booking.id,
    amount: toAmountString(booking.amount),
    currency: booking.currency || "USDC",
    network: metadata?.network || ACTIVE_CHAIN.name,
    bookingStatus: booking.status,
    paymentStatus: booking.paymentStatus,
    paymentProvider: booking.paymentProvider || "BASE_USDC",
    issuedAt: booking.createdAt.toISOString(),
    paidAt: booking.paidAt ? booking.paidAt.toISOString() : undefined,
    refundedAt: refund.processedAt || (booking.cancelledAt ? booking.cancelledAt.toISOString() : undefined),
    patientName: booking.user?.name || undefined,
    patientEmail: booking.user?.email || undefined,
    providerName: formatCaregiverName(booking.caregiver),
    paymentTxHash,
    paymentExplorerUrl: maybeExplorerUrl(paymentTxHash),
    refundTxHash: refund.txHash,
    refundExplorerUrl: maybeExplorerUrl(refund.txHash),
    refundAmount: refund.amount,
    refundReason: refund.reason,
  }
}
