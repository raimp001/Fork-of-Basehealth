"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

export default function McpClient() {
  const [tool, setTool] = useState<string>("getWalletBalance")
  const [params, setParams] = useState<string>("{}")
  const [result, setResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableTools = [
    { id: "getWalletBalance", name: "Get Wallet Balance", description: "Get the balance of a wallet address" },
    { id: "getTransactionDetails", name: "Get Transaction Details", description: "Get details about a transaction" },
    { id: "getPaymentHistory", name: "Get Payment History", description: "Get payment history for a wallet" },
    { id: "verifyPayment", name: "Verify Payment", description: "Verify if a payment was completed" },
  ]

  const handleParamsChange = (value: string) => {
    try {
      // Validate JSON
      JSON.parse(value)
      setParams(value)
      setError(null)
    } catch (err) {
      setError("Invalid JSON format")
      setParams(value)
    }
  }

  const handleExecute = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // In a real implementation, this would call the MCP server
      // For now, we'll just simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockResults = {
        getWalletBalance: {
          address: JSON.parse(params).address || "0x123...",
          balance: "0.5 ETH",
          timestamp: new Date().toISOString(),
        },
        getTransactionDetails: {
          txHash: JSON.parse(params).txHash || "0xabc...",
          status: "confirmed",
          value: "0.1 ETH",
          from: "0x123...",
          to: "0x456...",
          timestamp: new Date().toISOString(),
        },
        getPaymentHistory: {
          address: JSON.parse(params).address || "0x123...",
          payments: [
            { amount: "0.1 ETH", date: "2023-05-01", recipient: "Dr. Johnson" },
            { amount: "0.05 ETH", date: "2023-04-15", recipient: "BaseHealth Pharmacy" },
          ],
        },
        verifyPayment: {
          txHash: JSON.parse(params).txHash || "0xabc...",
          verified: true,
          amount: "0.1 ETH",
          recipient: "Dr. Johnson",
          date: "2023-05-01",
        },
      }

      setResult(JSON.stringify(mockResults[tool as keyof typeof mockResults], null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Model Context Protocol Tools</CardTitle>
          <CardDescription>
            Execute MCP tools to interact with blockchain data for healthcare applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Tool</label>
            <Select value={tool} onValueChange={setTool}>
              <SelectTrigger>
                <SelectValue placeholder="Select a tool" />
              </SelectTrigger>
              <SelectContent>
                {availableTools.map((tool) => (
                  <SelectItem key={tool.id} value={tool.id}>
                    {tool.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{availableTools.find((t) => t.id === tool)?.description}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Parameters (JSON)</label>
            <Textarea
              value={params}
              onChange={(e) => handleParamsChange(e.target.value)}
              placeholder='{"address": "0x123..."}'
              className="font-mono text-sm"
              rows={5}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Result</label>
              <div className="bg-muted p-4 rounded-md overflow-auto max-h-[300px]">
                <pre className="text-xs">{result}</pre>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleExecute} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executing...
              </>
            ) : (
              "Execute Tool"
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>These tools allow you to interact with blockchain data in a secure and standardized way.</p>
      </div>
    </div>
  )
}
