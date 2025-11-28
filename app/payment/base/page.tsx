"use client"

/**
 * Base Payment Page
 * Showcase for Base blockchain payments with USDC/ETH
 * Integrated with HTTP 402 protocol and Coinbase Design System
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MinimalNavigation } from '@/components/layout/minimal-navigation'
import { BaseCDSPayment } from '@/components/payment/base-cds-payment'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Sparkles,
  Zap,
  Shield,
  DollarSign,
  Clock,
  TrendingDown,
  CheckCircle,
  Info,
  Stethoscope,
  Brain,
  FileText,
  Crown,
} from 'lucide-react'
import { PAYMENT_TIERS, type PaymentProof } from '@/lib/http-402-service'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading'

export default function BasePaymentPage() {
  const router = useRouter()
  const [selectedTier, setSelectedTier] = useState<keyof typeof PAYMENT_TIERS>('VIRTUAL_CONSULTATION')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePaymentSuccess = async (proof: PaymentProof) => {
    try {
      // Verify payment with backend
      const response = await fetch('/api/payments/402/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proof,
          requirement: PAYMENT_TIERS[selectedTier],
        }),
      })

      if (!response.ok) {
        throw new Error('Payment verification failed')
      }

      const result = await response.json()
      
      toast.success('Payment Verified!', {
        description: `Access granted to ${PAYMENT_TIERS[selectedTier].description}`,
      })

      // Redirect based on resource type
      setTimeout(() => {
        if (selectedTier.includes('CONSULTATION')) {
          router.push('/appointment')
        } else if (selectedTier.includes('PREMIUM')) {
          router.push('/settings')
        } else if (selectedTier.includes('AI')) {
          router.push('/health-insights')
        } else if (selectedTier.includes('MEDICAL_RECORDS')) {
          router.push('/medical-records')
        }
      }, 2000)

    } catch (error) {
      toast.error('Verification Failed', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const handlePaymentError = (error: Error) => {
    toast.error('Payment Failed', {
      description: error.message,
    })
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <MinimalNavigation />
        <div className="container mx-auto py-8 px-4 max-w-7xl flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-stone-600">Loading payment page...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <MinimalNavigation />
      <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8 text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Powered by Base
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            HTTP 402 Protocol
          </Badge>
        </div>
        <h1 className="text-4xl font-bold">Fast, Secure Payouts</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Low fees, instant settlement, no chargebacks. Powered by Base blockchain.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold mb-1">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">~2 second confirmations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingDown className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold mb-1">Ultra Low Fees</h3>
            <p className="text-sm text-muted-foreground">&lt;$0.01 per transaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold mb-1">Secure</h3>
            <p className="text-sm text-muted-foreground">Base L2 blockchain</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-stone-600" />
            <h3 className="font-semibold mb-1">Stablecoins</h3>
            <p className="text-sm text-muted-foreground">Pay with USDC or ETH</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Payment Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Service Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Service</CardTitle>
              <CardDescription>Choose what you'd like to pay for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Tabs orientation="vertical" value={selectedTier} onValueChange={(v) => setSelectedTier(v as keyof typeof PAYMENT_TIERS)}>
                <TabsList className="grid grid-cols-1 h-auto gap-1">
                  {/* Consultations */}
                  <div className="text-xs font-semibold text-muted-foreground px-2 py-1">Healthcare</div>
                  <TabsTrigger value="VIRTUAL_CONSULTATION" className="justify-start">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    <div className="text-left flex-1">
                      <div>Virtual Consult</div>
                      <div className="text-xs text-muted-foreground">${PAYMENT_TIERS.VIRTUAL_CONSULTATION.amount} USDC</div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="IN_PERSON_CONSULTATION" className="justify-start">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    <div className="text-left flex-1">
                      <div>In-Person Consult</div>
                      <div className="text-xs text-muted-foreground">${PAYMENT_TIERS.IN_PERSON_CONSULTATION.amount} USDC</div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="SPECIALIST_CONSULTATION" className="justify-start">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    <div className="text-left flex-1">
                      <div>Specialist</div>
                      <div className="text-xs text-muted-foreground">${PAYMENT_TIERS.SPECIALIST_CONSULTATION.amount} USDC</div>
                    </div>
                  </TabsTrigger>

                  {/* Premium Features */}
                  <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mt-2">Premium</div>
                  <TabsTrigger value="PREMIUM_MONTH" className="justify-start">
                    <Crown className="h-4 w-4 mr-2" />
                    <div className="text-left flex-1">
                      <div>Premium (Month)</div>
                      <div className="text-xs text-muted-foreground">${PAYMENT_TIERS.PREMIUM_MONTH.amount} USDC</div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="PREMIUM_YEAR" className="justify-start">
                    <Crown className="h-4 w-4 mr-2" />
                    <div className="text-left flex-1">
                      <div>Premium (Year)</div>
                      <div className="text-xs text-muted-foreground">${PAYMENT_TIERS.PREMIUM_YEAR.amount} USDC</div>
                    </div>
                  </TabsTrigger>

                  {/* AI & Records */}
                  <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mt-2">AI & Records</div>
                  <TabsTrigger value="MEDICAL_RECORDS" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    <div className="text-left flex-1">
                      <div>Medical Records</div>
                      <div className="text-xs text-muted-foreground">${PAYMENT_TIERS.MEDICAL_RECORDS.amount} USDC</div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="AI_DIAGNOSIS" className="justify-start">
                    <Brain className="h-4 w-4 mr-2" />
                    <div className="text-left flex-1">
                      <div>AI Diagnosis</div>
                      <div className="text-xs text-muted-foreground">${PAYMENT_TIERS.AI_DIAGNOSIS.amount} USDC</div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="AI_SECOND_OPINION" className="justify-start">
                    <Brain className="h-4 w-4 mr-2" />
                    <div className="text-left flex-1">
                      <div>AI Second Opinion</div>
                      <div className="text-xs text-muted-foreground">${PAYMENT_TIERS.AI_SECOND_OPINION.amount} USDC</div>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">What is Base blockchain?</h4>
                <p className="text-sm text-muted-foreground">
                  Base is Coinbase's Layer 2 blockchain built on Ethereum. It offers fast, low-cost transactions while maintaining security through Ethereum's network.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Do I need crypto to pay?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, you'll need USDC (a stablecoin) or ETH in a crypto wallet. You can purchase crypto through Coinbase or other exchanges, then transfer to your wallet.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">How do I get started?</h4>
                <p className="text-sm text-muted-foreground">
                  Connect a crypto wallet (like MetaMask or Coinbase Wallet), ensure you're on the Base network, and have USDC or ETH available. The payment component will guide you through the process.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Component */}
        <div className="lg:col-span-2">
          <BaseCDSPayment
            requirement={PAYMENT_TIERS[selectedTier]}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            showHeader={true}
            compact={false}
          />

          {/* Features List */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                What's Included
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {selectedTier.includes('CONSULTATION') && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Professional medical consultation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Prescription if needed
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Follow-up recommendations
                    </li>
                  </>
                )}
                {selectedTier.includes('PREMIUM') && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Unlimited AI health insights
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Priority appointment booking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      24/7 chat support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Advanced health tracking
                    </li>
                  </>
                )}
                {selectedTier.includes('AI') && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      AI-powered analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Detailed health report
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Personalized recommendations
                    </li>
                  </>
                )}
                {selectedTier.includes('MEDICAL_RECORDS') && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Full medical history access
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Download all records
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Share with providers
                    </li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Technical Details */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Technical Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Network</h4>
              <p className="text-muted-foreground">
                Base {process.env.NODE_ENV === 'production' ? 'Mainnet' : 'Sepolia Testnet'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Supported Currencies</h4>
              <p className="text-muted-foreground">USDC, ETH</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Protocol</h4>
              <p className="text-muted-foreground">HTTP 402 Payment Required</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

