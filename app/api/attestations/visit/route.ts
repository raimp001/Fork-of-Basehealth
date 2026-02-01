/**
 * Visit Attestation API
 * 
 * Creates on-chain attestations for completed healthcare visits.
 * 
 * POST /api/attestations/visit - Create visit completion attestation
 * GET /api/attestations/visit?uid=X - Verify a visit attestation
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  attestVisitCompletion, 
  verifyAttestation,
  VISIT_ATTESTATION_SCHEMA,
  type VisitAttestationData,
} from '@/lib/base-attestations'
import { logger } from '@/lib/logger'

/**
 * POST - Create a visit completion attestation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      visitId, 
      visitType, 
      visitDate, 
      providerNpi,
      patientWalletAddress,
    } = body
    
    if (!visitId || !patientWalletAddress) {
      return NextResponse.json({
        success: false,
        error: 'Visit ID and patient wallet address are required',
      }, { status: 400 })
    }
    
    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(patientWalletAddress)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid wallet address format',
      }, { status: 400 })
    }
    
    const visitData: VisitAttestationData = {
      visitId,
      visitType: visitType || 'General Consultation',
      visitDate: visitDate ? new Date(visitDate) : new Date(),
      completed: true,
      providerNpi: providerNpi || '',
    }
    
    const result = await attestVisitCompletion(patientWalletAddress, visitData)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Attestation failed',
      }, { status: 500 })
    }
    
    logger.info('Visit attestation created', {
      visitId,
      attestationUid: result.uid,
    })
    
    return NextResponse.json({
      success: true,
      attestation: {
        uid: result.uid,
        txHash: result.txHash,
        explorerUrl: result.explorerUrl,
        recipient: patientWalletAddress,
        schema: VISIT_ATTESTATION_SCHEMA.name,
        visitId,
        visitType: visitData.visitType,
        visitDate: visitData.visitDate.toISOString(),
      },
    })
    
  } catch (error) {
    logger.error('Error creating visit attestation', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create attestation',
    }, { status: 500 })
  }
}

/**
 * GET - Verify a visit attestation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')
    
    if (!uid) {
      return NextResponse.json({
        success: false,
        error: 'Attestation UID is required',
      }, { status: 400 })
    }
    
    const verification = await verifyAttestation(uid)
    
    return NextResponse.json({
      success: true,
      attestation: {
        uid,
        valid: verification.valid,
        revoked: verification.revoked,
        schema: VISIT_ATTESTATION_SCHEMA.name,
        ...verification.data,
      },
    })
    
  } catch (error) {
    logger.error('Error verifying visit attestation', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to verify attestation',
    }, { status: 500 })
  }
}
