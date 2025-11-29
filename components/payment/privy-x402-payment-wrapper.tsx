"use client"

/**
 * Wrapper component that conditionally loads Privy x402 payment
 * Only renders when Privy is properly configured
 */

import { PrivyX402PaymentInner } from './privy-x402-payment-inner'
import { type PaymentRequirement } from '@/lib/http-402-service'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface PrivyX402PaymentWrapperProps {
  requirement: PaymentRequirement
  resourceUrl: string
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  showHeader?: boolean
  compact?: boolean
  className?: string
  maxValue?: bigint
}

export function PrivyX402PaymentWrapper(props: PrivyX402PaymentWrapperProps) {
  // Check if Privy is available
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

  if (!privyAppId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Privy x402 is not configured. Please set NEXT_PUBLIC_PRIVY_APP_ID in your environment variables to enable Privy payments.
          You can still use the "Alternative: Direct Wallet" option below.
        </AlertDescription>
      </Alert>
    )
  }

  // Render the actual Privy component
  return <PrivyX402PaymentInner {...props} />
}

