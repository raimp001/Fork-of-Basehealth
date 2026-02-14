import { NextResponse } from "next/server"
import { CARE_AGENTS, buildAgentPlan } from "@/lib/agent-mesh"

export async function GET() {
  return NextResponse.json({
    success: true,
    agents: CARE_AGENTS,
  })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const intake = typeof body?.intake === "string" ? body.intake : ""

  if (!intake) {
    return NextResponse.json({ success: false, error: "intake is required" }, { status: 400 })
  }

  const plan = buildAgentPlan(intake)
  return NextResponse.json({
    success: true,
    plan,
  })
}
