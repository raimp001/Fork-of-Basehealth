import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { mcpServer } from "@/lib/mcp-server"

export async function GET() {
  try {
    logger.info("MCP server status check requested")
    const status = await mcpServer.status()
    return NextResponse.json(status)
  } catch (error) {
    logger.error("Error checking MCP server status", error)
    return NextResponse.json({ status: "error", message: "Failed to check MCP server status" }, { status: 500 })
  }
}
