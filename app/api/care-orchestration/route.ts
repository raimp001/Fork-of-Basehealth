import { NextResponse } from "next/server"
import { getCareSnapshot } from "@/lib/care-orchestration"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get("patientId") || "demo-patient"

  const snapshot = await getCareSnapshot(patientId)
  return NextResponse.json(snapshot)
}
