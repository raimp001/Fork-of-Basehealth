/**
 * Unified Checkout API
 * 
 * Single endpoint for all payment methods with USDC settlement.
 * 
 * POST /api/checkout - Create payment
 * GET /api/checkout?amount=X - Get checkout configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  createPayment, 
  getCheckoutConfig,
  calculateSettlement,
  type PaymentRequest 
} from '@/lib/usdc-settlement-service'

/**
 * GET - Get checkout configuration for a given amount
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const amount = parseFloat(searchParams.get('amount') || '0')
  
  if (!amount || amount <= 0) {
    return NextResponse.json({
      error: 'Valid amount is required',
    }, { status: 400 })
  }
  
  const config = getCheckoutConfig(amount)
  
  return NextResponse.json({
    success: true,
    ...config,
  })
}

/**
 * POST - Create a payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      amount,
      method = 'card',
      orderId,
      userId,
      providerId,
      serviceType = 'consultation',
      serviceDescription,
      senderWalletAddress,
    } = body
    
    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({
        error: 'Valid amount is required',
      }, { status: 400 })
    }
    
    if (!orderId) {
      return NextResponse.json({
        error: 'Order ID is required',
      }, { status: 400 })
    }
    
    if (!providerId) {
      return NextResponse.json({
        error: 'Provider ID is required',
      }, { status: 400 })
    }
    
    // Create payment request
    const paymentRequest: PaymentRequest = {
      amountUsd: amount,
      method,
      orderId,
      userId,
      providerId,
      serviceType,
      serviceDescription,
      senderWalletAddress,
    }
    
    // Process payment
    const result = await createPayment(paymentRequest)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 })
    }
    
    // Calculate settlement details
    const settlement = calculateSettlement(amount)
    
    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      status: result.status,
      
      // Amount info
      amount: {
        display: `$${amount.toFixed(2)}`,
        usdc: settlement.grossAmountUsdc,
      },
      
      // Settlement info
      settlement: {
        chain: 'Base',
        currency: 'USDC',
        recipientAddress: result.settlementAddress,
        providerPayout: settlement.providerPayoutUsdc,
        platformFee: settlement.platformFeeUsdc,
      },
      
      // Method-specific info
      ...(method === 'card' && {
        stripe: {
          paymentIntentId: result.paymentId,
          // clientSecret would come from Stripe response
        },
      }),
      
      ...(method === 'usdc_direct' && {
        wallet: {
          recipientAddress: result.settlementAddress,
          tokenAddress: process.env.NODE_ENV === 'production'
            ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
            : '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
          amount: settlement.grossAmountUsdc,
          chainId: process.env.NODE_ENV === 'production' ? 8453 : 84532,
        },
      }),
      
      // For UI
      message: method === 'card' 
        ? 'Complete payment with your card'
        : 'Send USDC to complete payment',
    })
    
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Checkout failed',
    }, { status: 500 })
  }
}
