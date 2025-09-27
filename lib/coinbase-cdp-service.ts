import { Coinbase, Wallet, Transfer } from '@coinbase/coinbase-sdk'
import { parseUnits, formatUnits } from 'viem'
import { cdpConfig, paymentConfig, baseChain } from './coinbase-config'

// Initialize Coinbase SDK
let coinbaseClient: Coinbase | null = null

export function getCoinbaseClient() {
  if (!coinbaseClient && cdpConfig.apiKeyName && cdpConfig.apiKeySecret) {
    coinbaseClient = new Coinbase({
      apiKeyName: cdpConfig.apiKeyName,
      privateKey: cdpConfig.apiKeySecret,
    })
  }
  return coinbaseClient
}

// Create or get user wallet
export async function getOrCreateWallet(userId: string): Promise<Wallet | null> {
  try {
    const client = getCoinbaseClient()
    if (!client) {
      console.error('Coinbase client not initialized')
      return null
    }

    // In production, you'd store wallet info in your database
    // For now, we'll create a new wallet for demo
    const wallet = await Wallet.create({
      networkId: cdpConfig.network,
    })
    
    console.log('Created wallet:', wallet.getId())
    return wallet
  } catch (error) {
    console.error('Error creating wallet:', error)
    return null
  }
}

// Send payment
export async function sendPayment({
  fromWallet,
  toAddress,
  amount,
  currency = 'USDC',
  description = 'Healthcare payment',
}: {
  fromWallet: Wallet
  toAddress: string
  amount: number
  currency?: 'USDC' | 'ETH'
  description?: string
}): Promise<Transfer | null> {
  try {
    const token = paymentConfig.supportedTokens.find(t => t.symbol === currency)
    if (!token) {
      throw new Error(`Unsupported currency: ${currency}`)
    }

    // Convert amount to token units
    const amountInUnits = parseUnits(amount.toString(), token.decimals)

    // Create transfer
    const transfer = await fromWallet.createTransfer({
      amount: amountInUnits.toString(),
      assetId: currency === 'ETH' ? 'eth' : token.address,
      destination: toAddress,
      gasless: currency === 'USDC', // Use gasless for USDC transfers
    })

    // Wait for transfer to complete
    await transfer.wait()
    
    console.log('Payment sent:', {
      transferId: transfer.getId(),
      amount,
      currency,
      to: toAddress,
    })

    return transfer
  } catch (error) {
    console.error('Error sending payment:', error)
    return null
  }
}

// Get wallet balance
export async function getWalletBalance(wallet: Wallet, currency: 'USDC' | 'ETH' = 'USDC') {
  try {
    const token = paymentConfig.supportedTokens.find(t => t.symbol === currency)
    if (!token) {
      throw new Error(`Unsupported currency: ${currency}`)
    }

    const balance = await wallet.getBalance(
      currency === 'ETH' ? 'eth' : token.address
    )

    return {
      raw: balance.toString(),
      formatted: formatUnits(BigInt(balance.toString()), token.decimals),
      currency,
    }
  } catch (error) {
    console.error('Error getting balance:', error)
    return null
  }
}

// Create payment request
export async function createPaymentRequest({
  amount,
  currency = 'USDC',
  description,
  patientId,
  providerId,
  appointmentId,
  type,
}: {
  amount: number
  currency?: 'USDC' | 'ETH'
  description: string
  patientId: string
  providerId?: string
  appointmentId?: string
  type: 'consultation' | 'caregiver' | 'subscription' | 'bounty'
}) {
  try {
    // Create a unique payment ID
    const paymentId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Store payment request in database (mock for now)
    const paymentRequest = {
      id: paymentId,
      amount,
      currency,
      description,
      patientId,
      providerId,
      appointmentId,
      type,
      status: 'pending',
      recipientAddress: paymentConfig.recipientAddress,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    }

    return paymentRequest
  } catch (error) {
    console.error('Error creating payment request:', error)
    return null
  }
}

// Verify payment on blockchain
export async function verifyPayment(transactionHash: string) {
  try {
    // In production, you'd verify the transaction on-chain
    // For now, we'll simulate verification
    console.log('Verifying payment:', transactionHash)
    
    // Mock verification result
    return {
      verified: true,
      transactionHash,
      amount: '75.00',
      currency: 'USDC',
      from: '0x1234...5678',
      to: paymentConfig.recipientAddress,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error verifying payment:', error)
    return null
  }
}

// Get transaction history
export async function getTransactionHistory(walletAddress: string, limit = 10) {
  try {
    // In production, you'd fetch from blockchain or indexer
    // Mock transaction history
    return [
      {
        hash: '0x123...abc',
        type: 'payment',
        amount: '150.00',
        currency: 'USDC',
        description: 'In-person consultation',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed',
      },
      {
        hash: '0x456...def',
        type: 'payment',
        amount: '35.00',
        currency: 'USDC',
        description: 'Caregiver booking (1 hour)',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        status: 'completed',
      },
      {
        hash: '0x789...ghi',
        type: 'refund',
        amount: '75.00',
        currency: 'USDC',
        description: 'Cancelled appointment refund',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        status: 'completed',
      },
    ]
  } catch (error) {
    console.error('Error fetching transaction history:', error)
    return []
  }
}

// Healthcare-specific payment functions
export async function processConsultationPayment({
  patientWallet,
  providerId,
  consultationType,
  appointmentId,
}: {
  patientWallet: Wallet
  providerId: string
  consultationType: 'virtual' | 'inPerson' | 'specialist'
  appointmentId: string
}) {
  const amount = {
    virtual: 75,
    inPerson: 150,
    specialist: 250,
  }[consultationType]

  return await sendPayment({
    fromWallet: patientWallet,
    toAddress: paymentConfig.recipientAddress, // In production, send to provider's address
    amount,
    currency: 'USDC',
    description: `${consultationType} consultation - Appointment #${appointmentId}`,
  })
}

export async function processCaregiverBooking({
  patientWallet,
  caregiverId,
  hours,
  bookingId,
}: {
  patientWallet: Wallet
  caregiverId: string
  hours: number
  bookingId: string
}) {
  const hourlyRate = 35
  const amount = hourlyRate * hours

  return await sendPayment({
    fromWallet: patientWallet,
    toAddress: paymentConfig.recipientAddress, // In production, use escrow or caregiver address
    amount,
    currency: 'USDC',
    description: `Caregiver booking (${hours} hours) - Booking #${bookingId}`,
  })
}

export async function processSubscriptionPayment({
  patientWallet,
  tier,
  subscriptionId,
}: {
  patientWallet: Wallet
  tier: 'basic' | 'premium' | 'family'
  subscriptionId: string
}) {
  const amount = {
    basic: 9.99,
    premium: 19.99,
    family: 39.99,
  }[tier]

  return await sendPayment({
    fromWallet: patientWallet,
    toAddress: paymentConfig.recipientAddress,
    amount,
    currency: 'USDC',
    description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} subscription - ${subscriptionId}`,
  })
}
