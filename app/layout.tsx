import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Providers } from "./providers"
import { SkipToContent, Announcer } from "@/components/ui/accessibility"
import { OfflineIndicator, UpdateBanner, InstallPrompt } from "@/hooks/use-pwa"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { AgentAssistFloating } from "@/components/agents/agent-assist-floating"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://basehealth.xyz'

export const metadata: Metadata = {
  title: "BaseHealth - Healthcare Simplified",
  description:
    "Evidence-based health screenings, clinical trial matching, and expert care—all in one seamless platform.",
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-capable": "yes",
    // Base Mini App embed metadata
    "fc:miniapp": JSON.stringify({
      version: "next",
      imageUrl: `${APP_URL}/og-image.png`,
      button: {
        title: "Open BaseHealth",
        action: {
          type: "launch_miniapp",
          name: "BaseHealth",
          url: APP_URL,
          splashImageUrl: `${APP_URL}/icon-512.png`,
          splashBackgroundColor: "#1a1a1a",
        },
      },
    }),
  },
  openGraph: {
    title: "BaseHealth - Healthcare on Base",
    description: "Evidence-based health screenings, verified providers with on-chain attestations, and USDC payments on Base.",
    url: APP_URL,
    siteName: "BaseHealth",
    locale: "en_US",
    type: "website",
    images: [`${APP_URL}/og-image.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "BaseHealth - Healthcare on Base",
    description: "Evidence-based health screenings, verified providers, and USDC payments on Base.",
    images: [`${APP_URL}/og-image.png`],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0A0A0A" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <SkipToContent />
        <Announcer />
        <Providers>
          <OfflineIndicator />
          <UpdateBanner />
          <MinimalNavigation />
          <AgentAssistFloating />
          <main id="main-content" className="pt-20 md:pt-24 pb-24 md:pb-8">
            {children}
          </main>
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  )
}
