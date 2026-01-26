/**
 * Solana Payment Creation API
 * 
 * Creates a payment request for Solana blockchain payments.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  solanaConfig,
  createSolTransferTransaction,
  usdToSol,
  isValidSolanaAddress,
} from '@/lib/solana-payment-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency, senderAddress, orderId, description } = body
    
    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }
    
    if (!currency || !['SOL', 'USDC'].includes(currency)) {
      return NextResponse.json(
        { error: 'Invalid currency. Must be SOL or USDC' },
        { status: 400 }
      )
    }
    
    if (!senderAddress || !isValidSolanaAddress(senderAddress)) {
      return NextResponse.json(
        { error: 'Invalid sender address' },
        { status: 400 }
      )
    }
    
    // Check recipient wallet is configured
    if (!solanaConfig.recipientWallet || !isValidSolanaAddress(solanaConfig.recipientWallet)) {
      return NextResponse.json(
        { error: 'Payment recipient not configured' },
        { status: 500 }
      )
    }
    
    // Generate payment ID
    const paymentId = `sol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Calculate amount in native currency
    let transferAmount = amount
    if (currency === 'SOL') {
      transferAmount = await usdToSol(amount)
    }
    
    // For SOL transfers, create the transaction
    let transactionBase64 = null
    if (currency === 'SOL') {
      try {
        const transaction = await createSolTransferTransaction(
          senderAddress,
          solanaConfig.recipientWallet,
          transferAmount
        )
        // Serialize transaction for client
        transactionBase64 = transaction.serialize({ 
          requireAllSignatures: false,
          verifySignatures: false 
        }).toString('base64')
      } catch (err) {
        console.error('Error creating SOL transaction:', err)
        // Continue without pre-built transaction
      }
    }
    
    // Store payment request in database (simplified for now)
    // In production, save to database with prisma
    
    return NextResponse.json({
      success: true,
      paymentId,
      recipientAddress: solanaConfig.recipientWallet,
      amount: transferAmount,
      currency,
      amountUsd: amount,
      transaction: transactionBase64,
      network: solanaConfig.network,
      orderId,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min expiry
    })
    
  } catch (error) {
    console.error('Error creating Solana payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
