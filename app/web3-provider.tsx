"use client"

import { useEffect, useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base, baseSepolia } from 'wagmi/chains'
import { wagmiConfig } from '@/lib/coinbase-config'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

// RainbowKit configuration
const config = getDefaultConfig({
  appName: 'BaseHealth',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [process.env.NODE_ENV === 'production' ? base : baseSepolia],
  ssr: true,
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Don't render wallet components during SSR
  if (!mounted) {
    return <>{children}</>
  }
  
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          coolMode
          modalSize="compact"
          initialChain={process.env.NODE_ENV === 'production' ? base : baseSepolia}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
