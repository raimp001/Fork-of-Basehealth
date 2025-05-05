"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function McpClient() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [networkId, setNetworkId] = useState(process.env.NEXT_PUBLIC_NETWORK_ID || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/mcp-server/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, networkId }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setResult("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>MCP Query Tool</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="networkId">Network ID</Label>
            <Input
              id="networkId"
              value={networkId}
              onChange={(e) => setNetworkId(e.target.value)}
              placeholder="Enter network ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="query">MCP Query</Label>
            <Textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your MCP query"
              rows={5}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Submit Query"}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4">
            <Label>Result:</Label>
            <pre className="mt-2 p-4 bg-gray-100 rounded-md overflow-auto text-sm">{result}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
