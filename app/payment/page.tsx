"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { ImprovedPaymentFlow } from "@/components/billing/improved-payment-flow"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const appointmentId = searchParams.get("appointmentId") || ""
  const amount = Number.parseFloat(searchParams.get("amount") || "0")
  const providerId = searchParams.get("providerId") || ""
  const patientId = searchParams.get("patientId") || ""

  // Check if payment was canceled
  const canceled = searchParams.get("canceled") === "true"

  // Check if we have valid payment parameters
  const hasValidParams = appointmentId && amount > 0

  const handlePaymentSuccess = (result: any) => {
    console.log("Payment successful:", result)
    router.push(`/payment/success?appointmentId=${appointmentId}&transactionId=${result.transactionId}`)
  }

  const handlePaymentCancel = () => {
    router.back()
  }

  if (!hasValidParams) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Payment</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Invalid payment request</AlertTitle>
            <AlertDescription>
              This payment page requires an appointment ID and payment amount. Please return to your appointment details
              and try again.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Button onClick={() => router.push("/")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
        <p className="text-muted-foreground">Secure, fast, and flexible payment options for your healthcare</p>
      </div>

      {canceled && (
        <div className="mb-6">
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Your previous payment was canceled. Please try again when you're ready.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <ImprovedPaymentFlow
        amount={amount}
        appointmentId={appointmentId}
        patientId={patientId}
        providerId={providerId}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    </div>
  )
}
