"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { useCoinbaseConfig } from "@/components/coinbase-client-config"

interface SuperPayPaymentProps {
  amount: number
  appointmentId: string
  patientId?: string
  providerId?: string
}

export function SuperPayPayment({ amount, appointmentId, patientId, providerId }: SuperPayPaymentProps) {
  const [selectedCurrency, setSelectedCurrency] = useState("ETH")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentIntent, setPaymentIntent] = useState<any>(null)
  const { networkId } = useCoinbaseConfig()

  const currencies = [
    { value: "ETH", label: "Ethereum (ETH)" },
    { value: "USDC", label: "USD Coin (USDC)" },
  ]

  const createPaymentIntent = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/payments/intents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: selectedCurrency,
          appointmentId,
          patientId,
          providerId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment intent")
      }

      const data = await response.json()
      setPaymentIntent(data)

      // In a real implementation, we would use the Coinbase SDK to handle the payment
      // For now, we'll just simulate it
      if (typeof window !== "undefined" && window.coinbase) {
        window.coinbase.pay({
          paymentIntentId: data.id,
          onSuccess: handlePaymentSuccess,
          onFailure: handlePaymentFailure,
          onCancel: handlePaymentCancel,
        })
      } else {
        console.error("Coinbase SDK not loaded")
        setError("Payment provider not available. Please try again later.")
      }
    } catch (err) {
      console.error("Error creating payment intent:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = (result: any) => {
    console.log("Payment successful:", result)
    // In a real app, we would redirect to a success page
    window.location.href = `/payment/success?intent_id=${paymentIntent.id}`
  }

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error)
    setError("Payment failed. Please try again.")
  }

  const handlePaymentCancel = () => {
    console.log("Payment canceled")
    setError("Payment was canceled. Please try again when you're ready.")
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>Complete your payment using cryptocurrency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">${amount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Appointment ID:</span>
            <span className="font-mono text-xs">{appointmentId}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Network:</span>
            <span>{networkId === "base-mainnet" ? "Base Mainnet" : "Base Sepolia Testnet"}</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Currency</label>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={createPaymentIntent} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay with ${selectedCurrency}`
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Secure payment powered by Coinbase SuperPay</p>
        <p className="mt-1">Transaction fees may apply based on the network conditions</p>
      </div>
    </div>
  )
}
