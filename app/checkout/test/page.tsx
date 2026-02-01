'use client'

/**
 * Test Checkout Page
 * 
 * Demo page to test the Base Pay integration.
 * Try different service types and amounts.
 */

import { useState } from 'react'
import { BasePayCheckout } from '@/components/checkout/base-pay-checkout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Stethoscope, 
  Heart, 
  FileText, 
  Calendar,
  ArrowLeft,
  ExternalLink,
  Info,
} from 'lucide-react'

// Sample healthcare services
const services = [
  {
    id: 'virtual-consult',
    name: 'Virtual Consultation',
    description: '30-minute video call with a physician',
    price: 75,
    icon: Stethoscope,
    category: 'Consultation',
  },
  {
    id: 'in-person',
    name: 'In-Person Visit',
    description: 'Full examination at clinic',
    price: 150,
    icon: Calendar,
    category: 'Consultation',
  },
  {
    id: 'caregiver-daily',
    name: 'Daily Caregiver',
    description: '8-hour professional care',
    price: 280,
    icon: Heart,
    category: 'Caregiver',
  },
  {
    id: 'records-export',
    name: 'Medical Records Export',
    description: 'Complete health records package',
    price: 25,
    icon: FileText,
    category: 'Records',
  },
]

export default function TestCheckoutPage() {
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null)
  const [paymentComplete, setPaymentComplete] = useState(false)

  // Service selection view
  if (!selectedService) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
              Test Mode - Base Sepolia
            </Badge>
            <h1 className="text-3xl font-bold mb-2">BaseHealth Checkout</h1>
            <p className="text-muted-foreground">
              Select a service to test the Base Pay flow
            </p>
          </div>

          {/* Setup Instructions */}
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-amber-600" />
                Before You Start
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>1. Get test USDC from the <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Circle Faucet <ExternalLink className="h-3 w-3" /></a> (select Base Sepolia)</p>
              <p>2. Make sure you have a Base-compatible wallet (Coinbase Wallet, MetaMask, etc.)</p>
              <p>3. Select a service below to test the checkout</p>
            </CardContent>
          </Card>

          {/* Service Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <Card 
                  key={service.id}
                  className="cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                  onClick={() => setSelectedService(service)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold">{service.name}</h3>
                          <span className="text-lg font-bold text-green-600">
                            ${service.price}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {service.description}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {service.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            This is a test environment. No real payments will be processed.
          </p>
        </div>
      </div>
    )
  }

  // Checkout view
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => {
            setSelectedService(null)
            setPaymentComplete(false)
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to services
        </Button>

        {/* Service summary */}
        {!paymentComplete && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <selectedService.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">{selectedService.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedService.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Base Pay Checkout */}
        <BasePayCheckout
          amount={selectedService.price}
          serviceName={selectedService.name}
          serviceDescription={selectedService.description}
          orderId={`test-${selectedService.id}-${Date.now()}`}
          providerId="test-provider"
          onSuccess={(result) => {
            console.log('Payment successful:', result)
            setPaymentComplete(true)
          }}
          onError={(error) => {
            console.error('Payment error:', error)
          }}
          collectEmail={true}
        />

        {/* Test mode reminder */}
        <div className="mt-6 text-center">
          <Badge variant="outline" className="text-xs">
            🧪 Testnet Mode - Base Sepolia
          </Badge>
        </div>
      </div>
    </div>
  )
}
