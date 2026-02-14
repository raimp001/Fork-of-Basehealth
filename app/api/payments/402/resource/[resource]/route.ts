import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createPaymentRequiredResponse, createBasePaymentRequirement, decodePaymentPayload, X402_VERSION } from '@/lib/x402-protocol'
import { PAYMENT_TIERS } from '@/lib/http-402-service'
import { verifyExactPayment } from "@/lib/x402-verify"

/**
 * GET /api/payments/402/resource/[resource]
 * Resource endpoint that requires x402 payment
 * Returns 402 Payment Required with payment requirements
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  const params = await context.params
  try {
    const { resource } = params
    const tier = Object.values(PAYMENT_TIERS).find(t => t.resource === resource)

    if (!tier) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    const requirement = createBasePaymentRequirement(
      tier.amount,
      tier.currency,
      `/api/payments/402/resource/${resource}`,
      tier.description,
      'application/json',
      300 // 5 minute timeout
    )

    // Check for X-PAYMENT header
    const xPaymentHeader = request.headers.get('X-PAYMENT')

    if (!xPaymentHeader) {
      // No payment provided - return 402 with payment requirements
      return createPaymentRequiredResponse([requirement])
    }

    // Payment provided - verify and return resource.
    let paymentPayload: any
    try {
      paymentPayload = decodePaymentPayload(xPaymentHeader)
    } catch (error) {
      return createPaymentRequiredResponse([requirement], 'Invalid X-PAYMENT header')
    }

    if (paymentPayload?.x402Version !== X402_VERSION) {
      return createPaymentRequiredResponse([requirement], 'Unsupported x402 version')
    }

    if (paymentPayload?.scheme !== requirement.scheme || paymentPayload?.network !== requirement.network) {
      return createPaymentRequiredResponse([requirement], 'Payment scheme/network mismatch')
    }

    const verification = await verifyExactPayment(paymentPayload.payload, requirement)
    if (!verification.isValid) {
      return createPaymentRequiredResponse([requirement], verification.invalidReason || 'Payment verification failed')
    }
    
    // Return the resource content
    return NextResponse.json({
      success: true,
      resource,
      message: 'Payment verified. Access granted.',
      data: {
        // Resource-specific data would go here
        resource,
        accessGranted: true,
        timestamp: Date.now(),
      },
    })

  } catch (error) {
    logger.error('Resource endpoint error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
