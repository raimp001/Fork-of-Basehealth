/**
 * Provider Attestation Signing API
 * 
 * Implements the provider co-signing flow:
 * 1. GET - Generate signing request for provider
 * 2. POST - Verify signature and create attestation
 * 
 * Flow:
 * 1. Frontend calls GET with providerId
 * 2. Frontend prompts provider to sign with wallet
 * 3. Frontend calls POST with signature
 * 4. Backend verifies and creates on-chain attestation
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  generateSigningRequest, 
  verifyAndAttest,
  getSignTypedDataParams,
  type SignedCredential,
} from '@/lib/provider-attestation-signing'
import { canCreateAttestation } from '@/lib/onboarding/verification-service'
import { logger } from '@/lib/logger'

/**
 * GET - Generate signing request for provider
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('providerId')

    if (!providerId) {
      return NextResponse.json({
        success: false,
        error: 'Provider ID is required',
      }, { status: 400 })
    }

    // Check if attestation is allowed
    const attestationCheck = await canCreateAttestation(providerId)
    if (!attestationCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: attestationCheck.reason,
        attestationBlocked: true,
      }, { status: 400 })
    }

    // Generate signing request
    const result = await generateSigningRequest(providerId)

    if (!result.success || !result.signingRequest) {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 })
    }

    // Return signing data in format ready for wallet
    return NextResponse.json({
      success: true,
      signingRequest: result.signingRequest,
      // Pre-formatted for eth_signTypedData_v4
      signTypedDataParams: getSignTypedDataParams(result.signingRequest),
      instructions: {
        step1: 'Call eth_signTypedData_v4 with signTypedDataParams',
        step2: 'POST the signature back to this endpoint',
        step3: 'Attestation will be created on Base',
      },
    })

  } catch (error) {
    logger.error('Error generating signing request', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate signing request',
    }, { status: 500 })
  }
}

/**
 * POST - Verify signature and create attestation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, signature, signerAddress } = body

    if (!message || !signature || !signerAddress) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: message, signature, signerAddress',
      }, { status: 400 })
    }

    // Validate signature format
    if (!signature.startsWith('0x') || signature.length !== 132) {
      return NextResponse.json({
        success: false,
        error: 'Invalid signature format',
      }, { status: 400 })
    }

    // Validate address format
    if (!signerAddress.startsWith('0x') || signerAddress.length !== 42) {
      return NextResponse.json({
        success: false,
        error: 'Invalid signer address format',
      }, { status: 400 })
    }

    const signedCredential: SignedCredential = {
      message,
      signature,
      signerAddress,
    }

    const result = await verifyAndAttest(signedCredential)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      attestation: {
        uid: result.attestationUid,
        txHash: result.txHash,
        explorerUrl: result.explorerUrl,
      },
      message: 'Credential attestation created successfully with provider signature',
    })

  } catch (error) {
    logger.error('Error verifying signature and creating attestation', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create attestation',
    }, { status: 500 })
  }
}
