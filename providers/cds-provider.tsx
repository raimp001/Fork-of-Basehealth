"use client"

/**
 * Coinbase Design System Provider
 * Sets up CDS theming and media query support
 * Based on: https://cds.coinbase.com/getting-started/installation
 */

import '@coinbase/cds-icons/fonts/web/icon-font.css'
import '@coinbase/cds-web/defaultFontStyles'
import '@coinbase/cds-web/globalStyles'

import { ThemeProvider, MediaQueryProvider } from '@coinbase/cds-web/system'
import { defaultTheme } from '@coinbase/cds-web/themes/defaultTheme'
import { ReactNode, useMemo } from 'react'
import { useTheme } from 'next-themes'

interface CDSProviderProps {
  children: ReactNode
}

export function CDSProvider({ children }: CDSProviderProps) {
  const { theme: nextTheme } = useTheme()
  
  // Map next-themes to CDS color scheme
  const activeColorScheme = useMemo(() => {
    if (nextTheme === 'dark') return 'dark'
    if (nextTheme === 'light') return 'light'
    // Default to light for system
    return 'light'
  }, [nextTheme])

  return (
    <MediaQueryProvider>
      <ThemeProvider theme={defaultTheme} activeColorScheme={activeColorScheme}>
        {children}
      </ThemeProvider>
    </MediaQueryProvider>
  )
}

