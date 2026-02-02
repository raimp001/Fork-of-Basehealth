"use client"

import { useState, useEffect } from 'react'
import { Wallet, LogOut, User, ChevronDown, Copy, ExternalLink, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Dynamic import of Privy hooks to avoid SSR issues
let usePrivyHook: any = null
let useWalletsHook: any = null

function usePrivySafe() {
  const [hooks, setHooks] = useState<{ usePrivy: any; useWallets: any } | null>(null)
  
  useEffect(() => {
    import('@privy-io/react-auth').then((mod) => {
      usePrivyHook = mod.usePrivy
      useWalletsHook = mod.useWallets
      setHooks({ usePrivy: mod.usePrivy, useWallets: mod.useWallets })
    }).catch(() => {
      // Privy not available
    })
  }, [])
  
  return hooks
}

interface PrivyLoginButtonProps {
  className?: string
  variant?: 'primary' | 'secondary' | 'outline'
  showBalances?: boolean
}

export function PrivyLoginButton({ 
  className = '', 
  variant = 'primary',
  showBalances = true 
}: PrivyLoginButtonProps) {
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [privyState, setPrivyState] = useState<any>(null)
  const [walletsState, setWalletsState] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    
    // Try to use Privy hooks dynamically
    const loadPrivy = async () => {
      try {
        const mod = await import('@privy-io/react-auth')
        // We can't call hooks outside React, so we need a different approach
        // The hooks will be used via a wrapper
      } catch {
        // Privy not available
      }
    }
    loadPrivy()
  }, [])
  
  // Use a try-catch wrapper for hooks
  let ready = false
  let authenticated = false
  let user: any = null
  let login = () => {}
  let logout = () => {}
  let linkWallet = () => {}
  let wallets: any[] = []
  
  try {
    // These hooks will only work if PrivyProvider is active
    const privyMod = require('@privy-io/react-auth')
    const privyHook = privyMod.usePrivy()
    const walletsHook = privyMod.useWallets()
    
    ready = privyHook.ready
    authenticated = privyHook.authenticated
    user = privyHook.user
    login = privyHook.login
    logout = privyHook.logout
    linkWallet = privyHook.linkWallet
    wallets = walletsHook.wallets || []
  } catch {
    // Privy not available or not in provider context
  }

  // Prevent hydration errors
  if (!mounted || !ready) {
    return (
      <button 
        disabled
        className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors opacity-50 ${className}`}
        style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="hidden sm:inline">Loading...</span>
      </button>
    )
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = async (addr: string) => {
    await navigator.clipboard.writeText(addr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Get primary wallet
  const primaryWallet = wallets[0]
  const walletAddress = primaryWallet?.address || user?.wallet?.address

  // Base styles
  const baseStyles = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
  
  const variantStyles = {
    primary: { backgroundColor: '#0052FF', color: 'white' },
    secondary: { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' },
    outline: { backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' },
  }

  // Not authenticated - show login button
  if (!authenticated) {
    return (
      <button
        onClick={login}
        className={`${baseStyles} ${className}`}
        style={variantStyles[variant]}
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">Login</span>
      </button>
    )
  }

  // Authenticated - show user menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`${baseStyles} ${className}`}
          style={variantStyles.secondary}
        >
          {walletAddress ? (
            <>
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">
                {formatAddress(walletAddress)}
              </span>
            </>
          ) : (
            <>
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">
                {user?.email?.address || 'Account'}
              </span>
            </>
          )}
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-medium)' }}>
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span>Account</span>
            {walletAddress && (
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(0, 82, 255, 0.1)', color: '#0052FF' }}>
                Base
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator style={{ backgroundColor: 'var(--border-subtle)' }} />
        
        {/* Email if available */}
        {user?.email?.address && (
          <div className="px-2 py-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {user.email.address}
          </div>
        )}
        
        {/* Wallet address */}
        {walletAddress && (
          <DropdownMenuItem 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => copyAddress(walletAddress)}
          >
            <span className="text-sm font-mono">
              {formatAddress(walletAddress)}
            </span>
            <Copy className="h-3 w-3" />
          </DropdownMenuItem>
        )}
        
        {copied && (
          <div className="px-2 py-1 text-xs" style={{ color: '#6b9b6b' }}>
            Address copied!
          </div>
        )}
        
        <DropdownMenuSeparator style={{ backgroundColor: 'var(--border-subtle)' }} />
        
        {/* Link wallet if no wallet */}
        {!walletAddress && (
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={linkWallet}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Link Wallet
          </DropdownMenuItem>
        )}
        
        {/* View on explorer */}
        {walletAddress && (
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => window.open(`https://basescan.org/address/${walletAddress}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Explorer
          </DropdownMenuItem>
        )}
        
        {/* Logout */}
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={logout}
          style={{ color: '#dc6464' }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Hook to get Privy auth state
 * Use this in components that need to check auth status
 */
export function usePrivyAuth() {
  const [state, setState] = useState({
    ready: false,
    authenticated: false,
    user: null as any,
    walletAddress: null as string | null,
    privyUserId: null as string | null,
    email: null as string | null,
    login: () => {},
    logout: () => {},
  })

  useEffect(() => {
    try {
      const privyMod = require('@privy-io/react-auth')
      const { ready, authenticated, user, login, logout } = privyMod.usePrivy()
      const { wallets } = privyMod.useWallets()
      
      const primaryWallet = wallets?.[0]
      const walletAddress = primaryWallet?.address || user?.wallet?.address
      
      setState({
        ready,
        authenticated,
        user,
        walletAddress,
        privyUserId: user?.id,
        email: user?.email?.address,
        login,
        logout,
      })
    } catch {
      // Privy not available
    }
  }, [])
  
  return state
}
