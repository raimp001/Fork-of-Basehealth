import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execPromise = promisify(exec)

export async function GET() {
  try {
    // Check if the MCP server process is running
    // This is a simplified check - in production you'd want a more robust solution
    const { stdout } = await execPromise('ps aux | grep "mcp-server" | grep -v grep')

    const running = stdout.length > 0

    return NextResponse.json({
      running,
      output: running ? "MCP Server is running" : "MCP Server is not running",
    })
  } catch (error) {
    // If the grep command returns nothing, the process is not running
    return NextResponse.json({
      running: false,
      output: "MCP Server is not running",
    })
  }
}
