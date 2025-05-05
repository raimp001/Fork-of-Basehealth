"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function McpClient() {
  const [serverStatus, setServerStatus] = useState<{ status: string; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [action, setAction] = useState("FIND_PROVIDERS")
  const [params, setParams] = useState("")
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkServerStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch("/api/mcp-server/status")
      const data = await res.json()
      setServerStatus(data)
    } catch (err) {
      setError("Failed to check server status")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const sendRequest = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setResponse(null)

      let parsedParams = {}
      try {
        parsedParams = params ? JSON.parse(params) : {}
      } catch (err) {
        setError("Invalid JSON in parameters")
        setIsLoading(false)
        return
      }

      const res = await fetch("/api/mcp-server/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          params: parsedParams,
        }),
      })

      const data = await res.json()
      setResponse(data)
    } catch (err) {
      setError("Failed to send request")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>MCP Server Status</CardTitle>
          <CardDescription>Check if the MCP server is online and operational</CardDescription>
        </CardHeader>
        <CardContent>
          {serverStatus && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
              {serverStatus.status === "online" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span>{serverStatus.message}</span>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={checkServerStatus} disabled={isLoading}>
            {isLoading ? "Checking..." : "Check Server Status"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send MCP Request</CardTitle>
          <CardDescription>Send a request to the MCP server</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="action">Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger id="action">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIND_PROVIDERS">Find Providers</SelectItem>
                <SelectItem value="VERIFY_CREDENTIALS">Verify Credentials</SelectItem>
                <SelectItem value="CHECK_ELIGIBILITY">Check Eligibility</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="params">Parameters (JSON)</Label>
            <Textarea
              id="params"
              placeholder='{"key": "value"}'
              value={params}
              onChange={(e) => setParams(e.target.value)}
              rows={4}
            />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {response && (
            <div className="p-3 rounded-md bg-muted">
              <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(response, null, 2)}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={sendRequest} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Request"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
