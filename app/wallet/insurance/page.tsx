"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getBlockchainService } from "@/services/blockchain-service"
import { ethers } from "ethers"
import { toast } from "sonner"

interface Claim {
  claimId: string
  amount: string
  description: string
  status: number
  timestamp: number
  rejectionReason: string
}

export default function InsuranceClaimsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [claims, setClaims] = useState<Claim[]>([])
  const [form, setForm] = useState({
    claimId: "",
    amount: "",
    description: "",
  })

  const blockchainService = getBlockchainService()

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (blockchainService.isWalletConnected()) {
      setIsWalletConnected(true)
      await loadClaims()
    }
  }

  const handleConnectWallet = async () => {
    setIsLoading(true)
    try {
      const connected = await blockchainService.connect()
      if (connected) {
        setIsWalletConnected(true)
        await loadClaims()
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      toast.error("Failed to connect wallet. Please make sure you have a Web3 wallet installed.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadClaims = async () => {
    try {
      const address = await blockchainService.getWalletAddress()
      if (!address) return

      const claimIds = await blockchainService.getPatientClaims(address)
      const claimsData = await Promise.all(
        claimIds.map(async (claimId) => {
          const details = await blockchainService.getClaimDetails(claimId)
          return {
            claimId,
            amount: ethers.formatEther(details.amount),
            description: details.description,
            status: details.status,
            timestamp: details.timestamp,
            rejectionReason: details.rejectionReason,
          }
        })
      )
      setClaims(claimsData)
    } catch (error) {
      console.error("Error loading claims:", error)
      toast.error("Failed to load claims")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const tx = await blockchainService.submitInsuranceClaim(
        form.claimId,
        form.amount,
        form.description
      )
      await tx.wait()
      toast.success("Claim submitted successfully!")
      setForm({ claimId: "", amount: "", description: "" })
      await loadClaims()
    } catch (error) {
      console.error("Error submitting claim:", error)
      toast.error("Failed to submit claim")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Pending"
      case 1:
        return "Approved"
      case 2:
        return "Rejected"
      default:
        return "Unknown"
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-yellow-100 text-yellow-800"
      case 1:
        return "bg-green-100 text-green-800"
      case 2:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!isWalletConnected) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Insurance Claims</h1>
          <p className="text-gray-600 mb-8">
            Connect your wallet to submit and manage insurance claims.
          </p>
          <Button
            onClick={handleConnectWallet}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Insurance Claims</h1>

      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submit">Submit Claim</TabsTrigger>
          <TabsTrigger value="history">Claim History</TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Claim ID</label>
                <Input
                  value={form.claimId}
                  onChange={(e) => setForm({ ...form, claimId: e.target.value })}
                  placeholder="Enter unique claim ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount (ETH)</label>
                <Input
                  type="number"
                  step="0.000000000000000001"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="Enter claim amount in ETH"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your claim"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? "Submitting..." : "Submit Claim"}
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4">
            {claims.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No claims found</p>
            ) : (
              claims.map((claim) => (
                <Card key={claim.claimId} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">Claim ID: {claim.claimId}</h3>
                      <p className="text-sm text-gray-600 mt-1">{claim.description}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        claim.status
                      )}`}
                    >
                      {getStatusText(claim.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-medium">{claim.amount} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Submitted</p>
                      <p className="font-medium">
                        {new Date(Number(claim.timestamp) * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {claim.status === 2 && claim.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 rounded-md">
                      <p className="text-sm text-red-800">
                        <span className="font-medium">Rejection Reason:</span>{" "}
                        {claim.rejectionReason}
                      </p>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 