/**
 * Base Pay Integration Service
 * 
 * One-tap USDC payments using Base Pay SDK + Base Account.
 * 
 * BASE TOOLS LEVERAGED:
 * ─────────────────────
 * 1. Base Pay SDK (@base-org/account)
 *    - pay() - One-tap USDC payments
 *    - getPaymentStatus() - Verify payments server-side
 *    - Handles gas sponsorship automatically
 * 
 * 2. Base Account (Smart Wallet)
 *    - Account abstraction (ERC-4337)
 *    - Passkey/FaceID authentication
 *    - Batched transactions (approve + transfer in one)
 *    - Gas sponsorship via paymaster
 * 
 * 3. Base Pay Button (@base-org/account-ui)
 *    - Drop-in React component
 *    - Handles wallet connection
 *    - Shows payment confirmation modal
 * 
 * PAYMENT FLOW:
 * ─────────────
 * 1. User clicks "Pay with Base" button
 * 2. Base Account prompts for FaceID/passkey
 * 3. Smart wallet creates UserOp (approve + transfer)
 * 4. Paymaster sponsors gas (user pays nothing extra)
 * 5. Bundler submits to Base network
 * 6. Payment settles in ~2 seconds
 * 7. Backend verifies and fulfills order
 * 
 * NO CRYPTO NOISE:
 * ────────────────
 * - No "approve" step visible to user
 * - No gas fee shown (sponsored)
 * - No wallet address copy/paste
 * - No chain switching
 * - Just amount + confirm = done
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

import { USE_MAINNET, PAYMENT_CONFIG, ACTIVE_CHAIN } from './network-config'

export const basePayConfig = {
  // Network toggle - controlled by network-config.ts
  // Set NEXT_PUBLIC_USE_MAINNET=true for production
  testnet: !USE_MAINNET,
  
  // Platform treasury wallet (receives payments)
  // Set NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS for production
  recipientAddress: PAYMENT_CONFIG.recipientAddress,
  
  // Platform fee (2.5%)
  platformFeePercent: PAYMENT_CONFIG.platformFeePercent,
  
  // Callback URL for validating user info
  callbackUrl: process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/base-pay/validate`
    : undefined,
    
  // Chain info
  chainId: ACTIVE_CHAIN.id,
  chainName: ACTIVE_CHAIN.name,
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

// =============================================================================
// BASE ACCOUNT / SMART WALLET CONFIGURATION
// =============================================================================

/**
 * Base Account configuration for smart wallet integration
 * 
 * Key features we use:
 * 1. Passkey authentication (FaceID, TouchID, Windows Hello)
 * 2. Gas sponsorship via paymaster
 * 3. Batched transactions (no separate approve step)
 * 4. Session keys for recurring payments (future)
 */
export const baseAccountConfig = {
  // Chain configuration - controlled by network-config.ts
  chain: ACTIVE_CHAIN.network,
  chainId: ACTIVE_CHAIN.id,
  
  // USDC contract address for active chain
  usdcAddress: ACTIVE_CHAIN.contracts.usdc,
  
  // Paymaster for gas sponsorship (if using one)
  paymaster: process.env.BASE_PAYMASTER_URL || null,
  
  // Entry point contract (ERC-4337)
  entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  
  // Get USDC address for current environment
  getUsdcAddress(): string {
    return ACTIVE_CHAIN.contracts.usdc
  },
  
  // RPC URL for current environment
  getRpcUrl(): string {
    return ACTIVE_CHAIN.rpcUrls.default
  },
  
  // Is mainnet?
  isMainnet: USE_MAINNET,
}

/**
 * Check if user has a Base Account (smart wallet)
 * Used to determine if we can use passkey auth
 */
export async function checkBaseAccountStatus(address: string): Promise<{
  hasSmartWallet: boolean
  isPasskeyEnabled: boolean
  canSponsorGas: boolean
}> {
  // In a full implementation, this would:
  // 1. Check if address is a smart contract (code.length > 0)
  // 2. Check if it's a known smart wallet implementation
  // 3. Check if paymaster is configured
  
  // For now, return default capabilities
  return {
    hasSmartWallet: false, // Will be true after user creates Base Account
    isPasskeyEnabled: false,
    canSponsorGas: !!baseAccountConfig.paymaster,
  }
}

/**
 * Generate Base Account creation link
 * Redirects user to create a smart wallet if they don't have one
 */
export function getBaseAccountOnboardingUrl(returnUrl: string): string {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://wallet.coinbase.com'
    : 'https://wallet.coinbase.com' // Same for testnet
  
  return `${baseUrl}/create?returnUrl=${encodeURIComponent(returnUrl)}`
}

// =============================================================================
// INTEGRATION SUMMARY
// =============================================================================

/**
 * HOW WE USE BASE TOOLS:
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ PATIENT CHECKOUT                                                        │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │  1. Base Pay Button                                                     │
 * │     └─ import { BasePayButton } from '@base-org/account-ui/react'       │
 * │     └─ <BasePayButton amount="75.00" to={providerWallet} />             │
 * │                                                                         │
 * │  2. Base Account (Smart Wallet)                                         │
 * │     └─ Passkey/FaceID for auth (no seed phrase)                        │
 * │     └─ Gas sponsored by paymaster                                       │
 * │     └─ Batched approve+transfer in single UserOp                        │
 * │                                                                         │
 * │  3. Base Network                                                        │
 * │     └─ ~$0.001 per transaction                                          │
 * │     └─ 2-second finality                                                │
 * │     └─ Native USDC (Circle-issued)                                      │
 * │                                                                         │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ PROVIDER PAYOUT                                                         │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │  1. Settlement Service                                                  │
 * │     └─ Patient pays → Platform takes 2.5% → Provider credited           │
 * │                                                                         │
 * │  2. Provider Wallet                                                     │
 * │     └─ Can be EOA (MetaMask) or Smart Wallet (Base Account)             │
 * │     └─ USDC transferred directly on Base                                │
 * │     └─ Provider can off-ramp via Coinbase if needed                     │
 * │                                                                         │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ ATTESTATIONS                                                            │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │  1. EAS on Base                                                         │
 * │     └─ Provider credentials attested on-chain                           │
 * │     └─ ~$0.001 per attestation                                          │
 * │     └─ Verifiable via EASScan                                           │
 * │                                                                         │
 * │  2. Provider Co-Signing                                                 │
 * │     └─ EIP-712 typed data signing                                       │
 * │     └─ Provider's wallet signs credential acknowledgment                │
 * │     └─ Platform creates attestation with proof                          │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
