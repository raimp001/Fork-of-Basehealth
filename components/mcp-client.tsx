"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function McpClient() {
  const [input, setInput] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Client-side handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("input", input)

      // Call the API route instead of directly calling the server function
      const response = await fetch("/api/mcp-server/request", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to process MCP request")
      }

      setResponse(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>MCP Client</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="request">
          <TabsList>
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
          </TabsList>
          <TabsContent value="request">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Enter your MCP request..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[200px]"
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Send Request"}
              </Button>
              {error && <p className="text-red-500">{error}</p>}
            </form>
          </TabsContent>
          <TabsContent value="response">
            <Textarea readOnly value={response} className="min-h-[200px]" placeholder="Response will appear here..." />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
