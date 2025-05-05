import { Suspense } from "react"
import McpClientWrapper from "@/components/mcp-client-wrapper"

export default function McpToolsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">MCP Tools</h1>
      <Suspense fallback={<div>Loading MCP tools...</div>}>
        <McpClientWrapper />
      </Suspense>
    </div>
  )
}
