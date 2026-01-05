"use client"

/**
 * Offline Page
 * Shown when the user is offline and the requested page isn't cached
 */

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw, Home, Heart } from "lucide-react"

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  // If back online, auto-reload
  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(() => {
        window.location.reload()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center border-2 border-stone-200">
        <div className="w-20 h-20 mx-auto mb-6 bg-stone-100 rounded-full flex items-center justify-center">
          {isOnline ? (
            <Heart className="h-10 w-10 text-green-500 animate-pulse" />
          ) : (
            <WifiOff className="h-10 w-10 text-stone-400" />
          )}
        </div>

        {isOnline ? (
          <>
            <h1 className="text-2xl font-bold text-stone-900 mb-2">
              You're back online!
            </h1>
            <p className="text-stone-600 mb-6">
              Reconnecting to BaseHealth...
            </p>
            <div className="flex items-center justify-center gap-2 text-green-600">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Reloading</span>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-stone-900 mb-2">
              You're offline
            </h1>
            <p className="text-stone-600 mb-6">
              It looks like you've lost your internet connection. Some features may be unavailable until you reconnect.
            </p>

            <div className="space-y-3 mb-8">
              <div className="p-4 bg-stone-50 rounded-lg text-left">
                <h3 className="font-medium text-stone-900 mb-2">While offline, you can:</h3>
                <ul className="text-sm text-stone-600 space-y-1">
                  <li>✓ View previously loaded pages</li>
                  <li>✓ Access saved providers and trials</li>
                  <li>✓ Review your health profile</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="flex-1 gap-2 border-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={handleGoHome}
                className="flex-1 gap-2 bg-stone-900 hover:bg-stone-800"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>
          </>
        )}

        <p className="text-xs text-stone-400 mt-8">
          BaseHealth works best with an internet connection
        </p>
      </Card>
    </div>
  )
}

