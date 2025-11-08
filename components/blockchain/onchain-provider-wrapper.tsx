"use client"

import type { ReactNode } from "react"
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { baseChain, onchainKitConfig } from '@/lib/onchainkit-config'

/**
 * OnchainKit Provider Wrapper for Base Chain
 * Provides Coinbase CDK support with Base blockchain integration
 */
export function OnchainProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      chain={baseChain}
      apiKey={onchainKitConfig.apiKey}
      rpcUrl={onchainKitConfig.rpcUrl}
      config={onchainKitConfig.config}
    >
      {children}
    </OnchainKitProvider>
  )
}
