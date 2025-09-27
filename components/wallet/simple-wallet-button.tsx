"use client"

import { StandardizedButton } from '@/components/ui/standardized-button'
import { Wallet } from 'lucide-react'
import Link from 'next/link'

export function SimpleWalletButton() {
  return (
    <StandardizedButton
      asChild
      variant="secondary"
      size="sm"
      className="gap-2"
    >
      <Link href="/wallet">
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">Wallet</span>
      </Link>
    </StandardizedButton>
  )
}
