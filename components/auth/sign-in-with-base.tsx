'use client'

/**
 * Sign In with Base - One-tap authentication using Base Smart Wallet
 * 
 * Provides seamless authentication for users with:
 * - Coinbase account (one-tap)
 * - Base Smart Wallet
 * - Any connected wallet
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { Wallet, LogOut, ChevronDown, Copy, ExternalLink, Check } from 'lucide-react'
import { signIn, signOut, useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { buildWalletSignInMessage } from "@/lib/wallet-signin-message"
import { useMiniApp } from "@/components/providers/miniapp-provider"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.basehealth.xyz"

interface SignInWithBaseProps {
  className?: string
  mode?: "connect" | "signin"
  onWalletConnected?: (address: string) => void
  onAuthSuccess?: (address: string) => void
  onAuthError?: (error: string) => void
}

export function SignInWithBase({ 
  className = '',
  mode = "connect",
  onWalletConnected,
  onAuthSuccess,
  onAuthError,
}: SignInWithBaseProps) {
  const { data: session, status: sessionStatus } = useSession()
  const { isMiniApp, user: miniAppUser, openUrl, getEthereumProvider } = useMiniApp()
  const [mounted, setMounted] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sdk, setSdk] = useState<any>(null)

  const WALLET_STORAGE_KEY = "basehealth_wallet_address"

  const onWalletConnectedRef = useRef(onWalletConnected)
  const lastNotifiedRef = useRef<string | null>(null)

  useEffect(() => {
    onWalletConnectedRef.current = onWalletConnected
  }, [onWalletConnected])

  const isWalletAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test((addr || "").trim())

  const notifyWalletConnected = useCallback((address: string) => {
    const normalized = (address || "").trim()
    if (!isWalletAddress(normalized)) return

    try {
      window.localStorage.setItem(WALLET_STORAGE_KEY, normalized)
    } catch {
      // ignore
    }

    try {
      window.dispatchEvent(new CustomEvent("basehealth:wallet", { detail: { address: normalized } }))
    } catch {
      // ignore
    }

    try {
      onWalletConnectedRef.current?.(normalized)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const sessionWallet = (session?.user as any)?.walletAddress
    if (typeof sessionWallet === "string" && isWalletAddress(sessionWallet)) {
      setWalletAddress((prev) => prev || sessionWallet)
    }
  }, [session])

  useEffect(() => {
    if (!walletAddress) return
    if (walletAddress === lastNotifiedRef.current) return
    lastNotifiedRef.current = walletAddress
    notifyWalletConnected(walletAddress)
  }, [walletAddress, notifyWalletConnected])

  useEffect(() => {
    setMounted(true)

    // Restore last known wallet address so other parts of the app can stay in sync even if the provider
    // won't answer eth_accounts without an explicit user gesture.
    try {
      const saved = window.localStorage.getItem(WALLET_STORAGE_KEY) || ""
      if (saved && isWalletAddress(saved)) {
        setWalletAddress((prev) => prev || saved)
      }
    } catch {
      // ignore
    }
    
    // Initialize Base Account SDK
    const initSDK = async () => {
      try {
        const { createBaseAccountSDK } = await import('@base-org/account')
        const baseSDK = createBaseAccountSDK({
          appName: 'BaseHealth',
          appLogoUrl: `${APP_URL}/icon-192.png`,
          appChainIds: [8453, 84532], // Base Mainnet + Base Sepolia
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

  const getProvider = async () => {
    // Prefer the host wallet provider when running inside a mini app.
    if (isMiniApp) {
      const miniAppProvider = await getEthereumProvider()
      if (miniAppProvider) return miniAppProvider
    }

    if (sdk) {
      const baseAccountProvider = sdk.getProvider()
      if (baseAccountProvider) return baseAccountProvider
    }

    const ethereum = (window as any).ethereum
    return ethereum || null
  }

  const connectWallet = useCallback(async () => {
    setIsConnecting(true)
    setIsSigning(false)
    
    try {
      const provider = await getProvider()
      if (!provider) {
        onAuthError?.(
          isMiniApp
            ? "Wallet provider unavailable in the Base app. Please try again."
            : "No wallet detected. Open this in the Base app or install a wallet extension.",
        )
        return null
      }

      const accounts = await provider.request({ method: "eth_requestAccounts" })
      const nextAddress = accounts?.[0]
      if (!nextAddress) {
        onAuthError?.("No accounts found. Please create an account in your wallet.")
        return null
      }

      // Best-effort chain switch to Base (mainnet or sepolia).
      const useMainnet = process.env.NEXT_PUBLIC_USE_MAINNET === "true" || process.env.NODE_ENV === "production"
      const targetChainId = useMainnet ? "0x2105" : "0x14a34"
      const chainName = useMainnet ? "Base" : "Base Sepolia"
      const rpcUrl = useMainnet ? "https://mainnet.base.org" : "https://sepolia.base.org"
      const explorer = useMainnet ? "https://basescan.org" : "https://sepolia.basescan.org"

      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChainId }],
        })
      } catch (switchError: any) {
        if (switchError?.code === 4902) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: targetChainId,
                chainName,
                rpcUrls: [rpcUrl],
                blockExplorerUrls: [explorer],
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              },
            ],
          })
        }
      }

      setWalletAddress(nextAddress)
      return nextAddress as string
    } catch (error: any) {
      console.error("Wallet connect error:", error)
      onAuthError?.(error.message || "Wallet connect failed")
      return null
    } finally {
      setIsConnecting(false)
    }
  }, [sdk, isMiniApp, getEthereumProvider, onAuthError])

  const signInToBaseHealth = useCallback(
    async (address: string) => {
      setIsSigning(true)
      setIsConnecting(false)

      try {
        const provider = await getProvider()
        if (!provider) throw new Error("Wallet provider unavailable")

        // Some providers (including mini app wrappers) require calling eth_requestAccounts before signing.
        // Calling it here is safe and keeps the auth flow robust even if getProvider() returns a fresh instance.
        try {
          await provider.request({ method: "eth_requestAccounts" })
        } catch {
          // ignore
        }

        const nonceResponse = await fetch("/api/auth/wallet/nonce", { cache: "no-store" })
        const nonceJson = await nonceResponse.json()
        if (!nonceResponse.ok || !nonceJson?.nonce) {
          throw new Error(nonceJson?.error || "Failed to prepare sign-in")
        }

        const useMainnet = process.env.NEXT_PUBLIC_USE_MAINNET === "true" || process.env.NODE_ENV === "production"
        const chainId = useMainnet ? 8453 : 84532
        const message = buildWalletSignInMessage({
          domain: window.location.host,
          uri: window.location.origin,
          address,
          chainId,
          nonce: nonceJson.nonce,
          issuedAt: new Date().toISOString(),
        })

        // Some wallets expect [message, address], others [address, message].
        let signature: string | null = null
        try {
          signature = await provider.request({
            method: "personal_sign",
            params: [message, address],
          })
        } catch {
          signature = await provider.request({
            method: "personal_sign",
            params: [address, message],
          })
        }

        if (!signature) throw new Error("No signature returned from wallet")

        const result = await signIn("wallet", {
          redirect: false,
          address,
          message,
          signature,
        })

        if (result?.error) {
          throw new Error(result.error)
        }

        onAuthSuccess?.(address)
      } catch (error: any) {
        console.error("Wallet sign-in error:", error)
        onAuthError?.(error.message || "Sign in failed")
      } finally {
        setIsSigning(false)
      }
    },
    [sdk, isMiniApp, getEthereumProvider, onAuthSuccess, onAuthError],
  )

  const handleSignIn = useCallback(async () => {
    const connectedAddress = walletAddress || (await connectWallet())
    if (!connectedAddress) return
    if (mode === "signin") {
      await signInToBaseHealth(connectedAddress)
    }
  }, [walletAddress, connectWallet, signInToBaseHealth, mode])

  const handleSignOut = useCallback(() => {
    signOut({ redirect: false }).catch(() => null)
    setWalletAddress(null)
    try {
      window.localStorage.removeItem(WALLET_STORAGE_KEY)
    } catch {
      // ignore
    }
    try {
      window.dispatchEvent(new CustomEvent("basehealth:wallet", { detail: { address: null } }))
    } catch {
      // ignore
    }
  }, [])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = async (addr: string) => {
    await navigator.clipboard.writeText(addr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const profileName =
    (miniAppUser?.displayName && miniAppUser.displayName.trim()) ||
    (miniAppUser?.username && `@${miniAppUser.username}`) ||
    session?.user?.name ||
    "Wallet"

  const profileHandle = miniAppUser?.username ? `@${miniAppUser.username}` : null
  const avatarUrl = miniAppUser?.pfpUrl || (session?.user as any)?.image || null
  const avatarFallback =
    (miniAppUser?.displayName || miniAppUser?.username || session?.user?.name || "U")
      .trim()
      .slice(0, 1)
      .toUpperCase()

  // Prevent hydration errors
  if (!mounted) {
    return (
      <button 
        className={`inline-flex items-center justify-center gap-2 rounded-full h-10 px-4 bg-accent text-accent-foreground font-semibold shadow-glow-subtle transition-colors hover:bg-accent/90 ${className}`}
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
        disabled={isConnecting || isSigning}
        className={`inline-flex items-center justify-center gap-2.5 rounded-full h-10 px-5 font-semibold shadow-glow-subtle transition-colors hover:bg-accent/90 active:scale-[0.98] disabled:opacity-60 bg-accent text-accent-foreground ${className}`}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="white" />
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#0052FF" />
        </svg>
        {isConnecting
          ? "Connecting..."
          : isSigning
            ? "Signing..."
            : mode === "signin"
              ? "Sign in with Base"
              : "Connect wallet"}
      </button>
    )
  }

  // Connected - show wallet menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`inline-flex items-center gap-2 rounded-full h-10 px-3 border border-border/60 bg-card/25 backdrop-blur-md shadow-glow-subtle hover:bg-card/35 transition-colors ${className}`}
        >
          <span className="relative">
            <Avatar className="h-6 w-6 ring-1 ring-border/60">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={profileName} /> : null}
              <AvatarFallback className="text-[11px] font-semibold">{avatarFallback}</AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
          </span>
          <span className="text-sm font-medium max-w-[10rem] truncate">{profileName}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72 border-border/60 bg-popover/90 backdrop-blur-xl shadow-glow-subtle">
        <DropdownMenuLabel className="py-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-1 ring-border/60">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={profileName} /> : null}
              <AvatarFallback className="text-sm font-semibold">{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight truncate">{profileName}</div>
              <div className="text-xs text-muted-foreground leading-tight truncate">
                {profileHandle ?? (sessionStatus === "authenticated" ? "Signed in" : "Wallet connected")}
              </div>
            </div>
            <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full border border-accent/20 bg-accent/10 text-accent">
              Base
            </span>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-muted/60" />
        
        {/* Wallet address */}
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => copyAddress(walletAddress)}
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          <span>Copy address</span>
          <span className="ml-auto text-xs font-mono text-muted-foreground">{formatAddress(walletAddress)}</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-muted/60" />
        
        {/* View on explorer */}
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => {
            const useMainnet = process.env.NEXT_PUBLIC_USE_MAINNET === "true" || process.env.NODE_ENV === "production"
            const explorerBase = useMainnet ? "https://basescan.org" : "https://sepolia.basescan.org"
            openUrl(`${explorerBase}/address/${walletAddress}`)
          }}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View on BaseScan
        </DropdownMenuItem>

        {sessionStatus !== "authenticated" && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => signInToBaseHealth(walletAddress)}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Sign in to BaseHealth
          </DropdownMenuItem>
        )}
        
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
