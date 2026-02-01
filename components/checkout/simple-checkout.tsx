'use client'

/**
 * Simple Checkout Component
 * 
 * Stripe-like UX with USDC settlement on Base.
 * - Card payments feel like any e-commerce checkout
 * - USDC option for crypto-native users (2.5% discount)
 * - All payments settle to USDC on Base
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Wallet, 
  CheckCircle, 
  Loader2, 
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

interface SimpleCheckoutProps {
  amount: number
  serviceName: string
  providerName?: string
  orderId: string
  providerId: string
  onSuccess?: (result: CheckoutResult) => void
  onCancel?: () => void
}

interface CheckoutResult {
  success: boolean
  paymentId: string
  method: 'card' | 'usdc'
  txHash?: string
}

export function SimpleCheckout({
  amount,
  serviceName,
  providerName,
  orderId,
  providerId,
  onSuccess,
  onCancel,
}: SimpleCheckoutProps) {
  const [method, setMethod] = useState<'card' | 'usdc'>('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'select' | 'card' | 'usdc' | 'success'>('select')
  const [error, setError] = useState<string | null>(null)
  
  // Card form
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  })
  
  // Calculate USDC discount
  const usdcDiscount = 0.025 // 2.5%
  const usdcPrice = amount * (1 - usdcDiscount)
  const savings = amount - usdcPrice
  
  const handleMethodSelect = (value: 'card' | 'usdc') => {
    setMethod(value)
    setError(null)
  }
  
  const handleContinue = () => {
    setStep(method)
  }
  
  const handleCardPayment = async () => {
    // Basic validation
    if (!cardForm.number || !cardForm.expiry || !cardForm.cvc || !cardForm.name) {
      setError('Please fill in all card details')
      return
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // In production, this would use Stripe Elements
      // For demo, we simulate the payment
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          method: 'card',
          orderId,
          providerId,
          serviceType: 'consultation',
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setStep('success')
        onSuccess?.({
          success: true,
          paymentId: data.paymentId,
          method: 'card',
        })
      } else {
        setError(data.error || 'Payment failed')
      }
    } catch (err) {
      setError('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleUsdcPayment = async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: usdcPrice,
          method: 'usdc_direct',
          orderId,
          providerId,
          serviceType: 'consultation',
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // In production, this would trigger wallet connection and transaction
        setStep('success')
        onSuccess?.({
          success: true,
          paymentId: data.paymentId,
          method: 'usdc',
        })
      } else {
        setError(data.error || 'Payment failed')
      }
    } catch (err) {
      setError('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Success view
  if (step === 'success') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Payment Successful</h3>
          <p className="text-muted-foreground mb-4">
            Your payment of ${method === 'usdc' ? usdcPrice.toFixed(2) : amount.toFixed(2)} has been confirmed.
          </p>
          <p className="text-sm text-muted-foreground">
            {serviceName} with {providerName}
          </p>
        </CardContent>
      </Card>
    )
  }
  
  // Card payment view
  if (step === 'card') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Card Payment
          </CardTitle>
          <CardDescription>
            ${amount.toFixed(2)} for {serviceName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name on Card</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={cardForm.name}
              onChange={(e) => setCardForm(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="number">Card Number</Label>
            <Input
              id="number"
              placeholder="4242 4242 4242 4242"
              value={cardForm.number}
              onChange={(e) => setCardForm(prev => ({ ...prev, number: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={cardForm.expiry}
                onChange={(e) => setCardForm(prev => ({ ...prev, expiry: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                placeholder="123"
                value={cardForm.cvc}
                onChange={(e) => setCardForm(prev => ({ ...prev, cvc: e.target.value }))}
              />
            </div>
          </div>
          
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleCardPayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lock className="mr-2 h-4 w-4" />
            )}
            Pay ${amount.toFixed(2)}
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => setStep('select')}
          >
            Back
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            <Lock className="inline h-3 w-3 mr-1" />
            Secured by Stripe • Settles in USDC
          </p>
        </CardContent>
      </Card>
    )
  }
  
  // USDC payment view
  if (step === 'usdc') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-500" />
            Pay with USDC
          </CardTitle>
          <CardDescription>
            ${usdcPrice.toFixed(2)} USDC on Base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">You're saving ${savings.toFixed(2)}</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              2.5% discount for paying with USDC
            </p>
          </div>
          
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">${usdcPrice.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">USDC on Base</p>
          </div>
          
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            size="lg"
            onClick={handleUsdcPayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="mr-2 h-4 w-4" />
            )}
            Connect Wallet & Pay
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => setStep('select')}
          >
            Back
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Coinbase Wallet • MetaMask • WalletConnect
          </p>
        </CardContent>
      </Card>
    )
  }
  
  // Method selection view (default)
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>
          {serviceName} {providerName && `with ${providerName}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount */}
        <div className="text-center py-4">
          <p className="text-4xl font-bold">${amount.toFixed(2)}</p>
        </div>
        
        <Separator />
        
        {/* Payment method selection */}
        <RadioGroup value={method} onValueChange={(v) => handleMethodSelect(v as 'card' | 'usdc')}>
          {/* Card option */}
          <label
            className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
              method === 'card' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="card" id="card" />
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Credit / Debit Card</p>
                  <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
                </div>
              </div>
            </div>
            <span className="font-bold">${amount.toFixed(2)}</span>
          </label>
          
          {/* USDC option */}
          <label
            className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
              method === 'usdc' ? 'border-blue-500 bg-blue-50' : 'border-muted hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="usdc" id="usdc" />
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">$</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">USDC on Base</p>
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      Save 2.5%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Fast, low-fee crypto payment</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-green-600">${usdcPrice.toFixed(2)}</span>
              <p className="text-xs text-muted-foreground line-through">${amount.toFixed(2)}</p>
            </div>
          </label>
        </RadioGroup>
        
        {/* Continue button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleContinue}
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        
        {onCancel && (
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        
        {/* Settlement note */}
        <p className="text-xs text-center text-muted-foreground">
          All payments settle securely on Base blockchain
        </p>
      </CardContent>
    </Card>
  )
}

export default SimpleCheckout
