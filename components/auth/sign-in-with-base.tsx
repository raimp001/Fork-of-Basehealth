'use client'

/**
 * Sign In with Base - One-tap authentication using Base Smart Wallet
 * 
 * Provides seamless authentication for users with:
 * - Coinbase account (one-tap)
 * - Base Smart Wallet
 * - Any connected wallet
 */

import { useState, useEffect, useCallback } from 'react'
import { Wallet, LogOut, ChevronDown, Copy, ExternalLink, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SignInWithBaseProps {
  className?: string
  onAuthSuccess?: (address: string) => void
  onAuthError?: (error: string) => void
}

export function SignInWithBase({ 
  className = '',
  onAuthSuccess,
  onAuthError,
}: SignInWithBaseProps) {
  const [mounted, setMounted] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sdk, setSdk] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    
    // Initialize Base Account SDK
    const initSDK = async () => {
      try {
        const { createBaseAccountSDK } = await import('@base-org/account')
        const baseSDK = createBaseAccountSDK({
          appName: 'BaseHealth',
          appLogoUrl: 'https://basehealth.xyz/icon-192.png',
          appChainIds: [8453], // Base Mainnet
        })
        setSdk(baseSDK)
        
        // Check if already connected
        try {
          const provider = baseSDK.getProvider()
          if (provider) {
            const accounts = await provider.request({ method: 'eth_accounts' })
            if (accounts && accounts.length > 0) {
              setWalletAddress(accounts[0])
            }
          }
        } catch {
          // Not connected yet
        }
      } catch (error) {
        console.warn('Base Account SDK not available, falling back to direct wallet')
        // Check for existing wallet connection
        checkDirectWallet()
      }
    }
    
    initSDK()
  }, [])

  const checkDirectWallet = async () => {
    try {
      const ethereum = (window as any).ethereum
      if (!ethereum) return
      
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0])
      }
    } catch {
      // No wallet
    }
  }

  const handleSignIn = useCallback(async () => {
    setIsConnecting(true)
    
    try {
      if (sdk) {
        // Use Base Account SDK
        const provider = sdk.getProvider()
        const accounts = await provider.request({ method: 'eth_requestAccounts' })
        
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0])
          onAuthSuccess?.(accounts[0])
        }
      } else {
        // Fallback to direct wallet connection
        const ethereum = (window as any).ethereum
        
        if (!ethereum) {
          onAuthError?.('No wallet detected')
          window.open('https://wallet.coinbase.com/', '_blank')
          return
        }
        
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0])
          
          // Try to switch to Base Mainnet
          try {
            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x2105' }],
            })
          } catch (switchError: any) {
            if (switchError.code === 4902) {
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
            }
          }
          
          onAuthSuccess?.(accounts[0])
        }
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      onAuthError?.(error.message || 'Sign in failed')
    } finally {
      setIsConnecting(false)
    }
  }, [sdk, onAuthSuccess, onAuthError])

  const handleSignOut = useCallback(() => {
    setWalletAddress(null)
  }, [])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = async (addr: string) => {
    await navigator.clipboard.writeText(addr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Prevent hydration errors
  if (!mounted) {
    return (
      <button 
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${className}`}
        style={{ backgroundColor: '#0052FF', color: 'white' }}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="white" />
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#0052FF" />
        </svg>
        Sign in with Base
      </button>
    )
  }

  // Not connected - show Sign In with Base button
  if (!walletAddress) {
    return (
      <button
        onClick={handleSignIn}
        disabled={isConnecting}
        className={`inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold transition-all hover:opacity-90 active:scale-[0.98] ${className} ${isConnecting ? 'opacity-70' : ''}`}
        style={{ backgroundColor: '#0052FF', color: 'white' }}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="white" />
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#0052FF" />
        </svg>
        {isConnecting ? 'Connecting...' : 'Sign in with Base'}
      </button>
    )
  }

  // Connected - show wallet menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:opacity-90 ${className}`}
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
        >
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="font-mono text-sm">
            {formatAddress(walletAddress)}
          </span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-medium)' }}>
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span>Connected</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(0, 82, 255, 0.1)', color: '#0052FF' }}>
              Base
            </span>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator style={{ backgroundColor: 'var(--border-subtle)' }} />
        
        {/* Wallet address */}
        <DropdownMenuItem 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => copyAddress(walletAddress)}
        >
          <span className="text-sm font-mono">
            {formatAddress(walletAddress)}
          </span>
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator style={{ backgroundColor: 'var(--border-subtle)' }} />
        
        {/* View on explorer */}
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => window.open(`https://basescan.org/address/${walletAddress}`, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View on BaseScan
        </DropdownMenuItem>
        
        {/* Disconnect */}
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={handleSignOut}
          style={{ color: '#dc6464' }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SignInWithBase
