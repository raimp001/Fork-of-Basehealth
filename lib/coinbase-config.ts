import { createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'
import { http } from 'viem'

// Base chain configuration
// TESTING MODE: Force Base Sepolia for testnet testing
// TODO: Revert to `process.env.NODE_ENV === 'production' ? base : baseSepolia` after testing
export const baseChain = baseSepolia // Force testnet for testing

// WalletConnect Project ID - required for mobile wallet connections
// Get one free at https://cloud.walletconnect.com/
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

// Wagmi configuration for Base
// Supports: Base app (mobile), Coinbase Wallet, MetaMask, and other wallets
export const wagmiConfig = createConfig({
  chains: [baseSepolia, base], // Both chains available, Sepolia first for testing
  connectors: [
    // Coinbase Wallet - works with Base app on mobile
    coinbaseWallet({
      appName: 'BaseHealth',
      preference: 'all', // Allow both smart wallet and regular wallet
    }),
    // WalletConnect - for mobile wallet connections (Base app, Rainbow, etc.)
    walletConnect({
      projectId: walletConnectProjectId,
      metadata: {
        name: 'BaseHealth',
        description: 'Healthcare payments on Base',
        url: 'https://basehealth.xyz',
        icons: ['https://basehealth.xyz/logo.png'],
      },
      showQrModal: true,
    }),
    // Injected wallets (MetaMask, etc.)
    injected({
      shimDisconnect: true,
    }),
  ],
  ssr: true,
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
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
