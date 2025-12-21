import { NextResponse } from 'next/server'
import { getSupportedSchemes, type SupportedSchemesResponse } from '@/lib/x402-protocol'
import { logger } from '@/lib/logger'

/**
 * GET /api/x402/supported
 * Get supported payment schemes and networks
 * 
 * Response:
 * {
 *   kinds: [
 *     {
 *       scheme: string
 *       network: string
 *     }
 *   ]
 * }
 */
export async function GET() {
  try {
    const supported = getSupportedSchemes()
    return NextResponse.json(supported as SupportedSchemesResponse)
  } catch (error) {
    logger.error('x402 supported schemes error', error)
    return NextResponse.json(
      {
        kinds: [],
      } as SupportedSchemesResponse,
      { status: 500 }
    )
  }
}

