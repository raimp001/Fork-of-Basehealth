"use client"

import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { CDSProvider } from "@/lib/cds-config"
import { Web3Provider } from "./web3-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CDSProvider colorScheme="light">
      <SessionProvider>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Web3Provider>
              {children}
            </Web3Provider>
          </ThemeProvider>
        </AuthProvider>
      </SessionProvider>
    </CDSProvider>
  )
}
