import { NextRequest, NextResponse } from "next/server"
import { createCareAction } from "@/lib/care-orchestration"
import { requirePrivyAuth } from "@/lib/privy-auth"

export async function POST(request: NextRequest) {
  const auth = await requirePrivyAuth(request)
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, error: auth.error || "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const type = typeof body?.type === "string" ? body.type : "unknown"
  const payload = typeof body?.payload === "object" && body?.payload ? body.payload : {}

  const action = await createCareAction(type, payload)
  return NextResponse.json({ success: true, action, meta: { routedBy: "coordinator-agent" } })
}
