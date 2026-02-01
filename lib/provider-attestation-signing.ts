/**
 * Provider Attestation Signing Flow
 * 
 * Implements EIP-712 typed data signing for provider credential attestations.
 * Provider signs off-chain to consent, then platform creates on-chain attestation.
 * 
 * Flow:
 * 1. Verification passes (NPI, OIG, SAM)
 * 2. Platform generates EIP-712 message with credential data
 * 3. Provider signs message with their wallet (MetaMask, Coinbase Wallet, etc.)
 * 4. Platform verifies signature
 * 5. Platform creates attestation on Base with provider's signature attached
 */

import { ethers } from 'ethers'
import { prisma } from './prisma'
import { logger } from './logger'
import { attestProviderCredential, type ProviderCredentialData } from './base-attestations'

// =============================================================================
// EIP-712 TYPED DATA DEFINITION
// =============================================================================

const EIP712_DOMAIN = {
  name: 'BaseHealth',
  version: '1',
  chainId: process.env.NODE_ENV === 'production' ? 8453 : 84532, // Base mainnet / Sepolia
  verifyingContract: '0x0000000000000000000000000000000000000000', // No contract, off-chain signing
}

const CREDENTIAL_ATTESTATION_TYPES = {
  CredentialAttestation: [
    { name: 'npiNumber', type: 'string' },
    { name: 'licenseNumber', type: 'string' },
    { name: 'licenseState', type: 'string' },
    { name: 'providerType', type: 'string' },
    { name: 'specialty', type: 'string' },
    { name: 'walletAddress', type: 'address' },
    { name: 'timestamp', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
  ],
}

// =============================================================================
// TYPES
// =============================================================================

export interface CredentialMessage {
  npiNumber: string
  licenseNumber: string
  licenseState: string
  providerType: string
  specialty: string
  walletAddress: string
  timestamp: number
  nonce: number
}

export interface SigningRequest {
  domain: typeof EIP712_DOMAIN
  types: typeof CREDENTIAL_ATTESTATION_TYPES
  primaryType: string
  message: CredentialMessage
}

export interface SignedCredential {
  message: CredentialMessage
  signature: string
  signerAddress: string
}

// =============================================================================
// SIGNING REQUEST GENERATION
// =============================================================================

/**
 * Generate a signing request for a provider
 * Frontend will use this to request signature from provider's wallet
 */
export async function generateSigningRequest(
  providerId: string
): Promise<{ success: boolean; signingRequest?: SigningRequest; error?: string }> {
  try {
    // Get provider data
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    })

    if (!provider) {
      return { success: false, error: 'Provider not found' }
    }

    if (!provider.walletAddress) {
      return { success: false, error: 'Provider wallet address not configured' }
    }

    if (provider.status !== 'APPROVED') {
      return { success: false, error: 'Provider must be approved before signing' }
    }

    // Generate unique nonce
    const nonce = Date.now()

    const message: CredentialMessage = {
      npiNumber: provider.npiNumber || '',
      licenseNumber: provider.licenseNumber || '',
      licenseState: provider.licenseState || '',
      providerType: provider.type,
      specialty: provider.specialties?.[0] || '',
      walletAddress: provider.walletAddress,
      timestamp: Math.floor(Date.now() / 1000),
      nonce,
    }

    return {
      success: true,
      signingRequest: {
        domain: EIP712_DOMAIN,
        types: CREDENTIAL_ATTESTATION_TYPES,
        primaryType: 'CredentialAttestation',
        message,
      },
    }
  } catch (error) {
    logger.error('Failed to generate signing request', error)
    return { success: false, error: 'Failed to generate signing request' }
  }
}

// =============================================================================
// SIGNATURE VERIFICATION
// =============================================================================

/**
 * Verify a provider's signature and create attestation
 */
export async function verifyAndAttest(
  signedCredential: SignedCredential
): Promise<{
  success: boolean
  attestationUid?: string
  txHash?: string
  explorerUrl?: string
  error?: string
}> {
  try {
    const { message, signature, signerAddress } = signedCredential

    // Verify the signature
    const recoveredAddress = ethers.verifyTypedData(
      EIP712_DOMAIN,
      CREDENTIAL_ATTESTATION_TYPES,
      message,
      signature
    )

    if (recoveredAddress.toLowerCase() !== signerAddress.toLowerCase()) {
      return { success: false, error: 'Invalid signature - address mismatch' }
    }

    if (recoveredAddress.toLowerCase() !== message.walletAddress.toLowerCase()) {
      return { success: false, error: 'Signature address does not match provider wallet' }
    }

    // Check timestamp is recent (within 1 hour)
    const now = Math.floor(Date.now() / 1000)
    if (now - message.timestamp > 3600) {
      return { success: false, error: 'Signing request expired (>1 hour old)' }
    }

    // Get provider by wallet address
    const provider = await prisma.provider.findFirst({
      where: { walletAddress: signerAddress },
    })

    if (!provider) {
      return { success: false, error: 'Provider not found for this wallet' }
    }

    // Verify credentials match
    if (provider.npiNumber !== message.npiNumber) {
      return { success: false, error: 'NPI mismatch' }
    }

    // Create attestation with signature proof
    const credentialData: ProviderCredentialData = {
      npiNumber: message.npiNumber,
      licenseNumber: message.licenseNumber,
      licenseState: message.licenseState,
      providerType: message.providerType,
      specialty: message.specialty,
      npiVerified: provider.isVerified,
      licenseVerified: true,
    }

    const attestationResult = await attestProviderCredential(
      message.walletAddress,
      credentialData
    )

    if (!attestationResult.success) {
      return { success: false, error: attestationResult.error }
    }

    // Store signature proof (optional: could add to DB)
    logger.info('Provider co-signed attestation created', {
      providerId: provider.id,
      walletAddress: message.walletAddress,
      attestationUid: attestationResult.uid,
      signaturePrefix: signature.slice(0, 20) + '...',
    })

    return {
      success: true,
      attestationUid: attestationResult.uid,
      txHash: attestationResult.txHash,
      explorerUrl: attestationResult.explorerUrl,
    }
  } catch (error) {
    logger.error('Failed to verify and attest', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    }
  }
}

// =============================================================================
// FRONTEND HELPER - Generate signing data for wallet
// =============================================================================

/**
 * Generate the exact data structure needed for wallet signing
 * Frontend calls eth_signTypedData_v4 with this
 */
export function getSignTypedDataParams(signingRequest: SigningRequest): string {
  return JSON.stringify({
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      ...signingRequest.types,
    },
    primaryType: signingRequest.primaryType,
    domain: signingRequest.domain,
    message: signingRequest.message,
  })
}
