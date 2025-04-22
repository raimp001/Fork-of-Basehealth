import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Webhook event types
type WebhookEventType =
  | "payment_intent.created"
  | "payment_intent.completed"
  | "payment_intent.failed"
  | "payment_intent.expired"

interface WebhookEvent {
  id: string
  type: WebhookEventType
  data: {
    object: {
      id: string
      status: string
      [key: string]: any
    }
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("x-cb-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  // Verify webhook signature
  const isValid = verifySignature(body, signature, process.env.COINBASE_CDP_API_SECRET || "")

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  try {
    const event = JSON.parse(body) as WebhookEvent

    // Process different event types
    switch (event.type) {
      case "payment_intent.created":
        // Handle payment intent created
        console.log("Payment intent created:", event.data.object.id)
        break

      case "payment_intent.completed":
        // Handle payment intent completed
        console.log("Payment completed:", event.data.object.id)
        // Update appointment payment status in your database
        // await updateAppointmentPaymentStatus(event.data.object.metadata.appointmentId, 'paid');
        break

      case "payment_intent.failed":
        // Handle payment intent failed
        console.log("Payment failed:", event.data.object.id)
        break

      case "payment_intent.expired":
        // Handle payment intent expired
        console.log("Payment expired:", event.data.object.id)
        break

      default:
        console.log("Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac("sha256", secret)
    const expectedSignature = hmac.update(payload).digest("hex")
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  } catch (error) {
    console.error("Error verifying signature:", error)
    return false
  }
}
