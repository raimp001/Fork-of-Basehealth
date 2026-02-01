/**
 * Provider Attestation API
 * 
 * Creates on-chain credential attestations for verified providers.
 * 
 * POST /api/attestations/provider - Create provider credential attestation
 * GET /api/attestations/provider?npi=X - Get provider attestation status
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  attestProviderCredential, 
  verifyAttestation,
  PROVIDER_CREDENTIAL_SCHEMA,
  type ProviderCredentialData,
} from '@/lib/base-attestations'
import { logger } from '@/lib/logger'

/**
 * POST - Create a provider credential attestation
 * Called when a provider is approved after verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { providerId, walletAddress } = body
    
    if (!providerId) {
      return NextResponse.json({
        success: false,
        error: 'Provider ID is required',
      }, { status: 400 })
    }
    
    // Get provider from database
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    })
    
    if (!provider) {
      return NextResponse.json({
        success: false,
        error: 'Provider not found',
      }, { status: 404 })
    }
    
    // Provider must be approved
    if (provider.status !== 'APPROVED') {
      return NextResponse.json({
        success: false,
        error: 'Provider must be approved before attestation',
      }, { status: 400 })
    }
    
    // Use provided wallet or provider's saved wallet
    const recipientWallet = walletAddress || provider.walletAddress
    
    if (!recipientWallet) {
      return NextResponse.json({
        success: false,
        error: 'Wallet address is required for attestation. Provider must have a wallet configured.',
      }, { status: 400 })
    }
    
    // Prepare attestation data
    const credentialData: ProviderCredentialData = {
      npiNumber: provider.npiNumber || '',
      licenseNumber: provider.licenseNumber || '',
      licenseState: provider.licenseState || '',
      providerType: provider.type,
      specialty: provider.specialties?.[0] || '',
      npiVerified: provider.isVerified,
      licenseVerified: true, // Assumed verified if approved
    }
    
    // Create attestation
    const result = await attestProviderCredential(recipientWallet, credentialData)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Attestation failed',
      }, { status: 500 })
    }
    
    // Store attestation UID in provider record (optional: add field to schema)
    // For now, just return the result
    
    logger.info('Provider credential attestation created', {
      providerId,
      npi: provider.npiNumber,
      attestationUid: result.uid,
    })
    
    return NextResponse.json({
      success: true,
      attestation: {
        uid: result.uid,
        txHash: result.txHash,
        explorerUrl: result.explorerUrl,
        recipient: recipientWallet,
        schema: PROVIDER_CREDENTIAL_SCHEMA.name,
      },
      provider: {
        id: provider.id,
        name: provider.fullName,
        npi: provider.npiNumber,
        verified: provider.isVerified,
      },
    })
    
  } catch (error) {
    logger.error('Error creating provider attestation', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create attestation',
    }, { status: 500 })
  }
}

/**
 * GET - Check provider attestation status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const npi = searchParams.get('npi')
    const attestationUid = searchParams.get('uid')
    
    // If attestation UID provided, verify it directly
    if (attestationUid) {
      const verification = await verifyAttestation(attestationUid)
      
      return NextResponse.json({
        success: true,
        attestation: {
          uid: attestationUid,
          valid: verification.valid,
          revoked: verification.revoked,
          ...verification.data,
        },
      })
    }
    
    // If NPI provided, look up provider
    if (npi) {
      const provider = await prisma.provider.findFirst({
        where: { npiNumber: npi },
        select: {
          id: true,
          fullName: true,
          npiNumber: true,
          isVerified: true,
          status: true,
          walletAddress: true,
        },
      })
      
      if (!provider) {
        return NextResponse.json({
          success: false,
          error: 'Provider not found',
        }, { status: 404 })
      }
      
      return NextResponse.json({
        success: true,
        provider: {
          id: provider.id,
          name: provider.fullName,
          npi: provider.npiNumber,
          verified: provider.isVerified,
          status: provider.status,
          hasWallet: !!provider.walletAddress,
          // attestationUid would be returned if stored
        },
        attestationStatus: provider.isVerified && provider.status === 'APPROVED' 
          ? 'eligible' 
          : 'not_eligible',
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'NPI or attestation UID is required',
    }, { status: 400 })
    
  } catch (error) {
    logger.error('Error checking provider attestation', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check attestation status',
    }, { status: 500 })
  }
}
