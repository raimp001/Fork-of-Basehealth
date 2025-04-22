"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle, Wallet } from "lucide-react"

export function SimplifiedWalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [networkName, setNetworkName] = useState("Base Sepolia Testnet")

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Request accounts without prompting user
          const accounts = await window.ethereum.request({ method: "eth_accounts" })

          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0])
            setIsConnected(true)

            // Get network information
            const chainId = await window.ethereum.request({ method: "eth_chainId" })
            updateNetworkInfo(chainId)
          }
        } catch (err) {
          console.error("Error checking wallet connection:", err)
        }
      }
    }

    checkWalletConnection()
  }, [])

  const updateNetworkInfo = (chainId: string) => {
    // Map chain IDs to network names
    const networks: Record<string, string> = {
      "0x1": "Ethereum Mainnet",
      "0x8453": "Base Mainnet",
      "0x14a33": "Base Sepolia Testnet",
    }

    setNetworkName(networks[chainId] || "Unknown Network")
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("No Ethereum wallet detected. Please install MetaMask or another wallet.")
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      const chainId = await window.ethereum.request({ method: "eth_chainId" })

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0])
        setIsConnected(true)
        updateNetworkInfo(chainId)
      } else {
        throw new Error("No accounts found. Please create an account in your wallet.")
      }
    } catch (err: any) {
      console.error("Error connecting wallet:", err)
      setError(err.message || "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connect Wallet</CardTitle>
        <CardDescription>Connect your Ethereum wallet to use BaseHealth services</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected && walletAddress ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Connected</span>
              </div>
              <span className="font-mono text-sm">{formatAddress(walletAddress)}</span>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Network:</span> {networkName}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="bg-muted p-6 rounded-full mb-4">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <p className="text-center text-muted-foreground mb-4">
              Connect your Ethereum wallet to access healthcare services and make payments on the Base network.
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        {isConnected ? (
          <Button variant="outline" className="w-full">
            Disconnect Wallet
          </Button>
        ) : (
          <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Wallet"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
