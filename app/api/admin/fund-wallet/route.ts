/**
 * Fund Wallet API
 * 
 * Uses Coinbase CDP faucet to fund testnet wallets.
 * GET /api/admin/fund-wallet
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const walletAddress = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS
    
    if (!walletAddress) {
      return NextResponse.json({
        error: 'No wallet address configured',
        setup: 'Run /api/admin/setup-wallet first',
      }, { status: 400 })
    }
    
    // Try to use Coinbase CDP to fund the wallet
    const apiKeyName = process.env.CDP_API_KEY_NAME
    const apiKeySecret = process.env.CDP_API_KEY_SECRET
    
    if (!apiKeyName || !apiKeySecret) {
      return NextResponse.json({
        error: 'CDP credentials not configured',
        manualFaucets: [
          {
            name: 'LearnWeb3 Faucet',
            url: 'https://learnweb3.io/faucets/base_sepolia/',
            amount: '0.01 ETH/day',
            requirements: 'GitHub login',
          },
          {
            name: 'Alchemy Faucet',
            url: 'https://www.alchemy.com/faucets/base-sepolia',
            amount: '0.1 ETH',
            requirements: 'Alchemy account',
          },
          {
            name: 'QuickNode Faucet',
            url: 'https://faucet.quicknode.com/base/sepolia',
            amount: '0.1 ETH',
            requirements: 'QuickNode account',
          },
          {
            name: 'Chainlink Faucet',
            url: 'https://faucets.chain.link/base-sepolia',
            amount: '0.1 ETH',
            requirements: 'Connect wallet',
          },
        ],
        walletAddress,
      }, { status: 400 })
    }
    
    // Import CDP SDK
    const { Coinbase, Wallet } = await import('@coinbase/coinbase-sdk')
    
    // Initialize
    const coinbase = new Coinbase({
      apiKeyName,
      privateKey: apiKeySecret,
    })
    
    // Try to fund using CDP faucet
    try {
      // The CDP SDK has a built-in faucet for testnet
      const wallet = await Wallet.fetch(process.env.BASE_WALLET_ID || '')
      
      // Request funds from faucet
      const faucetTx = await wallet.faucet()
      
      return NextResponse.json({
        success: true,
        message: 'Wallet funded successfully!',
        walletAddress,
        transaction: faucetTx,
      })
    } catch (faucetError) {
      // Faucet may not be available, return manual options
      return NextResponse.json({
        message: 'Automatic funding not available. Use a manual faucet:',
        manualFaucets: [
          {
            name: 'LearnWeb3 Faucet (Recommended)',
            url: 'https://learnweb3.io/faucets/base_sepolia/',
            amount: '0.01 ETH/day',
            requirements: 'GitHub login',
          },
          {
            name: 'Alchemy Faucet',
            url: 'https://www.alchemy.com/faucets/base-sepolia',
            amount: '0.1 ETH',
            requirements: 'Free Alchemy account',
          },
          {
            name: 'Chainlink Faucet',
            url: 'https://faucets.chain.link/base-sepolia',
            amount: '0.1 ETH',
            requirements: 'Connect wallet or paste address',
          },
        ],
        walletAddress,
        instructions: `Paste this address into any faucet: ${walletAddress}`,
      })
    }
    
  } catch (error) {
    console.error('Fund wallet error:', error)
    return NextResponse.json({
      error: 'Failed to fund wallet',
      details: error instanceof Error ? error.message : String(error),
      manualFaucets: [
        'https://learnweb3.io/faucets/base_sepolia/',
        'https://www.alchemy.com/faucets/base-sepolia',
        'https://faucets.chain.link/base-sepolia',
      ],
    }, { status: 500 })
  }
}
