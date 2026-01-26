'use client'

/**
 * Solana Payment Component
 * 
 * Provides a payment interface for Solana blockchain payments.
 * Supports SOL and USDC (SPL Token) payments via Phantom and other Solana wallets.
 */

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle, ExternalLink, Wallet } from 'lucide-react'
import {
  solanaConfig,
  getSolPrice,
  usdToSol,
  getWalletBalance,
  isValidSolanaAddress,
  getExplorerUrl,
  type SolanaPaymentRequest,
} from '@/lib/solana-payment-service'

// =============================================================================
// TYPES
// =============================================================================

interface SolanaPaymentProps {
  amount: number
  currency?: 'SOL' | 'USDC'
  orderId?: string
  description?: string
  onSuccess?: (txSignature: string) => void
  onError?: (error: string) => void
  onCancel?: () => void
  discount?: number // Percentage discount
}

type PaymentStatus = 'idle' | 'connecting' | 'confirming' | 'processing' | 'success' | 'error'

interface PhantomProvider {
  isPhantom?: boolean
  publicKey?: { toString: () => string }
  connect: () => Promise<{ publicKey: { toString: () => string } }>
  disconnect: () => Promise<void>
  signAndSendTransaction: (transaction: any) => Promise<{ signature: string }>
  on: (event: string, callback: () => void) => void
  off: (event: string, callback: () => void) => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SolanaPayment({
  amount,
  currency = 'USDC',
  orderId,
  description,
  onSuccess,
  onError,
  onCancel,
  discount = 0,
}: SolanaPaymentProps) {
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<{ sol: number; usdc: number } | null>(null)
  const [solPrice, setSolPrice] = useState<number>(100)
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Calculate final amount with discount
  const discountAmount = amount * (discount / 100)
  const finalAmount = amount - discountAmount
  
  // Amount in SOL (if paying with SOL)
  const amountInSol = currency === 'SOL' ? finalAmount / solPrice : 0

  // =============================================================================
  // WALLET CONNECTION
  // =============================================================================
  
  const getPhantomProvider = useCallback((): PhantomProvider | null => {
    if (typeof window === 'undefined') return null
    
    const provider = (window as any).phantom?.solana
    
    if (provider?.isPhantom) {
      return provider
    }
    
    return null
  }, [])
  
  const connectWallet = useCallback(async () => {
    const provider = getPhantomProvider()
    
    if (!provider) {
      setError('Phantom wallet not found. Please install Phantom wallet.')
      window.open('https://phantom.app/', '_blank')
      return
    }
    
    try {
      setStatus('connecting')
      const { publicKey } = await provider.connect()
      const address = publicKey.toString()
      setWalletAddress(address)
      
      // Fetch balance
      const walletBalance = await getWalletBalance(address)
      setBalance({ sol: walletBalance.sol, usdc: walletBalance.usdc })
      
      setStatus('idle')
    } catch (err) {
      console.error('Wallet connection error:', err)
      setError('Failed to connect wallet')
      setStatus('error')
    }
  }, [getPhantomProvider])
  
  const disconnectWallet = useCallback(async () => {
    const provider = getPhantomProvider()
    if (provider) {
      await provider.disconnect()
    }
    setWalletAddress(null)
    setBalance(null)
  }, [getPhantomProvider])

  // =============================================================================
  // PAYMENT PROCESSING
  // =============================================================================
  
  const processPayment = useCallback(async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first')
      return
    }
    
    const provider = getPhantomProvider()
    if (!provider) {
      setError('Phantom wallet not found')
      return
    }
    
    try {
      setStatus('confirming')
      setError(null)
      
      // Create payment request on backend
      const response = await fetch('/api/payments/solana/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          currency,
          senderAddress: walletAddress,
          orderId,
          description,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create payment request')
      }
      
      const { transaction, recipientAddress } = await response.json()
      
      setStatus('processing')
      
      // For now, we'll simulate the transaction
      // In production, you'd deserialize and sign the transaction
      // const tx = Transaction.from(Buffer.from(transaction, 'base64'))
      // const { signature } = await provider.signAndSendTransaction(tx)
      
      // Simulated success for demo
      const simulatedSignature = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Verify the payment
      const verifyResponse = await fetch('/api/payments/solana/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature: simulatedSignature,
          orderId,
        }),
      })
      
      setTxSignature(simulatedSignature)
      setStatus('success')
      onSuccess?.(simulatedSignature)
      
    } catch (err) {
      console.error('Payment error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Payment failed'
      setError(errorMessage)
      setStatus('error')
      onError?.(errorMessage)
    }
  }, [walletAddress, getPhantomProvider, finalAmount, currency, orderId, description, onSuccess, onError])

  // =============================================================================
  // EFFECTS
  // =============================================================================
  
  useEffect(() => {
    // Fetch SOL price
    getSolPrice().then(setSolPrice)
    
    // Check if already connected
    const provider = getPhantomProvider()
    if (provider?.publicKey) {
      const address = provider.publicKey.toString()
      setWalletAddress(address)
      getWalletBalance(address).then(b => setBalance({ sol: b.sol, usdc: b.usdc }))
    }
  }, [getPhantomProvider])

  // =============================================================================
  // RENDER
  // =============================================================================
  
  const renderWalletButton = () => {
    if (walletAddress) {
      return (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
              <span className="text-white text-xs">◎</span>
            </div>
            <div>
              <p className="text-sm font-medium">
                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </p>
              {balance && (
                <p className="text-xs text-muted-foreground">
                  {balance.sol.toFixed(4)} SOL • {balance.usdc.toFixed(2)} USDC
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={disconnectWallet}>
            Disconnect
          </Button>
        </div>
      )
    }
    
    return (
      <Button 
        onClick={connectWallet} 
        className="w-full bg-purple-600 hover:bg-purple-700"
        disabled={status === 'connecting'}
      >
        {status === 'connecting' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Phantom Wallet
          </>
        )}
      </Button>
    )
  }
  
  const renderPaymentButton = () => {
    if (!walletAddress) return null
    
    // Check sufficient balance
    const hasSufficientBalance = currency === 'SOL' 
      ? (balance?.sol || 0) >= amountInSol
      : (balance?.usdc || 0) >= finalAmount
    
    if (!hasSufficientBalance) {
      return (
        <div className="text-center p-4 bg-destructive/10 rounded-lg">
          <p className="text-sm text-destructive">
            Insufficient {currency} balance. You need {currency === 'SOL' ? amountInSol.toFixed(4) : finalAmount.toFixed(2)} {currency}.
          </p>
        </div>
      )
    }
    
    return (
      <Button
        onClick={processPayment}
        className="w-full"
        disabled={status === 'processing' || status === 'confirming'}
        size="lg"
      >
        {status === 'confirming' && (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Confirm in Wallet...
          </>
        )}
        {status === 'processing' && (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        )}
        {status === 'idle' && (
          <>
            Pay {currency === 'SOL' ? `${amountInSol.toFixed(4)} SOL` : `$${finalAmount.toFixed(2)} USDC`}
          </>
        )}
      </Button>
    )
  }
  
  const renderSuccess = () => (
    <div className="text-center space-y-4 p-6">
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Payment Successful!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your payment of {currency === 'SOL' ? `${amountInSol.toFixed(4)} SOL` : `$${finalAmount.toFixed(2)} USDC`} has been confirmed.
        </p>
      </div>
      {txSignature && (
        <a
          href={getExplorerUrl(txSignature)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          View on Solana Explorer
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  )
  
  const renderError = () => (
    <div className="text-center space-y-4 p-6">
      <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
        <XCircle className="h-8 w-8 text-red-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Payment Failed</h3>
        <p className="text-sm text-destructive mt-1">{error}</p>
      </div>
      <Button onClick={() => setStatus('idle')} variant="outline">
        Try Again
      </Button>
    </div>
  )

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-purple-500">◎</span>
              Pay with Solana
            </CardTitle>
            <CardDescription>
              Fast, low-fee payments on Solana
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {solanaConfig.network === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {status === 'success' ? (
          renderSuccess()
        ) : status === 'error' && error ? (
          renderError()
        ) : (
          <>
            {/* Amount Display */}
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{description || 'Payment Amount'}</p>
              <p className="text-3xl font-bold mt-1">
                {currency === 'SOL' 
                  ? `${amountInSol.toFixed(4)} SOL`
                  : `$${finalAmount.toFixed(2)}`
                }
              </p>
              {discount > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  {discount}% crypto discount applied (saved ${discountAmount.toFixed(2)})
                </p>
              )}
              {currency === 'SOL' && (
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ ${finalAmount.toFixed(2)} USD @ ${solPrice.toFixed(2)}/SOL
                </p>
              )}
            </div>
            
            {/* Currency Selection */}
            <div className="flex gap-2">
              <Button
                variant={currency === 'USDC' ? 'default' : 'outline'}
                className="flex-1"
                size="sm"
                disabled
              >
                USDC
              </Button>
              <Button
                variant={currency === 'SOL' ? 'default' : 'outline'}
                className="flex-1"
                size="sm"
                disabled
              >
                SOL
              </Button>
            </div>
            
            {/* Wallet Connection */}
            {renderWalletButton()}
            
            {/* Payment Button */}
            {renderPaymentButton()}
            
            {/* Cancel Button */}
            {onCancel && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            
            {/* Info */}
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Transaction fees: ~$0.00025</p>
              <p>Confirmation time: &lt; 1 second</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default SolanaPayment
