"use client"

import { useState } from 'react'
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StandardizedButton, PrimaryActionButton } from '@/components/ui/standardized-button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading'
import { FormError } from '@/components/ui/error-boundary'
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
  Shield
} from 'lucide-react'
import { paymentConfig, healthcarePayments } from '@/lib/coinbase-config'

// USDC Transfer ABI
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
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

interface CryptoPaymentProps {
  amount: number
  description: string
  type: 'consultation' | 'caregiver' | 'subscription' | 'bounty'
  recipientAddress?: string
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  metadata?: {
    appointmentId?: string
    providerId?: string
    caregiverId?: string
    subscriptionTier?: string
  }
}

export function CryptoPayment({
  amount,
  description,
  type,
  recipientAddress = paymentConfig.recipientAddress,
  onSuccess,
  onError,
  metadata
}: CryptoPaymentProps) {
  const { address, isConnected } = useAccount()
  const [selectedToken, setSelectedToken] = useState<'USDC' | 'ETH'>('USDC')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  // Get token info
  const token = paymentConfig.supportedTokens.find(t => t.symbol === selectedToken)
  const tokenAddress = token?.address as `0x${string}`

  // Get user balance
  const { data: tokenBalance } = useBalance({
    address,
    token: selectedToken === 'USDC' ? tokenAddress : undefined,
  })

  // Contract write hook
  const { writeContract, data: hash } = useWriteContract()

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Calculate if user has sufficient balance
  const hasBalance = tokenBalance && parseFloat(formatUnits(tokenBalance.value, tokenBalance.decimals)) >= amount

  const handlePayment = async () => {
    if (!address || !token) return
    
    setError(null)
    setIsProcessing(true)

    try {
      if (selectedToken === 'USDC') {
        // USDC transfer
        await writeContract({
          address: tokenAddress,
          abi: USDC_ABI,
          functionName: 'transfer',
          args: [recipientAddress as `0x${string}`, parseUnits(amount.toString(), token.decimals)],
        })
      } else {
        // ETH transfer
        await writeContract({
          address: recipientAddress as `0x${string}`,
          abi: [],
          functionName: 'transfer',
          value: parseUnits(amount.toString(), 18),
        })
      }

      if (hash) {
        setTxHash(hash)
        onSuccess?.(hash)
      }
    } catch (err) {
      const error = err as Error
      setError(error.message)
      onError?.(error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Show success state
  if (isConfirmed && txHash) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Successful!</h3>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Transaction Hash</p>
              <p className="text-xs font-mono text-gray-900 break-all mt-1">{txHash}</p>
            </div>
            <StandardizedButton
              variant="secondary"
              onClick={() => window.open(`https://basescan.org/tx/${txHash}`, '_blank')}
              className="w-full"
            >
              View on BaseScan
            </StandardizedButton>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Crypto Payment
        </CardTitle>
        <CardDescription>
          Pay securely with cryptocurrency on Base
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Amount Due</p>
              <p className="text-2xl font-semibold text-gray-900">${amount.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-gray-400" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Description</p>
            <p className="text-sm text-gray-600">{description}</p>
          </div>

          {/* Token Selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Payment Method</p>
            <div className="grid grid-cols-2 gap-2">
              {paymentConfig.supportedTokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => setSelectedToken(token.symbol as 'USDC' | 'ETH')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedToken === token.symbol
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{token.symbol}</p>
                  <p className="text-xs text-gray-600">{token.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Balance Check */}
          {isConnected && tokenBalance && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-900">Your Balance</span>
              <span className="text-sm font-mono text-blue-900">
                {parseFloat(formatUnits(tokenBalance.value, tokenBalance.decimals)).toFixed(4)} {selectedToken}
              </span>
            </div>
          )}

          {/* Warnings */}
          {isConnected && !hasBalance && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm text-red-900">
                <p className="font-medium">Insufficient Balance</p>
                <p className="mt-1">You need at least ${amount} worth of {selectedToken} to complete this payment.</p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium">Secure On-Chain Payment</p>
              <p className="mt-1">Your payment will be processed on the Base blockchain with low fees and instant settlement.</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <FormError error={error} onDismiss={() => setError(null)} />
        )}

        {/* Payment Button */}
        {!isConnected ? (
          <WalletConnectButton />
        ) : (
          <PrimaryActionButton
            onClick={handlePayment}
            disabled={!hasBalance || isProcessing || isConfirming}
            loading={isProcessing || isConfirming}
            loadingText={isConfirming ? "Confirming..." : "Processing..."}
            className="w-full"
          >
            {isConfirming ? (
              <>
                <Clock className="h-4 w-4" />
                Confirming Payment...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Pay ${amount} with {selectedToken}
              </>
            )}
          </PrimaryActionButton>
        )}

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield className="h-3 w-3" />
          <span>Secured by Base blockchain</span>
        </div>
      </CardContent>
    </Card>
  )
}
