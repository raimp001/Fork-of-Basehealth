import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { coinbaseCommerceConfig } from '@/lib/coinbase-config'

// Verify webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const expectedSignature = hmac.digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-cc-webhook-signature')
    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    const body = await request.text()
    
    // Verify webhook signature
    const isValid = verifyWebhookSignature(
      body,
      signature,
      coinbaseCommerceConfig.webhookSecret
    )

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)
    console.log('Coinbase Commerce webhook:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'charge:created':
        console.log('Charge created:', event.data.id)
        // Store charge info in database
        break

      case 'charge:confirmed':
        console.log('Payment confirmed:', event.data.id)
        // Update payment status in database
        // Grant access to services
        await handlePaymentConfirmed(event.data)
        break

      case 'charge:failed':
        console.log('Payment failed:', event.data.id)
        // Update payment status
        // Send failure notification
        break

      case 'charge:delayed':
        console.log('Payment delayed:', event.data.id)
        // Handle delayed payment
        break

      case 'charge:pending':
        console.log('Payment pending:', event.data.id)
        // Update status to pending
        break

      case 'charge:resolved':
        console.log('Payment resolved:', event.data.id)
        // Handle resolved payment (after being delayed)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentConfirmed(charge: any) {
  const { metadata, pricing, payments } = charge

  // Extract payment info
  const payment = payments[0] // Get first confirmed payment
  const { network, transaction_id, value } = payment

  // Process based on payment type
  if (metadata.type === 'consultation') {
    // Grant access to consultation
    console.log('Granting consultation access:', {
      appointmentId: metadata.appointment_id,
      patientId: metadata.user_id,
      amount: value.local.amount,
      currency: value.local.currency,
      txHash: transaction_id,
      network
    })
    // TODO: Update appointment status in database
  } else if (metadata.type === 'caregiver') {
    // Confirm caregiver booking
    console.log('Confirming caregiver booking:', {
      bookingId: metadata.booking_id,
      patientId: metadata.user_id,
      hours: metadata.hours,
      txHash: transaction_id
    })
    // TODO: Update booking status and notify caregiver
  } else if (metadata.type === 'subscription') {
    // Activate subscription
    console.log('Activating subscription:', {
      tier: metadata.tier,
      userId: metadata.user_id,
      txHash: transaction_id
    })
    // TODO: Update user subscription in database
  }

  // Send confirmation email
  // TODO: Integrate with email service
}
