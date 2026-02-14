import { NextResponse } from "next/server"
import { createCareAction } from "@/lib/care-orchestration"

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const type = typeof body?.type === "string" ? body.type : "unknown"
  const payload = typeof body?.payload === "object" && body?.payload ? body.payload : {}

  const action = await createCareAction(type, payload)
  return NextResponse.json({ success: true, action })
}
