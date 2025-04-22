"use client"

import { useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Send } from "lucide-react"

export default function McpServerChat() {
  const [serverRunning, setServerRunning] = useState(false)
  const [serverOutput, setServerOutput] = useState("")

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat/mcp-server",
    onResponse: () => {
      // This would be called when we get a response from the API
      // In a real implementation, we'd check if the server is running
      setServerRunning(true)
    },
  })

  // In a real implementation, we'd need to check if the MCP server is running
  // This is a simplified version for demonstration
  const checkServerStatus = async () => {
    try {
      const response = await fetch("/api/mcp-server/status")
      const data = await response.json()
      setServerRunning(data.running)
      setServerOutput(data.output || "Server is running")
    } catch (error) {
      setServerRunning(false)
      setServerOutput("Error checking server status")
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Blockchain Health Assistant (MCP Server)</CardTitle>
        <CardDescription>
          This assistant uses the Model Context Protocol server to provide blockchain-aware responses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${serverRunning ? "bg-green-500" : "bg-red-500"}`}></div>
            <span>{serverRunning ? "MCP Server Running" : "MCP Server Not Running"}</span>
          </div>
          <Button onClick={checkServerStatus} variant="outline" size="sm">
            Check Status
          </Button>
        </div>

        {serverOutput && (
          <Card className="bg-muted p-2 text-xs font-mono overflow-auto max-h-32">
            <pre>{serverOutput}</pre>
          </Card>
        )}

        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about blockchain healthcare payments..."
            disabled={!serverRunning || isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!serverRunning || isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
