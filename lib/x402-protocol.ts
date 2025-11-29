/**
 * x402 Payment Protocol Implementation
 * Based on Coinbase x402 spec: https://github.com/coinbase/x402
 * 
 * A payments protocol for the internet. Built on HTTP.
 */

import { paymentConfig, baseChain } from './coinbase-config'

// x402 Protocol Version
export const X402_VERSION = 1

/**
 * Payment Required Response
 * Returned by resource server when payment is required
 */
export interface PaymentRequiredResponse {
  // Version of the x402 payment protocol
  x402Version: number
  
  // List of payment requirements that the resource server accepts
  accepts: PaymentRequirement[]
  
  // Message from the resource server to the client to communicate errors
  error?: string | null
}

/**
 * Payment Requirement
 * Defines what payment is required for a resource
 */
export interface PaymentRequirement {
  // Scheme of the payment protocol to use (e.g., "exact")
  scheme: string
  
  // Network of the blockchain to send payment on (e.g., "base", "base-sepolia")
  network: string
  
  // Maximum amount required to pay for the resource in atomic units of the asset
  maxAmountRequired: string // uint256 as string
  
  // URL of resource to pay for
  resource: string
  
  // Description of the resource
  description: string
  
  // MIME type of the resource response
  mimeType: string
  
  // Output schema of the resource response (optional)
  outputSchema?: object | null
  
  // Address to pay value to
  payTo: string
  
  // Maximum time in seconds for the resource server to respond
  maxTimeoutSeconds: number
  
  // Address of the EIP-3009 compliant ERC20 contract (or native token)
  asset: string
  
  // Extra information about the payment details specific to the scheme
  // For `exact` scheme on EVM network, expects extra to contain `name` and `version` pertaining to asset
  extra: {
    name?: string
    version?: string
    [key: string]: any
  } | null
}

/**
 * Payment Payload
 * Included as the X-PAYMENT header in base64 encoded JSON
 */
export interface PaymentPayload {
  // Version of the x402 payment protocol
  x402Version: number
  
  // scheme is the scheme value of the accepted paymentRequirements the client is using to pay
  scheme: string
  
  // network is the network id of the accepted paymentRequirements the client is using to pay
  network: string
  
  // payload is scheme dependent
  payload: ExactSchemePayload | any
}

/**
 * Exact Scheme Payload (for EVM networks)
 * Used for exact payment amounts on EVM-compatible chains
 */
export interface ExactSchemePayload {
  // Transaction hash of the payment
  txHash: string
  
  // Address that sent the payment
  from: string
  
  // Address that received the payment
  to: string
  
  // Amount paid (in atomic units)
  amount: string
  
  // Block number where transaction was included
  blockNumber?: string
  
  // Block hash where transaction was included
  blockHash?: string
}

/**
 * Verification Response
 * Returned by facilitator server after verifying payment
 */
export interface VerificationResponse {
  isValid: boolean
  invalidReason: string | null
}

/**
 * Settlement Response
 * Returned by facilitator server after settling payment
 */
export interface SettlementResponse {
  // Whether the payment was successful
  success: boolean
  
  // Error message from the facilitator server
  error: string | null
  
  // Transaction hash of the settled payment
  txHash: string | null
  
  // Network id of the blockchain the payment was settled on
  networkId: string | null
}

/**
 * Supported Schemes Response
 * Returned by facilitator server listing supported schemes and networks
 */
export interface SupportedSchemesResponse {
  kinds: Array<{
    scheme: string
    network: string
  }>
}

/**
 * Create Payment Required Response (HTTP 402)
 * Returns a properly formatted x402 Payment Required response
 */
export function createPaymentRequiredResponse(
  requirements: PaymentRequirement[],
  error?: string
): Response {
  const response: PaymentRequiredResponse = {
    x402Version: X402_VERSION,
    accepts: requirements,
    error: error || null,
  }
  
  return new Response(JSON.stringify(response), {
    status: 402,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Encode Payment Payload to X-PAYMENT header
 * Converts PaymentPayload to base64 encoded JSON string
 */
export function encodePaymentPayload(payload: PaymentPayload): string {
  const jsonString = JSON.stringify(payload)
  return Buffer.from(jsonString).toString('base64')
}

/**
 * Decode X-PAYMENT header to Payment Payload
 * Converts base64 encoded JSON string to PaymentPayload
 */
export function decodePaymentPayload(header: string): PaymentPayload {
  try {
    const jsonString = Buffer.from(header, 'base64').toString('utf-8')
    return JSON.parse(jsonString) as PaymentPayload
  } catch (error) {
    throw new Error('Invalid X-PAYMENT header format')
  }
}

/**
 * Create Payment Requirement for Base blockchain
 */
export function createBasePaymentRequirement(
  amount: number,
  currency: 'USDC' | 'ETH',
  resource: string,
  description: string,
  mimeType: string = 'application/json',
  maxTimeoutSeconds: number = 300
): PaymentRequirement {
  const token = paymentConfig.supportedTokens.find(t => t.symbol === currency)
  const network = process.env.NODE_ENV === 'production' ? 'base' : 'base-sepolia'
  
  // Convert amount to atomic units (wei for ETH, smallest unit for USDC)
  const decimals = currency === 'ETH' ? 18 : 6
  const atomicAmount = BigInt(Math.floor(amount * Math.pow(10, decimals))).toString()
  
  return {
    scheme: 'exact', // Using exact scheme for EVM
    network,
    maxAmountRequired: atomicAmount,
    resource,
    description,
    mimeType,
    outputSchema: null,
    payTo: paymentConfig.recipientAddress,
    maxTimeoutSeconds,
    asset: currency === 'ETH' 
      ? '0x0000000000000000000000000000000000000000' // Native ETH
      : (token?.address || ''),
    extra: {
      name: currency === 'USDC' ? 'USD Coin' : 'Ethereum',
      version: '1',
    },
  }
}

/**
 * Verify Exact Scheme Payment (EVM)
 * Verifies that a payment payload matches the payment requirement
 */
export async function verifyExactPayment(
  payload: ExactSchemePayload,
  requirement: PaymentRequirement
): Promise<VerificationResponse> {
  try {
    // Verify network matches
    if (payload.network !== requirement.network) {
      return {
        isValid: false,
        invalidReason: `Network mismatch: ${payload.network} !== ${requirement.network}`,
      }
    }
    
    // Verify recipient matches
    if (payload.to.toLowerCase() !== requirement.payTo.toLowerCase()) {
      return {
        isValid: false,
        invalidReason: `Recipient mismatch: ${payload.to} !== ${requirement.payTo}`,
      }
    }
    
    // Verify amount matches (exact scheme requires exact amount)
    const paidAmount = BigInt(payload.amount)
    const requiredAmount = BigInt(requirement.maxAmountRequired)
    
    if (paidAmount < requiredAmount) {
      return {
        isValid: false,
        invalidReason: `Insufficient payment: ${paidAmount.toString()} < ${requiredAmount.toString()}`,
      }
    }
    
    // Verify transaction hash format
    if (!payload.txHash || !payload.txHash.startsWith('0x') || payload.txHash.length !== 66) {
      return {
        isValid: false,
        invalidReason: 'Invalid transaction hash format',
      }
    }
    
    // In production, verify on-chain:
    // 1. Transaction exists and is confirmed
    // 2. Transaction details match payload
    // 3. Transaction is recent (< maxTimeoutSeconds)
    
    return {
      isValid: true,
      invalidReason: null,
    }
  } catch (error) {
    return {
      isValid: false,
      invalidReason: error instanceof Error ? error.message : 'Verification failed',
    }
  }
}

/**
 * Get supported schemes and networks
 */
export function getSupportedSchemes(): SupportedSchemesResponse {
  const network = process.env.NODE_ENV === 'production' ? 'base' : 'base-sepolia'
  
  return {
    kinds: [
      {
        scheme: 'exact',
        network,
      },
    ],
  }
}

