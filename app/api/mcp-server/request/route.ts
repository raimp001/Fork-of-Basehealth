import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const input = formData.get("input") as string

    if (!input) {
      return NextResponse.json({ success: false, error: "Input is required" }, { status: 400 })
    }

    // Dynamically import to avoid server component issues
    const { handleMcpServerRequest } = await import("@/lib/mcp-server")
    const result = await handleMcpServerRequest(input)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error in MCP server request:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
