/**
 * Admin API - Run verification on application
 */

import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { runVerification } from "@/lib/onboarding/verification-service"
import { logVerificationResult } from "@/lib/onboarding/audit-service"
import { VerificationType } from "@prisma/client"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { type } = body

    if (!type || !["NPI_LOOKUP", "OIG_LEIE", "SAM_EXCLUSION", "LICENSE_CHECK"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid verification type" },
        { status: 400 }
      )
    }

    const result = await runVerification(id, type as VerificationType)

    // Log verification result
    await logVerificationResult(id, type, result.passed, { status: result.status })

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    logger.error("Failed to run verification", error)
    return NextResponse.json(
      { error: "Failed to run verification" },
      { status: 500 }
    )
  }
}
