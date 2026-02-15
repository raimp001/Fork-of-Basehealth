"use client"

import { useEffect, useState } from 'react'
import { Loader2, Lock } from 'lucide-react'

interface RequireAuthProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

/**
 * Auth guard component using Privy
 * 
 * Usage:
 * <RequireAuth>
 *   <ProtectedContent />
 * </RequireAuth>
 * 
 * Behavior:
 * - If not authenticated: triggers Privy login modal
 * - If authenticated: renders children
 */
export function RequireAuth({ 
  children, 
  fallback,
  redirectTo 
}: RequireAuthProps) {
  const [Guard, setGuard] = useState<React.ComponentType<RequireAuthProps> | null>(null)

  useEffect(() => {
    let cancelled = false

    // Dynamically load Privy and build a guard that uses hooks correctly (during render).
    import("@privy-io/react-auth")
      .then((mod) => {
        if (cancelled) return

        const GuardImpl = ({ children, fallback }: RequireAuthProps) => {
          // If Privy isn't configured / provider isn't mounted, fail open.
          // (We prefer an accessible app over a runtime crash.)
          let privy: { ready: boolean; authenticated: boolean; login: () => void }
          try {
            const { ready, authenticated, login } = mod.usePrivy()
            privy = { ready, authenticated, login }
          } catch {
            privy = { ready: true, authenticated: true, login: () => {} }
          }

          const [hasTriggeredLogin, setHasTriggeredLogin] = useState(false)

          useEffect(() => {
            if (privy.ready && !privy.authenticated && !hasTriggeredLogin) {
              setHasTriggeredLogin(true)
              privy.login()
            }
          }, [privy.ready, privy.authenticated, privy.login, hasTriggeredLogin])

          if (!privy.ready) return fallback || <AuthLoadingState />
          if (!privy.authenticated) return fallback || <AuthRequiredState onLogin={privy.login} />
          return <>{children}</>
        }

        setGuard(() => GuardImpl)
      })
      .catch(() => {
        if (cancelled) return
        setGuard(() => ({ children }: RequireAuthProps) => <>{children}</>)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (!Guard) {
    return fallback || <AuthLoadingState />
  }

  return <Guard fallback={fallback} redirectTo={redirectTo}>{children}</Guard>
}

/**
 * Loading state while Privy initializes
 */
function AuthLoadingState() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    </div>
  )
}

/**
 * State shown when authentication is required
 */
function AuthRequiredState({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'rgba(0, 82, 255, 0.1)' }}
        >
          <Lock className="h-8 w-8" style={{ color: '#0052FF' }} />
        </div>
        <h2 className="text-2xl font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
          Login Required
        </h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Please connect your wallet to access this page.
        </p>
        <button
          onClick={onLogin}
          className="px-6 py-3 rounded-lg font-medium transition-colors"
          style={{ backgroundColor: '#0052FF', color: 'white' }}
        >
          Login to Continue
        </button>
      </div>
    </div>
  )
}

/**
 * Higher-order component version for page-level auth
 */
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <RequireAuth>
        <WrappedComponent {...props} />
      </RequireAuth>
    )
  }
}
