"use client"

import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth'
import { base, baseSepolia } from 'viem/chains'

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''
const isMainnet = process.env.NEXT_PUBLIC_USE_MAINNET === 'true'

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  // If Privy app ID is not set, skip Privy provider (optional feature)
  if (!privyAppId) {
    return <>{children}</>
  }

  return (
    <PrivyProviderBase
      appId={privyAppId}
      config={{
        // Login methods - wallet is primary, email/sms as fallbacks
        loginMethods: ['wallet', 'email', 'sms'],
        
        // Appearance - matches existing design system
        appearance: {
          theme: 'dark',
          accentColor: '#0052FF', // Base blue
          logo: '/icon-192.png',
          showWalletLoginFirst: true,
        },
        
        // Embedded wallets - create for users without existing wallets
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        
        // Chain configuration - Base mainnet or Sepolia testnet
        defaultChain: isMainnet ? base : baseSepolia,
        supportedChains: [base, baseSepolia],
        
        // Wallet connect configuration
        walletConnectCloudProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
        
        // Legal
        legal: {
          termsAndConditionsUrl: 'https://basehealth.xyz/terms',
          privacyPolicyUrl: 'https://basehealth.xyz/privacy',
        },
      }}
    >
      {children}
    </PrivyProviderBase>
  )
}

