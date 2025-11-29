"use client"

/**
 * Privy x402 Payment Component
 * Uses Privy's useX402Fetch hook for seamless x402 payments
 * Based on: https://docs.privy.io/recipes/x402
 */

import dynamic from 'next/dynamic'
import { type PaymentRequirement } from '@/lib/http-402-service'

interface PrivyX402PaymentProps {
  requirement: PaymentRequirement
  resourceUrl: string
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  showHeader?: boolean
  compact?: boolean
  className?: string
  maxValue?: bigint
}

// Dynamically import Privy component to avoid build errors when Privy is not configured
const PrivyX402PaymentInner = dynamic(
  () => import('./privy-x402-payment-inner').then(mod => ({ default: mod.PrivyX402PaymentInner })),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 text-center text-sm text-gray-600">
        Loading payment options...
      </div>
    ),
  }
)

export function PrivyX402Payment(props: PrivyX402PaymentProps) {
  // Check if Privy is configured
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

  if (!privyAppId) {
    return (
      <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
        <div className="text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-900">Privy x402 Not Configured</p>
          <p>
            To enable Privy x402 payments, set NEXT_PUBLIC_PRIVY_APP_ID in your environment variables.
            You can still use the "Alternative: Direct Wallet" option below.
          </p>
        </div>
      </div>
    )
  }

  return <PrivyX402PaymentInner {...props} />
}
