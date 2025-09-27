"use client"

import { useAccount, useBalance } from 'wagmi'
import { formatUnits } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WalletConnectButton } from '@/components/wallet/wallet-connect-button'
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
import { paymentConfig } from '@/lib/coinbase-config'

interface WalletDashboardProps {
  features: Array<{
    icon: any
    title: string
    description: string
  }>
}

export default function WalletDashboard({ features }: WalletDashboardProps) {
  const { address, isConnected } = useAccount()
  
  // Get USDC balance
  const { data: usdcBalance } = useBalance({
    address,
    token: paymentConfig.supportedTokens[0].address as `0x${string}`,
  })
  
  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address,
  })

  // Mock transaction history
  const transactions = [
    {
      id: '1',
      type: 'payment',
      description: 'Virtual Consultation',
      amount: '75.00',
      currency: 'USDC',
      status: 'completed',
      date: new Date(Date.now() - 86400000),
      txHash: '0x123...abc'
    },
    {
      id: '2',
      type: 'payment',
      description: 'Caregiver Booking (4 hours)',
      amount: '140.00',
      currency: 'USDC',
      status: 'completed',
      date: new Date(Date.now() - 172800000),
      txHash: '0x456...def'
    },
    {
      id: '3',
      type: 'refund',
      description: 'Cancelled Appointment Refund',
      amount: '150.00',
      currency: 'USDC',
      status: 'completed',
      date: new Date(Date.now() - 259200000),
      txHash: '0x789...ghi'
    }
  ]

  if (!isConnected) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>
            Connect your wallet to view balances and make payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <WalletConnectButton />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet Balance</CardTitle>
            <CardDescription>
              Your available funds on Base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usdcBalance && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">USDC Balance</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${parseFloat(formatUnits(usdcBalance.value, usdcBalance.decimals)).toFixed(2)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              )}
              
              {ethBalance && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">ETH Balance</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {parseFloat(formatUnits(ethBalance.value, ethBalance.decimals)).toFixed(4)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex gap-3">
              <StandardizedButton variant="primary" className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Send Payment
              </StandardizedButton>
              <StandardizedButton variant="secondary" className="flex-1">
                <CreditCard className="h-4 w-4 mr-2" />
                Add Funds
              </StandardizedButton>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <CardDescription>
              Your recent healthcare payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      tx.type === 'payment' ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {tx.type === 'payment' ? (
                        <ArrowUpRight className="h-5 w-5 text-red-600" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {tx.date.toLocaleDateString()}
                        </span>
                        <span className="text-xs font-mono text-gray-500">
                          {tx.txHash}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      tx.type === 'payment' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {tx.type === 'payment' ? '-' : '+'}${tx.amount}
                    </p>
                    <p className="text-sm text-gray-600">{tx.currency}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <StandardizedButton variant="secondary" className="w-full mt-4">
              View All Transactions
            </StandardizedButton>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StandardizedButton variant="secondary" className="w-full justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Pay for Appointment
            </StandardizedButton>
            <StandardizedButton variant="secondary" className="w-full justify-start">
              <Send className="h-4 w-4 mr-2" />
              Send to Provider
            </StandardizedButton>
            <StandardizedButton variant="secondary" className="w-full justify-start">
              <History className="h-4 w-4 mr-2" />
              Export Statements
            </StandardizedButton>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Shield className="h-4 w-4" />
                <span>Wallet Connected Securely</span>
              </div>
              <p className="text-sm text-gray-600">
                Your wallet is protected by blockchain security. Never share your private keys.
              </p>
              <StandardizedButton variant="secondary" className="w-full">
                Security Settings
              </StandardizedButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
