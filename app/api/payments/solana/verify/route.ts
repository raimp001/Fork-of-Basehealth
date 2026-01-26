/**
 * Solana Payment Verification API
 * 
 * Verifies a Solana transaction was completed successfully.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  verifyTransaction,
  getExplorerUrl,
} from '@/lib/solana-payment-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { signature, orderId } = body
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Transaction signature is required' },
        { status: 400 }
      )
    }
    
    // Verify the transaction on-chain
    const status = await verifyTransaction(signature)
    
    if (!status.confirmed) {
      return NextResponse.json({
        verified: false,
        status: 'pending',
        error: status.error,
      })
    }
    
    // Update order status in database
    // In production, update the order/payment record
    
    return NextResponse.json({
      verified: true,
      status: 'completed',
      signature,
      slot: status.slot,
      blockTime: status.blockTime,
      explorerUrl: getExplorerUrl(signature),
      orderId,
    })
    
  } catch (error) {
    console.error('Error verifying Solana payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
