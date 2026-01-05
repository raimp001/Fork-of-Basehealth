import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Providers } from "./providers"
import { SkipToContent, Announcer } from "@/components/ui/accessibility"
import { OfflineIndicator, UpdateBanner, InstallPrompt } from "@/hooks/use-pwa"

export const metadata: Metadata = {
  title: "BaseHealth - Healthcare Simplified",
  description:
    "Evidence-based health screenings, clinical trial matching, and expert care—all in one seamless platform.",
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-capable": "yes",
  },
  openGraph: {
    title: "BaseHealth - Healthcare Simplified",
    description: "Evidence-based health screenings, clinical trial matching, and expert care—all in one seamless platform.",
    url: "https://basehealth.app",
    siteName: "BaseHealth",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BaseHealth - Healthcare Simplified",
    description: "Evidence-based health screenings, clinical trial matching, and expert care—all in one seamless platform.",
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
      <body className="font-sans antialiased bg-white dark:bg-stone-900">
        <SkipToContent />
        <Announcer />
        <Providers>
          <OfflineIndicator />
          <UpdateBanner />
          <main id="main-content">
            {children}
          </main>
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  )
}
