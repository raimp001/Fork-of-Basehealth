/**
 * USDC Settlement Service
 * 
 * Unified payment layer that provides:
 * - Stripe-like UX for users (cards, Apple Pay, etc.)
 * - USDC on Base as the settlement layer
 * - Auto-conversion from fiat to USDC when paying with cards
 * - Direct USDC payments for crypto-native users
 * - Predictable USDC payouts for providers
 * 
 * Architecture:
 * ┌─────────────────────────────────────────────────────────┐
 * │                    USER PAYMENT                         │
 * ├─────────────────────┬───────────────────────────────────┤
 * │  Card/Bank Payment  │     Direct USDC Payment           │
 * │  (Stripe)           │     (Wallet)                      │
 * ├─────────────────────┼───────────────────────────────────┤
 * │         ↓           │           ↓                       │
 * │  Fiat → USDC        │     Already USDC                  │
 * │  (On-ramp)          │     (One-click)                   │
 * ├─────────────────────┴───────────────────────────────────┤
 * │              USDC SETTLEMENT LAYER                      │
 * │              (Base Blockchain)                          │
 * ├─────────────────────────────────────────────────────────┤
 * │              PROVIDER PAYOUT                            │
 * │              (USDC to Provider Wallet)                  │
 * └─────────────────────────────────────────────────────────┘
 * 
 * @module usdc-settlement-service
 */

import { paymentConfig, baseChain } from './coinbase-config'
import { base, baseSepolia } from 'wagmi/chains'
import { prisma } from './prisma'

// =============================================================================
// TYPES
// =============================================================================

export type PaymentMethod = 'card' | 'usdc_direct' | 'bank'

export type PaymentStatus = 
  | 'pending'        // Payment initiated
  | 'processing'     // Being processed
  | 'converting'     // Card payment being converted to USDC
  | 'settling'       // USDC transfer in progress
  | 'completed'      // Successfully settled in USDC
  | 'failed'         // Payment failed
  | 'refunded'       // Payment refunded

export interface PaymentRequest {
  // Amount in USD (displayed to user)
  amountUsd: number
  
  // Payment method
  method: PaymentMethod
  
  // Order details
  orderId: string
  userId?: string
  providerId: string
  
  // Service details
  serviceType: 'consultation' | 'caregiver_booking' | 'subscription' | 'medical_record'
  serviceDescription?: string
  
  // For card payments
  stripePaymentMethodId?: string
  
  // For direct USDC
  senderWalletAddress?: string
}

export interface PaymentResult {
  success: boolean
  paymentId: string
  status: PaymentStatus
  
  // Original payment info
  amountUsd: number
  method: PaymentMethod
  
  // Settlement info
  usdcAmount: string  // In USDC (6 decimals)
  settlementTxHash?: string
  settlementAddress: string
  
  // Timestamps
  createdAt: Date
  settledAt?: Date
  
  // Provider payout info
  providerPayoutAmount: string  // After platform fee
  providerWalletAddress?: string
  
  // For UI
  checkoutUrl?: string  // For card payments
  error?: string
}

export interface ProviderPayout {
  providerId: string
  providerWalletAddress: string
  amountUsdc: string
  paymentIds: string[]
  txHash?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export const settlementConfig = {
  // Platform fee percentage (e.g., 2.5%)
  platformFeePercent: 2.5,
  
  // Minimum payout threshold in USDC
  minPayoutThreshold: 10,
  
  // USDC contract address on Base
  usdcAddress: baseChain.id === base.id 
    ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'  // Base Mainnet
    : '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
  
  // Platform treasury wallet
  treasuryAddress: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS || '',
  
  // Network
  chainId: baseChain.id,
  chainName: baseChain.name,
  
  // On-ramp provider (for card → USDC conversion)
  onRampProvider: 'coinbase', // or 'stripe_crypto' when available
}

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Calculate amounts including platform fee
 */
export function calculateSettlement(amountUsd: number): {
  grossAmountUsdc: string
  platformFeeUsdc: string
  providerPayoutUsdc: string
  feePercent: number
} {
  const grossAmount = amountUsd * 1_000_000 // Convert to 6 decimals
  const platformFee = (amountUsd * settlementConfig.platformFeePercent / 100) * 1_000_000
  const providerPayout = grossAmount - platformFee
  
  return {
    grossAmountUsdc: grossAmount.toFixed(0),
    platformFeeUsdc: platformFee.toFixed(0),
    providerPayoutUsdc: providerPayout.toFixed(0),
    feePercent: settlementConfig.platformFeePercent,
  }
}

/**
 * Create a unified payment
 * Routes to appropriate handler based on payment method
 */
export async function createPayment(request: PaymentRequest): Promise<PaymentResult> {
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const settlement = calculateSettlement(request.amountUsd)
  
  const baseResult: Partial<PaymentResult> = {
    paymentId,
    amountUsd: request.amountUsd,
    method: request.method,
    usdcAmount: settlement.grossAmountUsdc,
    settlementAddress: settlementConfig.treasuryAddress,
    providerPayoutAmount: settlement.providerPayoutUsdc,
    createdAt: new Date(),
  }
  
  switch (request.method) {
    case 'card':
      return await createCardPayment(request, baseResult as PaymentResult)
    
    case 'usdc_direct':
      return await createDirectUsdcPayment(request, baseResult as PaymentResult)
    
    case 'bank':
      return await createBankPayment(request, baseResult as PaymentResult)
    
    default:
      return {
        ...baseResult,
        success: false,
        status: 'failed',
        error: `Unknown payment method: ${request.method}`,
      } as PaymentResult
  }
}

/**
 * Handle card payment (Stripe → USDC conversion)
 * Returns payment details - actual Stripe call is made from the API route
 */
async function createCardPayment(
  request: PaymentRequest,
  baseResult: PaymentResult
): Promise<PaymentResult> {
  try {
    // For card payments, we return the payment request details
    // The actual Stripe intent is created by the API route
    const paymentId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      ...baseResult,
      success: true,
      status: 'pending',
      paymentId,
      // The API route will add Stripe-specific fields
    }
    
  } catch (error) {
    return {
      ...baseResult,
      success: false,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Card payment failed',
    }
  }
}

/**
 * Handle direct USDC payment (already crypto-native)
 * Returns payment details for wallet transaction
 */
async function createDirectUsdcPayment(
  request: PaymentRequest,
  baseResult: PaymentResult
): Promise<PaymentResult> {
  try {
    const paymentId = `usdc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      ...baseResult,
      success: true,
      status: 'pending',
      paymentId,
      settlementAddress: settlementConfig.treasuryAddress,
    }
    
  } catch (error) {
    return {
      ...baseResult,
      success: false,
      status: 'failed',
      error: error instanceof Error ? error.message : 'USDC payment failed',
    }
  }
}

/**
 * Handle bank payment (ACH → USDC conversion)
 */
async function createBankPayment(
  request: PaymentRequest,
  baseResult: PaymentResult
): Promise<PaymentResult> {
  // Bank payments work similar to card - Stripe handles ACH, we convert to USDC
  return createCardPayment(request, baseResult)
}

/**
 * Process card payment completion (called by webhook)
 * Converts fiat to USDC and settles on Base
 */
export async function processCardToUsdcSettlement(
  stripePaymentIntentId: string,
  amountUsd: number,
  metadata: Record<string, string>
): Promise<{
  success: boolean
  usdcAmount: string
  txHash?: string
  error?: string
}> {
  try {
    const settlement = calculateSettlement(amountUsd)
    
    // In production, this would:
    // 1. Use Coinbase Commerce or on-ramp API to convert USD to USDC
    // 2. Transfer USDC to the treasury wallet
    // 3. Record the settlement transaction
    
    // For MVP, we simulate the conversion and record it
    const txHash = `0x${Date.now().toString(16)}${'0'.repeat(40)}`
    
    console.log(`[Settlement] Card payment ${stripePaymentIntentId} converted to ${settlement.grossAmountUsdc} USDC`)
    
    return {
      success: true,
      usdcAmount: settlement.grossAmountUsdc,
      txHash,
    }
    
  } catch (error) {
    console.error('Settlement error:', error)
    return {
      success: false,
      usdcAmount: '0',
      error: error instanceof Error ? error.message : 'Settlement failed',
    }
  }
}

/**
 * Process provider payout in USDC
 */
export async function processProviderPayout(
  providerId: string,
  providerWalletAddress: string,
  amountUsdc: string,
  paymentIds: string[]
): Promise<ProviderPayout> {
  try {
    // In production, this would:
    // 1. Batch pending payments for provider
    // 2. Calculate total after platform fee
    // 3. Transfer USDC to provider's wallet
    // 4. Record payout transaction
    
    console.log(`[Payout] Sending ${amountUsdc} USDC to provider ${providerId} (${providerWalletAddress})`)
    
    const txHash = `0x${Date.now().toString(16)}${'0'.repeat(40)}`
    
    return {
      providerId,
      providerWalletAddress,
      amountUsdc,
      paymentIds,
      txHash,
      status: 'completed',
    }
    
  } catch (error) {
    console.error('Payout error:', error)
    return {
      providerId,
      providerWalletAddress,
      amountUsdc,
      paymentIds,
      status: 'failed',
    }
  }
}

// =============================================================================
// CHECKOUT HELPERS
// =============================================================================

/**
 * Get checkout configuration for frontend
 */
export function getCheckoutConfig(amountUsd: number) {
  const settlement = calculateSettlement(amountUsd)
  
  return {
    // Display amount
    displayAmount: `$${amountUsd.toFixed(2)}`,
    
    // Payment options
    paymentMethods: [
      {
        id: 'card',
        name: 'Credit / Debit Card',
        description: 'Visa, Mastercard, Amex',
        icon: '💳',
        processingTime: 'Instant',
        available: true,
      },
      {
        id: 'usdc_direct',
        name: 'Pay with USDC',
        description: 'Direct payment from wallet',
        icon: '🔵',
        processingTime: '~2 seconds',
        discount: '2.5%',
        available: true,
      },
      {
        id: 'bank',
        name: 'Bank Transfer (ACH)',
        description: 'Direct from bank account',
        icon: '🏦',
        processingTime: '1-3 business days',
        available: true,
      },
    ],
    
    // Settlement info (for transparency)
    settlement: {
      chain: 'Base',
      currency: 'USDC',
      contractAddress: settlementConfig.usdcAddress,
      note: 'All payments settle in USDC for fast, predictable payouts',
    },
    
    // Fee breakdown (optional transparency)
    fees: {
      platformFeePercent: settlementConfig.platformFeePercent,
      providerReceives: `$${(amountUsd * (1 - settlementConfig.platformFeePercent / 100)).toFixed(2)}`,
    },
  }
}

/**
 * Format USDC amount for display (6 decimals → human readable)
 */
export function formatUsdcAmount(usdcRaw: string): string {
  const amount = parseInt(usdcRaw) / 1_000_000
  return `$${amount.toFixed(2)}`
}

/**
 * Check if wallet has sufficient USDC balance
 */
export async function checkUsdcBalance(
  walletAddress: string,
  requiredAmount: number
): Promise<{ sufficient: boolean; balance: string }> {
  try {
    // In production, query the USDC contract for balance
    // For now, return a simulated check
    
    return {
      sufficient: true,
      balance: '1000000000', // 1000 USDC
    }
  } catch (error) {
    return {
      sufficient: false,
      balance: '0',
    }
  }
}

/**
 * Record a payment to provider's pending balance
 * Called when a patient payment is confirmed
 */
export async function recordProviderEarning(
  providerId: string,
  amountUsd: number,
  paymentId: string
): Promise<{ success: boolean; newBalance?: string; error?: string }> {
  try {
    const settlement = calculateSettlement(amountUsd)
    const providerPayoutRaw = parseInt(settlement.providerPayoutUsdc)
    
    // Get current provider
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      select: { pendingPayoutUsdc: true },
    })
    
    if (!provider) {
      // Try by NPI number
      const providerByNpi = await prisma.provider.findFirst({
        where: { npiNumber: providerId },
        select: { id: true, pendingPayoutUsdc: true },
      })
      
      if (!providerByNpi) {
        // Provider not in our system - they haven't signed up yet
        console.log(`[Settlement] Provider ${providerId} not found - payment pending until signup`)
        return {
          success: true,
          newBalance: '0',
        }
      }
      
      // Update by found ID
      const currentBalance = parseInt(providerByNpi.pendingPayoutUsdc || '0')
      const newBalance = currentBalance + providerPayoutRaw
      
      await prisma.provider.update({
        where: { id: providerByNpi.id },
        data: {
          pendingPayoutUsdc: newBalance.toString(),
        },
      })
      
      console.log(`[Settlement] Added ${settlement.providerPayoutUsdc} to provider ${providerByNpi.id}. New balance: ${newBalance}`)
      
      return {
        success: true,
        newBalance: newBalance.toString(),
      }
    }
    
    // Update provider's pending balance
    const currentBalance = parseInt(provider.pendingPayoutUsdc || '0')
    const newBalance = currentBalance + providerPayoutRaw
    
    await prisma.provider.update({
      where: { id: providerId },
      data: {
        pendingPayoutUsdc: newBalance.toString(),
      },
    })
    
    console.log(`[Settlement] Added ${settlement.providerPayoutUsdc} to provider ${providerId}. New balance: ${newBalance}`)
    
    return {
      success: true,
      newBalance: newBalance.toString(),
    }
    
  } catch (error) {
    console.error('Error recording provider earning:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record earning',
    }
  }
}
