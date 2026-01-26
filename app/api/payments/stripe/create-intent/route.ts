/**
 * Stripe Payment Intent Creation API
 * 
 * Creates a Stripe payment intent for credit card payments.
 * Supports demo mode when Stripe is not configured.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createPaymentIntent, isStripeDemoMode, getStripeStatus } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      amount, 
      currency = 'usd', 
      metadata = {},
      customerId,
      description,
    } = body
    
    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }
    
    // Create payment intent (real or demo)
    const paymentIntent = await createPaymentIntent(amount, currency.toLowerCase())
    
    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: amount,
      currency: currency.toUpperCase(),
      demoMode: isStripeDemoMode,
      ...(isStripeDemoMode && {
        notice: 'This is a demo payment. No real charges will be made.',
      }),
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
