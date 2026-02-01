/**
 * Base Pay Verification API
 * 
 * Verifies Base Pay transactions on the server before fulfilling orders.
 * Prevents replay attacks and impersonation.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  verifyBasePayment,
  isPaymentProcessed,
  markPaymentProcessed,
  basePayConfig,
} from '@/lib/base-pay-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, orderId, expectedAmount, authenticatedUser } = body
    
    if (!paymentId) {
      return NextResponse.json({
        verified: false,
        error: 'Payment ID is required',
      }, { status: 400 })
    }
    
    // Check for replay attack
    if (isPaymentProcessed(paymentId)) {
      return NextResponse.json({
        verified: false,
        error: 'Payment already processed',
      }, { status: 400 })
    }
    
    // Verify the payment on-chain
    const verification = await verifyBasePayment(
      paymentId,
      expectedAmount,
      basePayConfig.recipientAddress
    )
    
    if (!verification.verified) {
      return NextResponse.json({
        verified: false,
        status: verification.status,
        error: verification.error,
      }, { status: 400 })
    }
    
    // Check for impersonation attack (if authenticated user provided)
    if (authenticatedUser && verification.sender) {
      if (verification.sender.toLowerCase() !== authenticatedUser.toLowerCase()) {
        return NextResponse.json({
          verified: false,
          error: 'Payment sender does not match authenticated user',
        }, { status: 400 })
      }
    }
    
    // Mark as processed to prevent replay
    markPaymentProcessed(
      paymentId,
      orderId,
      verification.sender || 'unknown',
      verification.amount || expectedAmount
    )
    
    return NextResponse.json({
      verified: true,
      status: 'completed',
      sender: verification.sender,
      amount: verification.amount,
      recipient: verification.recipient,
      orderId,
      message: 'Payment verified successfully',
    })
    
  } catch (error) {
    console.error('Base Pay verification error:', error)
    return NextResponse.json({
      verified: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    }, { status: 500 })
  }
}
