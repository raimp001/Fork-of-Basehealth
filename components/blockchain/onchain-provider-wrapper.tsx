"use client"

import type { ReactNode } from "react"
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { onchainKitConfig, baseChain } from '@/lib/onchainkit-config'

/**
 * OnchainKit Provider Wrapper for Base Chain
 * Provides Coinbase CDK support with Base blockchain integration
 */
export function OnchainProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider config={onchainKitConfig} chain={baseChain}>
      {children}
    </OnchainKitProvider>
  )
}
