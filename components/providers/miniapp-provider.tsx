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
      const READY_TIMEOUT_MS = 1500

      try {
        const { sdk: miniAppSdk } = await import('@farcaster/miniapp-sdk')
        setSdk(miniAppSdk)

        const inMiniApp =
          typeof miniAppSdk?.isInMiniApp === 'function' ? await miniAppSdk.isInMiniApp() : false

        setIsMiniApp(Boolean(inMiniApp))

        if (inMiniApp && typeof miniAppSdk?.actions?.ready === 'function') {
          // Some preview environments may not respond; don't hang the app.
          await Promise.race([
            miniAppSdk.actions.ready(),
            new Promise((resolve) => setTimeout(resolve, READY_TIMEOUT_MS)),
          ])
        }
      } catch (error) {
        console.warn('Mini app SDK not available:', error)
      } finally {
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
