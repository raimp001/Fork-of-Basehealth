"use client"

import { Suspense } from "react"
import { McpClient } from "./mcp-client"

export function McpClientWrapper() {
  return (
    <Suspense fallback={<div>Loading MCP Client...</div>}>
      <McpClient />
    </Suspense>
  )
}
