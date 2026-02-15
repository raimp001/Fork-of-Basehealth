"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { getBlockchainService } from "@/services/blockchain-service"
import { useMiniApp } from "@/components/providers/miniapp-provider"

export function WalletConnect() {
  const { isMiniApp, user: miniAppUser } = useMiniApp()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const blockchainService = getBlockchainService()
      const connected = await blockchainService.connect()

      if (connected) {
        setIsConnected(true)
        const address = await blockchainService.getWalletAddress()
        setWalletAddress(address)

        // Get wallet balance
        const walletBalance = await blockchainService.getBalance()
        setBalance(walletBalance)
      } else {
        setError("Failed to connect wallet. Please try again.")
      }
    } catch (err) {
      console.error("Error connecting wallet:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsConnecting(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const profileName =
    (miniAppUser?.displayName && miniAppUser.displayName.trim()) ||
    (miniAppUser?.username && `@${miniAppUser.username}`) ||
    null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>Connect your Ethereum wallet to make payments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected && walletAddress ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Connected as:</span>
                  <span className="text-sm font-medium">{profileName || "Wallet"}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">Wallet:</span>
                  <span className="font-mono text-sm">{formatAddress(walletAddress)}</span>
                </div>

                {balance && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-muted-foreground">Balance:</span>
                    <span>{balance} ETH</span>
                  </div>
                )}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium text-sm">Connected to Base Network</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Your wallet is connected to the Base network. You can now make payments for healthcare services.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="bg-muted p-6 rounded-full mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M19 7H5C3.89543 7 3 7.89543 3 9V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 14C16.5523 14 17 13.5523 17 13C17 12.4477 16.5523 12 16 12C15.4477 12 15 12.4477 15 13C15 13.5523 15.4477 14 16 14Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 10H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-center text-sm text-muted-foreground mb-4">
                Connect your Ethereum wallet to make payments for healthcare services on the Base network.
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

      <div className="text-center text-sm text-muted-foreground">
        <p>
          {isMiniApp
            ? "You can connect using the Base app wallet."
            : "Open this page in the Base app or install a compatible Ethereum wallet to connect."}
        </p>
      </div>
    </div>
  )
}
