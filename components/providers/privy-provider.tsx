"use client"

import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth'
import { base, baseSepolia } from 'wagmi/chains'

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  // If Privy app ID is not set, skip Privy provider (optional feature)
  if (!privyAppId) {
    return <>{children}</>
  }

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
}

