import { NextRequest, NextResponse } from "next/server"
import { ASSISTANT_PASS, getAssistantPassStatus, isWalletAddress } from "@/lib/assistant-pass"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = (searchParams.get("walletAddress") || "").trim()

    if (!walletAddress || !isWalletAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: "walletAddress is required", pass: { usd: ASSISTANT_PASS.usd, hours: ASSISTANT_PASS.hours } },
        { status: 400 },
      )
    }

    const status = await getAssistantPassStatus(walletAddress)

    return NextResponse.json({
      success: true,
      walletAddress: status.walletAddress,
      hasAccess: status.active,
      validUntil: status.validUntil ? status.validUntil.toISOString() : null,
      pass: { usd: ASSISTANT_PASS.usd, hours: ASSISTANT_PASS.hours, serviceType: ASSISTANT_PASS.serviceType },
      lastPayment: status.lastPayment
        ? {
            provider: status.lastPayment.provider,
            txHash: status.lastPayment.txHash,
            amount: status.lastPayment.amount,
            paidAt: status.lastPayment.paidAt.toISOString(),
          }
        : null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to check pass status",
        pass: { usd: ASSISTANT_PASS.usd, hours: ASSISTANT_PASS.hours },
      },
      { status: 500 },
    )
  }
}

