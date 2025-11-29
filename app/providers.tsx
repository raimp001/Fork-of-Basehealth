"use client"

import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { CDSProvider } from "@/providers/cds-provider"
import { Web3Provider } from "./web3-provider"
import { PrivyProvider } from "@/components/providers/privy-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PrivyProvider>
            <CDSProvider>
              <Web3Provider>
                {children}
              </Web3Provider>
            </CDSProvider>
          </PrivyProvider>
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
