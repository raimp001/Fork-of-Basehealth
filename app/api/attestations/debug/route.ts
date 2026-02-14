import { NextResponse } from 'next/server'
import { getNetworkStatus, isMainnetReady, ATTESTATION_CONFIG } from '@/lib/network-config'

export async function GET() {
  const network = getNetworkStatus()
  const mainnet = isMainnetReady()

  return NextResponse.json({
    success: true,
    attestation: {
      chainId: network.chainId,
      network: network.network,
      attestationsReady: network.attestationsReady,
      schemaUid: ATTESTATION_CONFIG.schemaUid,
      easScanUrl: ATTESTATION_CONFIG.easScanUrl,
    },
    readiness: mainnet,
    checks: [
      'Ensure wallet network matches NEXT_PUBLIC_BASE_CHAIN_ID',
      'Ensure provider.walletAddress equals connected wallet address',
      'Ensure EAS schema UID is set for target chain',
      'Ensure ATTESTATION_PRIVATE_KEY is configured server-side',
    ],
  })
}
