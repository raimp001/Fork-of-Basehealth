"use client"

import { useEffect, useState, type ReactNode } from 'react'

/**
 * Web3Provider - Wraps the app with wallet providers
 * 
 * This provider is designed to be resilient - if RainbowKit/Wagmi
 * fails to load (e.g., in some mobile browsers), the app still works
 * and uses native window.ethereum for wallet connections.
 */

// Lazy load wagmi/rainbowkit to prevent SSR issues
let WagmiProvider: any = null
let QueryClientProvider: any = null
let RainbowKitProvider: any = null
let wagmiConfig: any = null
let initialChain: any = null
let QueryClient: any = null

// Track if we've attempted to load the providers
let providersLoaded = false
let providersError: Error | null = null

async function loadProviders() {
  if (providersLoaded) return !providersError
  
  try {
    const [wagmiModule, queryModule, rainbowModule, configModule] = await Promise.all([
      import('wagmi'),
      import('@tanstack/react-query'),
      import('@rainbow-me/rainbowkit'),
      import('@/lib/coinbase-config'),
    ])
    
    WagmiProvider = wagmiModule.WagmiProvider
    QueryClientProvider = queryModule.QueryClientProvider
    QueryClient = queryModule.QueryClient
    RainbowKitProvider = rainbowModule.RainbowKitProvider
    wagmiConfig = configModule.wagmiConfig
    initialChain = configModule.baseChain
    
    // Import styles
    await import('@rainbow-me/rainbowkit/styles.css')
    
    providersLoaded = true
    return true
  } catch (error) {
    console.warn('Failed to load Web3 providers:', error)
    providersError = error as Error
    providersLoaded = true
    return false
  }
}

// Simple wrapper that doesn't crash if providers fail
function SafeWeb3Wrapper({ children, loaded }: { children: ReactNode; loaded: boolean }) {
  if (!loaded || !WagmiProvider || !QueryClientProvider || !RainbowKitProvider) {
    // Providers failed to load - render children without wallet providers
    // The app will use native window.ethereum for wallet connections
    return <>{children}</>
  }
  
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
      },
    },
  })
  
  try {
    return (
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            modalSize="compact"
            initialChain={initialChain}
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    )
  } catch (error) {
    console.warn('Web3Provider render error:', error)
    return <>{children}</>
  }
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [loaded, setLoaded] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    
    // Load providers asynchronously
    loadProviders().then((success) => {
      setLoaded(success)
    })
  }, [])
  
  // During SSR or before mount, just render children
  if (!mounted) {
    return <div style={{ minHeight: '100vh' }}>{children}</div>
  }
  
  return <SafeWeb3Wrapper loaded={loaded}>{children}</SafeWeb3Wrapper>
}
