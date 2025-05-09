"use client"

import { useEffect } from "react"
import McpClient from "@/components/mcp-client"

export default function McpToolsClient() {
  // Any client-side logic can go here
  useEffect(() => {
    // Example: Analytics tracking
    console.log("MCP Tools page viewed")
  }, [])

  return <McpClient />
}
