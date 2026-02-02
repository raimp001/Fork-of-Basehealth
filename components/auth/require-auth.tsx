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
  const [privyState, setPrivyState] = useState<{
    ready: boolean
    authenticated: boolean
    login: () => void
  } | null>(null)
  const [hasTriggeredLogin, setHasTriggeredLogin] = useState(false)

  useEffect(() => {
    // Dynamically load Privy
    import('@privy-io/react-auth').then((mod) => {
      try {
        const { ready, authenticated, login } = mod.usePrivy()
        setPrivyState({ ready, authenticated, login })
      } catch {
        // Not in Privy context, allow access
        setPrivyState({ ready: true, authenticated: true, login: () => {} })
      }
    }).catch(() => {
      // Privy not available, allow access
      setPrivyState({ ready: true, authenticated: true, login: () => {} })
    })
  }, [])

  useEffect(() => {
    // Only trigger login once when ready and not authenticated
    if (privyState?.ready && !privyState?.authenticated && !hasTriggeredLogin) {
      setHasTriggeredLogin(true)
      privyState.login()
    }
  }, [privyState, hasTriggeredLogin])

  // Still loading Privy
  if (!privyState || !privyState.ready) {
    return fallback || <AuthLoadingState />
  }

  // Not authenticated - show loading while login modal opens
  if (!privyState.authenticated) {
    return fallback || <AuthRequiredState onLogin={privyState.login} />
  }

  // Authenticated - render children
  return <>{children}</>
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
          Please login to access this page. You can use your wallet or email.
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
