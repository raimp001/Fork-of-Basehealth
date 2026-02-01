/**
 * Admin API - Run verification on application
 * 
 * POST /api/admin/applications/[id]/verify
 *   - { type: "NPI_LOOKUP" | "OIG_LEIE" | "SAM_EXCLUSION" | "LICENSE_CHECK" }
 *   - Runs a single verification
 * 
 * POST /api/admin/applications/[id]/verify
 *   - { runAll: true }
 *   - Runs full verification pipeline
 * 
 * GET /api/admin/applications/[id]/verify
 *   - Returns verification summary
 */

import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { 
  runVerification, 
  runVerificationPipeline,
  getVerificationSummary,
} from "@/lib/onboarding/verification-service"
import { logVerificationResult } from "@/lib/onboarding/audit-service"
import { VerificationType } from "@prisma/client"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const summary = await getVerificationSummary(id)
    
    return NextResponse.json({
      success: true,
      summary,
    })
  } catch (error) {
    logger.error("Failed to get verification summary", error)
    return NextResponse.json(
      { error: "Failed to get verification summary" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { type, runAll } = body

    // Run full pipeline if requested
    if (runAll === true) {
      logger.info("Running full verification pipeline", { applicationId: id })
      
      const pipelineResult = await runVerificationPipeline(id)
      
      return NextResponse.json({
        success: pipelineResult.success,
        pipeline: true,
        summary: pipelineResult.summary,
        canAttest: pipelineResult.canAttest,
        nextSteps: pipelineResult.nextSteps,
      })
    }

    // Run single verification
    if (!type || !["NPI_LOOKUP", "OIG_LEIE", "SAM_EXCLUSION", "LICENSE_CHECK"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid verification type. Use runAll: true for full pipeline." },
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
