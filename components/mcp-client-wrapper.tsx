"use client"

import { Suspense } from "react"
import McpClient from "./mcp-client"

export default function McpClientWrapper() {
  return (
    <Suspense fallback={<div className="p-4">Loading MCP tools...</div>}>
      <McpClient />
    </Suspense>
  )
}
