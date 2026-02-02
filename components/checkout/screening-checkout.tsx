'use client'

/**
 * Screening Checkout Component
 * 
 * Base Pay checkout for paid screening bookings.
 * Uses FSM for robust state management and error recovery.
 * Compatible with Base app, Coinbase Wallet, and other wallets.
 * 
 * Matches existing BaseHealth design system.
 */

import { useEffect, useCallback, useState } from 'react'
import { 
  useCheckoutMachine, 
  selectors,
  type QuoteData,
  type TransactionResult 
} from '@/lib/checkout-machine'
import { basePayConfig, createPaymentConfig } from '@/lib/base-pay-service'
import { 
  CheckCircle, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  Wallet,
  Shield,
  Clock,
  Zap,
} from 'lucide-react'

// Format wallet address for display (0x1234...5678)
function formatAddress(address: string | null): string {
  if (!address) return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

// Detect if we're in a wallet's in-app browser (Base app, Coinbase Wallet, etc.)
function detectWalletBrowser(): { isWalletBrowser: boolean; walletName: string | null } {
  if (typeof window === 'undefined') return { isWalletBrowser: false, walletName: null }
  
  const ethereum = (window as any).ethereum
  if (!ethereum) return { isWalletBrowser: false, walletName: null }
  
  // Check for Coinbase Wallet / Base app
  if (ethereum.isCoinbaseWallet || ethereum.isCoinbaseBrowser) {
    return { isWalletBrowser: true, walletName: 'Coinbase Wallet' }
  }
  
  // Check for MetaMask
  if (ethereum.isMetaMask) {
    return { isWalletBrowser: true, walletName: 'MetaMask' }
  }
  
  // Generic injected wallet
  if (ethereum.isWalletConnect || ethereum.request) {
    return { isWalletBrowser: true, walletName: 'Wallet' }
  }
  
  return { isWalletBrowser: false, walletName: null }
}

interface ScreeningCheckoutProps {
  screeningName: string
  screeningDescription?: string
  providerName: string
  providerId: string
  providerWallet?: string
  amount: number // USD
  onSuccess?: (result: TransactionResult) => void
  onCancel?: () => void
}

export function ScreeningCheckout({
  screeningName,
  screeningDescription,
  providerName,
  providerId,
  providerWallet,
  amount,
  onSuccess,
  onCancel,
}: ScreeningCheckoutProps) {
  const { context, actions, is } = useCheckoutMachine()
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletInfo, setWalletInfo] = useState<{ isWalletBrowser: boolean; walletName: string | null }>({ isWalletBrowser: false, walletName: null })
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletChainId, setWalletChainId] = useState<number | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  
  // Target chain (force Sepolia for testing)
  const targetChainId = 84532 // Base Sepolia

  // Detect wallet browser on mount
  useEffect(() => {
    const detected = detectWalletBrowser()
    setWalletInfo(detected)
    
    // If in wallet browser, try to auto-connect
    if (detected.isWalletBrowser) {
      checkExistingConnection()
    }
  }, [])

  // Check if wallet is already connected
  const checkExistingConnection = async () => {
    try {
      const ethereum = (window as any).ethereum
      if (!ethereum) return
      
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts && accounts.length > 0) {
        const chainIdHex = await ethereum.request({ method: 'eth_chainId' })
        const chainIdNum = parseInt(chainIdHex, 16)
        setWalletAddress(accounts[0])
        setWalletChainId(chainIdNum)
        
        // Update FSM
        actions.connectWallet({
          address: accounts[0],
          chainId: chainIdNum,
        })
      }
    } catch (error) {
      console.error('Error checking existing connection:', error)
    }
  }

  // Initialize quote on mount
  useEffect(() => {
    const quote: QuoteData = {
      orderId: `screening-${Date.now()}`,
      serviceName: screeningName,
      serviceDescription: screeningDescription,
      amountUsd: amount,
      amountUsdc: amount.toFixed(2),
      providerId,
      providerName,
      providerWallet: providerWallet || basePayConfig.recipientAddress,
    }
    actions.setQuote(quote)
  }, [screeningName, amount, providerId, providerName, providerWallet, actions, screeningDescription])

  // Handle wallet connection - works in both wallet browsers and regular browsers
  const handleConnectWallet = useCallback(async () => {
    setIsConnecting(true)
    setConnectionError(null)
    
    try {
      const ethereum = (window as any).ethereum
      
      if (!ethereum) {
        setConnectionError('No wallet detected. Please open this page in the Base app or install a wallet.')
        setIsConnecting(false)
        return
      }
      
      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      
      if (accounts && accounts.length > 0) {
        const chainIdHex = await ethereum.request({ method: 'eth_chainId' })
        const chainIdNum = parseInt(chainIdHex, 16)
        
        setWalletAddress(accounts[0])
        setWalletChainId(chainIdNum)
        
        // Check if on correct chain
        if (chainIdNum !== targetChainId) {
          // Try to switch to Base Sepolia
          try {
            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x14A34' }], // 84532 in hex
            })
            setWalletChainId(targetChainId)
          } catch (switchError: any) {
            // Chain not added, try to add it
            if (switchError.code === 4902) {
              try {
                await ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0x14A34',
                    chainName: 'Base Sepolia',
                    rpcUrls: ['https://sepolia.base.org'],
                    blockExplorerUrls: ['https://sepolia.basescan.org'],
                    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                  }],
                })
                setWalletChainId(targetChainId)
              } catch (addError) {
                console.error('Failed to add Base Sepolia:', addError)
                setConnectionError('Please switch to Base Sepolia network in your wallet.')
              }
            } else {
              console.error('Failed to switch chain:', switchError)
              setConnectionError('Please switch to Base Sepolia network in your wallet.')
            }
          }
        }
        
        // Update FSM with wallet info
        actions.connectWallet({
          address: accounts[0],
          chainId: targetChainId,
        })
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error)
      if (error.code === 4001) {
        setConnectionError('Connection rejected. Please try again.')
      } else {
        setConnectionError(error.message || 'Failed to connect wallet.')
      }
    } finally {
      setIsConnecting(false)
    }
  }, [actions, targetChainId])

  // Handle Base Pay payment
  const handlePay = useCallback(async () => {
    if (!context.quote || !context.wallet) return
    
    actions.requestConfirm()
    
    try {
      // Dynamic import Base Pay SDK
      const { pay } = await import('@base-org/account')
      
      const config = createPaymentConfig({
        amount: context.quote.amountUsdc,
        orderId: context.quote.orderId,
        providerId: context.quote.providerId,
        providerWallet: context.quote.providerWallet || basePayConfig.recipientAddress,
        serviceType: 'consultation',
        serviceDescription: context.quote.serviceDescription,
        collectEmail: true,
      })
      
      actions.confirm()
      
      const payment = await pay(config)
      
      actions.submitTx(payment.id)
      
      // Payment successful
      const result: TransactionResult = {
        paymentId: payment.id,
        txHash: payment.id,
        sender: context.wallet.address,
        amountUsdc: context.quote.amountUsdc,
        recipient: context.quote.providerWallet || '',
        timestamp: new Date(),
      }
      
      actions.confirmTx(result)
      onSuccess?.(result)
      
    } catch (error) {
      console.error('Payment error:', error)
      const message = error instanceof Error ? error.message : 'Payment failed'
      
      // Check if user rejected
      if (message.includes('rejected') || message.includes('cancelled')) {
        actions.reject()
      } else {
        actions.failTx(message, true)
      }
    }
  }, [context.quote, context.wallet, actions, onSuccess])

  // Receipt view
  if (is.confirmed || is.receipt) {
    const explorerUrl = selectors.getTxExplorerUrl(context)
    
    return (
      <div 
        className="p-6 rounded-xl text-center"
        style={{ backgroundColor: 'rgba(107, 155, 107, 0.1)', border: '1px solid rgba(107, 155, 107, 0.2)' }}
      >
        <div 
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(107, 155, 107, 0.2)' }}
        >
          <CheckCircle className="h-8 w-8" style={{ color: '#6b9b6b' }} />
        </div>
        
        <h3 className="text-xl font-medium mb-2">Payment Complete</h3>
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
          ${context.quote?.amountUsd.toFixed(2)} USDC paid for {screeningName}
        </p>
        
        {context.transaction?.paymentId && (
          <div 
            className="p-3 rounded-lg mb-4"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Transaction ID</p>
            <p className="font-mono text-sm break-all">{context.transaction.paymentId}</p>
          </div>
        )}
        
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm transition-colors"
            style={{ color: 'var(--accent)' }}
          >
            View on BaseScan <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    )
  }

  // Failed view with retry
  if (is.failed) {
    return (
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: 'rgba(220, 100, 100, 0.1)', border: '1px solid rgba(220, 100, 100, 0.2)' }}
      >
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#dc6464' }} />
          <div>
            <h3 className="font-medium" style={{ color: '#dc6464' }}>Payment Failed</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {context.error || 'An error occurred during payment.'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {is.canRetry && (
            <button
              onClick={actions.retry}
              className="flex-1 px-4 py-2.5 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-lg transition-colors border"
              style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
            >
              Cancel
            </button>
          )}
        </div>
        
        <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
          Retry attempts: {context.retryCount} / {context.maxRetries}
        </p>
      </div>
    )
  }

  // Loading/processing view
  if (is.pending || is.awaitingConfirm) {
    return (
      <div 
        className="p-6 rounded-xl text-center"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
      >
        <Loader2 className="h-10 w-10 mx-auto mb-4 animate-spin" style={{ color: 'var(--accent)' }} />
        <h3 className="text-lg font-medium mb-2">
          {is.awaitingConfirm ? 'Confirm Payment' : 'Processing...'}
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          {is.awaitingConfirm 
            ? 'Please confirm the transaction in your wallet' 
            : 'Your payment is being processed'
          }
        </p>
      </div>
    )
  }

  // Main checkout view (quote_ready or wallet_ready)
  return (
    <div 
      className="p-6 rounded-xl"
      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Amount */}
      <div className="text-center mb-6">
        <p className="text-3xl font-medium mb-1">${amount.toFixed(2)}</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {screeningName} with {providerName}
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-2 text-center mb-6">
        <div className="p-2">
          <Zap className="h-5 w-5 mx-auto mb-1" style={{ color: 'var(--accent)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>~2 sec</p>
        </div>
        <div className="p-2">
          <Shield className="h-5 w-5 mx-auto mb-1" style={{ color: '#6b9b6b' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Secure</p>
        </div>
        <div className="p-2">
          <Clock className="h-5 w-5 mx-auto mb-1" style={{ color: 'var(--text-secondary)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No fees</p>
        </div>
      </div>

      {/* Error display */}
      {context.error && (
        <div 
          className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
          style={{ backgroundColor: 'rgba(220, 100, 100, 0.1)', color: '#dc6464' }}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {context.error}
        </div>
      )}

      {/* Connection error display */}
      {connectionError && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(220, 100, 100, 0.1)', color: '#dc6464' }}>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{connectionError}</span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!is.walletReady ? (
        // Need to connect wallet
        <button
          onClick={handleConnectWallet}
          disabled={isConnecting}
          className="w-full py-3.5 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Connecting{walletInfo.walletName ? ` to ${walletInfo.walletName}` : ''}...
            </>
          ) : (
            <>
              <Wallet className="h-5 w-5" />
              {walletInfo.isWalletBrowser 
                ? `Connect ${walletInfo.walletName}` 
                : 'Connect Wallet'}
            </>
          )}
        </button>
      ) : (
        // Ready to pay
        <button
          onClick={handlePay}
          className="w-full py-3.5 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          style={{ backgroundColor: '#0052FF', color: 'white' }}
        >
          <svg 
            className="h-5 w-5" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="10" fill="white" />
            <path 
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" 
              fill="#0052FF"
            />
          </svg>
          Pay with Base
        </button>
      )}

      {/* Wallet info */}
      {context.wallet && (
        <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
          {formatAddress(context.wallet.address)}
        </p>
      )}

      {/* Cancel */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="w-full mt-3 py-2 text-sm transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          Cancel
        </button>
      )}

      {/* Network badge */}
      <div className="flex justify-center mt-4">
        <span 
          className="px-2 py-1 text-xs rounded"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
        >
          {basePayConfig.testnet ? 'Base Sepolia (Testnet)' : 'Base Mainnet'}
        </span>
      </div>
    </div>
  )
}

export default ScreeningCheckout
