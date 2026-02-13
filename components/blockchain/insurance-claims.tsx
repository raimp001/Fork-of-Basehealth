"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { getBlockchainService } from "@/services/blockchain-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"

const CLAIM_STATUS = {
  0: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  1: { label: "Approved", color: "bg-green-100 text-green-800" },
  2: { label: "Rejected", color: "bg-red-100 text-red-800" },
}

export function InsuranceClaims() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [claims, setClaims] = useState<string[]>([])
  const [claimStatuses, setClaimStatuses] = useState<Record<string, number>>({})
  const [formData, setFormData] = useState({
    claimId: "",
    amount: "",
    description: "",
  })

  const blockchainService = getBlockchainService()

  useEffect(() => {
    loadClaims()
  }, [])

  const loadClaims = async () => {
    try {
      const address = await blockchainService.getWalletAddress()
      if (!address) return

      const patientClaims = await blockchainService.getPatientClaims(address)
      setClaims(patientClaims)

      // Load status for each claim
      const statuses: Record<string, number> = {}
      for (const claimId of patientClaims) {
        const status = await blockchainService.getClaimStatus(claimId)
        statuses[claimId] = status
      }
      setClaimStatuses(statuses)
    } catch (err) {
      console.error("Failed to load claims:", err)
      setError("Failed to load claims")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const tx = await blockchainService.submitInsuranceClaim(
        formData.claimId,
        formData.amount,
        formData.description
      )
      await tx.wait()
      setSuccess("Claim submitted successfully!")
      setFormData({ claimId: "", amount: "", description: "" })
      loadClaims()
    } catch (err) {
      console.error("Failed to submit claim:", err)
      setError("Failed to submit claim")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit Insurance Claim</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="claimId">Claim ID</Label>
              <Input
                id="claimId"
                name="claimId"
                value={formData.claimId}
                onChange={handleInputChange}
                placeholder="Enter claim ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (ETH)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.000000000000000001"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount in ETH"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your claim"
                required
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Claim"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {claims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {claims.map((claimId) => (
                <div key={claimId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Claim ID: {claimId}</p>
                  </div>
                  <Badge className={CLAIM_STATUS[claimStatuses[claimId]]?.color}>
                    {CLAIM_STATUS[claimStatuses[claimId]]?.label}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 