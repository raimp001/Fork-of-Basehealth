'use client'

/**
 * Mini App Provider
 * 
 * Initializes the Base mini app SDK when running inside the Base app.
 * Calls sdk.actions.ready() to hide splash screen and display app.
 */

import { useEffect, useState, createContext, useContext, ReactNode } from 'react'

interface MiniAppContext {
  isMiniApp: boolean
  isReady: boolean
  sdk: any | null
}

const MiniAppContext = createContext<MiniAppContext>({
  isMiniApp: false,
  isReady: false,
  sdk: null,
})

export function useMiniApp() {
  return useContext(MiniAppContext)
}

export function MiniAppProvider({ children }: { children: ReactNode }) {
  const [isMiniApp, setIsMiniApp] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [sdk, setSdk] = useState<any>(null)

  useEffect(() => {
    const initMiniApp = async () => {
      try {
        // Check if we're in a mini app context (Base app iframe)
        const isInMiniApp = window.self !== window.top || 
                           window.location.search.includes('miniapp=true') ||
                           navigator.userAgent.includes('Farcaster') ||
                           navigator.userAgent.includes('Base')
        
        if (isInMiniApp) {
          setIsMiniApp(true)
          
          // Import and initialize SDK
          const { sdk: miniAppSdk } = await import('@farcaster/miniapp-sdk')
          setSdk(miniAppSdk)
          
          // Signal that the app is ready
          await miniAppSdk.actions.ready()
          setIsReady(true)
          
          console.log('Mini app initialized successfully')
        } else {
          // Not in mini app, mark as ready anyway
          setIsReady(true)
        }
      } catch (error) {
        console.warn('Mini app SDK not available:', error)
        setIsReady(true)
      }
    }

    initMiniApp()
  }, [])

  return (
    <MiniAppContext.Provider value={{ isMiniApp, isReady, sdk }}>
      {children}
    </MiniAppContext.Provider>
  )
}
