"use client"

/**
 * PWA Hook
 * Manages PWA installation and service worker registration
 */

import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface UsePWAReturn {
  isInstallable: boolean
  isInstalled: boolean
  isOffline: boolean
  promptInstall: () => Promise<boolean>
  updateAvailable: boolean
  updateServiceWorker: () => void
}

export function usePWA(): UsePWAReturn {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    // Listen for online/offline status
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial offline state
    setIsOffline(!navigator.onLine)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        setRegistration(reg)

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          }
        })
      }).catch((error) => {
        console.error('Service worker registration failed:', error)
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) return false

    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice

    if (outcome === 'accepted') {
      setInstallPrompt(null)
      return true
    }

    return false
  }, [installPrompt])

  const updateServiceWorker = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }, [registration])

  return {
    isInstallable: !!installPrompt,
    isInstalled,
    isOffline,
    promptInstall,
    updateAvailable,
    updateServiceWorker,
  }
}

// Install prompt component
export function InstallPrompt() {
  const { isInstallable, promptInstall } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed before
    const wasDismissed = localStorage.getItem('pwa-install-dismissed')
    if (wasDismissed) {
      setDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  const handleInstall = async () => {
    const installed = await promptInstall()
    if (installed) {
      setDismissed(true)
    }
  }

  if (!isInstallable || dismissed) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-stone-900 text-white rounded-xl shadow-xl p-4 z-50 animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-lg">💊</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">Install BaseHealth</h4>
          <p className="text-xs text-stone-300 mt-0.5">
            Get quick access and work offline
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-stone-400 hover:text-white p-1"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleInstall}
          className="flex-1 bg-white text-stone-900 rounded-lg py-2 text-sm font-medium hover:bg-stone-100 transition-colors"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 text-stone-400 text-sm hover:text-white transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  )
}

// Update available banner
export function UpdateBanner() {
  const { updateAvailable, updateServiceWorker } = usePWA()

  if (!updateAvailable) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white py-2 px-4 text-center text-sm z-[100]">
      <span>A new version is available!</span>
      <button
        onClick={updateServiceWorker}
        className="ml-2 underline font-medium hover:no-underline"
      >
        Update now
      </button>
    </div>
  )
}

// Offline indicator
export function OfflineIndicator() {
  const { isOffline } = usePWA()

  if (!isOffline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-amber-900 py-2 px-4 text-center text-sm font-medium z-[100]">
      You're offline. Some features may be unavailable.
    </div>
  )
}

