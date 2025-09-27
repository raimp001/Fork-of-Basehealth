"use client"

import { StandardizedButton } from '@/components/ui/standardized-button'
import { Wallet } from 'lucide-react'

export function SimpleWalletButton() {
  // For now, just show a placeholder button that links to crypto payment page
  return (
    <StandardizedButton 
      variant="secondary" 
      className="gap-2"
      onClick={() => window.location.href = '/payment/crypto'}
    >
      <Wallet className="h-4 w-4" />
      <span className="hidden sm:inline">Crypto</span>
    </StandardizedButton>
  )
}