/**
 * Wallet Setup API
 * 
 * Creates a Base wallet using Coinbase CDP for receiving payments.
 * GET /api/admin/setup-wallet
 * 
 * WARNING: This endpoint should be protected in production!
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check for CDP credentials
    const apiKeyName = process.env.CDP_API_KEY_NAME
    const apiKeySecret = process.env.CDP_API_KEY_SECRET
    
    if (!apiKeyName || !apiKeySecret) {
      return NextResponse.json({
        error: 'CDP_API_KEY_NAME and CDP_API_KEY_SECRET must be set in environment',
        setup: {
          step1: 'Add CDP_API_KEY_NAME to .env.local',
          step2: 'Add CDP_API_KEY_SECRET to .env.local',
        }
      }, { status: 400 })
    }
    
    // Dynamically import the SDK
    const { Coinbase, Wallet } = await import('@coinbase/coinbase-sdk')
    
    // Initialize Coinbase SDK
    const coinbase = new Coinbase({
      apiKeyName,
      privateKey: apiKeySecret,
    })
    
    // Create a new wallet on Base Sepolia (testnet)
    const network = process.env.NODE_ENV === 'production' ? 'base-mainnet' : 'base-sepolia'
    
    const wallet = await Wallet.create({ networkId: network })
    const address = await wallet.getDefaultAddress()
    const walletAddress = address.getId()
    
    // Export wallet for backup
    const walletExport = wallet.export()
    
    return NextResponse.json({
      success: true,
      message: 'Wallet created successfully!',
      wallet: {
        network,
        walletId: wallet.getId(),
        address: walletAddress,
      },
      envVariable: `NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS="${walletAddress}"`,
      backup: walletExport,
      nextSteps: [
        `Add NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS="${walletAddress}" to your .env.local`,
        'Save the wallet backup data securely',
        'For testnet, get test ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet',
      ],
    })
    
  } catch (error) {
    console.error('Wallet setup error:', error)
    return NextResponse.json({
      error: 'Failed to create wallet',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
