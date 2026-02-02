'use client'

/**
 * Attestation Admin Page
 * 
 * One-time setup for registering EAS schemas on Base Mainnet.
 */

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Loader2, ExternalLink, Copy, Shield } from 'lucide-react'

const SCHEMA = 'string npi,string name,string specialty,bool npiVerified,bool oigCleared,bool samCleared,bool licenseVerified,uint64 verificationDate'

const EAS_CONFIG = {
  schemaRegistry: '0x4200000000000000000000000000000000000020',
  eas: '0x4200000000000000000000000000000000000021',
  explorerUrl: 'https://base.easscan.org',
  chainId: '0x2105', // 8453 in hex
}

export default function AttestationsAdminPage() {
  const [mounted, setMounted] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [schemaUid, setSchemaUid] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const ethereum = (window as any).ethereum
      if (!ethereum) return
      
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0])
      }
    } catch {
      // Not connected
    }
  }

  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)
    
    try {
      const ethereum = (window as any).ethereum
      if (!ethereum) {
        setError('No wallet detected. Install Coinbase Wallet or MetaMask.')
        return
      }
      
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0])
        
        // Switch to Base Mainnet
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: EAS_CONFIG.chainId }],
          })
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: EAS_CONFIG.chainId,
                chainName: 'Base',
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              }],
            })
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const registerSchema = async () => {
    if (!walletAddress) return
    
    setIsRegistering(true)
    setError(null)
    
    try {
      const ethereum = (window as any).ethereum
      
      // Schema Registry ABI for register function
      const iface = new (await import('ethers')).Interface([
        'function register(string schema, address resolver, bool revocable) returns (bytes32)',
      ])
      
      // Encode the function call
      const data = iface.encodeFunctionData('register', [
        SCHEMA,
        '0x0000000000000000000000000000000000000000', // No resolver
        true, // Revocable
      ])
      
      // Send transaction
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: EAS_CONFIG.schemaRegistry,
          data: data,
        }],
      })
      
      // Wait for confirmation
      setError('Transaction submitted! Waiting for confirmation...')
      
      // Poll for receipt
      let receipt = null
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000))
        receipt = await ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        })
        if (receipt) break
      }
      
      if (receipt && receipt.status === '0x1') {
        // Get schema UID from logs
        // The Registered event has the UID as the first indexed parameter
        const uidFromLog = receipt.logs?.[0]?.topics?.[1]
        
        if (uidFromLog) {
          setSchemaUid(uidFromLog)
          setError(null)
        } else {
          // Compute UID manually
          const { keccak256, AbiCoder } = await import('ethers')
          const uid = keccak256(
            AbiCoder.defaultAbiCoder().encode(
              ['string', 'address', 'bool'],
              [SCHEMA, '0x0000000000000000000000000000000000000000', true]
            )
          )
          setSchemaUid(uid)
          setError(null)
        }
      } else {
        setError('Transaction failed. Please try again.')
      }
    } catch (err: any) {
      console.error('Register error:', err)
      setError(err.message || 'Failed to register schema')
    } finally {
      setIsRegistering(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 82, 255, 0.1)' }}>
            <Shield className="h-8 w-8" style={{ color: '#0052FF' }} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Attestation Setup</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Register the provider verification schema on Base Mainnet
          </p>
        </div>

        {/* Schema Display */}
        <div className="p-6 rounded-xl mb-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <h2 className="text-lg font-semibold mb-3">Provider Verification Schema</h2>
          <code className="block p-4 rounded-lg text-sm break-all" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            {SCHEMA}
          </code>
          <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            This schema defines what data is included in provider attestations.
          </p>
        </div>

        {/* Success State */}
        {schemaUid && (
          <div className="p-6 rounded-xl mb-6" style={{ backgroundColor: 'rgba(107, 155, 107, 0.1)', border: '1px solid rgba(107, 155, 107, 0.3)' }}>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 flex-shrink-0" style={{ color: '#6b9b6b' }} />
              <div className="flex-1">
                <h3 className="font-semibold text-lg" style={{ color: '#6b9b6b' }}>Schema Registered!</h3>
                <p className="mt-2 mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Copy this Schema UID to your Vercel environment variables:
                </p>
                
                <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>EAS_SCHEMA_UID_MAINNET</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm break-all font-mono">{schemaUid}</code>
                    <button
                      onClick={() => copyToClipboard(schemaUid)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}
                    >
                      {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <a
                  href={`${EAS_CONFIG.explorerUrl}/schema/view/${schemaUid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm"
                  style={{ color: '#0052FF' }}
                >
                  View on EAS Scan <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !schemaUid && (
          <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: 'rgba(220, 100, 100, 0.1)', border: '1px solid rgba(220, 100, 100, 0.3)' }}>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#dc6464' }} />
              <p style={{ color: '#dc6464' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!schemaUid && (
          <div className="space-y-4">
            {!walletAddress ? (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full py-4 text-lg font-semibold rounded-xl transition-colors flex items-center justify-center gap-3"
                style={{ backgroundColor: '#0052FF', color: 'white' }}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Admin Wallet'
                )}
              </button>
            ) : (
              <>
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Connected Wallet</p>
                  <p className="font-mono">{walletAddress}</p>
                </div>
                
                <button
                  onClick={registerSchema}
                  disabled={isRegistering}
                  className="w-full py-4 text-lg font-semibold rounded-xl transition-colors flex items-center justify-center gap-3"
                  style={{ backgroundColor: '#0052FF', color: 'white' }}
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Registering Schema...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      Register Schema on Base Mainnet
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold mb-4">Setup Instructions</h3>
          <ol className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ backgroundColor: 'var(--bg-tertiary)' }}>1</span>
              Connect a wallet with ETH on Base Mainnet (~$0.01 for gas)
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ backgroundColor: 'var(--bg-tertiary)' }}>2</span>
              Click "Register Schema" and approve the transaction
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ backgroundColor: 'var(--bg-tertiary)' }}>3</span>
              Copy the Schema UID to your Vercel environment variables
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ backgroundColor: 'var(--bg-tertiary)' }}>4</span>
              Also set <code className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>ATTESTATION_PRIVATE_KEY</code> for creating attestations
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
