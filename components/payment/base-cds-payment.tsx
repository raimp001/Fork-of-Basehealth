"use client"

/**
 * Coinbase Design System (CDS) Payment Component
 * Integrated with Base blockchain for USDC/ETH payments
 * Implements HTTP 402 payment protocol
 */

import { useState, useEffect } from 'react'
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { parseUnits, formatUnits, type Address } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { StandardizedButton, PrimaryActionButton } from '@/components/ui/standardized-button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { WalletConnectButton } from '@/components/wallet/wallet-connect-button'
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
import { paymentConfig, baseChain } from '@/lib/coinbase-config'
import { type PaymentRequirement, type PaymentProof } from '@/lib/http-402-service'
import { cn } from '@/lib/utils'

// USDC Contract ABI
const USDC_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

interface BaseCDSPaymentProps {
  requirement: PaymentRequirement
  onSuccess?: (proof: PaymentProof) => void
  onError?: (error: Error) => void
  showHeader?: boolean
  compact?: boolean
  className?: string
}

export function BaseCDSPayment({
  requirement,
  onSuccess,
  onError,
  showHeader = true,
  compact = false,
  className,
}: BaseCDSPaymentProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<'USDC' | 'ETH'>(requirement.currency || 'USDC')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()

  // Get token details
  const token = paymentConfig.supportedTokens.find(t => t.symbol === selectedCurrency)
  const tokenAddress = token?.address as Address | undefined

  // Get balance for selected token
  const { data: tokenBalance, refetch: refetchBalance } = useBalance({
    address,
    token: selectedCurrency === 'USDC' ? tokenAddress : undefined,
  })

  // Contract write hook
  const { writeContract, data: hash, error: writeError } = useWriteContract()

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Check if user has sufficient balance
  const hasBalance = tokenBalance && 
    parseFloat(formatUnits(tokenBalance.value, tokenBalance.decimals)) >= requirement.amount

  // Handle payment execution
  const handlePayment = async () => {
    if (!address || !token || !isConnected) {
      setError('Please connect your wallet')
      return
    }

    if (!hasBalance) {
      setError(`Insufficient ${selectedCurrency} balance`)
      return
    }

    setError(null)
    setIsProcessing(true)

    try {
      const amountInUnits = parseUnits(requirement.amount.toString(), token.decimals)

      if (selectedCurrency === 'USDC' && tokenAddress) {
        // USDC transfer using contract
        await writeContract({
          address: tokenAddress,
          abi: USDC_ABI,
          functionName: 'transfer',
          args: [paymentConfig.recipientAddress as Address, amountInUnits],
        })
      } else {
        // Native ETH transfer
        await writeContract({
          address: paymentConfig.recipientAddress as Address,
          abi: [],
          functionName: 'transfer',
          value: amountInUnits,
        })
      }
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Transaction failed')
      onError?.(error)
      setIsProcessing(false)
    }
  }

  // Monitor transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      setTxHash(hash)
      setIsProcessing(false)

      // Create payment proof
      const proof: PaymentProof = {
        transactionHash: hash,
        from: address!,
        to: paymentConfig.recipientAddress,
        amount: requirement.amount.toString(),
        currency: selectedCurrency,
        network: baseChain.network as 'base' | 'base-sepolia',
        timestamp: Date.now(),
      }

      onSuccess?.(proof)
      refetchBalance()
    }
  }, [isConfirmed, hash])

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      setError(writeError.message)
      setIsProcessing(false)
    }
  }, [writeError])

  // Render success state
  if (isConfirmed && txHash) {
    return (
      <Card className={cn('border-green-500 bg-green-50 dark:bg-green-950/10', className)}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {requirement.amount} {selectedCurrency} sent via Base
              </p>
            </div>
            <div className="w-full p-3 bg-white dark:bg-gray-900 rounded-lg border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Transaction:</span>
                <a
                  href={`https://${baseChain.network === 'base' ? 'basescan.org' : 'sepolia.basescan.org'}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span className="font-mono">{txHash.slice(0, 6)}...{txHash.slice(-4)}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            {!compact && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secured by Base blockchain</span>
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
              Base
            </Badge>
          </div>
          <CardDescription>
            Pay with crypto on Base blockchain - Fast, secure, and low fees
          </CardDescription>
        </CardHeader>
      )}

      <CardContent className={cn('space-y-4', compact && 'pt-4')}>
        {/* Currency Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Currency</label>
          <div className="grid grid-cols-2 gap-3">
            {paymentConfig.supportedTokens.map((t) => (
              <button
                key={t.symbol}
                onClick={() => setSelectedCurrency(t.symbol as 'USDC' | 'ETH')}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all',
                  selectedCurrency === t.symbol
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-800'
                )}
              >
                <div className="text-left">
                  <div className="font-semibold">{t.symbol}</div>
                  <div className="text-xs text-muted-foreground">{t.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Display */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Amount</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{requirement.amount}</div>
              <div className="text-xs text-muted-foreground">{selectedCurrency}</div>
            </div>
          </div>
        </div>

        {/* Balance Display */}
        {isConnected && tokenBalance && (
          <div className="flex items-center justify-between text-sm p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <span className="text-muted-foreground">Your Balance:</span>
            <span className={cn(
              'font-semibold',
              hasBalance ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {parseFloat(formatUnits(tokenBalance.value, tokenBalance.decimals)).toFixed(4)} {selectedCurrency}
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
              Payment will be processed on {baseChain.network === 'base' ? 'Base Mainnet' : 'Base Sepolia Testnet'}. 
              Transaction fees are minimal thanks to Base's L2 scaling.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {!isConnected ? (
          <WalletConnectButton className="w-full" />
        ) : (
          <PrimaryActionButton
            onClick={handlePayment}
            disabled={!hasBalance || isProcessing || isConfirming}
            className="w-full"
          >
            {isProcessing || isConfirming ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {isConfirming ? 'Confirming...' : 'Processing...'}
              </>
            ) : (
              <>
                Pay {requirement.amount} {selectedCurrency}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </PrimaryActionButton>
        )}

        {!compact && (
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground w-full">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Fast</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>~2 sec</span>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

