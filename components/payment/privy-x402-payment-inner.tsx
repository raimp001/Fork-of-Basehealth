"use client"

/**
 * Privy x402 Payment Component
 * Uses Privy's useX402Fetch hook for seamless x402 payments
 * Based on: https://docs.privy.io/recipes/x402
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { StandardizedButton, PrimaryActionButton } from '@/components/ui/standardized-button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Wallet,
  CreditCard,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  DollarSign,
  Clock,
  Shield,
  Zap,
  ExternalLink,
} from 'lucide-react'
import { type PaymentRequirement } from '@/lib/http-402-service'
import { cn } from '@/lib/utils'
import { parseUnits } from 'viem'

// Import Privy hooks (will fail if Privy not installed, but that's handled by wrapper)
import { useX402Fetch, useWallets } from '@privy-io/react-auth'

interface PrivyX402PaymentProps {
  requirement: PaymentRequirement
  resourceUrl: string // URL of the resource that requires payment
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  showHeader?: boolean
  compact?: boolean
  className?: string
  maxValue?: bigint // Maximum payment amount for protection (in atomic units)
}

export function PrivyX402PaymentInner({
  requirement,
  resourceUrl,
  onSuccess,
  onError,
  showHeader = true,
  compact = false,
  className,
  maxValue,
}: PrivyX402PaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [responseData, setResponseData] = useState<any>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  // Use Privy hooks (must be called unconditionally)
  const { wallets } = useWallets()
  const { wrapFetchWithPayment } = useX402Fetch()

  const connectedWallet = wallets[0]
  const isConnected = !!connectedWallet

  // Convert amount to atomic units for maxValue protection
  const requirementAmountAtomic = parseUnits(
    requirement.amount.toString(),
    requirement.currency === 'ETH' ? 18 : 6
  )

  // Use provided maxValue or requirement amount + 10% buffer
  const maxPaymentValue = maxValue || (requirementAmountAtomic * BigInt(110)) / BigInt(100)

  const handlePayment = async () => {
    if (!connectedWallet) {
      setError('Please connect your wallet')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Wrap fetch with Privy's x402 payment handler
      const fetchWithPayment = wrapFetchWithPayment({
        walletAddress: connectedWallet.address,
        fetch,
        maxValue: maxPaymentValue,
      })

      // Use Privy's x402 fetch - automatically handles 402 responses
      const response = await fetchWithPayment(resourceUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok && response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      // Extract payment info from response headers if available
      const xPaymentResponse = response.headers.get('X-PAYMENT-RESPONSE')
      if (xPaymentResponse) {
        try {
          const paymentInfo = JSON.parse(Buffer.from(xPaymentResponse, 'base64').toString())
          if (paymentInfo.txHash) {
            setTxHash(paymentInfo.txHash)
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }

      const data = await response.json()
      setResponseData(data)
      onSuccess?.(data)
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Payment failed')
      onError?.(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFundWallet = async () => {
    // Redirect to Privy wallet funding or show instructions
    setError('Please fund your wallet with USDC. Use Privy\'s wallet funding features or transfer USDC to your wallet address.')
  }

  // Render success state
  if (responseData && !error) {
    return (
      <Card className={cn('border-green-500 bg-green-50 dark:bg-green-950/10', className)}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">
                Payment Successful!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {requirement.amount} {requirement.currency} paid via x402
              </p>
            </div>
            {txHash && (
              <div className="w-full p-3 bg-white dark:bg-gray-900 rounded-lg border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Transaction:</span>
                  <a
                    href={`https://${process.env.NODE_ENV === 'production' ? 'basescan.org' : 'sepolia.basescan.org'}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span className="font-mono">{txHash.slice(0, 6)}...{txHash.slice(-4)}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
            {!compact && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secured by x402 protocol</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Main payment UI
  return (
    <Card className={cn('w-full', className)}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {requirement.description}
            </CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              x402
            </Badge>
          </div>
          <CardDescription>
            Pay with USDC using Privy embedded wallets - No gas fees required
          </CardDescription>
        </CardHeader>
      )}

      <CardContent className={cn('space-y-4', compact && 'pt-4')}>
        {/* Amount Display */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Amount</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{requirement.amount}</div>
              <div className="text-xs text-muted-foreground">{requirement.currency}</div>
            </div>
          </div>
        </div>

        {/* Wallet Status */}
        {isConnected && (
          <div className="flex items-center justify-between text-sm p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <span className="text-muted-foreground">Wallet:</span>
            <span className="font-mono text-xs">
              {connectedWallet.address.slice(0, 6)}...{connectedWallet.address.slice(-4)}
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Info Alert */}
        {!compact && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Using Privy's x402 implementation. Payment uses EIP-3009 transferWithAuthorization.
              Facilitator handles gas fees - you only need {requirement.currency}.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {!isConnected ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your Privy wallet to make payments. Privy embedded wallets support
              automatic x402 payments without requiring ETH for gas.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <PrimaryActionButton
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Processing payment...</span>
                </div>
              ) : (
                <>
                  Pay {requirement.amount} {requirement.currency}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </PrimaryActionButton>

            <StandardizedButton
              variant="secondary"
              onClick={handleFundWallet}
              className="w-full"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Add {requirement.currency} to Wallet
            </StandardizedButton>
          </>
        )}

        {!compact && (
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground w-full">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Instant</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>No gas fees</span>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

