import { NextResponse } from "next/server"
import { generatePersonalizedInsights, SUPPORTED_DEVICES, type DeviceMetrics } from "@/lib/device-insights"

export async function GET() {
  return NextResponse.json({ devices: SUPPORTED_DEVICES })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const metrics = (body?.metrics || {}) as DeviceMetrics

  const insights = generatePersonalizedInsights(metrics)

  return NextResponse.json({ insights })
}
