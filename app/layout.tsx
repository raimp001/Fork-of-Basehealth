import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { MainNavigation } from "@/components/layout/main-navigation"
import Script from "next/script"

export const metadata: Metadata = {
  title: "BaseHealth - Healthcare Platform",
  description:
    "Connect with healthcare providers, schedule telemedicine appointments, and manage your health journey in one place.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive"
        />
        <div className="flex min-h-screen flex-col">
          <MainNavigation />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
