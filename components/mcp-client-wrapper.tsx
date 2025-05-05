"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Use dynamic import with no SSR in a client component
const McpClient = dynamic(() => import("./mcp-client"), {
  ssr: false,
  loading: () => <div className="p-4">Loading MCP tools...</div>,
})

export default function McpClientWrapper() {
  return (
    <Suspense fallback={<div className="p-4">Loading MCP tools...</div>}>
      <McpClient />
    </Suspense>
  )
}
