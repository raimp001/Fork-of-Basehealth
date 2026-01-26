/**
 * Payment Wallet Setup Script
 * 
 * Creates a Base wallet using Coinbase CDP for receiving payments.
 * Run with: npx ts-node scripts/setup-payment-wallets.ts
 */

import { Coinbase, Wallet } from '@coinbase/coinbase-sdk'

async function setupBaseWallet() {
  console.log('🔧 Setting up Base payment wallet...\n')
  
  // Check for CDP credentials
  const apiKeyName = process.env.CDP_API_KEY_NAME
  const apiKeySecret = process.env.CDP_API_KEY_SECRET
  
  if (!apiKeyName || !apiKeySecret) {
    console.error('❌ CDP_API_KEY_NAME and CDP_API_KEY_SECRET must be set in .env.local')
    process.exit(1)
  }
  
  try {
    // Initialize Coinbase SDK
    const coinbase = new Coinbase({
      apiKeyName,
      privateKey: apiKeySecret,
    })
    
    console.log('✅ Connected to Coinbase CDP\n')
    
    // Create a new wallet on Base Sepolia (testnet) or Base Mainnet
    const network = process.env.NODE_ENV === 'production' ? 'base-mainnet' : 'base-sepolia'
    console.log(`📍 Creating wallet on ${network}...\n`)
    
    const wallet = await Wallet.create({ networkId: network })
    
    // Get the default address
    const address = await wallet.getDefaultAddress()
    
    console.log('=' .repeat(60))
    console.log('🎉 WALLET CREATED SUCCESSFULLY!')
    console.log('=' .repeat(60))
    console.log('')
    console.log(`Network: ${network}`)
    console.log(`Wallet ID: ${wallet.getId()}`)
    console.log(`Address: ${address.getId()}`)
    console.log('')
    console.log('=' .repeat(60))
    console.log('📋 ADD THIS TO YOUR .env.local:')
    console.log('=' .repeat(60))
    console.log('')
    console.log(`NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS="${address.getId()}"`)
    console.log('')
    console.log('=' .repeat(60))
    console.log('')
    console.log('⚠️  IMPORTANT: Save your wallet ID securely!')
    console.log(`    Wallet ID: ${wallet.getId()}`)
    console.log('')
    console.log('💡 To fund your testnet wallet, use the Base Sepolia faucet:')
    console.log('   https://www.coinbase.com/faucets/base-ethereum-goerli-faucet')
    console.log('')
    
    // Export wallet data for backup
    const walletData = wallet.export()
    console.log('🔐 Wallet Export (KEEP SECURE):')
    console.log(JSON.stringify(walletData, null, 2))
    
    return address.getId()
    
  } catch (error) {
    console.error('❌ Error creating wallet:', error)
    throw error
  }
}

// Run if called directly
setupBaseWallet()
  .then((address) => {
    console.log('\n✅ Setup complete! Your payment address:', address)
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message)
    process.exit(1)
  })
