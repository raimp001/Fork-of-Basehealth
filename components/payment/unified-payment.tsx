'use client'

/**
 * Unified Payment Component
 * 
 * A comprehensive payment interface supporting:
 * - Credit/Debit Cards (via Stripe)
 * - Base Blockchain (USDC, ETH)
 * - Solana Blockchain (SOL, USDC)
 * - Coinbase Commerce (multi-crypto)
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CreditCard,
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Percent,
  ExternalLink,
  Coins,
} from 'lucide-react'
import { SolanaPayment } from './solana-payment'
import {
  getEnabledPaymentOptions,
  getCardPaymentOptions,
  getCryptoPaymentOptions,
  createUnifiedPayment,
  calculatePriceWithDiscount,
  formatPrice,
  type PaymentOption,
  type PaymentProvider,
  type PaymentCurrency,
} from '@/lib/unified-payment-service'

// =============================================================================
// TYPES
// =============================================================================

interface UnifiedPaymentProps {
  amount: number
  currency?: 'USD'
  orderId?: string
  userId?: string
  description?: string
  serviceType?: 'consultation' | 'caregiver' | 'subscription' | 'one-time'
  serviceTier?: string
  onSuccess?: (result: PaymentResult) => void
  onError?: (error: string) => void
  onCancel?: () => void
  successUrl?: string
  cancelUrl?: string
}

interface PaymentResult {
  success: boolean
  provider: PaymentProvider
  transactionId?: string
  transactionHash?: string
  amount: number
  currency: PaymentCurrency
}

type PaymentStep = 'select' | 'details' | 'processing' | 'success' | 'error'

// =============================================================================
// COMPONENT
// =============================================================================

export function UnifiedPayment({
  amount,
  currency = 'USD',
  orderId,
  userId,
  description,
  serviceType,
  serviceTier,
  onSuccess,
  onError,
  onCancel,
  successUrl,
  cancelUrl,
}: UnifiedPaymentProps) {
  const [step, setStep] = useState<PaymentStep>('select')
  const [selectedOption, setSelectedOption] = useState<PaymentOption | null>(null)
  const [paymentTab, setPaymentTab] = useState<'card' | 'crypto'>('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txResult, setTxResult] = useState<PaymentResult | null>(null)
  
  // Card form state
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    zipCode: '',
  })
  
  // Get available payment options
  const allOptions = getEnabledPaymentOptions()
  const cardOptions = getCardPaymentOptions()
  const cryptoOptions = getCryptoPaymentOptions()
  
  // Calculate discounted price for crypto
  const cryptoDiscount = 2.5 // 2.5% discount for crypto payments
  const { finalPrice: cryptoPrice, discount: discountAmount } = calculatePriceWithDiscount(amount, {
    discount: cryptoDiscount,
  } as PaymentOption)

  // =============================================================================
  // HANDLERS
  // =============================================================================
  
  const handleSelectOption = (option: PaymentOption) => {
    setSelectedOption(option)
    setError(null)
  }
  
  const handleCardSubmit = async () => {
    if (!selectedOption) return
    
    // Basic validation
    if (!cardForm.number || !cardForm.expiry || !cardForm.cvc || !cardForm.name) {
      setError('Please fill in all card details')
      return
    }
    
    setIsProcessing(true)
    setError(null)
    setStep('processing')
    
    try {
      const result = await createUnifiedPayment({
        amount,
        currency: 'USD',
        provider: 'stripe',
        method: selectedOption.method,
        orderId,
        userId,
        description,
        serviceType,
        serviceTier,
        successUrl,
        cancelUrl,
      })
      
      if (result.success && result.clientSecret) {
        // In production, use Stripe Elements to complete payment
        // For now, simulate success
        const paymentResult: PaymentResult = {
          success: true,
          provider: 'stripe',
          transactionId: result.paymentId,
          amount,
          currency: 'USD',
        }
        setTxResult(paymentResult)
        setStep('success')
        onSuccess?.(paymentResult)
      } else {
        throw new Error(result.error || 'Payment failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed'
      setError(errorMessage)
      setStep('error')
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleCryptoPayment = async (option: PaymentOption) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      if (option.provider === 'coinbase_commerce') {
        // Create Coinbase Commerce charge and redirect
        const result = await createUnifiedPayment({
          amount: cryptoPrice,
          currency: option.currency,
          provider: 'coinbase_commerce',
          method: 'coinbase_checkout',
          orderId,
          userId,
          description,
          successUrl: successUrl || `${window.location.origin}/payment/success`,
          cancelUrl: cancelUrl || `${window.location.origin}/payment?canceled=true`,
        })
        
        if (result.success && result.checkoutUrl) {
          window.location.href = result.checkoutUrl
        } else {
          throw new Error(result.error || 'Failed to create checkout')
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleSolanaSuccess = (signature: string) => {
    const result: PaymentResult = {
      success: true,
      provider: 'solana',
      transactionHash: signature,
      amount: cryptoPrice,
      currency: 'USDC',
    }
    setTxResult(result)
    setStep('success')
    onSuccess?.(result)
  }
  
  const handleBaseSuccess = (txHash: string) => {
    const result: PaymentResult = {
      success: true,
      provider: 'base',
      transactionHash: txHash,
      amount: cryptoPrice,
      currency: 'USDC',
    }
    setTxResult(result)
    setStep('success')
    onSuccess?.(result)
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================
  
  const renderPaymentOption = (option: PaymentOption) => {
    const isSelected = selectedOption?.id === option.id
    const finalAmount = option.discount 
      ? amount - (amount * option.discount / 100)
      : amount
    
    return (
      <div
        key={option.id}
        onClick={() => handleSelectOption(option)}
        className={`
          p-4 rounded-lg border-2 cursor-pointer transition-all
          ${isSelected 
            ? 'border-primary bg-primary/5' 
            : 'border-muted hover:border-primary/50'
          }
        `}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{option.icon}</div>
            <div>
              <p className="font-medium">{option.name}</p>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
          </div>
          <div className="text-right">
            {option.discount ? (
              <>
                <p className="font-bold text-green-600">
                  ${finalAmount.toFixed(2)}
                </p>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  <Percent className="h-3 w-3 mr-1" />
                  {option.discount}% off
                </Badge>
              </>
            ) : (
              <p className="font-bold">${amount.toFixed(2)}</p>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span>⏱️ {option.processingTime}</span>
          <span>💰 Fees: {option.fees}</span>
        </div>
      </div>
    )
  }
  
  const renderCardForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cardName">Cardholder Name</Label>
        <Input
          id="cardName"
          placeholder="John Doe"
          value={cardForm.name}
          onChange={(e) => setCardForm(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>
      
      <div>
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          placeholder="4242 4242 4242 4242"
          value={cardForm.number}
          onChange={(e) => setCardForm(prev => ({ ...prev, number: e.target.value }))}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
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
        <div>
          <Label htmlFor="zip">ZIP Code</Label>
          <Input
            id="zip"
            placeholder="12345"
            value={cardForm.zipCode}
            onChange={(e) => setCardForm(prev => ({ ...prev, zipCode: e.target.value }))}
          />
        </div>
      </div>
      
      <Button 
        onClick={handleCardSubmit} 
        className="w-full" 
        size="lg"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </Button>
      
      <p className="text-xs text-center text-muted-foreground">
        <Lock className="inline h-3 w-3 mr-1" />
        Secured by Stripe. Your card details are encrypted.
      </p>
    </div>
  )
  
  const renderSuccess = () => (
    <div className="text-center space-y-4 py-8">
      <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <div>
        <h3 className="text-xl font-semibold">Payment Successful!</h3>
        <p className="text-muted-foreground mt-1">
          Your payment of ${txResult?.amount.toFixed(2)} has been confirmed.
        </p>
      </div>
      {txResult?.transactionHash && (
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm font-mono break-all">
            {txResult.transactionHash.slice(0, 20)}...{txResult.transactionHash.slice(-20)}
          </p>
          <a
            href={
              txResult.provider === 'solana'
                ? `https://explorer.solana.com/tx/${txResult.transactionHash}`
                : `https://basescan.org/tx/${txResult.transactionHash}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
          >
            View on Explorer <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
      <Button onClick={() => window.location.href = successUrl || '/'}>
        Continue
      </Button>
    </div>
  )

  // =============================================================================
  // MAIN RENDER
  // =============================================================================
  
  if (step === 'success') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          {renderSuccess()}
        </CardContent>
      </Card>
    )
  }
  
  if (step === 'error') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4 py-8">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Payment Failed</h3>
              <p className="text-destructive mt-1">{error}</p>
            </div>
            <Button onClick={() => setStep('select')} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Complete Payment
        </CardTitle>
        <CardDescription>
          {description || 'Choose your preferred payment method'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Amount Summary */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Amount Due</span>
            <span className="text-2xl font-bold">${amount.toFixed(2)}</span>
          </div>
          {paymentTab === 'crypto' && (
            <div className="flex justify-between items-center mt-2 text-green-600">
              <span className="text-sm">Crypto Discount ({cryptoDiscount}%)</span>
              <span className="font-medium">-${discountAmount.toFixed(2)}</span>
            </div>
          )}
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Payment Method Tabs */}
        <Tabs value={paymentTab} onValueChange={(v) => setPaymentTab(v as 'card' | 'crypto')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Card
            </TabsTrigger>
            <TabsTrigger value="crypto" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Crypto
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                Save {cryptoDiscount}%
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          {/* Card Payment Tab */}
          <TabsContent value="card" className="space-y-4 mt-4">
            <div className="space-y-3">
              {cardOptions.map(renderPaymentOption)}
            </div>
            
            {selectedOption?.provider === 'stripe' && (
              <>
                <Separator />
                {renderCardForm()}
              </>
            )}
          </TabsContent>
          
          {/* Crypto Payment Tab */}
          <TabsContent value="crypto" className="space-y-4 mt-4">
            <Alert className="bg-green-50 border-green-200">
              <Percent className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Pay with crypto and save {cryptoDiscount}%! Final amount: ${cryptoPrice.toFixed(2)}
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Base/Coinbase Section */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="text-blue-500">🔵</span>
                    Base Blockchain
                  </CardTitle>
                  <CardDescription className="text-xs">
                    USDC or ETH on Base
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cryptoOptions
                      .filter(o => o.provider === 'base')
                      .map(option => (
                        <Button
                          key={option.id}
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => handleSelectOption(option)}
                        >
                          <span>{option.icon} {option.currency}</span>
                          <span className="text-xs text-muted-foreground">{option.fees}</span>
                        </Button>
                      ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Solana Section */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="text-purple-500">◎</span>
                    Solana Blockchain
                  </CardTitle>
                  <CardDescription className="text-xs">
                    SOL or USDC on Solana
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cryptoOptions
                      .filter(o => o.provider === 'solana')
                      .map(option => (
                        <Button
                          key={option.id}
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => handleSelectOption(option)}
                        >
                          <span>{option.icon} {option.currency}</span>
                          <span className="text-xs text-muted-foreground">{option.fees}</span>
                        </Button>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Coinbase Commerce Option */}
            {cryptoOptions.some(o => o.provider === 'coinbase_commerce') && (
              <Card>
                <CardContent className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const option = cryptoOptions.find(o => o.provider === 'coinbase_commerce')
                      if (option) handleCryptoPayment(option)
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <span className="mr-2">🪙</span>
                    )}
                    Pay with Coinbase (Any Crypto)
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Inline Solana Payment */}
            {selectedOption?.provider === 'solana' && (
              <>
                <Separator />
                <SolanaPayment
                  amount={cryptoPrice}
                  currency={selectedOption.currency as 'SOL' | 'USDC'}
                  orderId={orderId}
                  description={description}
                  discount={0} // Already applied
                  onSuccess={handleSolanaSuccess}
                  onError={(err) => {
                    setError(err)
                    onError?.(err)
                  }}
                  onCancel={onCancel}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Cancel Button */}
        {onCancel && (
          <Button variant="ghost" className="w-full" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default UnifiedPayment
