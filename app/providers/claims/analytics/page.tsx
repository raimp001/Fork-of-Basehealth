"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getProviderAnalytics } from "@/services/analytics-service"
import { getBlockchainService } from "@/services/blockchain-service"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { toast } from "sonner"

export default function ProviderAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [analytics, setAnalytics] = useState<any>(null)

  const blockchainService = getBlockchainService()

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (blockchainService.isWalletConnected()) {
      setIsWalletConnected(true)
      await loadAnalytics()
    }
  }

  const handleConnectWallet = async () => {
    setIsLoading(true)
    try {
      const connected = await blockchainService.connect()
      if (connected) {
        setIsWalletConnected(true)
        await loadAnalytics()
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      toast.error("Failed to connect wallet. Please make sure you have a Web3 wallet installed.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      const address = await blockchainService.getWalletAddress()
      if (!address) return

      const data = await getProviderAnalytics(address)
      setAnalytics(data)
    } catch (error) {
      console.error("Error loading analytics:", error)
      toast.error("Failed to load analytics")
    }
  }

  if (!isWalletConnected) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Provider Analytics</h1>
          <p className="text-gray-600 mb-8">
            Connect your wallet to view your claims analytics.
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

  if (!analytics) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Provider Analytics</h1>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Provider Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Claims Processed</h3>
          <p className="text-2xl font-bold">{analytics.totalClaims}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Approval Rate</h3>
          <p className="text-2xl font-bold">{analytics.approvalRate}%</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Average Processing Time</h3>
          <p className="text-2xl font-bold">{analytics.avgProcessingTime}h</p>
        </Card>
      </div>

      {/* Claims by Status Chart */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Claims by Status</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.claimsByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Monthly Activity Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Monthly Activity</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.monthlyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="processed" name="Total Processed" stroke="#8884d8" />
              <Line type="monotone" dataKey="approved" name="Approved" stroke="#82ca9d" />
              <Line type="monotone" dataKey="rejected" name="Rejected" stroke="#ff8042" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
} 