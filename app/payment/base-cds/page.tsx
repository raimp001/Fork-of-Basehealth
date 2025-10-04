"use client"

/**
 * Base Payment Page with Official CDS Components
 * Showcase using @coinbase/cds-web components
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BaseCDSPaymentV2 } from '@/components/payment/base-cds-payment-v2'
import { Box, VStack, HStack } from '@coinbase/cds-web/layout'
import { Text } from '@coinbase/cds-web/typography'
import { Button } from '@coinbase/cds-web/buttons'
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

export default function BaseCDSPaymentPage() {
  const router = useRouter()
  const [selectedTier, setSelectedTier] = useState<keyof typeof PAYMENT_TIERS>('VIRTUAL_CONSULTATION')

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

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header with CDS Components */}
      <VStack gap="4" alignItems="center" style={{ marginBottom: '32px' }}>
        <HStack gap="2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Powered by Base
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            CDS Official
          </Badge>
        </HStack>
        <Text size="xxxlarge" weight="bold" align="center">
          Base Blockchain Payments
        </Text>
        <Text size="large" color="secondary" align="center" style={{ maxWidth: '800px' }}>
          Pay for healthcare services with crypto on Base - Fast, secure, and affordable
        </Text>
      </VStack>

      {/* Benefits Section with CDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <VStack gap="2" alignItems="center">
              <Zap className="h-8 w-8 text-blue-600" />
              <Text weight="bold" align="center">Lightning Fast</Text>
              <Text size="small" color="secondary" align="center">~2 second confirmations</Text>
            </VStack>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <VStack gap="2" alignItems="center">
              <TrendingDown className="h-8 w-8 text-green-600" />
              <Text weight="bold" align="center">Ultra Low Fees</Text>
              <Text size="small" color="secondary" align="center">&lt;$0.01 per transaction</Text>
            </VStack>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <VStack gap="2" alignItems="center">
              <Shield className="h-8 w-8 text-purple-600" />
              <Text weight="bold" align="center">Secure</Text>
              <Text size="small" color="secondary" align="center">Base L2 blockchain</Text>
            </VStack>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <VStack gap="2" alignItems="center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <Text weight="bold" align="center">Stablecoins</Text>
              <Text size="small" color="secondary" align="center">Pay with USDC or ETH</Text>
            </VStack>
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

          {/* Info Card */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Official CDS Components</AlertTitle>
            <AlertDescription className="text-xs">
              This page uses official Coinbase Design System components from{' '}
              <a href="https://cds.coinbase.com" target="_blank" rel="noopener noreferrer" className="underline">
                cds.coinbase.com
              </a>
            </AlertDescription>
          </Alert>
        </div>

        {/* Payment Component - Using Official CDS */}
        <div className="lg:col-span-2">
          <BaseCDSPaymentV2
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
            Powered by Coinbase Design System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VStack gap="3">
            <Text size="small" color="secondary">
              This interface uses official components from <strong>@coinbase/cds-web</strong> including:
            </Text>
            <HStack gap="2" style={{ flexWrap: 'wrap' }}>
              <Badge variant="outline">Button</Badge>
              <Badge variant="outline">HStack / VStack</Badge>
              <Badge variant="outline">Box</Badge>
              <Badge variant="outline">Text</Badge>
              <Badge variant="outline">Spinner</Badge>
              <Badge variant="outline">ThemeProvider</Badge>
            </HStack>
            <Text size="xsmall" color="secondary">
              Learn more at <a href="https://cds.coinbase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">cds.coinbase.com</a>
            </Text>
          </VStack>
        </CardContent>
      </Card>
    </div>
  )
}

