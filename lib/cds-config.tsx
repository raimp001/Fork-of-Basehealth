"use client"

/**
 * Coinbase Design System Configuration
 * Sets up CDS ThemeProvider and MediaQueryProvider
 */

import { ReactNode } from 'react'
import { ThemeProvider, MediaQueryProvider } from '@coinbase/cds-web/system'
import { defaultTheme } from '@coinbase/cds-web/themes/defaultTheme'
import '@coinbase/cds-icons/fonts/web/icon-font.css'
import '@coinbase/cds-web/defaultFontStyles'
import '@coinbase/cds-web/globalStyles'

interface CDSProviderProps {
  children: ReactNode
  colorScheme?: 'light' | 'dark'
}

export function CDSProvider({ children, colorScheme = 'light' }: CDSProviderProps) {
  return (
    <MediaQueryProvider>
      <ThemeProvider theme={defaultTheme} activeColorScheme={colorScheme}>
        {children}
      </ThemeProvider>
    </MediaQueryProvider>
  )
}

