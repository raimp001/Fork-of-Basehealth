import dynamic from "next/dynamic"

// Use dynamic import with no SSR
const McpClientWrapper = dynamic(() => import("@/components/mcp-client-wrapper"), {
  ssr: false,
  loading: () => <div className="p-4">Loading MCP tools...</div>,
})

export default function McpToolsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Model Context Protocol Tools</h1>
      <p className="mb-8 text-gray-600">
        Use these tools to interact with blockchain data through the Model Context Protocol.
      </p>
      <McpClientWrapper />
    </div>
  )
}
