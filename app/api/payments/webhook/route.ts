import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe only if API key is provided
const stripeKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia'
}) : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    // Return early if Stripe is not configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing not configured' },
        { status: 503 }
      )
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature') || ''

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout completed:', session.id)
        
        // Update user subscription status in database
        const userId = session.metadata?.userId
        if (userId) {
          // TODO: Update user subscription in database
          console.log('Updating subscription for user:', userId)
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        
        // Process successful payment
        const userId = paymentIntent.metadata?.userId
        if (userId) {
          // TODO: Update payment record in database
          console.log('Recording payment for user:', userId)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', paymentIntent.id)
        
        // Handle failed payment
        const userId = paymentIntent.metadata?.userId
        if (userId) {
          // TODO: Notify user of failed payment
          console.log('Payment failed for user:', userId)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription updated:', subscription.id)
        
        // Update subscription in database
        const userId = subscription.metadata?.userId
        if (userId) {
          // TODO: Update subscription status
          console.log('Updating subscription for user:', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription cancelled:', subscription.id)
        
        // Handle subscription cancellation
        const userId = subscription.metadata?.userId
        if (userId) {
          // TODO: Update user to free tier
          console.log('Subscription cancelled for user:', userId)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
