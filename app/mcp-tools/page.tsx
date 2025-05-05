import { McpClientWrapper } from "@/components/mcp-client-wrapper"

export default function McpToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">MCP Tools</h1>
      <McpClientWrapper />
    </div>
  )
}
