/**
 * Payment Verification API
 * 
 * Server-side verification of Base Pay payments.
 * Call before fulfilling orders to prevent replay attacks.
 * 
 * POST /api/payments/verify
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  verifyBasePayment, 
  isPaymentProcessed, 
  markPaymentProcessed,
  basePayConfig,
} from '@/lib/base-pay-service'
import { recordProviderEarning } from '@/lib/usdc-settlement-service'

interface VerifyRequest {
  paymentId: string
  orderId: string
  expectedAmount: string
  expectedRecipient?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequest = await request.json()
    
    const { 
      paymentId, 
      orderId, 
      expectedAmount, 
      expectedRecipient = basePayConfig.recipientAddress 
    } = body
    
    // Validate required fields
    if (!paymentId) {
      return NextResponse.json({
        success: false,
        error: 'Payment ID is required',
      }, { status: 400 })
    }
    
    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: 'Order ID is required',
      }, { status: 400 })
    }
    
    if (!expectedAmount) {
      return NextResponse.json({
        success: false,
        error: 'Expected amount is required',
      }, { status: 400 })
    }
    
    // Check for replay attack
    if (isPaymentProcessed(paymentId)) {
      return NextResponse.json({
        success: false,
        error: 'Payment has already been processed',
        code: 'PAYMENT_ALREADY_PROCESSED',
      }, { status: 409 })
    }
    
    // Verify payment with Base Pay SDK
    const verification = await verifyBasePayment(
      paymentId,
      expectedAmount,
      expectedRecipient
    )
    
    if (!verification.verified) {
      return NextResponse.json({
        success: false,
        error: verification.error || 'Payment verification failed',
        status: verification.status,
      }, { status: 400 })
    }
    
    // Mark payment as processed to prevent replay
    markPaymentProcessed(
      paymentId,
      orderId,
      verification.sender || '',
      verification.amount || expectedAmount
    )
    
    // Record provider earning (credit to their pending balance)
    const providerId = body.providerId
    if (providerId) {
      const amountUsd = parseFloat(expectedAmount)
      await recordProviderEarning(providerId, amountUsd, paymentId)
    }
    
    return NextResponse.json({
      success: true,
      verified: true,
      payment: {
        id: paymentId,
        orderId,
        sender: verification.sender,
        recipient: verification.recipient,
        amount: verification.amount,
        status: verification.status,
      },
    })
    
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    }, { status: 500 })
  }
}

/**
 * GET - Check if a payment has been processed
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const paymentId = searchParams.get('paymentId')
  
  if (!paymentId) {
    return NextResponse.json({
      success: false,
      error: 'Payment ID is required',
    }, { status: 400 })
  }
  
  const processed = isPaymentProcessed(paymentId)
  
  return NextResponse.json({
    success: true,
    paymentId,
    processed,
  })
}
