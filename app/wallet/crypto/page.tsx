"use client"

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { MinimalNavigation } from '@/components/layout/minimal-navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StandardizedButton } from '@/components/ui/standardized-button'
import { Badge } from '@/components/ui/badge'
import { 
  Wallet, 
  Send, 
  History, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react'

// Dynamically import wallet components to avoid SSR issues
const WalletConnectButton = dynamic(
  () => import('@/components/wallet/wallet-connect-button').then(mod => mod.WalletConnectButton),
  { 
    ssr: false,
    loading: () => <StandardizedButton disabled>Loading...</StandardizedButton>
  }
)

const WalletDashboard = dynamic(
  () => import('./wallet-dashboard'),
  { ssr: false }
)

export default function CryptoWalletPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const features = [
    {
      icon: Shield,
      title: "Self-Custody",
      description: "You control your funds"
    },
    {
      icon: Zap,
      title: "Instant Payments",
      description: "No waiting for bank transfers"
    },
    {
      icon: TrendingUp,
      title: "Low Fees",
      description: "Save on transaction costs"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <Wallet className="h-4 w-4" />
            Crypto Wallet
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">
            Your Healthcare Wallet
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Manage your crypto payments for healthcare services on the Base blockchain.
          </p>
        </div>

        {!mounted ? (
          // Loading state
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12">
              <div className="flex justify-center">
                <StandardizedButton disabled>
                  <Wallet className="h-4 w-4 mr-2" />
                  Loading Wallet...
                </StandardizedButton>
              </div>
            </CardContent>
          </Card>
        ) : (
          <WalletDashboard features={features} />
        )}
      </main>
    </div>
  )
}