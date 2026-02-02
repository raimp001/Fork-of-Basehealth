"use client"

import { useState, useEffect, useCallback } from 'react'
import { Wallet, LogOut, ChevronDown, Copy, ExternalLink } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PrivyLoginButtonProps {
  className?: string
  variant?: 'primary' | 'secondary' | 'outline'
  showBalances?: boolean
}

export function PrivyLoginButton({ 
  className = '', 
  variant = 'primary',
}: PrivyLoginButtonProps) {
  const [mounted, setMounted] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if already connected
    checkConnection()
  }, [])

  const checkConnection = async () => {
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

  const connectWallet = useCallback(async () => {
    setIsConnecting(true)
    try {
      const ethereum = (window as any).ethereum
      
      if (!ethereum) {
        // No wallet - open Base app download or show message
        window.open('https://base.org/names', '_blank')
        setIsConnecting(false)
        return
      }
      
      // Request accounts
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0])
        
        // Try to switch to Base Mainnet
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }], // 8453 in hex
          })
        } catch (switchError: any) {
          // Chain not added, try to add it
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
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error)
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
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
        className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${className}`}
        style={{ backgroundColor: '#0052FF', color: 'white' }}
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">Connect</span>
      </button>
    )
  }

  // Base styles
  const baseStyles = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
  
  const variantStyles = {
    primary: { backgroundColor: '#0052FF', color: 'white' },
    secondary: { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' },
    outline: { backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' },
  }

  // Not connected - show connect button
  if (!walletAddress) {
    return (
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className={`${baseStyles} ${className} ${isConnecting ? 'opacity-70' : ''}`}
        style={variantStyles[variant]}
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">
          {isConnecting ? 'Connecting...' : 'Connect'}
        </span>
      </button>
    )
  }

  // Connected - show wallet menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`${baseStyles} ${className}`}
          style={variantStyles.secondary}
        >
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">
            {formatAddress(walletAddress)}
          </span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-medium)' }}>
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span>Wallet</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(0, 82, 255, 0.1)', color: '#0052FF' }}>
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
          <Copy className="h-3 w-3" />
        </DropdownMenuItem>
        
        {copied && (
          <div className="px-2 py-1 text-xs" style={{ color: '#6b9b6b' }}>
            Address copied!
          </div>
        )}
        
        <DropdownMenuSeparator style={{ backgroundColor: 'var(--border-subtle)' }} />
        
        {/* View on explorer */}
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => window.open(`https://basescan.org/address/${walletAddress}`, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>
        
        {/* Disconnect */}
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={disconnectWallet}
          style={{ color: '#dc6464' }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Hook to get wallet auth state
 * Use this in components that need to check auth status
 */
export function usePrivyAuth() {
  const [state, setState] = useState({
    ready: false,
    authenticated: false,
    walletAddress: null as string | null,
  })

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const ethereum = (window as any).ethereum
        if (!ethereum) {
          setState({ ready: true, authenticated: false, walletAddress: null })
          return
        }
        
        const accounts = await ethereum.request({ method: 'eth_accounts' })
        if (accounts && accounts.length > 0) {
          setState({ ready: true, authenticated: true, walletAddress: accounts[0] })
        } else {
          setState({ ready: true, authenticated: false, walletAddress: null })
        }
      } catch {
        setState({ ready: true, authenticated: false, walletAddress: null })
      }
    }
    
    checkWallet()
  }, [])
  
  return state
}
