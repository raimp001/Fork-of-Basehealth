"use client"

/**
 * Payment Gate Component
 * Wraps content that requires payment (HTTP 402)
 * Shows payment UI until user pays, then reveals content
 */

import { useState, useEffect, ReactNode } from 'react'
import { BaseCDSPayment } from './base-cds-payment'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, CheckCircle, Info } from 'lucide-react'
import { type PaymentRequirement, type PaymentProof, PAYMENT_TIERS } from '@/lib/http-402-service'
import { LoadingSpinner } from '@/components/ui/loading'

interface PaymentGateProps {
  children: ReactNode
  resourceType: keyof typeof PAYMENT_TIERS
  title?: string
  description?: string
  className?: string
}

export function PaymentGate({
  children,
  resourceType,
  title,
  description,
  className,
}: PaymentGateProps) {
  const [hasAccess, setHasAccess] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const requirement = PAYMENT_TIERS[resourceType]

  // Check if user already has access
  useEffect(() => {
    checkAccess()
  }, [resourceType])

  const checkAccess = async () => {
    try {
      setIsChecking(true)
      const response = await fetch('/api/payments/402/check-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resource: requirement.resource,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setHasAccess(data.hasAccess)
      }
    } catch (error) {
      console.error('Access check failed:', error)
      setError('Failed to verify access')
    } finally {
      setIsChecking(false)
    }
  }

  const handlePaymentSuccess = async (proof: PaymentProof) => {
    try {
      // Verify payment
      const response = await fetch('/api/payments/402/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proof,
          requirement,
        }),
      })

      if (response.ok) {
        setHasAccess(true)
      } else {
        throw new Error('Payment verification failed')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed')
    }
  }

  // Loading state
  if (isChecking) {
    return (
      <Card className={className}>
        <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground mt-4">Checking access...</p>
        </CardContent>
      </Card>
    )
  }

  // User has access - show content
  if (hasAccess) {
    return (
      <div className={className}>
        <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950/10">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            Access granted - Payment verified
          </AlertDescription>
        </Alert>
        {children}
      </div>
    )
  }

  // Payment required - show payment gate
  return (
    <div className={className}>
      <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/10 mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <Lock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <CardTitle>{title || 'Payment Required'}</CardTitle>
              <CardDescription>
                {description || `This ${requirement.description} requires payment to access`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Pay once with crypto to get instant access. Your payment is secured on Base blockchain.
            </AlertDescription>
          </Alert>

          <BaseCDSPayment
            requirement={requirement}
            onSuccess={handlePaymentSuccess}
            onError={(err) => setError(err.message)}
            showHeader={false}
            compact={true}
          />

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Preview/Teaser of locked content */}
      <div className="relative">
        <div className="pointer-events-none blur-sm opacity-50">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background/90 to-transparent">
          <div className="text-center space-y-2">
            <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm font-medium">Content locked</p>
            <p className="text-xs text-muted-foreground">Pay to unlock</p>
          </div>
        </div>
      </div>
    </div>
  )
}

