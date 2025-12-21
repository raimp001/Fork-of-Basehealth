import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter'
import { getServerSession } from 'next-auth'
import { coinbaseCommerceConfig } from '@/lib/coinbase-config'

// Coinbase Commerce API endpoint
const COINBASE_COMMERCE_API = 'https://api.commerce.coinbase.com'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { 
      amount, 
      currency = 'USD',
      description,
      metadata,
      pricing_type = 'fixed_price'
    } = await request.json()

    // Create charge with Coinbase Commerce
    const response = await fetch(`${COINBASE_COMMERCE_API}/charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': coinbaseCommerceConfig.apiKey,
        'X-CC-Version': '2018-03-22'
      },
      body: JSON.stringify({
        name: 'BaseHealth Payment',
        description,
        pricing_type,
        local_price: {
          amount: amount.toString(),
          currency
        },
        metadata: {
          user_id: session.user?.id,
          user_email: session.user?.email,
          ...metadata
        },
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`
      })
    })

    if (!response.ok) {
      const error = await response.text()
      logger.error('Coinbase Commerce error', error)
      throw new Error('Failed to create charge')
    }

    const charge = await response.json()

    return NextResponse.json({
      success: true,
      charge_id: charge.data.id,
      hosted_url: charge.data.hosted_url,
      expires_at: charge.data.expires_at,
      addresses: charge.data.addresses,
      pricing: charge.data.pricing
    })

  } catch (error) {
    logger.error('Create charge error', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

// Get charge status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chargeId = searchParams.get('charge_id')

    if (!chargeId) {
      return NextResponse.json(
        { error: 'Charge ID required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${COINBASE_COMMERCE_API}/charges/${chargeId}`, {
      headers: {
        'X-CC-Api-Key': coinbaseCommerceConfig.apiKey,
        'X-CC-Version': '2018-03-22'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch charge')
    }

    const charge = await response.json()

    return NextResponse.json({
      success: true,
      status: charge.data.timeline[charge.data.timeline.length - 1].status,
      charge: charge.data
    })

  } catch (error) {
    logger.error('Get charge error', error)
    return NextResponse.json(
      { error: 'Failed to fetch charge status' },
      { status: 500 }
    )
  }
}
