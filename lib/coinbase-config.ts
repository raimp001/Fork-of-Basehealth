import { createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { coinbaseWallet } from 'wagmi/connectors'
import { http } from 'viem'

// Base chain configuration
// TESTING MODE: Force Base Sepolia for testnet testing
// TODO: Revert to `process.env.NODE_ENV === 'production' ? base : baseSepolia` after testing
export const baseChain = baseSepolia // Force testnet for testing

// Wagmi configuration for Base
export const wagmiConfig = createConfig({
  chains: [baseChain],
  connectors: [
    coinbaseWallet({
      appName: 'BaseHealth',
      preference: 'smartWalletOnly',
    }),
  ],
  ssr: true,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})

// Coinbase Commerce configuration
export const coinbaseCommerceConfig = {
  apiKey: process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY || '',
  webhookSecret: process.env.COINBASE_COMMERCE_WEBHOOK_SECRET || '',
}

// CDP SDK configuration
export const cdpConfig = {
  apiKeyName: process.env.CDP_API_KEY_NAME || '',
  apiKeySecret: process.env.CDP_API_KEY_SECRET || '',
  network: process.env.NODE_ENV === 'production' ? 'base' : 'base-sepolia',
}

// Payment configurations
export const paymentConfig = {
  // USDC contract addresses
  usdcAddress: {
    base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  },
  // Payment recipient addresses
  recipientAddress: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS || '0x0000000000000000000000000000000000000000',
  // Supported tokens
  supportedTokens: [
    {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      address: baseChain.id === base.id 
        ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
        : '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000', // Native ETH
    },
  ],
}

// Healthcare-specific payment amounts (in USD)
export const healthcarePayments = {
  consultation: {
    virtual: 75,
    inPerson: 150,
    specialist: 250,
  },
  caregiverBooking: {
    hourly: 35,
    daily: 280,
    weekly: 1680,
  },
  subscription: {
    basic: 9.99,
    premium: 19.99,
    family: 39.99,
  },
  medicalBounty: {
    minimum: 100,
    standard: 500,
    complex: 1000,
  },
}
