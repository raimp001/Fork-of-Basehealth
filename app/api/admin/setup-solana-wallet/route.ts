/**
 * Solana Wallet Setup API
 * 
 * Creates a Solana wallet for receiving payments.
 * GET /api/admin/setup-solana-wallet
 */

import { NextRequest, NextResponse } from 'next/server'
import { Keypair } from '@solana/web3.js'
import * as bs58 from 'bs58'

export async function GET(request: NextRequest) {
  try {
    // Generate a new keypair
    const keypair = Keypair.generate()
    
    // Get the public key (wallet address)
    const publicKey = keypair.publicKey.toBase58()
    
    // Get the secret key for backup (base58 encoded)
    const secretKey = bs58.default.encode(keypair.secretKey)
    
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'
    
    return NextResponse.json({
      success: true,
      message: 'Solana wallet created successfully!',
      wallet: {
        network,
        address: publicKey,
      },
      envVariable: `NEXT_PUBLIC_SOLANA_RECIPIENT_WALLET="${publicKey}"`,
      backup: {
        publicKey,
        secretKey,
        warning: 'KEEP THIS SECRET KEY SECURE! Anyone with this key can access your funds.',
      },
      nextSteps: [
        `Add NEXT_PUBLIC_SOLANA_RECIPIENT_WALLET="${publicKey}" to your .env.local`,
        'Save the secret key securely',
        `Get test SOL from: https://faucet.solana.com/ (select ${network})`,
      ],
    })
    
  } catch (error) {
    console.error('Solana wallet setup error:', error)
    return NextResponse.json({
      error: 'Failed to create Solana wallet',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
