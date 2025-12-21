"use client"

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MinimalNavigation } from '@/components/layout/minimal-navigation'
import { CryptoPayment } from '@/components/payment/crypto-payment'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StandardizedButton } from '@/components/ui/standardized-button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Wallet, 
  CreditCard, 
  Bitcoin,
  Globe,
  Shield,
  Zap,
  TrendingDown,
  Clock,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default function CryptoPaymentPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'onchain' | 'commerce'>('onchain')
  
  // Get payment details from URL params
  const amount = parseFloat(searchParams.get('amount') || '0')
  const type = searchParams.get('type') as 'consultation' | 'caregiver' | 'subscription' | 'bounty' || 'consultation'
  const description = searchParams.get('description') || 'Healthcare Service Payment'
  const appointmentId = searchParams.get('appointmentId')
  const providerId = searchParams.get('providerId')

  const features = [
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your payment data is secured by blockchain technology"
    },
    {
      icon: Zap,
      title: "Instant Settlement",
      description: "Payments settle in seconds, not days"
    },
    {
      icon: TrendingDown,
      title: "Low Fees",
      description: "Save on transaction fees compared to traditional payments"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Pay from anywhere in the world"
    }
  ]

  const handlePaymentSuccess = (txHash: string) => {
    // Redirect to success page with transaction details
    window.location.href = `/payment/success?tx=${txHash}&type=crypto`
  }

  const handlePaymentError = (error: Error) => {
    // Error handled by toast notification
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <Bitcoin className="h-4 w-4" />
            Crypto Payment
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">
            Pay with Cryptocurrency
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Complete your payment using cryptocurrency on the Base blockchain for lower fees and instant settlement.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="onchain" className="gap-2">
                  <Wallet className="h-4 w-4" />
                  On-Chain Payment
                </TabsTrigger>
                <TabsTrigger value="commerce" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Coinbase Commerce
                </TabsTrigger>
              </TabsList>

              <TabsContent value="onchain" className="mt-6">
                <CryptoPayment
                  amount={amount}
                  description={description}
                  type={type}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  metadata={{
                    appointmentId,
                    providerId,
                  }}
                />
              </TabsContent>

              <TabsContent value="commerce" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Coinbase Commerce
                    </CardTitle>
                    <CardDescription>
                      Pay with multiple cryptocurrencies via Coinbase
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Amount Due</p>
                        <p className="text-2xl font-semibold text-gray-900">${amount.toFixed(2)}</p>
                      </div>
                      <Badge variant="outline">Multiple Cryptos</Badge>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">Accepted Cryptocurrencies</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['Bitcoin', 'Ethereum', 'USDC', 'Litecoin'].map((crypto) => (
                          <div key={crypto} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <div className="w-6 h-6 bg-gray-200 rounded-full" />
                            <span className="text-sm font-medium">{crypto}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <StandardizedButton
                      variant="primary"
                      className="w-full"
                      onClick={() => {
                        // Create Coinbase Commerce charge
                        window.location.href = `/api/payments/coinbase/create-charge?amount=${amount}&type=${type}`
                      }}
                    >
                      Pay with Coinbase Commerce
                    </StandardizedButton>

                    <p className="text-xs text-gray-500 text-center">
                      You'll be redirected to Coinbase to complete payment
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Alternative Payment Methods */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Other Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <StandardizedButton asChild variant="secondary" className="w-full justify-start">
                    <Link href={`/payment?amount=${amount}&type=${type}`}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay with Credit Card
                    </Link>
                  </StandardizedButton>
                  <StandardizedButton asChild variant="secondary" className="w-full justify-start">
                    <Link href="/billing">
                      <Clock className="h-4 w-4 mr-2" />
                      Use Insurance
                    </Link>
                  </StandardizedButton>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Why Pay with Crypto?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{feature.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  New to crypto payments? We're here to help you get started.
                </p>
                <StandardizedButton variant="secondary" className="w-full">
                  View Payment Guide
                </StandardizedButton>
                <StandardizedButton variant="secondary" className="w-full">
                  Contact Support
                </StandardizedButton>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
