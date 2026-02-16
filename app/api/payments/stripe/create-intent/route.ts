/**
 * Stripe Payment Intent Creation API
 *
 * Creates a Stripe payment intent for credit card payments.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createPaymentIntent, getStripeStatus, stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { success: false, error: 'Stripe is not configured.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const {
      amount,
      currency = 'usd',
    } = body
    
    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }
    
    // Create payment intent
    const paymentIntent = await createPaymentIntent(amount, currency.toLowerCase())
    
    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: amount,
      currency: currency.toUpperCase(),
    })
    
  } catch (error) {
    console.error('Error creating Stripe payment intent:', error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment' },
      { status: 500 }
    )
  }
}

// GET endpoint to check Stripe status
export async function GET() {
  return NextResponse.json(getStripeStatus())
}
