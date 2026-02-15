/**
 * Base Mini App Manifest
 * 
 * Serves the farcaster.json manifest for Base mini app integration.
 * GET /.well-known/farcaster.json
 */

import { NextResponse } from 'next/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.basehealth.xyz'

export async function GET() {
  const manifest = {
    accountAssociation: {
      // These will be filled in after signing via Base Build
      header: process.env.MINIAPP_HEADER || '',
      payload: process.env.MINIAPP_PAYLOAD || '',
      signature: process.env.MINIAPP_SIGNATURE || '',
    },
    miniapp: {
      version: '1',
      name: 'BaseHealth',
      homeUrl: APP_URL,
      iconUrl: `${APP_URL}/icon-192.png`,
      splashImageUrl: `${APP_URL}/icon-512.png`,
      splashBackgroundColor: '#1a1a1a',
      webhookUrl: `${APP_URL}/api/miniapp/webhook`,
      
      // App store listing
      subtitle: 'Healthcare on Base',
      description: 'Evidence-based health screenings, verified providers with on-chain attestations, and USDC payments. Your health, intelligently managed.',
      screenshotUrls: [
        `${APP_URL}/screenshots/screening.png`,
        `${APP_URL}/screenshots/providers.png`,
        `${APP_URL}/screenshots/payment.png`,
      ],
      // Base manifest schema expects one of the documented categories (e.g. "health-fitness").
      primaryCategory: 'health-fitness',
      // Up to 5 tags; lowercase; no spaces/emojis/special chars.
      tags: ['health', 'healthcare', 'screenings', 'telemedicine', 'usdc'],
      
      // Hero content
      heroImageUrl: `${APP_URL}/og-image.png`,
      tagline: 'Healthcare, simplified',
      
      // Open Graph
      // Max 30 chars per Base manifest schema.
      ogTitle: 'BaseHealth: Healthcare on Base',
      ogDescription: 'Get personalized health screenings, find verified providers, and pay with USDC on Base.',
      ogImageUrl: `${APP_URL}/og-image.png`,
      
      // Don't index until fully set up
      noindex: false,
    },
  }

  return NextResponse.json(manifest)
}
