"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProvider } from "@/services/provider-service"
import { getBlockchainService } from "@/services/blockchain-service"

interface WalletAddressFormProps {
  providerId: string
  currentAddress?: string
  onUpdate?: (address: string) => void
}

export function WalletAddressForm({ providerId, currentAddress = "", onUpdate }: WalletAddressFormProps) {
  const [walletAddress, setWalletAddress] = useState(currentAddress)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleAutoConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const blockchainService = getBlockchainService()
      await blockchainService.connect()
      const address = await blockchainService.getWalletAddress()

      if (address) {
        setWalletAddress(address)
      } else {
        setError("Could not retrieve wallet address")
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      setError(error.message || "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSave = async () => {
    if (!walletAddress || !walletAddress.startsWith("0x") || walletAddress.length !== 42) {
      setError("Please enter a valid Ethereum wallet address")
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await updateProvider(providerId, {
        wallet_address: walletAddress,
        network: "base-sepolia", // Default to Base Sepolia testnet
      } as any)

      setSuccess(true)
      onUpdate?.(walletAddress)
    } catch (error: any) {
      console.error("Error saving wallet address:", error)
      setError(error.message || "Failed to save wallet address")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Address</CardTitle>
        <CardDescription>Connect your Ethereum wallet address to receive payments on Base</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet-address">Ethereum Wallet Address</Label>
            <div className="flex space-x-2">
              <Input
                id="wallet-address"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
              <Button variant="outline" onClick={handleAutoConnect} disabled={isConnecting}>
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              This wallet address will be used to receive payments from patients on the Base network
            </p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">Wallet address saved successfully!</p>}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving || !walletAddress} className="w-full">
          {isSaving ? "Saving..." : "Save Wallet Address"}
        </Button>
      </CardFooter>
    </Card>
  )
}
