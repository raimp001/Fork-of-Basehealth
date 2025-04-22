import { type NextRequest, NextResponse } from "next/server"
import { coinbaseSuperPayService, type CreatePaymentIntentParams } from "@/lib/coinbase-superpay-service"
import { NETWORK_ID } from "@/lib/constants"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency, appointmentId, patientId, providerId, tokenAddress } = body

    if (!amount || !currency || !appointmentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create payment intent params
    const params: CreatePaymentIntentParams = {
      amount: {
        value: amount.toString(),
        currency: currency,
      },
      blockchain: {
        network: NETWORK_ID,
        tokenAddress: tokenAddress || undefined,
      },
      metadata: {
        appointmentId,
        patientId: patientId || "",
        providerId: providerId || "",
        type: "healthcare_payment",
      },
      redirectUrl: `${request.nextUrl.origin}/payment/success?intent_id={id}`,
      cancelUrl: `${request.nextUrl.origin}/payment?canceled=true`,
    }

    const paymentIntent = await coinbaseSuperPayService.createPaymentIntent(params)

    return NextResponse.json(paymentIntent)
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (id) {
      // Get a specific payment intent
      const paymentIntent = await coinbaseSuperPayService.getPaymentIntent(id)
      return NextResponse.json(paymentIntent)
    } else {
      // List payment intents
      const limit = Number.parseInt(searchParams.get("limit") || "10")
      const startingAfter = searchParams.get("starting_after") || undefined

      const paymentIntents = await coinbaseSuperPayService.listPaymentIntents(limit, startingAfter)
      return NextResponse.json(paymentIntents)
    }
  } catch (error) {
    console.error("Error fetching payment intents:", error)
    return NextResponse.json({ error: "Failed to fetch payment intents" }, { status: 500 })
  }
}
