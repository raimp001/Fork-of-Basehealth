"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, RefreshCw, CheckCircle, XCircle } from "lucide-react"

export default function McpClient() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading")
  const [requestInput, setRequestInput] = useState("")
  const [response, setResponse] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/mcp-server/status")
        const data = await res.json()

        if (data.success && data.status === "online") {
          setStatus("online")
        } else {
          setStatus("offline")
          setError(data.error || "MCP Server is offline")
        }
      } catch (err) {
        console.error("Error checking MCP server status:", err)
        setStatus("offline")
        setError("Failed to connect to MCP server")
      }
    }

    checkStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!requestInput.trim()) return

    setIsProcessing(true)
    setError(null)

    try {
      const res = await fetch("/api/mcp-server/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ request: requestInput }),
      })

      const data = await res.json()

      if (data.success) {
        setResponse(data.response)
      } else {
        setError(data.error || "Failed to process request")
      }
    } catch (err) {
      console.error("Error sending request to MCP server:", err)
      setError("Failed to communicate with MCP server")
    } finally {
      setIsProcessing(false)
    }
  }

  const refreshStatus = () => {
    setStatus("loading")
    setError(null)

    async function checkStatus() {
      try {
        const res = await fetch("/api/mcp-server/status")
        const data = await res.json()

        if (data.success && data.status === "online") {
          setStatus("online")
        } else {
          setStatus("offline")
          setError(data.error || "MCP Server is offline")
        }
      } catch (err) {
        console.error("Error checking MCP server status:", err)
        setStatus("offline")
        setError("Failed to connect to MCP server")
      }
    }

    checkStatus()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>MCP Server Status</CardTitle>
            <Button variant="ghost" size="sm" onClick={refreshStatus} disabled={status === "loading"}>
              <RefreshCw className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            {status === "loading" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2 text-blue-500" />
                <span>Checking MCP server status...</span>
              </>
            ) : status === "online" ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                <span>MCP Server is online and ready</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 mr-2 text-red-500" />
                <span>MCP Server is offline</span>
              </>
            )}
          </div>

          {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
        </CardContent>
      </Card>

      <Tabs defaultValue="request">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="request">Make Request</TabsTrigger>
          <TabsTrigger value="tools">Available Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="request">
          <Card>
            <CardHeader>
              <CardTitle>Send Request to MCP Server</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Enter your request..."
                    value={requestInput}
                    onChange={(e) => setRequestInput(e.target.value)}
                    disabled={status !== "online" || isProcessing}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={status !== "online" || isProcessing || !requestInput.trim()}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Send Request"
                  )}
                </Button>
              </form>

              {response && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Response:</h3>
                  <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">{response}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Available MCP Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium">Provider Search</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Search for healthcare providers by specialty, location, and other criteria.
                  </p>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium">Blockchain Verification</h3>
                  <p className="text-sm text-gray-500 mt-1">Verify provider credentials on the blockchain network.</p>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium">Health Data Analysis</h3>
                  <p className="text-sm text-gray-500 mt-1">Analyze health data for patterns and insights.</p>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium">Payment Processing</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Process healthcare payments using traditional and blockchain methods.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
