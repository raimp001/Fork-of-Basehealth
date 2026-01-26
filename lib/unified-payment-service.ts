/**
 * Unified Payment Service
 * 
 * A single interface for all payment methods:
 * - Stripe (Credit/Debit Cards, Apple Pay, Google Pay)
 * - Base/Coinbase (USDC, ETH on Base blockchain)
 * - Solana (SOL, USDC on Solana blockchain)
 * 
 * @module unified-payment-service
 */

import { healthcarePayments as baseHealthcarePayments } from './coinbase-config'
import { solanaHealthcarePayments, isSolanaConfigured } from './solana-payment-service'

// =============================================================================
// TYPES
// =============================================================================

export type PaymentProvider = 
  | 'stripe'           // Credit cards, Apple Pay, Google Pay
  | 'base'             // Base blockchain (Coinbase)
  | 'solana'           // Solana blockchain
  | 'coinbase_commerce' // Coinbase Commerce (hosted checkout)

export type PaymentCurrency =
  | 'USD'              // US Dollars (Stripe)
  | 'USDC'             // USD Coin (Base, Solana)
  | 'ETH'              // Ethereum (Base)
  | 'SOL'              // Solana

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'apple_pay'
  | 'google_pay'
  | 'crypto_base'
  | 'crypto_solana'
  | 'coinbase_checkout'

export interface PaymentOption {
  id: string
  provider: PaymentProvider
  method: PaymentMethod
  currency: PaymentCurrency
  name: string
  description: string
  icon: string
  enabled: boolean
  discount?: number // Percentage discount (e.g., 2.5 for crypto)
  processingTime: string
  fees: string
}

export interface UnifiedPaymentRequest {
  amount: number
  currency: PaymentCurrency
  provider: PaymentProvider
  method: PaymentMethod
  
  // Metadata
  orderId?: string
  userId?: string
  email?: string
  description?: string
  
  // Service-specific
  serviceType?: 'consultation' | 'caregiver' | 'subscription' | 'one-time'
  serviceTier?: string
  
  // Return URLs
  successUrl?: string
  cancelUrl?: string
}

export interface UnifiedPaymentResult {
  success: boolean
  provider: PaymentProvider
  paymentId?: string
  transactionHash?: string
  checkoutUrl?: string
  clientSecret?: string // For Stripe Elements
  error?: string
  amount: number
  currency: PaymentCurrency
  timestamp: Date
}

export interface PaymentVerification {
  verified: boolean
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  provider: PaymentProvider
  paymentId: string
  amount: number
  currency: PaymentCurrency
  completedAt?: Date
  error?: string
}

// =============================================================================
// PAYMENT OPTIONS
// =============================================================================

/**
 * Get all available payment options
 */
export function getPaymentOptions(): PaymentOption[] {
  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY
  const baseConfigured = !!(process.env.NEXT_PUBLIC_COINBASE_CDP_API_KEY || process.env.CDP_API_KEY_NAME)
  const solanaConfigured = isSolanaConfigured()
  const coinbaseCommerceConfigured = !!process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY
  
  return [
    // Credit/Debit Cards via Stripe
    {
      id: 'stripe_card',
      provider: 'stripe',
      method: 'credit_card',
      currency: 'USD',
      name: 'Credit / Debit Card',
      description: 'Pay securely with Visa, Mastercard, Amex, or Discover',
      icon: '💳',
      enabled: stripeConfigured,
      processingTime: 'Instant',
      fees: '2.9% + $0.30',
    },
    
    // Apple Pay via Stripe
    {
      id: 'stripe_apple',
      provider: 'stripe',
      method: 'apple_pay',
      currency: 'USD',
      name: 'Apple Pay',
      description: 'Fast checkout with Apple Pay',
      icon: '',
      enabled: stripeConfigured,
      processingTime: 'Instant',
      fees: '2.9% + $0.30',
    },
    
    // Google Pay via Stripe
    {
      id: 'stripe_google',
      provider: 'stripe',
      method: 'google_pay',
      currency: 'USD',
      name: 'Google Pay',
      description: 'Fast checkout with Google Pay',
      icon: '🔵',
      enabled: stripeConfigured,
      processingTime: 'Instant',
      fees: '2.9% + $0.30',
    },
    
    // USDC on Base
    {
      id: 'base_usdc',
      provider: 'base',
      method: 'crypto_base',
      currency: 'USDC',
      name: 'USDC on Base',
      description: 'Pay with USDC on Base blockchain - Low fees, fast settlement',
      icon: '🔵',
      enabled: baseConfigured,
      discount: 2.5, // 2.5% discount for crypto
      processingTime: '~2 seconds',
      fees: '< $0.01',
    },
    
    // ETH on Base
    {
      id: 'base_eth',
      provider: 'base',
      method: 'crypto_base',
      currency: 'ETH',
      name: 'ETH on Base',
      description: 'Pay with Ethereum on Base blockchain',
      icon: '⟠',
      enabled: baseConfigured,
      discount: 2.5,
      processingTime: '~2 seconds',
      fees: '< $0.01',
    },
    
    // USDC on Solana
    {
      id: 'solana_usdc',
      provider: 'solana',
      method: 'crypto_solana',
      currency: 'USDC',
      name: 'USDC on Solana',
      description: 'Pay with USDC on Solana - Ultra-fast transactions',
      icon: '◎',
      enabled: solanaConfigured,
      discount: 2.5,
      processingTime: '< 1 second',
      fees: '~$0.00025',
    },
    
    // SOL on Solana
    {
      id: 'solana_sol',
      provider: 'solana',
      method: 'crypto_solana',
      currency: 'SOL',
      name: 'SOL',
      description: 'Pay with native Solana tokens',
      icon: '◎',
      enabled: solanaConfigured,
      discount: 2.5,
      processingTime: '< 1 second',
      fees: '~$0.00025',
    },
    
    // Coinbase Commerce (Hosted Checkout)
    {
      id: 'coinbase_commerce',
      provider: 'coinbase_commerce',
      method: 'coinbase_checkout',
      currency: 'USDC',
      name: 'Coinbase Checkout',
      description: 'Pay with crypto via Coinbase - Multiple currencies accepted',
      icon: '🪙',
      enabled: coinbaseCommerceConfigured,
      discount: 2.5,
      processingTime: '1-10 minutes',
      fees: '1%',
    },
  ]
}

/**
 * Get enabled payment options only
 */
export function getEnabledPaymentOptions(): PaymentOption[] {
  return getPaymentOptions().filter(option => option.enabled)
}

/**
 * Get payment options by provider
 */
export function getPaymentOptionsByProvider(provider: PaymentProvider): PaymentOption[] {
  return getPaymentOptions().filter(option => option.provider === provider && option.enabled)
}

/**
 * Get crypto payment options
 */
export function getCryptoPaymentOptions(): PaymentOption[] {
  return getPaymentOptions().filter(
    option => ['base', 'solana', 'coinbase_commerce'].includes(option.provider) && option.enabled
  )
}

/**
 * Get traditional payment options (cards)
 */
export function getCardPaymentOptions(): PaymentOption[] {
  return getPaymentOptions().filter(
    option => option.provider === 'stripe' && option.enabled
  )
}

// =============================================================================
// PAYMENT PROCESSING
// =============================================================================

/**
 * Create a payment request for any provider
 * Returns provider-specific data needed to complete payment
 */
export async function createUnifiedPayment(
  request: UnifiedPaymentRequest
): Promise<UnifiedPaymentResult> {
  const { provider, amount, currency } = request
  
  try {
    switch (provider) {
      case 'stripe':
        return await createStripePayment(request)
      
      case 'base':
        return await createBasePayment(request)
      
      case 'solana':
        return await createSolanaPayment(request)
      
      case 'coinbase_commerce':
        return await createCoinbaseCommercePayment(request)
      
      default:
        return {
          success: false,
          provider,
          error: `Unknown payment provider: ${provider}`,
          amount,
          currency,
          timestamp: new Date(),
        }
    }
  } catch (error) {
    console.error('Error creating unified payment:', error)
    return {
      success: false,
      provider,
      error: error instanceof Error ? error.message : 'Payment creation failed',
      amount,
      currency,
      timestamp: new Date(),
    }
  }
}

/**
 * Create a Stripe payment
 */
async function createStripePayment(
  request: UnifiedPaymentRequest
): Promise<UnifiedPaymentResult> {
  // Call the Stripe payment API
  const response = await fetch('/api/payments/stripe/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: request.amount,
      currency: request.currency.toLowerCase(),
      metadata: {
        orderId: request.orderId,
        userId: request.userId,
        serviceType: request.serviceType,
        serviceTier: request.serviceTier,
      },
    }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    return {
      success: false,
      provider: 'stripe',
      error: error.message || 'Failed to create Stripe payment',
      amount: request.amount,
      currency: request.currency,
      timestamp: new Date(),
    }
  }
  
  const data = await response.json()
  
  return {
    success: true,
    provider: 'stripe',
    paymentId: data.paymentIntentId,
    clientSecret: data.clientSecret,
    amount: request.amount,
    currency: request.currency,
    timestamp: new Date(),
  }
}

/**
 * Create a Base blockchain payment
 */
async function createBasePayment(
  request: UnifiedPaymentRequest
): Promise<UnifiedPaymentResult> {
  // For Base payments, we return the payment details
  // The actual transaction is signed and sent by the user's wallet
  
  const response = await fetch('/api/payments/base/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: request.amount,
      currency: request.currency,
      orderId: request.orderId,
      userId: request.userId,
    }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    return {
      success: false,
      provider: 'base',
      error: error.message || 'Failed to create Base payment',
      amount: request.amount,
      currency: request.currency,
      timestamp: new Date(),
    }
  }
  
  const data = await response.json()
  
  return {
    success: true,
    provider: 'base',
    paymentId: data.paymentId,
    amount: request.amount,
    currency: request.currency,
    timestamp: new Date(),
  }
}

/**
 * Create a Solana blockchain payment
 */
async function createSolanaPayment(
  request: UnifiedPaymentRequest
): Promise<UnifiedPaymentResult> {
  const response = await fetch('/api/payments/solana/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: request.amount,
      currency: request.currency,
      orderId: request.orderId,
      userId: request.userId,
    }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    return {
      success: false,
      provider: 'solana',
      error: error.message || 'Failed to create Solana payment',
      amount: request.amount,
      currency: request.currency,
      timestamp: new Date(),
    }
  }
  
  const data = await response.json()
  
  return {
    success: true,
    provider: 'solana',
    paymentId: data.paymentId,
    amount: request.amount,
    currency: request.currency,
    timestamp: new Date(),
  }
}

/**
 * Create a Coinbase Commerce payment
 */
async function createCoinbaseCommercePayment(
  request: UnifiedPaymentRequest
): Promise<UnifiedPaymentResult> {
  const response = await fetch('/api/payments/coinbase/create-charge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: request.amount,
      currency: 'USD', // Coinbase Commerce accepts USD pricing
      name: request.description || 'Healthcare Service',
      description: request.description,
      orderId: request.orderId,
      successUrl: request.successUrl,
      cancelUrl: request.cancelUrl,
    }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    return {
      success: false,
      provider: 'coinbase_commerce',
      error: error.message || 'Failed to create Coinbase Commerce charge',
      amount: request.amount,
      currency: request.currency,
      timestamp: new Date(),
    }
  }
  
  const data = await response.json()
  
  return {
    success: true,
    provider: 'coinbase_commerce',
    paymentId: data.chargeId,
    checkoutUrl: data.checkoutUrl,
    amount: request.amount,
    currency: request.currency,
    timestamp: new Date(),
  }
}

// =============================================================================
// PAYMENT VERIFICATION
// =============================================================================

/**
 * Verify a payment across any provider
 */
export async function verifyPayment(
  paymentId: string,
  provider: PaymentProvider
): Promise<PaymentVerification> {
  try {
    const response = await fetch(`/api/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, provider }),
    })
    
    if (!response.ok) {
      return {
        verified: false,
        status: 'failed',
        provider,
        paymentId,
        amount: 0,
        currency: 'USD',
        error: 'Verification request failed',
      }
    }
    
    const data = await response.json()
    
    return {
      verified: data.verified,
      status: data.status,
      provider,
      paymentId,
      amount: data.amount,
      currency: data.currency,
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
    }
  } catch (error) {
    return {
      verified: false,
      status: 'failed',
      provider,
      paymentId,
      amount: 0,
      currency: 'USD',
      error: error instanceof Error ? error.message : 'Verification failed',
    }
  }
}

// =============================================================================
// PRICING HELPERS
// =============================================================================

/**
 * Calculate price with crypto discount
 */
export function calculatePriceWithDiscount(
  basePrice: number,
  paymentOption: PaymentOption
): { originalPrice: number; finalPrice: number; discount: number } {
  const discount = paymentOption.discount || 0
  const discountAmount = basePrice * (discount / 100)
  
  return {
    originalPrice: basePrice,
    finalPrice: basePrice - discountAmount,
    discount: discountAmount,
  }
}

/**
 * Get healthcare service pricing
 */
export function getServicePricing(
  serviceType: 'consultation' | 'caregiverBooking' | 'subscription',
  tier: string
): number | null {
  const pricing = baseHealthcarePayments[serviceType] as Record<string, number>
  return pricing?.[tier] ?? null
}

/**
 * Format price for display
 */
export function formatPrice(
  amount: number,
  currency: PaymentCurrency
): string {
  switch (currency) {
    case 'USD':
    case 'USDC':
      return `$${amount.toFixed(2)}`
    case 'ETH':
      return `${amount.toFixed(6)} ETH`
    case 'SOL':
      return `${amount.toFixed(4)} SOL`
    default:
      return `${amount} ${currency}`
  }
}

// =============================================================================
// CONFIGURATION STATUS
// =============================================================================

export interface PaymentConfigStatus {
  stripe: { configured: boolean; missing: string[] }
  base: { configured: boolean; missing: string[] }
  solana: { configured: boolean; missing: string[] }
  coinbaseCommerce: { configured: boolean; missing: string[] }
  anyConfigured: boolean
}

/**
 * Check which payment providers are configured
 */
export function getPaymentConfigStatus(): PaymentConfigStatus {
  const stripeMissing: string[] = []
  const baseMissing: string[] = []
  const solanaMissing: string[] = []
  const coinbaseMissing: string[] = []
  
  // Stripe checks
  if (!process.env.STRIPE_SECRET_KEY) stripeMissing.push('STRIPE_SECRET_KEY')
  if (!process.env.STRIPE_WEBHOOK_SECRET) stripeMissing.push('STRIPE_WEBHOOK_SECRET')
  
  // Base/Coinbase checks
  if (!process.env.CDP_API_KEY_NAME && !process.env.NEXT_PUBLIC_COINBASE_CDP_API_KEY) {
    baseMissing.push('CDP_API_KEY_NAME or NEXT_PUBLIC_COINBASE_CDP_API_KEY')
  }
  if (!process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS) {
    baseMissing.push('NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS')
  }
  
  // Solana checks
  if (!process.env.NEXT_PUBLIC_SOLANA_RECIPIENT_WALLET) {
    solanaMissing.push('NEXT_PUBLIC_SOLANA_RECIPIENT_WALLET')
  }
  
  // Coinbase Commerce checks
  if (!process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY) {
    coinbaseMissing.push('NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY')
  }
  
  const stripeConfigured = stripeMissing.length === 0
  const baseConfigured = baseMissing.length === 0
  const solanaConfigured = solanaMissing.length === 0
  const coinbaseConfigured = coinbaseMissing.length === 0
  
  return {
    stripe: { configured: stripeConfigured, missing: stripeMissing },
    base: { configured: baseConfigured, missing: baseMissing },
    solana: { configured: solanaConfigured, missing: solanaMissing },
    coinbaseCommerce: { configured: coinbaseConfigured, missing: coinbaseMissing },
    anyConfigured: stripeConfigured || baseConfigured || solanaConfigured || coinbaseConfigured,
  }
}
