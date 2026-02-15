/**
 * Base Mini App Manifest
 * 
 * Serves the farcaster.json manifest for Base mini app integration.
 * GET /.well-known/farcaster.json
 */

import { NextResponse } from 'next/server'

const DEFAULT_OWNER_ADDRESS = "0xcB335bb4a2d2151F4E17eD525b7874343B77Ba8b"

function normalizeAppUrl(raw: string): string {
  return raw.replace(/\/$/, '')
}

function resolveOwnerAddress(): string {
  const candidate = (
    process.env.BASE_BUILDER_OWNER_ADDRESS ||
    process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS ||
    DEFAULT_OWNER_ADDRESS
  ).trim()

  return /^0x[a-fA-F0-9]{40}$/.test(candidate) ? candidate : DEFAULT_OWNER_ADDRESS
}

export async function GET(request: Request) {
  const requestOrigin = (() => {
    try {
      return new URL(request.url).origin
    } catch {
      return ''
    }
  })()

  // Prefer explicitly configured canonical URL, otherwise fall back to the incoming request origin.
  const appUrl = normalizeAppUrl(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_URL ||
      requestOrigin ||
      'https://www.basehealth.xyz',
  )

  const manifest = {
    accountAssociation: resolveAccountAssociation(),
    baseBuilder: {
      // Wallet used to import the mini app in Base Build (unlock analytics + builder rewards).
      ownerAddress: resolveOwnerAddress(),
    },
    miniapp: {
      version: '1',
      name: 'BaseHealth',
      homeUrl: appUrl,
      iconUrl: `${appUrl}/icon-192.png`,
      splashImageUrl: `${appUrl}/icon-512.png`,
      splashBackgroundColor: '#1a1a1a',
      webhookUrl: `${appUrl}/api/miniapp/webhook`,
      
      // App store listing
      subtitle: 'Healthcare on Base',
      description: 'Evidence-based health screenings, verified providers with on-chain attestations, and USDC payments. Your health, intelligently managed.',
      screenshotUrls: [
        `${appUrl}/screenshots/screening.png`,
        `${appUrl}/screenshots/providers.png`,
        `${appUrl}/screenshots/payment.png`,
      ],
      // Base manifest schema expects one of the documented categories (e.g. "health-fitness").
      primaryCategory: 'health-fitness',
      // Up to 5 tags; lowercase; no spaces/emojis/special chars.
      tags: ['health', 'healthcare', 'screenings', 'telemedicine', 'usdc'],
      
      // Hero content
      heroImageUrl: `${appUrl}/og-image.png`,
      tagline: 'Healthcare, simplified',
      
      // Open Graph
      // Max 30 chars per Base manifest schema.
      ogTitle: 'BaseHealth: Healthcare on Base',
      ogDescription: 'Get personalized health screenings, find verified providers, and pay with USDC on Base.',
      ogImageUrl: `${appUrl}/og-image.png`,
      
      // Don't index until fully set up
      noindex: false,
    },
  }

  return NextResponse.json(manifest)
}

function resolveAccountAssociation() {
  return {
    // Support both the repo's original MINIAPP_* naming and the Base docs' FARCASTER_* naming.
    header: process.env.MINIAPP_HEADER || process.env.FARCASTER_HEADER || '',
    payload: process.env.MINIAPP_PAYLOAD || process.env.FARCASTER_PAYLOAD || '',
    signature: process.env.MINIAPP_SIGNATURE || process.env.FARCASTER_SIGNATURE || '',
  }
}
