import McpClient from "@/components/mcp-client"

export default function McpToolsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Model Context Protocol Tools</h1>
      <McpClient />
    </div>
  )
}
