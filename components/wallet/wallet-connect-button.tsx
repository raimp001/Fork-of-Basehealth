"use client"

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useBalance } from 'wagmi'
import { StandardizedButton } from '@/components/ui/standardized-button'
import { Badge } from '@/components/ui/badge'
import { Wallet, Copy, ExternalLink, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { formatUnits } from 'viem'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { paymentConfig } from '@/lib/coinbase-config'

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const [copied, setCopied] = useState(false)
  
  // Get USDC balance
  const { data: usdcBalance } = useBalance({
    address,
    token: paymentConfig.supportedTokens[0].address as `0x${string}`,
  })
  
  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address,
  })

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <StandardizedButton 
                    onClick={openConnectModal}
                    variant="primary"
                    className="gap-2"
                  >
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                  </StandardizedButton>
                )
              }

              if (chain.unsupported) {
                return (
                  <StandardizedButton 
                    onClick={openChainModal}
                    variant="error"
                    className="gap-2"
                  >
                    Wrong network
                  </StandardizedButton>
                )
              }

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <StandardizedButton 
                      variant="secondary"
                      className="gap-2"
                    >
                      <Wallet className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {formatAddress(account.address)}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </StandardizedButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>
                      <div className="flex items-center justify-between">
                        <span>Wallet</span>
                        <Badge variant="outline" className="text-xs">
                          {chain.name}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Address */}
                    <DropdownMenuItem 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={copyAddress}
                    >
                      <span className="text-sm font-mono">
                        {formatAddress(account.address)}
                      </span>
                      <Copy className="h-3 w-3" />
                    </DropdownMenuItem>
                    
                    {copied && (
                      <div className="px-2 py-1 text-xs text-green-600">
                        Address copied!
                      </div>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    {/* Balances */}
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      Balances
                    </DropdownMenuLabel>
                    
                    <div className="px-2 py-1 space-y-1">
                      {usdcBalance && (
                        <div className="flex items-center justify-between text-sm">
                          <span>USDC</span>
                          <span className="font-mono">
                            ${parseFloat(formatUnits(usdcBalance.value, usdcBalance.decimals)).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {ethBalance && (
                        <div className="flex items-center justify-between text-sm">
                          <span>ETH</span>
                          <span className="font-mono">
                            {parseFloat(formatUnits(ethBalance.value, ethBalance.decimals)).toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Actions */}
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => window.open(`https://basescan.org/address/${account.address}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Explorer
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={openAccountModal}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
