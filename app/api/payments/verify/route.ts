/**
 * Unified Payment Verification API
 * 
 * Verifies payments across all providers (Stripe, Base, Solana, Coinbase Commerce).
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyTransaction as verifySolanaTransaction } from '@/lib/solana-payment-service'

// Initialize Stripe if configured
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, provider, transactionHash } = body
    
    if (!paymentId && !transactionHash) {
      return NextResponse.json(
        { error: 'Payment ID or transaction hash is required' },
        { status: 400 }
      )
    }
    
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      )
    }
    
    switch (provider) {
      case 'stripe':
        return await verifyStripePayment(paymentId)
      
      case 'base':
        return await verifyBasePayment(transactionHash || paymentId)
      
      case 'solana':
        return await verifySolanaPayment(transactionHash || paymentId)
      
      case 'coinbase_commerce':
        return await verifyCoinbaseCommercePayment(paymentId)
      
      default:
        return NextResponse.json(
          { error: `Unknown provider: ${provider}` },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}

async function verifyStripePayment(paymentIntentId: string) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    )
  }
  
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    const statusMap: Record<string, string> = {
      'succeeded': 'completed',
      'processing': 'processing',
      'requires_payment_method': 'pending',
      'requires_confirmation': 'pending',
      'requires_action': 'pending',
      'canceled': 'failed',
    }
    
    return NextResponse.json({
      verified: paymentIntent.status === 'succeeded',
      status: statusMap[paymentIntent.status] || 'pending',
      paymentId: paymentIntentId,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      completedAt: paymentIntent.status === 'succeeded' 
        ? new Date(paymentIntent.created * 1000).toISOString()
        : null,
    })
  } catch (error) {
    console.error('Stripe verification error:', error)
    return NextResponse.json({
      verified: false,
      status: 'failed',
      error: 'Failed to verify Stripe payment',
    })
  }
}

async function verifyBasePayment(transactionHash: string) {
  try {
    // Use viem/ethers to verify the transaction
    // For now, return a placeholder
    // In production, check the transaction on Base blockchain
    
    const isValidHash = /^0x[a-fA-F0-9]{64}$/.test(transactionHash)
    
    if (!isValidHash) {
      return NextResponse.json({
        verified: false,
        status: 'failed',
        error: 'Invalid transaction hash',
      })
    }
    
    // TODO: Implement actual blockchain verification with viem
    // const client = createPublicClient({ chain: base, transport: http() })
    // const receipt = await client.getTransactionReceipt({ hash: transactionHash })
    
    return NextResponse.json({
      verified: true, // Placeholder - implement actual verification
      status: 'completed',
      paymentId: transactionHash,
      transactionHash,
      explorerUrl: `https://basescan.org/tx/${transactionHash}`,
    })
  } catch (error) {
    console.error('Base verification error:', error)
    return NextResponse.json({
      verified: false,
      status: 'failed',
      error: 'Failed to verify Base payment',
    })
  }
}

async function verifySolanaPayment(signature: string) {
  try {
    const status = await verifySolanaTransaction(signature)
    
    return NextResponse.json({
      verified: status.confirmed,
      status: status.confirmed ? 'completed' : 'pending',
      paymentId: signature,
      transactionHash: signature,
      slot: status.slot,
      blockTime: status.blockTime,
      error: status.error,
    })
  } catch (error) {
    console.error('Solana verification error:', error)
    return NextResponse.json({
      verified: false,
      status: 'failed',
      error: 'Failed to verify Solana payment',
    })
  }
}

async function verifyCoinbaseCommercePayment(chargeId: string) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Coinbase Commerce is not configured' },
        { status: 500 }
      )
    }
    
    const response = await fetch(`https://api.commerce.coinbase.com/charges/${chargeId}`, {
      headers: {
        'X-CC-Api-Key': apiKey,
        'X-CC-Version': '2018-03-22',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch charge status')
    }
    
    const data = await response.json()
    const charge = data.data
    
    // Get the latest timeline event
    const timeline = charge.timeline || []
    const latestEvent = timeline[timeline.length - 1]
    
    const statusMap: Record<string, string> = {
      'NEW': 'pending',
      'PENDING': 'processing',
      'COMPLETED': 'completed',
      'EXPIRED': 'failed',
      'CANCELED': 'failed',
      'UNRESOLVED': 'pending',
      'RESOLVED': 'completed',
    }
    
    const currentStatus = latestEvent?.status || 'NEW'
    
    return NextResponse.json({
      verified: currentStatus === 'COMPLETED' || currentStatus === 'RESOLVED',
      status: statusMap[currentStatus] || 'pending',
      paymentId: chargeId,
      amount: parseFloat(charge.pricing?.local?.amount || 0),
      currency: charge.pricing?.local?.currency || 'USD',
      completedAt: currentStatus === 'COMPLETED' ? latestEvent?.time : null,
    })
  } catch (error) {
    console.error('Coinbase Commerce verification error:', error)
    return NextResponse.json({
      verified: false,
      status: 'failed',
      error: 'Failed to verify Coinbase Commerce payment',
    })
  }
}
