/**
 * Base Pay Integration Service
 * 
 * One-tap USDC payments using Base Pay SDK.
 * - User sees simple "Pay with Base" button
 * - Confirms with Face ID / fingerprint
 * - Payment settles in ~2 seconds
 * - No gas handling needed (sponsored automatically)
 * 
 * Architecture:
 * Frontend: BasePayButton → pay() → User confirms → Done
 * Backend: getPaymentStatus() → Verify → Fulfill order
 * 
 * @module base-pay-service
 */

// Client-side imports (use dynamic import in components)
// import { pay, getPaymentStatus } from '@base-org/account'
// import { BasePayButton } from '@base-org/account-ui/react'

// =============================================================================
// TYPES
// =============================================================================

export interface BasePayRequest {
  amount: string  // USD amount as string (e.g., "75.00")
  orderId: string
  providerId: string
  providerWallet: string
  serviceType: string
  serviceDescription?: string
  
  // Optional: collect user info at checkout
  collectEmail?: boolean
  collectPhone?: boolean
  collectAddress?: boolean
}

export interface BasePayResult {
  success: boolean
  paymentId: string
  status: 'pending' | 'completed' | 'failed'
  txHash?: string
  sender?: string
  amount?: string
  
  // User info if collected
  email?: string
  phone?: string
  address?: {
    name: { firstName: string; familyName: string }
    address1: string
    city: string
    state: string
    postalCode: string
    countryCode: string
  }
}

export interface PaymentVerification {
  verified: boolean
  status: 'pending' | 'completed' | 'failed'
  sender?: string
  amount?: string
  recipient?: string
  error?: string
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export const basePayConfig = {
  // Use testnet in development
  testnet: process.env.NODE_ENV !== 'production',
  
  // Platform treasury wallet (receives payments)
  recipientAddress: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS || '',
  
  // Callback URL for validating user info
  callbackUrl: process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/base-pay/validate`
    : undefined,
}

// =============================================================================
// CLIENT-SIDE HELPERS
// =============================================================================

/**
 * Create a Base Pay payment request configuration
 * Use this with the pay() function from @base-org/account
 */
export function createPaymentConfig(request: BasePayRequest) {
  const payerInfoRequests = []
  
  if (request.collectEmail) {
    payerInfoRequests.push({ type: 'email' as const })
  }
  if (request.collectPhone) {
    payerInfoRequests.push({ type: 'phoneNumber' as const, optional: true })
  }
  if (request.collectAddress) {
    payerInfoRequests.push({ type: 'physicalAddress' as const, optional: true })
  }
  
  return {
    amount: request.amount,
    to: request.providerWallet || basePayConfig.recipientAddress,
    testnet: basePayConfig.testnet,
    
    // Collect user info if requested
    ...(payerInfoRequests.length > 0 && {
      payerInfo: {
        requests: payerInfoRequests,
        callbackURL: basePayConfig.callbackUrl,
      },
    }),
  }
}

/**
 * Format healthcare service for Base Pay
 */
export function formatHealthcarePayment(
  serviceType: 'consultation' | 'caregiver' | 'subscription' | 'records',
  tier: string,
  providerWallet?: string
): BasePayRequest {
  const pricing: Record<string, Record<string, number>> = {
    consultation: {
      virtual: 75,
      inPerson: 150,
      specialist: 250,
    },
    caregiver: {
      hourly: 35,
      daily: 280,
      weekly: 1680,
    },
    subscription: {
      basic: 9.99,
      premium: 19.99,
      family: 39.99,
    },
    records: {
      access: 10,
      export: 25,
    },
  }
  
  const amount = pricing[serviceType]?.[tier] || 0
  
  return {
    amount: amount.toFixed(2),
    orderId: `${serviceType}-${tier}-${Date.now()}`,
    providerId: 'platform',
    providerWallet: providerWallet || basePayConfig.recipientAddress,
    serviceType,
    serviceDescription: `${serviceType} - ${tier}`,
    collectEmail: true,
  }
}

// =============================================================================
// SERVER-SIDE VERIFICATION
// =============================================================================

/**
 * Verify a Base Pay payment on the server
 * Call this before fulfilling orders
 */
export async function verifyBasePayment(
  paymentId: string,
  expectedAmount: string,
  expectedRecipient: string
): Promise<PaymentVerification> {
  try {
    // Dynamic import for server-side
    const { getPaymentStatus } = await import('@base-org/account')
    
    const result = await getPaymentStatus({
      id: paymentId,
      testnet: basePayConfig.testnet,
    })
    
    if (result.status !== 'completed') {
      return {
        verified: false,
        status: result.status as 'pending' | 'completed' | 'failed',
        error: `Payment not completed. Status: ${result.status}`,
      }
    }
    
    // Verify amount matches
    if (result.amount !== expectedAmount) {
      return {
        verified: false,
        status: 'failed',
        error: `Amount mismatch. Expected ${expectedAmount}, got ${result.amount}`,
      }
    }
    
    // Verify recipient matches
    if (result.recipient?.toLowerCase() !== expectedRecipient.toLowerCase()) {
      return {
        verified: false,
        status: 'failed',
        error: 'Recipient mismatch',
      }
    }
    
    return {
      verified: true,
      status: 'completed',
      sender: result.sender,
      amount: result.amount,
      recipient: result.recipient,
    }
    
  } catch (error) {
    console.error('Base Pay verification error:', error)
    return {
      verified: false,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Verification failed',
    }
  }
}

/**
 * Track processed transactions to prevent replay attacks
 */
const processedPayments = new Map<string, {
  orderId: string
  sender: string
  amount: string
  timestamp: Date
}>()

export function isPaymentProcessed(paymentId: string): boolean {
  return processedPayments.has(paymentId)
}

export function markPaymentProcessed(
  paymentId: string,
  orderId: string,
  sender: string,
  amount: string
): void {
  processedPayments.set(paymentId, {
    orderId,
    sender,
    amount,
    timestamp: new Date(),
  })
}

// =============================================================================
// PROVIDER PAYOUTS
// =============================================================================

/**
 * Calculate provider payout after platform fee
 */
export function calculateProviderPayout(
  grossAmount: number,
  platformFeePercent = 2.5
): {
  grossAmount: string
  platformFee: string
  providerPayout: string
} {
  const platformFee = grossAmount * (platformFeePercent / 100)
  const providerPayout = grossAmount - platformFee
  
  return {
    grossAmount: grossAmount.toFixed(2),
    platformFee: platformFee.toFixed(2),
    providerPayout: providerPayout.toFixed(2),
  }
}
