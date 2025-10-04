/**
 * HTTP 402 Payment Required Service
 * Implements payment-gated content/features using HTTP 402 protocol
 * Integrated with Base blockchain (USDC/ETH) payments
 */

import { NextRequest, NextResponse } from 'next/server'
import { paymentConfig } from './coinbase-config'

export interface PaymentRequirement {
  amount: number
  currency: 'USDC' | 'ETH'
  resource: string
  description: string
  metadata?: Record<string, any>
}

export interface PaymentProof {
  transactionHash: string
  from: string
  to: string
  amount: string
  currency: string
  network: 'base' | 'base-sepolia'
  timestamp: number
}

/**
 * HTTP 402 Response Headers
 */
export const PAYMENT_HEADERS = {
  ACCEPT_PAYMENT: 'Accept-Payment',
  PAYMENT_REQUIRED: 'Payment-Required',
  PAYMENT_BALANCE: 'Payment-Balance',
  PAYMENT_ADDRESS: 'Payment-Address',
} as const

/**
 * Create HTTP 402 Payment Required response
 */
export function createPaymentRequiredResponse(requirement: PaymentRequirement) {
  const token = paymentConfig.supportedTokens.find(t => t.symbol === requirement.currency)
  
  const paymentInfo = {
    amount: requirement.amount,
    currency: requirement.currency,
    recipient: paymentConfig.recipientAddress,
    tokenAddress: token?.address,
    network: process.env.NODE_ENV === 'production' ? 'base' : 'base-sepolia',
    description: requirement.description,
    resource: requirement.resource,
    metadata: requirement.metadata,
  }

  return NextResponse.json(
    {
      error: 'Payment Required',
      message: `This resource requires payment of ${requirement.amount} ${requirement.currency}`,
      payment: paymentInfo,
    },
    {
      status: 402,
      headers: {
        [PAYMENT_HEADERS.PAYMENT_REQUIRED]: 'true',
        [PAYMENT_HEADERS.ACCEPT_PAYMENT]: `${requirement.currency}`,
        [PAYMENT_HEADERS.PAYMENT_ADDRESS]: paymentConfig.recipientAddress,
        'Content-Type': 'application/json',
      },
    }
  )
}

/**
 * Verify payment proof on Base blockchain
 */
export async function verifyPaymentProof(proof: PaymentProof, requirement: PaymentRequirement): Promise<boolean> {
  try {
    // Validate basic requirements
    if (!proof.transactionHash || proof.transactionHash.length < 66) {
      throw new Error('Invalid transaction hash')
    }

    // Verify recipient matches
    if (proof.to.toLowerCase() !== paymentConfig.recipientAddress.toLowerCase()) {
      throw new Error('Payment sent to wrong address')
    }

    // Verify amount (with small tolerance for gas/rounding)
    const paidAmount = parseFloat(proof.amount)
    const requiredAmount = requirement.amount
    if (paidAmount < requiredAmount * 0.999) { // 0.1% tolerance
      throw new Error(`Insufficient payment: ${paidAmount} < ${requiredAmount}`)
    }

    // Verify currency
    if (proof.currency !== requirement.currency) {
      throw new Error('Wrong currency')
    }

    // In production, verify transaction on-chain using viem
    // For now, we'll trust the proof if it has valid structure
    const isValid = await verifyOnChain(proof)
    
    return isValid
  } catch (error) {
    console.error('Payment verification failed:', error)
    return false
  }
}

/**
 * Verify transaction on Base blockchain
 */
async function verifyOnChain(proof: PaymentProof): Promise<boolean> {
  try {
    // This would use viem to verify on-chain in production
    // For MVP, we validate structure and return true
    if (typeof window !== 'undefined') {
      return false // Don't verify on client
    }

    // In production, use viem publicClient to:
    // 1. Get transaction by hash
    // 2. Verify it's confirmed
    // 3. Check from/to/amount match
    // 4. Ensure it's recent (< 24 hours)
    
    // Mock verification for demo
    const isRecent = Date.now() - proof.timestamp < 24 * 60 * 60 * 1000
    const hasValidHash = proof.transactionHash.startsWith('0x') && proof.transactionHash.length === 66
    
    return isRecent && hasValidHash
  } catch (error) {
    console.error('On-chain verification error:', error)
    return false
  }
}

/**
 * Payment-gate middleware wrapper
 */
export function requirePayment(requirement: PaymentRequirement) {
  return async (request: NextRequest) => {
    // Check for payment proof in headers
    const proofHeader = request.headers.get('X-Payment-Proof')
    
    if (!proofHeader) {
      return createPaymentRequiredResponse(requirement)
    }

    try {
      const proof: PaymentProof = JSON.parse(proofHeader)
      const isValid = await verifyPaymentProof(proof, requirement)
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid payment proof' },
          { status: 402 }
        )
      }

      // Payment verified, allow access
      return null // Proceed to handler
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid payment proof format' },
        { status: 400 }
      )
    }
  }
}

/**
 * Check if user has paid for resource
 */
export async function hasUserPaid(
  userId: string,
  resource: string,
  sessionId?: string
): Promise<boolean> {
  // In production, check database for payment records
  // For now, return false to require payment
  
  // TODO: Implement database lookup
  // const payment = await db.payment.findFirst({
  //   where: {
  //     userId,
  //     resource,
  //     status: 'confirmed',
  //     createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  //   }
  // })
  
  return false
}

/**
 * Store payment record
 */
export async function recordPayment(
  userId: string,
  proof: PaymentProof,
  requirement: PaymentRequirement
) {
  // In production, store in database
  // For now, just log
  
  console.log('Payment recorded:', {
    userId,
    resource: requirement.resource,
    txHash: proof.transactionHash,
    amount: proof.amount,
    currency: proof.currency,
    timestamp: new Date(proof.timestamp).toISOString(),
  })

  // TODO: Implement database storage
  // await db.payment.create({
  //   data: {
  //     userId,
  //     resource: requirement.resource,
  //     transactionHash: proof.transactionHash,
  //     amount: proof.amount,
  //     currency: proof.currency,
  //     network: proof.network,
  //     status: 'confirmed',
  //     metadata: requirement.metadata,
  //   }
  // })
}

/**
 * Payment tiers for different features
 */
export const PAYMENT_TIERS = {
  // Consultation access
  VIRTUAL_CONSULTATION: {
    amount: 75,
    currency: 'USDC' as const,
    resource: 'virtual-consultation',
    description: 'Virtual healthcare consultation',
  },
  IN_PERSON_CONSULTATION: {
    amount: 150,
    currency: 'USDC' as const,
    resource: 'in-person-consultation',
    description: 'In-person healthcare consultation',
  },
  SPECIALIST_CONSULTATION: {
    amount: 250,
    currency: 'USDC' as const,
    resource: 'specialist-consultation',
    description: 'Specialist consultation',
  },
  
  // Premium features
  PREMIUM_MONTH: {
    amount: 19.99,
    currency: 'USDC' as const,
    resource: 'premium-subscription-month',
    description: 'Premium features for 1 month',
  },
  PREMIUM_YEAR: {
    amount: 199,
    currency: 'USDC' as const,
    resource: 'premium-subscription-year',
    description: 'Premium features for 1 year',
  },
  
  // Medical records access
  MEDICAL_RECORDS: {
    amount: 10,
    currency: 'USDC' as const,
    resource: 'medical-records-access',
    description: 'Full medical records access',
  },
  
  // AI features
  AI_DIAGNOSIS: {
    amount: 25,
    currency: 'USDC' as const,
    resource: 'ai-diagnosis',
    description: 'AI-powered diagnosis analysis',
  },
  AI_SECOND_OPINION: {
    amount: 50,
    currency: 'USDC' as const,
    resource: 'ai-second-opinion',
    description: 'AI second opinion on diagnosis',
  },
} as const

/**
 * Get payment requirement for resource
 */
export function getPaymentRequirement(resourceType: keyof typeof PAYMENT_TIERS): PaymentRequirement {
  return PAYMENT_TIERS[resourceType]
}

