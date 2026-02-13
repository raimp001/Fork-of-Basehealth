"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { getBlockchainService } from "@/services/blockchain-service"
import { ethers } from "ethers"
import { toast } from "sonner"

interface Claim {
  claimId: string
  patient: string
  amount: string
  description: string
  status: number
  timestamp: number
  rejectionReason: string
}

export default function ProviderClaimsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [claims, setClaims] = useState<Claim[]>([])
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null)

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
      // In a real application, you would fetch all claims from the contract
      // For now, we'll just show a sample claim
      const sampleClaim = {
        claimId: "CLAIM-001",
        patient: "0x123...",
        amount: "0.1",
        description: "Sample claim for medical procedure",
        status: 0,
        timestamp: Math.floor(Date.now() / 1000),
        rejectionReason: "",
      }
      setClaims([sampleClaim])
    } catch (error) {
      console.error("Error loading claims:", error)
      toast.error("Failed to load claims")
    }
  }

  const handleApproveClaim = async (claimId: string) => {
    setIsLoading(true)
    try {
      const tx = await blockchainService.approveClaim(claimId)
      await tx.wait()
      toast.success("Claim approved successfully!")
      await loadClaims()
    } catch (error) {
      console.error("Error approving claim:", error)
      toast.error("Failed to approve claim")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectClaim = async (claimId: string) => {
    if (!rejectionReason) {
      toast.error("Please provide a rejection reason")
      return
    }

    setIsLoading(true)
    try {
      const tx = await blockchainService.rejectClaim(claimId, rejectionReason)
      await tx.wait()
      toast.success("Claim rejected successfully!")
      setRejectionReason("")
      setSelectedClaim(null)
      await loadClaims()
    } catch (error) {
      console.error("Error rejecting claim:", error)
      toast.error("Failed to reject claim")
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
          <h1 className="text-3xl font-bold mb-6">Provider Claims Management</h1>
          <p className="text-gray-600 mb-8">
            Connect your wallet to manage insurance claims.
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
      <h1 className="text-3xl font-bold mb-6">Provider Claims Management</h1>

      <div className="space-y-4">
        {claims.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No claims found</p>
        ) : (
          claims.map((claim) => (
            <Card key={claim.claimId} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium">Claim ID: {claim.claimId}</h3>
                  <p className="text-sm text-gray-600 mt-1">Patient: {claim.patient}</p>
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

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
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

              {claim.status === 0 && (
                <div className="space-y-4">
                  {selectedClaim === claim.claimId ? (
                    <>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter rejection reason"
                        className="w-full"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRejectClaim(claim.claimId)}
                          disabled={isLoading}
                          variant="destructive"
                        >
                          Confirm Reject
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedClaim(null)
                            setRejectionReason("")
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveClaim(claim.claimId)}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve Claim
                      </Button>
                      <Button
                        onClick={() => setSelectedClaim(claim.claimId)}
                        variant="outline"
                      >
                        Reject Claim
                      </Button>
                    </div>
                  )}
                </div>
              )}

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
    </div>
  )
} 