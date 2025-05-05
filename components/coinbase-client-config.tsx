"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Script from "next/script"

interface CoinbaseClientConfigProps {
  children: React.ReactNode
}

export function CoinbaseClientConfig({ children }: CoinbaseClientConfigProps) {
  const [networkId, setNetworkId] = useState<string>("base-sepolia")

  useEffect(() => {
    // Fetch configuration from server
    fetch("/api/config/coinbase")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch Coinbase config: ${res.status} ${res.statusText}`)
        }
        return res.json()
      })
      .then((data) => {
        // Validate the network ID before using it
        const validNetworkId = data.networkId && typeof data.networkId === "string" ? data.networkId : "base-sepolia" // Default fallback

        setNetworkId(validNetworkId)

        // Initialize Coinbase client when configuration is loaded
        if (typeof window !== "undefined" && window.coinbase) {
          try {
            window.coinbase.init({
              appId: process.env.NEXT_PUBLIC_COINBASE_APP_ID || "", // Use empty string as fallback
              networkId: validNetworkId,
            })
          } catch (initError) {
            console.error("Failed to initialize Coinbase client:", initError)
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load Coinbase configuration:", err)
        // Set default network ID on error
        setNetworkId("base-sepolia")
      })
  }, [])

  return (
    <>
      <Script
        src="https://cdn.pay.coinbase.com/js/coinbase-commerce-v1.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.coinbase) {
            try {
              window.coinbase.init({
                appId: "", // Remove direct environment variable reference
                networkId: networkId || "base-sepolia", // Use default if networkId is not set yet
              })
            } catch (error) {
              console.error("Error initializing Coinbase client:", error)
            }
          } else {
            console.warn("Coinbase SDK not available")
          }
        }}
      />
      {children}
    </>
  )
}

// Add TypeScript definitions for window.coinbase
declare global {
  interface Window {
    coinbase?: {
      init: (config: { appId: string | undefined; networkId: string }) => void
      pay: (options: any) => void
    }
  }
}

export function useCoinbaseConfig() {
  const [config, setConfig] = useState({
    networkId: "base-sepolia",
  })

  useEffect(() => {
    fetch("/api/config/coinbase")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data)
      })
      .catch((err) => {
        console.error("Failed to load Coinbase configuration:", err)
      })
  }, [])

  return config
}
