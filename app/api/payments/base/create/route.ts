/**
 * Base Blockchain Payment Creation API
 * 
 * Creates a payment request for Base blockchain payments (USDC/ETH).
 */

import { NextRequest, NextResponse } from 'next/server'
import { paymentConfig, baseChain } from '@/lib/coinbase-config'
import { base, baseSepolia } from 'wagmi/chains'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency, orderId, userId } = body
    
    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }
    
    if (!currency || !['USDC', 'ETH'].includes(currency)) {
      return NextResponse.json(
        { error: 'Invalid currency. Must be USDC or ETH' },
        { status: 400 }
      )
    }
    
    // Check recipient is configured
    if (!paymentConfig.recipientAddress || paymentConfig.recipientAddress === '0x0000000000000000000000000000000000000000') {
      return NextResponse.json(
        { error: 'Payment recipient not configured' },
        { status: 500 }
      )
    }
    
    // Generate payment ID
    const paymentId = `base_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Get token address
    const tokenAddress = currency === 'USDC' 
      ? (baseChain.id === base.id 
          ? paymentConfig.usdcAddress.base 
          : paymentConfig.usdcAddress['base-sepolia'])
      : '0x0000000000000000000000000000000000000000' // Native ETH
    
    // Calculate amount in token decimals
    const decimals = currency === 'USDC' ? 6 : 18
    const amountInSmallestUnit = Math.round(amount * Math.pow(10, decimals)).toString()
    
    return NextResponse.json({
      success: true,
      paymentId,
      recipientAddress: paymentConfig.recipientAddress,
      tokenAddress,
      amount: amountInSmallestUnit,
      amountDisplay: amount,
      currency,
      decimals,
      chainId: baseChain.id,
      chainName: baseChain.name,
      orderId,
      userId,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min expiry
    })
    
  } catch (error) {
    console.error('Error creating Base payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
