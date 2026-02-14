import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { 
  decodePaymentPayload, 
  type PaymentPayload,
  type PaymentRequirement,
  type VerificationResponse 
} from '@/lib/x402-protocol'
import { verifyExactPayment } from "@/lib/x402-verify"

/**
 * POST /api/x402/verify
 * Verify a payment with a supported scheme and network
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
 *   isValid: boolean
 *   invalidReason: string | null
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { x402Version, paymentHeader, paymentRequirements } = body

    if (!paymentHeader || !paymentRequirements) {
      return NextResponse.json(
        {
          isValid: false,
          invalidReason: 'Missing paymentHeader or paymentRequirements',
        } as VerificationResponse,
        { status: 400 }
      )
    }

    // Decode the payment payload from X-PAYMENT header
    let paymentPayload: PaymentPayload
    try {
      paymentPayload = decodePaymentPayload(paymentHeader)
    } catch (error) {
      return NextResponse.json(
        {
          isValid: false,
          invalidReason: 'Invalid payment header format',
        } as VerificationResponse,
        { status: 400 }
      )
    }

    // Verify x402 version matches
    if (paymentPayload.x402Version !== x402Version) {
      return NextResponse.json(
        {
          isValid: false,
          invalidReason: `Version mismatch: ${paymentPayload.x402Version} !== ${x402Version}`,
        } as VerificationResponse,
        { status: 400 }
      )
    }

    // Verify scheme matches
    if (paymentPayload.scheme !== paymentRequirements.scheme) {
      return NextResponse.json(
        {
          isValid: false,
          invalidReason: `Scheme mismatch: ${paymentPayload.scheme} !== ${paymentRequirements.scheme}`,
        } as VerificationResponse,
        { status: 400 }
      )
    }

    // Verify network matches
    if (paymentPayload.network !== paymentRequirements.network) {
      return NextResponse.json(
        {
          isValid: false,
          invalidReason: `Network mismatch: ${paymentPayload.network} !== ${paymentRequirements.network}`,
        } as VerificationResponse,
        { status: 400 }
      )
    }

    // Verify payment based on scheme
    let verificationResult: VerificationResponse

    if (paymentPayload.scheme === 'exact') {
      // Verify exact scheme payment (EVM)
      verificationResult = await verifyExactPayment(
        paymentPayload.payload,
        paymentRequirements
      )
    } else {
      return NextResponse.json(
        {
          isValid: false,
          invalidReason: `Unsupported scheme: ${paymentPayload.scheme}`,
        } as VerificationResponse,
        { status: 400 }
      )
    }

    return NextResponse.json(verificationResult)

  } catch (error) {
    logger.error('x402 verification error', error)
    return NextResponse.json(
      {
        isValid: false,
        invalidReason: error instanceof Error ? error.message : 'Verification failed',
      } as VerificationResponse,
      { status: 500 }
    )
  }
}
