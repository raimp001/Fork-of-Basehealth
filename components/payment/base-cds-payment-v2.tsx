"use client"

/**
 * Coinbase Design System Payment Component v2
 * Uses official CDS components from @coinbase/cds-web
 * Integrated with Base blockchain for USDC/ETH payments
 */

import { useState, useEffect } from 'react'
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits, type Address } from 'viem'
import { Button } from '@coinbase/cds-web/buttons'
import { HStack, VStack, Box } from '@coinbase/cds-web/layout'
import { Text } from '@coinbase/cds-web/typography'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
] as const

interface BaseCDSPaymentV2Props {
  requirement: PaymentRequirement
  onSuccess?: (proof: PaymentProof) => void
  onError?: (error: Error) => void
  showHeader?: boolean
  compact?: boolean
  className?: string
}

export function BaseCDSPaymentV2({
  requirement,
  onSuccess,
  onError,
  showHeader = true,
  compact = false,
  className,
}: BaseCDSPaymentV2Props) {
  const [selectedCurrency, setSelectedCurrency] = useState<'USDC' | 'ETH'>(requirement.currency || 'USDC')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const { address, isConnected } = useAccount()

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
          <VStack gap="4" alignItems="center">
            <Box 
              style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                backgroundColor: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CheckCircle className="h-8 w-8 text-white" />
            </Box>
            <VStack gap="2" alignItems="center">
              <Text size="xlarge" weight="bold" color="success">
                Payment Successful!
              </Text>
              <Text size="small" color="secondary">
                {requirement.amount} {selectedCurrency} sent via Base
              </Text>
            </VStack>
            <Box style={{ width: '100%', padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text size="xsmall" color="secondary">Transaction:</Text>
                <a
                  href={`https://${baseChain.network === 'base' ? 'basescan.org' : 'sepolia.basescan.org'}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span className="font-mono text-xs">{txHash.slice(0, 6)}...{txHash.slice(-4)}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </HStack>
            </Box>
            {!compact && (
              <HStack gap="2" alignItems="center">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Text size="xsmall" color="secondary">Secured by Base blockchain</Text>
              </HStack>
            )}
          </VStack>
        </CardContent>
      </Card>
    )
  }

  // Main payment UI with CDS components
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
        {/* Currency Selection with CDS Buttons */}
        <VStack gap="2">
          <Text size="small" weight="medium">Select Currency</Text>
          <HStack gap="3">
            {paymentConfig.supportedTokens.map((t) => (
              <Button
                key={t.symbol}
                variant={selectedCurrency === t.symbol ? 'primary' : 'secondary'}
                onClick={() => setSelectedCurrency(t.symbol as 'USDC' | 'ETH')}
                style={{ flex: 1 }}
              >
                <VStack gap="0" alignItems="flex-start">
                  <Text weight="bold">{t.symbol}</Text>
                  <Text size="xsmall">{t.name}</Text>
                </VStack>
              </Button>
            ))}
          </HStack>
        </VStack>

        {/* Amount Display */}
        <Box 
          style={{
            padding: '16px',
            background: 'linear-gradient(to bottom right, #eff6ff, #faf5ff)',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}
        >
          <HStack justifyContent="space-between" alignItems="center">
            <HStack gap="2" alignItems="center">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <Text size="small" weight="medium" color="secondary">Amount</Text>
            </HStack>
            <VStack gap="0" alignItems="flex-end">
              <Text size="xxlarge" weight="bold">{requirement.amount}</Text>
              <Text size="xsmall" color="secondary">{selectedCurrency}</Text>
            </VStack>
          </HStack>
        </Box>

        {/* Balance Display */}
        {isConnected && tokenBalance && (
          <Box style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text size="small" color="secondary">Your Balance:</Text>
              <Text 
                size="small" 
                weight="bold"
                style={{ color: hasBalance ? '#16a34a' : '#dc2626' }}
              >
                {parseFloat(formatUnits(tokenBalance.value, tokenBalance.decimals)).toFixed(4)} {selectedCurrency}
              </Text>
            </HStack>
          </Box>
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
          <Button
            onClick={handlePayment}
            disabled={!hasBalance || isProcessing || isConfirming}
            variant="primary"
            style={{ width: '100%' }}
          >
            {isProcessing || isConfirming ? (
              <HStack gap="2" alignItems="center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <Text>{isConfirming ? 'Confirming...' : 'Processing...'}</Text>
              </HStack>
            ) : (
              <HStack gap="2" alignItems="center">
                <Text>Pay {requirement.amount} {selectedCurrency}</Text>
                <ArrowRight className="h-4 w-4" />
              </HStack>
            )}
          </Button>
        )}

        {!compact && (
          <HStack gap="4" justifyContent="center" style={{ width: '100%' }}>
            <HStack gap="1" alignItems="center">
              <Shield className="h-3 w-3 text-muted-foreground" />
              <Text size="xsmall" color="secondary">Secure</Text>
            </HStack>
            <HStack gap="1" alignItems="center">
              <Zap className="h-3 w-3 text-muted-foreground" />
              <Text size="xsmall" color="secondary">Fast</Text>
            </HStack>
            <HStack gap="1" alignItems="center">
              <Wallet className="h-3 w-3 text-muted-foreground" />
              <Text size="xsmall" color="secondary">~2 sec</Text>
            </HStack>
          </HStack>
        )}
      </CardFooter>
    </Card>
  )
}

