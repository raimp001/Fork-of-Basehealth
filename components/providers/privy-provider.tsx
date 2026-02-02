"use client"

import { useState, useEffect, type ReactNode } from 'react'

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''
const isMainnet = process.env.NEXT_PUBLIC_USE_MAINNET === 'true'

// Validate Privy App ID format (should be alphanumeric string)
function isValidPrivyAppId(id: string): boolean {
  return id.length > 10 && /^[a-z0-9]+$/i.test(id)
}

export function PrivyProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [PrivyWrapper, setPrivyWrapper] = useState<React.ComponentType<{ children: ReactNode }> | null>(null)

  useEffect(() => {
    setMounted(true)
    
    // Only load Privy on client and if valid App ID
    if (privyAppId && isValidPrivyAppId(privyAppId)) {
      import('@privy-io/react-auth').then((mod) => {
        import('viem/chains').then((chains) => {
          const { PrivyProvider: PrivyProviderBase } = mod
          const { base, baseSepolia } = chains
          
          // Create wrapper component
          const Wrapper = ({ children }: { children: ReactNode }) => (
            <PrivyProviderBase
              appId={privyAppId}
              config={{
                loginMethods: ['wallet', 'email', 'sms'],
                appearance: {
                  theme: 'dark',
                  accentColor: '#0052FF',
                  logo: '/icon-192.png',
                  showWalletLoginFirst: true,
                },
                embeddedWallets: {
                  createOnLogin: 'users-without-wallets',
                  requireUserPasswordOnCreate: false,
                },
                defaultChain: isMainnet ? base : baseSepolia,
                supportedChains: [base, baseSepolia],
                walletConnectCloudProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
                legal: {
                  termsAndConditionsUrl: 'https://basehealth.xyz/terms',
                  privacyPolicyUrl: 'https://basehealth.xyz/privacy',
                },
              }}
            >
              {children}
            </PrivyProviderBase>
          )
          
          setPrivyWrapper(() => Wrapper)
        })
      }).catch((err) => {
        console.warn('Failed to load Privy:', err)
      })
    }
  }, [])

  // During SSR or before Privy loads, just render children
  if (!mounted || !PrivyWrapper) {
    return <>{children}</>
  }

  return <PrivyWrapper>{children}</PrivyWrapper>
}

