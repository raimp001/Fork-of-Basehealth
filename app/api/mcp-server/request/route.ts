import { type NextRequest, NextResponse } from "next/server"
import { handleMcpServerRequest } from "@/lib/mcp-server"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const input = formData.get("input") as string

    if (!input) {
      return NextResponse.json({ success: false, error: "Input is required" }, { status: 400 })
    }

    logger.info("Received MCP request:", input)
    const result = await handleMcpServerRequest(input)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    logger.error("Error in MCP server request:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
