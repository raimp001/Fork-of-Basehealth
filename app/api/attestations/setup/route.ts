/**
 * Attestation Schema Setup API
 * 
 * One-time setup to register EAS schemas on Base.
 * Only run once per environment (testnet/mainnet).
 * 
 * POST /api/attestations/setup - Register all schemas
 * GET /api/attestations/setup - Get schema info
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  registerSchemas,
  attestationConfig,
  PROVIDER_CREDENTIAL_SCHEMA,
  VISIT_ATTESTATION_SCHEMA,
  REVIEW_ATTESTATION_SCHEMA,
  SCREENING_ATTESTATION_SCHEMA,
} from '@/lib/base-attestations'
import { logger } from '@/lib/logger'

/**
 * GET - Get current schema configuration
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    config: {
      easContract: attestationConfig.easContract,
      schemaRegistry: attestationConfig.schemaRegistry,
      network: attestationConfig.isProduction ? 'Base Mainnet' : 'Base Sepolia',
      explorer: attestationConfig.explorer,
    },
    schemas: {
      providerCredential: {
        name: PROVIDER_CREDENTIAL_SCHEMA.name,
        schema: PROVIDER_CREDENTIAL_SCHEMA.schema,
        uid: PROVIDER_CREDENTIAL_SCHEMA.uid || 'Not registered - run POST to register',
        revocable: PROVIDER_CREDENTIAL_SCHEMA.revocable,
      },
      visitAttestation: {
        name: VISIT_ATTESTATION_SCHEMA.name,
        schema: VISIT_ATTESTATION_SCHEMA.schema,
        uid: VISIT_ATTESTATION_SCHEMA.uid || 'Not registered - run POST to register',
        revocable: VISIT_ATTESTATION_SCHEMA.revocable,
      },
      reviewAttestation: {
        name: REVIEW_ATTESTATION_SCHEMA.name,
        schema: REVIEW_ATTESTATION_SCHEMA.schema,
        uid: REVIEW_ATTESTATION_SCHEMA.uid || 'Not registered - run POST to register',
        revocable: REVIEW_ATTESTATION_SCHEMA.revocable,
      },
      screeningAttestation: {
        name: SCREENING_ATTESTATION_SCHEMA.name,
        schema: SCREENING_ATTESTATION_SCHEMA.schema,
        uid: SCREENING_ATTESTATION_SCHEMA.uid || 'Not registered - run POST to register',
        revocable: SCREENING_ATTESTATION_SCHEMA.revocable,
      },
    },
    instructions: {
      step1: 'Ensure ATTESTOR_PRIVATE_KEY is set in environment',
      step2: 'POST to this endpoint to register schemas',
      step3: 'Copy the returned UIDs to environment variables',
      step4: 'Set PROVIDER_CREDENTIAL_SCHEMA_UID, VISIT_ATTESTATION_SCHEMA_UID, etc.',
    },
  })
}

/**
 * POST - Register all schemas (one-time setup)
 */
export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization
    const authHeader = request.headers.get('authorization')
    const adminKey = process.env.ADMIN_API_KEY
    
    if (adminKey && authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - admin API key required',
      }, { status: 401 })
    }
    
    // Check if attestor key is configured
    if (!process.env.ATTESTOR_PRIVATE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'ATTESTOR_PRIVATE_KEY not configured. This is required to register schemas.',
        instructions: [
          '1. Generate a new wallet for the attestor',
          '2. Fund it with ETH on Base (for gas)',
          '3. Set ATTESTOR_PRIVATE_KEY in environment',
          '4. Retry this endpoint',
        ],
      }, { status: 400 })
    }
    
    logger.info('Registering EAS schemas on Base')
    
    const uids = await registerSchemas()
    
    logger.info('EAS schemas registered successfully', uids)
    
    return NextResponse.json({
      success: true,
      message: 'Schemas registered successfully!',
      schemaUids: {
        PROVIDER_CREDENTIAL_SCHEMA_UID: uids.providerCredentialUid,
        VISIT_ATTESTATION_SCHEMA_UID: uids.visitAttestationUid,
        REVIEW_ATTESTATION_SCHEMA_UID: uids.reviewAttestationUid,
        SCREENING_ATTESTATION_SCHEMA_UID: uids.screeningAttestationUid,
      },
      nextSteps: [
        'Copy these UIDs to your environment variables',
        'Restart the application',
        'Attestations will now use these schemas',
      ],
      explorerLinks: {
        providerCredential: `${attestationConfig.explorer}/schema/view/${uids.providerCredentialUid}`,
        visitAttestation: `${attestationConfig.explorer}/schema/view/${uids.visitAttestationUid}`,
        reviewAttestation: `${attestationConfig.explorer}/schema/view/${uids.reviewAttestationUid}`,
        screeningAttestation: `${attestationConfig.explorer}/schema/view/${uids.screeningAttestationUid}`,
      },
    })
    
  } catch (error) {
    logger.error('Error registering schemas', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to register schemas',
    }, { status: 500 })
  }
}
