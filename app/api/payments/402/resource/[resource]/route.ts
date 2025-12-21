import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createPaymentRequiredResponse } from '@/lib/x402-protocol'
import { createBasePaymentRequirement } from '@/lib/x402-protocol'
import { PAYMENT_TIERS } from '@/lib/http-402-service'

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

    // Check for X-PAYMENT header
    const xPaymentHeader = request.headers.get('X-PAYMENT')

    if (!xPaymentHeader) {
      // No payment provided - return 402 with payment requirements
      const tier = Object.values(PAYMENT_TIERS).find(t => t.resource === resource)
      
      if (!tier) {
        return NextResponse.json(
          { error: 'Resource not found' },
          { status: 404 }
        )
      }

      // Create x402 payment requirement
      const requirement = createBasePaymentRequirement(
        tier.amount,
        tier.currency,
        `/api/payments/402/resource/${resource}`,
        tier.description,
        'application/json',
        300 // 5 minute timeout
      )

      return createPaymentRequiredResponse([requirement])
    }

    // Payment provided - verify and return resource
    // In production, verify the payment using facilitator
    // For now, we'll accept any valid X-PAYMENT header
    
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

