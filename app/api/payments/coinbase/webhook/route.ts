import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
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
    logger.info('Coinbase Commerce webhook', { eventType: event.type })

    // Handle different event types
    switch (event.type) {
      case 'charge:created':
        logger.info('Charge created', { chargeId: event.data.id })
        // Store charge info in database
        break

      case 'charge:confirmed':
        logger.info('Payment confirmed', { chargeId: event.data.id })
        // Update payment status in database
        // Grant access to services
        await handlePaymentConfirmed(event.data)
        break

      case 'charge:failed':
        logger.warn('Payment failed', { chargeId: event.data.id })
        // Update payment status
        // Send failure notification
        break

      case 'charge:delayed':
        logger.warn('Payment delayed', { chargeId: event.data.id })
        // Handle delayed payment
        break

      case 'charge:pending':
        logger.info('Payment pending', { chargeId: event.data.id })
        // Update status to pending
        break

      case 'charge:resolved':
        logger.info('Payment resolved', { chargeId: event.data.id })
        // Handle resolved payment (after being delayed)
        break

      default:
        logger.warn('Unhandled event type', { eventType: event.type })
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    logger.error('Webhook error', error)
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
    logger.info('Granting consultation access', {
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
    logger.info('Confirming caregiver booking', {
      bookingId: metadata.booking_id,
      patientId: metadata.user_id,
      hours: metadata.hours,
      txHash: transaction_id
    })
    // TODO: Update booking status and notify caregiver
  } else if (metadata.type === 'subscription') {
    // Activate subscription
    logger.info('Activating subscription', {
      tier: metadata.tier,
      userId: metadata.user_id,
      txHash: transaction_id
    })
    // TODO: Update user subscription in database
  }

  // Send confirmation email
  // TODO: Integrate with email service
}
