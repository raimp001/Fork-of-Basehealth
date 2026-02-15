import "server-only"

import { NextRequest, NextResponse } from "next/server"
import { createPublicClient, formatEther, http, type Hex } from "viem"
import { base, baseSepolia } from "viem/chains"
import { prisma } from "@/lib/prisma"
import { ACTIVE_CHAIN, PAYMENT_CONFIG, USE_MAINNET, getTxExplorerUrl } from "@/lib/network-config"
import { createBillingReceipt } from "@/lib/base-billing"

type VerifyTipRequest = {
  txHash: string
  orderId?: string
}

type VerifyTipResponse =
  | {
      success: true
      txHash: string
      explorerUrl: string
      paidAsset: "ETH"
      ethAmount: string
      priceUsdPerEth: number
      usdcEquivalent: string
      receipt: ReturnType<typeof createBillingReceipt>
    }
  | {
      success: false
      pending?: boolean
      error: string
      txHash?: string
    }

let PRICE_CACHE: { price: number; updatedAtMs: number } | null = null
const PRICE_TTL_MS = 60_000

async function getEthUsdSpotPrice(): Promise<number> {
  const now = Date.now()
  if (PRICE_CACHE && now - PRICE_CACHE.updatedAtMs < PRICE_TTL_MS) return PRICE_CACHE.price

  const res = await fetch("https://api.coinbase.com/v2/prices/ETH-USD/spot", {
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    throw new Error(`Coinbase price fetch failed (${res.status})`)
  }
  const json: any = await res.json().catch(() => null)
  const raw = json?.data?.amount
  const price = typeof raw === "string" ? Number.parseFloat(raw) : Number.NaN
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Invalid Coinbase price response")
  }

  PRICE_CACHE = { price, updatedAtMs: now }
  return price
}

function isValidTxHash(value: string): value is Hex {
  return /^0x[a-fA-F0-9]{64}$/.test(value)
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as VerifyTipRequest | null
    const txHash = body?.txHash?.trim()
    const orderId = body?.orderId?.trim()

    if (!txHash || !isValidTxHash(txHash)) {
      return NextResponse.json(
        { success: false, error: "Invalid txHash" } satisfies VerifyTipResponse,
        { status: 400 },
      )
    }

    const chain = USE_MAINNET ? base : baseSepolia
    const rpcUrl = USE_MAINNET ? "https://mainnet.base.org" : "https://sepolia.base.org"
    const client = createPublicClient({ chain, transport: http(rpcUrl) })

    let receipt: any
    try {
      receipt = await client.waitForTransactionReceipt({
        hash: txHash,
        timeout: 45_000,
      })
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          pending: true,
          error: "Transaction not confirmed yet. Retry verification shortly.",
          txHash,
        } satisfies VerifyTipResponse,
        { status: 202 },
      )
    }

    if (receipt?.status !== "success") {
      return NextResponse.json(
        { success: false, error: "Transaction failed or not confirmed", txHash } satisfies VerifyTipResponse,
        { status: 400 },
      )
    }

    const tx = await client.getTransaction({ hash: txHash })
    const to = (tx.to || "").toLowerCase()
    const expectedTo = PAYMENT_CONFIG.recipientAddress.toLowerCase()
    if (!to || to !== expectedTo) {
      return NextResponse.json(
        {
          success: false,
          error: `Recipient mismatch. Expected ${PAYMENT_CONFIG.recipientAddress}, got ${tx.to || "unknown"}.`,
          txHash,
        } satisfies VerifyTipResponse,
        { status: 400 },
      )
    }

    const ethAmount = formatEther(tx.value)
    const priceUsdPerEth = await getEthUsdSpotPrice()
    const ethNumber = Number.parseFloat(ethAmount)
    const usdNumber = Number.isFinite(ethNumber) ? ethNumber * priceUsdPerEth : 0
    const usdcEquivalent = Math.max(0, Math.round(usdNumber * 100) / 100).toFixed(2)

    const now = new Date()

    // Record a standalone transaction (tip). This is used for auditability and receipts.
    try {
      await prisma.transaction.create({
        data: {
          bookingId: null,
          transactionHash: txHash,
          provider: "BASE_ETH",
          providerId: txHash,
          amount: Number.parseFloat(usdcEquivalent),
          currency: "USDC",
          status: "PAID",
          completedAt: now,
          metadata: {
            kind: "tip",
            orderId: orderId || null,
            network: ACTIVE_CHAIN.name,
            sender: tx.from,
            recipient: tx.to,
            paidAsset: "ETH",
            eth: {
              wei: tx.value.toString(),
              amount: ethAmount,
            },
            conversion: {
              priceUsdPerEth,
              usdcEquivalent,
            },
            verifiedAt: now.toISOString(),
          },
        },
      })
    } catch (error) {
      // If already recorded (unique tx hash), continue.
    }

    const receiptView = createBillingReceipt({
      id: orderId || `tip-${txHash}`,
      amount: usdcEquivalent,
      currency: "USDC",
      status: "COMPLETED",
      paymentStatus: "PAID",
      paymentProvider: "BASE_ETH",
      paymentProviderId: txHash,
      paymentMetadata: {
        network: ACTIVE_CHAIN.name,
        payment: {
          txHash,
          sender: tx.from,
          recipient: tx.to,
          amount: usdcEquivalent,
          paidAsset: "ETH",
          ethAmount,
          ethWei: tx.value.toString(),
          priceUsdPerEth,
          verifiedAt: now.toISOString(),
        },
      },
      createdAt: now,
      paidAt: now,
      caregiver: { name: "BaseHealth" },
      user: null,
    })

    return NextResponse.json(
      {
        success: true,
        txHash,
        explorerUrl: getTxExplorerUrl(txHash),
        paidAsset: "ETH",
        ethAmount,
        priceUsdPerEth,
        usdcEquivalent,
        receipt: receiptView,
      } satisfies VerifyTipResponse,
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to verify tip",
      } satisfies VerifyTipResponse,
      { status: 500 },
    )
  }
}

