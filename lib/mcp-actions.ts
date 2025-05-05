"use server"

export async function handleMcpRequest(formData: FormData) {
  try {
    const input = formData.get("input") as string

    // Import dynamically to avoid server/client mismatch
    const { handleMcpServerRequest } = await import("@/lib/mcp-server")
    const result = await handleMcpServerRequest(input)

    return { success: true, data: result }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
