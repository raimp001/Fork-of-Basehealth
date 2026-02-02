"use client"

import { Web3Provider } from "@/app/web3-provider"

export const dynamic = 'force-dynamic'

export default function BasePaymentLayout({
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

