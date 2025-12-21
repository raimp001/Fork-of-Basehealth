import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getPaymentRequirement, PAYMENT_TIERS } from '@/lib/http-402-service'

/**
 * GET /api/payments/402/requirements?resource=RESOURCE_TYPE
 * Get payment requirements for a specific resource
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const resourceType = searchParams.get('resource') as keyof typeof PAYMENT_TIERS

    if (!resourceType) {
      return NextResponse.json(
        { error: 'Missing resource parameter' },
        { status: 400 }
      )
    }

    if (!PAYMENT_TIERS[resourceType]) {
      return NextResponse.json(
        { error: 'Invalid resource type' },
        { status: 404 }
      )
    }

    const requirement = getPaymentRequirement(resourceType)

    return NextResponse.json({
      requirement,
      availableResources: Object.keys(PAYMENT_TIERS),
    })

  } catch (error) {
    logger.error('Get requirements error', error)
    return NextResponse.json(
      { error: 'Failed to get payment requirements' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payments/402/requirements/all
 * Get all available payment tiers
 */
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({
      tiers: PAYMENT_TIERS,
      network: process.env.NODE_ENV === 'production' ? 'base' : 'base-sepolia',
    })
  } catch (error) {
    logger.error('Get all requirements error', error)
    return NextResponse.json(
      { error: 'Failed to get payment tiers' },
      { status: 500 }
    )
  }
}

