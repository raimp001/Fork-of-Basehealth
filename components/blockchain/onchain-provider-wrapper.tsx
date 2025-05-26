"use client"

import type { ReactNode } from "react"
import { WagmiProvider, createConfig, http } from "wagmi"
import { base, baseSepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Create a query client for React Query
const queryClient = new QueryClient()

// Determine which network to use based on environment
const networkId = process.env.NETWORK_ID || "base"
const chain = networkId === "base-sepolia" ? baseSepolia : base

// Create Wagmi config
const config = createConfig({
  chains: [chain],
  transports: {
    [chain.id]: http(),
  },
})

export function OnchainProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
