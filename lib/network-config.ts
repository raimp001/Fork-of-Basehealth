/**
 * Network Configuration for BaseHealth
 * 
 * MAINNET TOGGLE: Change USE_MAINNET to true when ready for production
 * 
 * This file centralizes all network-related configuration for:
 * - Base blockchain (payments, attestations)
 * - RPC endpoints
 * - Explorer URLs
 * - Contract addresses
 */

// ============================================================
// MAINNET TOGGLE
// ============================================================
// Prefer explicit env vars; otherwise default to mainnet in production.
const useMainnetEnv = process.env.NEXT_PUBLIC_USE_MAINNET ?? process.env.USE_MAINNET
export const USE_MAINNET = useMainnetEnv ? useMainnetEnv === "true" : process.env.NODE_ENV === "production"

// ============================================================
// CHAIN CONFIGURATION
// ============================================================

export const CHAINS = {
  mainnet: {
    id: 8453,
    name: 'Base',
    network: 'base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: 'https://mainnet.base.org',
      public: 'https://mainnet.base.org',
      alchemy: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY || ''}`,
    },
    blockExplorers: {
      default: 'https://basescan.org',
      etherscan: 'https://basescan.org',
    },
    contracts: {
      eas: '0x4200000000000000000000000000000000000021',
      schemaRegistry: '0x4200000000000000000000000000000000000020',
      usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base Mainnet
    },
  },
  sepolia: {
    id: 84532,
    name: 'Base Sepolia',
    network: 'base-sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: 'https://sepolia.base.org',
      public: 'https://sepolia.base.org',
      alchemy: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY || ''}`,
    },
    blockExplorers: {
      default: 'https://sepolia.basescan.org',
      etherscan: 'https://sepolia.basescan.org',
    },
    contracts: {
      eas: '0x4200000000000000000000000000000000000021',
      schemaRegistry: '0x4200000000000000000000000000000000000020',
      usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
    },
  },
} as const

// ============================================================
// ACTIVE CHAIN (based on toggle)
// ============================================================

export const ACTIVE_CHAIN = USE_MAINNET ? CHAINS.mainnet : CHAINS.sepolia

// ============================================================
// PAYMENT CONFIGURATION
// ============================================================

function sanitizeEnvValue(value: string | undefined | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    const unquoted = trimmed.slice(1, -1).trim()
    return unquoted || undefined
  }
  return trimmed
}

function looksLikeAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value)
}

// Default treasury wallet address (used if env var not set)
// NOTE: Set NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS in production.
const DEFAULT_TREASURY_ADDRESS = '0xcB335bb4a2d2151F4E17eD525b7874343B77Ba8b'

export const PAYMENT_CONFIG = {
  // Platform treasury wallet - receives payments
  // Can be overridden with NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS env var
  recipientAddress: (() => {
    const env = sanitizeEnvValue(process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS)
    if (env && looksLikeAddress(env)) return env
    return DEFAULT_TREASURY_ADDRESS
  })(),
  
  // Platform fee percentage (2.5%)
  platformFeePercent: 2.5,
  
  // USDC contract address
  usdcAddress: ACTIVE_CHAIN.contracts.usdc,
  
  // Payment verification settings
  confirmationsRequired: USE_MAINNET ? 3 : 1,
  
  // Timeout for payment verification (ms)
  verificationTimeout: 60000,
}

// ============================================================
// ATTESTATION CONFIGURATION
// ============================================================

// Registered schema UID on Base Mainnet
const MAINNET_SCHEMA_UID = '0xc418e5961df11f29f7e16d0a4d7450e9640a055822a8fd3c1edf90b425116fa5'

export const ATTESTATION_CONFIG = {
  // EAS contract addresses
  easAddress: ACTIVE_CHAIN.contracts.eas,
  schemaRegistryAddress: ACTIVE_CHAIN.contracts.schemaRegistry,
  
  // BaseHealth provider schema UID
  // Registered on Base Mainnet by the BaseHealth builder wallet.
  schemaUid: USE_MAINNET
    ? process.env.EAS_SCHEMA_UID_MAINNET || MAINNET_SCHEMA_UID
    : process.env.EAS_SCHEMA_UID_SEPOLIA || '0x0000000000000000000000000000000000000000000000000000000000000000',
  
  // EAS scan URL
  easScanUrl: USE_MAINNET
    ? 'https://base.easscan.org'
    : 'https://base-sepolia.easscan.org',
}

// ============================================================
// API KEYS & EXTERNAL SERVICES
// ============================================================

export const EXTERNAL_SERVICES = {
  // OIG/SAM verification
  oig: {
    enabled: true,
    // No API key needed for OIG
  },
  sam: {
    enabled: !!process.env.SAM_GOV_API_KEY,
    apiKey: process.env.SAM_GOV_API_KEY,
  },
  
  // Email service
  email: {
    enabled: !!process.env.RESEND_API_KEY,
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@basehealth.xyz',
  },
  
  // OpenAI for health screening
  openai: {
    enabled: !!process.env.OPENAI_API_KEY,
    apiKey: process.env.OPENAI_API_KEY,
  },
}

// ============================================================
// WALLET CONNECTION CONFIGURATION
// ============================================================

export const WALLET_CONFIG = {
  // WalletConnect project ID
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  
  // Supported wallet types
  supportedWallets: ['coinbase', 'walletConnect', 'injected'] as const,
  
  // App metadata for wallet connections
  appMetadata: {
    name: 'BaseHealth',
    description: 'Healthcare payments on Base',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.basehealth.xyz',
    icon: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.basehealth.xyz'}/icon-192.png`,
  },
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get the block explorer URL for a transaction
 */
export function getTxExplorerUrl(txHash: string): string {
  return `${ACTIVE_CHAIN.blockExplorers.default}/tx/${txHash}`
}

/**
 * Get the block explorer URL for an address
 */
export function getAddressExplorerUrl(address: string): string {
  return `${ACTIVE_CHAIN.blockExplorers.default}/address/${address}`
}

/**
 * Get the EAS scan URL for an attestation
 */
export function getAttestationUrl(uid: string): string {
  return `${ATTESTATION_CONFIG.easScanUrl}/attestation/view/${uid}`
}

/**
 * Check if mainnet is ready (all required config set)
 */
export function isMainnetReady(): { ready: boolean; missing: string[] } {
  const missing: string[] = []
  
  if (!PAYMENT_CONFIG.recipientAddress) {
    missing.push('NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS')
  }
  
  if (!ATTESTATION_CONFIG.schemaUid || ATTESTATION_CONFIG.schemaUid === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    missing.push('EAS_SCHEMA_UID_MAINNET')
  }
  
  if (!process.env.ATTESTATION_PRIVATE_KEY) {
    missing.push('ATTESTATION_PRIVATE_KEY (for creating attestations)')
  }
  
  return {
    ready: missing.length === 0,
    missing,
  }
}

/**
 * Get network status summary
 */
export function getNetworkStatus(): {
  network: string
  chainId: number
  isMainnet: boolean
  paymentsReady: boolean
  attestationsReady: boolean
  emailReady: boolean
} {
  const mainnetCheck = isMainnetReady()
  
  return {
    network: ACTIVE_CHAIN.name,
    chainId: ACTIVE_CHAIN.id,
    isMainnet: USE_MAINNET,
    paymentsReady: !!PAYMENT_CONFIG.recipientAddress,
    attestationsReady: !!ATTESTATION_CONFIG.schemaUid && ATTESTATION_CONFIG.schemaUid !== '0x0000000000000000000000000000000000000000000000000000000000000000',
    emailReady: EXTERNAL_SERVICES.email.enabled,
  }
}

// ============================================================
// MAINNET CHECKLIST (for reference)
// ============================================================
/**
 * MAINNET DEPLOYMENT CHECKLIST:
 * 
 * 1. Environment Variables to Set:
 *    - NEXT_PUBLIC_USE_MAINNET=true
 *    - NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS=<your wallet>
 *    - ATTESTATION_PRIVATE_KEY=<private key for attestations>
 *    - EAS_SCHEMA_UID_MAINNET=<after registering schema>
 *    - RESEND_API_KEY=<for email notifications>
 *    - SAM_GOV_API_KEY=<for SAM.gov verification>
 * 
 * 2. One-Time Setup:
 *    - Register EAS schema on Base Mainnet
 *    - Fund attestation wallet with ETH for gas
 * 
 * 3. Testing:
 *    - Test payment flow end-to-end
 *    - Verify attestations are created
 *    - Confirm email notifications work
 * 
 * 4. Security:
 *    - Never commit private keys
 *    - Use environment variables for all secrets
 *    - Enable rate limiting on API routes
 */
