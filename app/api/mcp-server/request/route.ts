import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { mcpServer } from "@/lib/mcp-server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, params } = body

    if (!action) {
      return NextResponse.json({ success: false, error: "Action is required" }, { status: 400 })
    }

    logger.info(`MCP server request: ${action}`, params)
    const result = await mcpServer.request(action, params || {})

    return NextResponse.json(result)
  } catch (error) {
    logger.error("Error in MCP server request", error)
    return NextResponse.json({ success: false, error: "Failed to process MCP server request" }, { status: 500 })
  }
}
