"use client"

import { base, baseSepolia } from 'wagmi/chains'

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  // If Privy app ID is not set, skip Privy provider (optional feature)
  if (!privyAppId) {
    return <>{children}</>
  }

  // Dynamically import Privy to avoid Solana dependencies in build
  // This allows the app to work without Privy configured
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrivyProvider: PrivyProviderBase } = require('@privy-io/react-auth')
    const chainId = process.env.NODE_ENV === 'production' ? base.id : baseSepolia.id

    return (
      <PrivyProviderBase
        appId={privyAppId}
        config={{
          loginMethods: ['email', 'wallet', 'sms'],
          appearance: {
            theme: 'light',
            accentColor: '#0A0A0A',
            logo: '/basehealth-logo.svg',
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
          defaultChain: chainId,
          supportedChains: [chainId],
        }}
      >
        {children}
      </PrivyProviderBase>
    )
  } catch (error) {
    // If Privy fails to load (e.g., missing dependencies), just render children
    console.warn('Privy provider not available:', error)
    return <>{children}</>
  }
}

