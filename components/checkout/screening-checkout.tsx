'use client'

/**
 * Screening Checkout Component
 * 
 * Base Pay checkout for paid screening bookings.
 * Uses Privy for seamless wallet-as-login authentication.
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
import { basePayConfig } from '@/lib/base-pay-service'
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
  
  // Target chain - Base Mainnet
  const targetChainId = 8453 // Base Mainnet

  // Detect wallet browser on mount and auto-connect if available
  useEffect(() => {
    const detected = detectWalletBrowser()
    setWalletInfo(detected)
    
    // Auto-connect if in wallet browser
    if (detected.isWalletBrowser) {
      checkExistingConnection()
    }
  }, [])

  // Check if wallet is already connected (fallback for non-Privy)
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

  // Default treasury wallet (fallback if env var not set)
  const DEFAULT_TREASURY = '0xEf352b65503b01997b0d91e9c24621FB1f141726'
  
  // Get valid recipient address
  const getRecipientAddress = () => {
    if (providerWallet && providerWallet.startsWith('0x') && providerWallet.length === 42) {
      return providerWallet
    }
    if (basePayConfig.recipientAddress && basePayConfig.recipientAddress.startsWith('0x') && basePayConfig.recipientAddress.length === 42) {
      return basePayConfig.recipientAddress
    }
    return DEFAULT_TREASURY
  }

  // Initialize quote on mount
  useEffect(() => {
    const recipientAddress = getRecipientAddress()
    const quote: QuoteData = {
      orderId: `screening-${Date.now()}`,
      serviceName: screeningName,
      serviceDescription: screeningDescription,
      amountUsd: amount,
      amountUsdc: amount.toFixed(2),
      providerId,
      providerName,
      providerWallet: recipientAddress,
    }
    actions.setQuote(quote)
  }, [screeningName, amount, providerId, providerName, providerWallet, actions, screeningDescription])

  // Handle wallet connection - direct wallet connection
  const handleConnectWallet = useCallback(async () => {
    setIsConnecting(true)
    setConnectionError(null)
    
    try {
      const ethereum = (window as any).ethereum
      
      if (!ethereum) {
        // No wallet detected - show helpful message
        setConnectionError('Please open this page in the Base app, Coinbase Wallet, or install a wallet extension.')
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
          // Try to switch to Base Mainnet
          try {
            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x2105' }], // 8453 in hex
            })
            setWalletChainId(targetChainId)
          } catch (switchError: any) {
            // Chain not added, try to add it
            if (switchError.code === 4902) {
              try {
                await ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0x2105',
                    chainName: 'Base',
                    rpcUrls: ['https://mainnet.base.org'],
                    blockExplorerUrls: ['https://basescan.org'],
                    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                  }],
                })
                setWalletChainId(targetChainId)
              } catch (addError) {
                console.error('Failed to add Base:', addError)
                setConnectionError('Please switch to Base network in your wallet.')
              }
            } else {
              console.error('Failed to switch chain:', switchError)
              setConnectionError('Please switch to Base network in your wallet.')
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

  // USDC contract address on Base Mainnet
  const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  
  // ERC20 transfer ABI
  const ERC20_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
  ]

  // Handle direct USDC payment
  const handlePay = useCallback(async () => {
    if (!context.quote || !context.wallet) return
    
    const ethereum = (window as any).ethereum
    if (!ethereum) {
      actions.failTx('No wallet detected', true)
      return
    }
    
    actions.requestConfirm()
    
    try {
      const recipientAddress = context.quote.providerWallet || getRecipientAddress()
      
      // Convert amount to USDC units (6 decimals)
      const amountFloat = parseFloat(context.quote.amountUsdc)
      const amountInUnits = Math.floor(amountFloat * 1_000_000) // USDC has 6 decimals
      const amountHex = '0x' + amountInUnits.toString(16)
      
      // Encode the transfer function call
      // transfer(address,uint256) = 0xa9059cbb
      const transferSelector = '0xa9059cbb'
      const paddedRecipient = recipientAddress.slice(2).padStart(64, '0')
      const paddedAmount = amountInUnits.toString(16).padStart(64, '0')
      const data = transferSelector + paddedRecipient + paddedAmount
      
      actions.confirm()
      
      // Send the transaction
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: context.wallet.address,
          to: USDC_ADDRESS,
          data: data,
          // Gas will be estimated by the wallet
        }],
      })
      
      actions.submitTx(txHash)
      
      // Payment successful
      const result: TransactionResult = {
        paymentId: txHash,
        txHash: txHash,
        sender: context.wallet.address,
        amountUsdc: context.quote.amountUsdc,
        recipient: recipientAddress,
        timestamp: new Date(),
      }
      
      actions.confirmTx(result)
      onSuccess?.(result)
      
    } catch (error: any) {
      console.error('Payment error:', error)
      const message = error?.message || 'Payment failed'
      
      // Check if user rejected
      if (error?.code === 4001 || message.includes('rejected') || message.includes('denied')) {
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
        className="p-8 rounded-2xl text-center"
        style={{ backgroundColor: 'rgba(107, 155, 107, 0.1)', border: '1px solid rgba(107, 155, 107, 0.2)' }}
      >
        <div 
          className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(107, 155, 107, 0.2)' }}
        >
          <CheckCircle className="h-10 w-10" style={{ color: '#6b9b6b' }} />
        </div>
        
        <h3 className="text-2xl font-semibold mb-3">Payment Complete</h3>
        <p className="text-lg mb-5" style={{ color: 'var(--text-secondary)' }}>
          ${context.quote?.amountUsd.toFixed(2)} USDC paid
        </p>
        
        {context.transaction?.paymentId && (
          <div 
            className="p-4 rounded-xl mb-5"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Transaction ID</p>
            <p className="font-mono text-sm break-all">{context.transaction.paymentId}</p>
          </div>
        )}
        
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-base font-medium transition-colors"
            style={{ color: 'hsl(var(--accent))' }}
          >
            View on BaseScan <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    )
  }

  // Failed view with retry
  if (is.failed) {
    return (
      <div 
        className="p-8 rounded-2xl"
        style={{ backgroundColor: 'rgba(220, 100, 100, 0.1)', border: '1px solid rgba(220, 100, 100, 0.2)' }}
      >
        <div className="flex items-start gap-4 mb-5">
          <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" style={{ color: '#dc6464' }} />
          <div>
            <h3 className="text-lg font-semibold" style={{ color: '#dc6464' }}>Payment Failed</h3>
            <p className="text-base mt-2" style={{ color: 'var(--text-secondary)' }}>
              {context.error || 'An error occurred during payment.'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {is.canRetry && (
            <button
              onClick={actions.retry}
              className="flex-1 px-5 py-3.5 text-base font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-5 py-3.5 text-base font-medium rounded-xl transition-colors border"
              style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
            >
              Cancel
            </button>
          )}
        </div>
        
        <p className="text-sm text-center mt-4" style={{ color: 'var(--text-muted)' }}>
          Retry attempts: {context.retryCount} / {context.maxRetries}
        </p>
      </div>
    )
  }

  // Loading/processing view
  if (is.pending || is.awaitingConfirm) {
    return (
      <div 
        className="p-8 rounded-2xl text-center"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
      >
        <Loader2 className="h-12 w-12 mx-auto mb-5 animate-spin" style={{ color: 'hsl(var(--accent))' }} />
        <h3 className="text-xl font-semibold mb-3">
          {is.awaitingConfirm ? 'Confirm Payment' : 'Processing...'}
        </h3>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
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
      className="p-8 rounded-2xl"
      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Amount */}
      <div className="text-center mb-6">
        <p className="text-4xl font-semibold mb-2">${amount.toFixed(2)}</p>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          {screeningName}
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-3 text-center mb-6">
        <div className="p-3">
          <Zap className="h-6 w-6 mx-auto mb-1.5" style={{ color: 'hsl(var(--accent))' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>~2 sec</p>
        </div>
        <div className="p-3">
          <Shield className="h-6 w-6 mx-auto mb-1.5" style={{ color: '#6b9b6b' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Secure</p>
        </div>
        <div className="p-3">
          <Clock className="h-6 w-6 mx-auto mb-1.5" style={{ color: 'var(--text-secondary)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No fees</p>
        </div>
      </div>

      {/* Error display */}
      {context.error && (
        <div 
          className="mb-5 p-4 rounded-xl flex items-center gap-3 text-base"
          style={{ backgroundColor: 'rgba(220, 100, 100, 0.1)', color: '#dc6464' }}
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {context.error}
        </div>
      )}

      {/* Connection error display */}
      {connectionError && (
        <div className="mb-5 p-4 rounded-xl text-base" style={{ backgroundColor: 'rgba(220, 100, 100, 0.1)', color: '#dc6464' }}>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span>{connectionError}</span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!is.walletReady ? (
        // Need to connect wallet / login
        <button
          onClick={handleConnectWallet}
          disabled={isConnecting}
          className="w-full py-4 text-lg font-semibold rounded-xl transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
          style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              Connecting...
            </>
          ) : walletInfo.isWalletBrowser ? (
            <>
              <Wallet className="h-6 w-6" />
              Connect {walletInfo.walletName}
            </>
          ) : (
            <>
              <Wallet className="h-6 w-6" />
              Connect Wallet
            </>
          )}
        </button>
      ) : (
        // Ready to pay
        <button
          onClick={handlePay}
          className="w-full py-4 text-lg font-semibold rounded-xl transition-colors flex items-center justify-center gap-3"
          style={{ backgroundColor: '#0052FF', color: 'white' }}
        >
          <svg 
            className="h-6 w-6" 
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
        <p className="text-sm text-center mt-4 font-mono" style={{ color: 'var(--text-muted)' }}>
          {formatAddress(context.wallet.address)}
        </p>
      )}

      {/* Cancel */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="w-full mt-4 py-3 text-base font-medium transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          Cancel
        </button>
      )}

      {/* Network badge */}
      <div className="flex justify-center mt-5">
        <span 
          className="px-3 py-1.5 text-sm rounded-lg font-medium"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
        >
          {basePayConfig.testnet ? 'Base Sepolia (Testnet)' : 'Base Mainnet'}
        </span>
      </div>
    </div>
  )
}

export default ScreeningCheckout
