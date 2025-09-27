"use client"

import { Web3Provider } from "@/app/web3-provider"

export default function CryptoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Web3Provider>
      {children}
    </Web3Provider>
  )
}
