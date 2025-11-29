import { NextRequest, NextResponse } from 'next/server'
import { 
  decodePaymentPayload,
  type PaymentPayload,
  type PaymentRequirement,
  type SettlementResponse 
} from '@/lib/x402-protocol'

/**
 * POST /api/x402/settle
 * Settle a payment with a supported scheme and network
 * 
 * Request body:
 * {
 *   x402Version: number
 *   paymentHeader: string (base64 encoded PaymentPayload)
 *   paymentRequirements: PaymentRequirement
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   error: string | null
 *   txHash: string | null
 *   networkId: string | null
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { x402Version, paymentHeader, paymentRequirements } = body

    if (!paymentHeader || !paymentRequirements) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing paymentHeader or paymentRequirements',
          txHash: null,
          networkId: null,
        } as SettlementResponse,
        { status: 400 }
      )
    }

    // Decode the payment payload
    let paymentPayload: PaymentPayload
    try {
      paymentPayload = decodePaymentPayload(paymentHeader)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payment header format',
          txHash: null,
          networkId: null,
        } as SettlementResponse,
        { status: 400 }
      )
    }

    // For exact scheme, the payment is already settled on-chain
    // We just need to extract the transaction hash
    if (paymentPayload.scheme === 'exact') {
      const txHash = paymentPayload.payload.txHash
      
      return NextResponse.json({
        success: true,
        error: null,
        txHash,
        networkId: paymentPayload.network,
      } as SettlementResponse)
    }

    // For other schemes, settlement logic would go here
    return NextResponse.json(
      {
        success: false,
        error: `Unsupported scheme: ${paymentPayload.scheme}`,
        txHash: null,
        networkId: null,
      } as SettlementResponse,
      { status: 400 }
    )

  } catch (error) {
    console.error('x402 settlement error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Settlement failed',
        txHash: null,
        networkId: null,
      } as SettlementResponse,
      { status: 500 }
    )
  }
}

