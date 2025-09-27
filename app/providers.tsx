"use client"

import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Web3Provider } from "./web3-provider"
import { Suspense } from "react"

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
          <Suspense fallback={children}>
            <Web3Provider>
              {children}
            </Web3Provider>
          </Suspense>
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
