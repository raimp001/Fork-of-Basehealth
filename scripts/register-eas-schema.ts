/**
 * EAS Schema Registration Script for Base Mainnet
 * 
 * Run this ONCE to register the provider verification schema on Base Mainnet.
 * After registration, save the Schema UID to your environment variables.
 * 
 * Prerequisites:
 * - Node.js 18+
 * - A wallet with ~0.001 ETH on Base Mainnet for gas
 * 
 * Usage:
 *   npx ts-node scripts/register-eas-schema.ts
 * 
 * Or set the private key as env var:
 *   SCHEMA_REGISTRATION_KEY=0x... npx ts-node scripts/register-eas-schema.ts
 */

import { ethers } from 'ethers'

// Configuration
const CONFIG = {
  // Base Mainnet
  rpcUrl: 'https://mainnet.base.org',
  chainId: 8453,
  
  // EAS Schema Registry on Base
  schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
  
  // Our provider verification schema
  schema: 'string npi,string name,string specialty,bool npiVerified,bool oigCleared,bool samCleared,bool licenseVerified,uint64 verificationDate',
  
  // No resolver (anyone can create attestations with this schema)
  resolver: '0x0000000000000000000000000000000000000000',
  
  // Allow revocation (important for revoking if provider loses license)
  revocable: true,
}

// Schema Registry ABI
const SCHEMA_REGISTRY_ABI = [
  'function register(string calldata schema, address resolver, bool revocable) external returns (bytes32)',
  'function getSchema(bytes32 uid) external view returns (tuple(bytes32 uid, address resolver, bool revocable, string schema))',
  'event Registered(bytes32 indexed uid, address indexed registerer, tuple(bytes32 uid, address resolver, bool revocable, string schema) schema)',
]

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║     BaseHealth EAS Schema Registration - Base Mainnet        ║')
  console.log('╚══════════════════════════════════════════════════════════════╝\n')

  // Get private key from environment or prompt
  const privateKey = process.env.SCHEMA_REGISTRATION_KEY
  
  if (!privateKey) {
    console.log('❌ No private key provided.\n')
    console.log('Set your private key as an environment variable:')
    console.log('  export SCHEMA_REGISTRATION_KEY=0x...\n')
    console.log('Or run with:')
    console.log('  SCHEMA_REGISTRATION_KEY=0x... npx ts-node scripts/register-eas-schema.ts\n')
    console.log('⚠️  The wallet needs ~0.001 ETH on Base Mainnet for gas.\n')
    process.exit(1)
  }

  // Connect to Base Mainnet
  console.log('🔗 Connecting to Base Mainnet...')
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl)
  const wallet = new ethers.Wallet(privateKey, provider)
  
  console.log(`   Wallet: ${wallet.address}`)
  
  // Check balance
  const balance = await provider.getBalance(wallet.address)
  const balanceEth = ethers.formatEther(balance)
  console.log(`   Balance: ${balanceEth} ETH`)
  
  if (balance < ethers.parseEther('0.0001')) {
    console.log('\n❌ Insufficient balance. Need at least 0.0001 ETH for gas.')
    console.log('   Send some ETH to this wallet on Base Mainnet first.')
    process.exit(1)
  }

  // Connect to Schema Registry
  console.log('\n📋 Schema Registry:')
  console.log(`   Address: ${CONFIG.schemaRegistryAddress}`)
  
  const schemaRegistry = new ethers.Contract(
    CONFIG.schemaRegistryAddress,
    SCHEMA_REGISTRY_ABI,
    wallet
  )

  // Display schema
  console.log('\n📝 Schema to register:')
  console.log(`   "${CONFIG.schema}"`)
  console.log(`   Resolver: ${CONFIG.resolver}`)
  console.log(`   Revocable: ${CONFIG.revocable}`)

  // Register schema
  console.log('\n⏳ Registering schema on Base Mainnet...')
  
  try {
    const tx = await schemaRegistry.register(
      CONFIG.schema,
      CONFIG.resolver,
      CONFIG.revocable
    )
    
    console.log(`   Transaction: ${tx.hash}`)
    console.log('   Waiting for confirmation...')
    
    const receipt = await tx.wait()
    
    // Get the schema UID from the event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = schemaRegistry.interface.parseLog(log)
        return parsed?.name === 'Registered'
      } catch {
        return false
      }
    })
    
    let schemaUid: string
    
    if (event) {
      const parsed = schemaRegistry.interface.parseLog(event)
      schemaUid = parsed?.args?.[0] || ''
    } else {
      // Fallback: compute the UID
      schemaUid = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['string', 'address', 'bool'],
          [CONFIG.schema, CONFIG.resolver, CONFIG.revocable]
        )
      )
    }

    console.log('\n✅ Schema registered successfully!\n')
    console.log('╔══════════════════════════════════════════════════════════════╗')
    console.log('║                      SCHEMA UID                              ║')
    console.log('╚══════════════════════════════════════════════════════════════╝')
    console.log(`\n   ${schemaUid}\n`)
    
    console.log('📋 Next Steps:')
    console.log('   1. Copy the Schema UID above')
    console.log('   2. Add to your Vercel environment variables:')
    console.log(`      EAS_SCHEMA_UID_MAINNET=${schemaUid}`)
    console.log('   3. Also add your attestation wallet private key:')
    console.log('      ATTESTATION_PRIVATE_KEY=0x...')
    console.log('\n🔗 View on EAS Scan:')
    console.log(`   https://base.easscan.org/schema/view/${schemaUid}`)
    console.log('\n🔗 View transaction:')
    console.log(`   https://basescan.org/tx/${tx.hash}`)
    
  } catch (error: any) {
    console.error('\n❌ Error registering schema:', error.message)
    
    if (error.message.includes('already registered')) {
      console.log('\n💡 This schema may already be registered.')
      console.log('   Check https://base.easscan.org for existing schemas.')
    }
    
    process.exit(1)
  }
}

main().catch(console.error)
