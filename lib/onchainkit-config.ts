/**
 * OnchainKit Configuration for Base Chain
 * Coinbase CDK integration with Base blockchain
 * Supports both Base Mainnet and Base Sepolia Testnet
 */

import { getDefaultConfig } from '@coinbase/onchainkit'
import { base, baseSepolia } from 'wagmi/chains'

// Determine which network to use based on environment
const isProduction = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_NETWORK === 'base'
const chain = isProduction ? base : baseSepolia

// OnchainKit configuration with Base chain
export const onchainKitConfig = getDefaultConfig({
  appName: 'BaseHealth',
  appIcon: '/basehealth-logo.svg',
  infuraKey: process.env.NEXT_PUBLIC_INFURA_API_KEY || '',
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  chains: [chain],
})

// Export chain info for use in components
export const baseChainInfo = {
  id: chain.id,
  name: chain.name,
  network: chain.network,
  isProduction,
  blockExplorer: isProduction ? 'https://basescan.org' : 'https://sepolia.basescan.org',
  rpcUrl: chain.rpcUrls.default.http[0],
  nativeCurrency: chain.nativeCurrency,
}

// Export the chain for direct use
export { chain as baseChain }

