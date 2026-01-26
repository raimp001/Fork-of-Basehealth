import Stripe from 'stripe'

/**
 * Stripe Payment Integration
 * 
 * Supports two modes:
 * 1. Live Mode: Real Stripe API with valid STRIPE_SECRET_KEY
 * 2. Demo Mode: Simulated payments when Stripe is not configured
 */

// Check if Stripe is properly configured
const isStripeConfigured = () => {
  const key = process.env.STRIPE_SECRET_KEY
  return key && 
         key.startsWith('sk_') && 
         !key.includes('placeholder')
}

// Initialize Stripe only if configured
export const stripe = isStripeConfigured()
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
      typescript: true,
    })
  : null

// Check if we're in demo mode
export const isStripeDemoMode = !stripe

/**
 * Create a payment intent (real or simulated)
 */
export async function createPaymentIntent(amount: number, currency: string = 'usd') {
  // Demo mode - return simulated payment intent
  if (!stripe) {
    console.log('[Stripe Demo Mode] Simulating payment intent for $' + amount)
    return {
      id: `pi_demo_${Date.now()}`,
      client_secret: `demo_secret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(amount * 100),
      currency,
      status: 'requires_payment_method',
      _demo: true,
    }
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })
    return paymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

/**
 * Create an appointment payment (real or simulated)
 */
export async function createAppointmentPayment(amount: number, appointmentId: string) {
  // Demo mode - return simulated payment intent
  if (!stripe) {
    console.log('[Stripe Demo Mode] Simulating appointment payment for $' + amount)
    return {
      id: `pi_demo_apt_${Date.now()}`,
      client_secret: `demo_secret_apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(amount * 100),
      currency: 'usd',
      status: 'requires_payment_method',
      metadata: { appointmentId },
      _demo: true,
    }
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: {
        appointmentId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })
    return paymentIntent
  } catch (error) {
    console.error('Error creating appointment payment:', error)
    throw error
  }
}

/**
 * Verify a payment intent status
 */
export async function verifyPaymentIntent(paymentIntentId: string) {
  // Demo mode - simulate success
  if (!stripe || paymentIntentId.startsWith('pi_demo')) {
    return {
      id: paymentIntentId,
      status: 'succeeded',
      _demo: true,
    }
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error('Error verifying payment intent:', error)
    throw error
  }
}

/**
 * Get Stripe configuration status
 */
export function getStripeStatus() {
  return {
    configured: isStripeConfigured(),
    demoMode: isStripeDemoMode,
    message: isStripeConfigured()
      ? 'Stripe is configured and ready for payments'
      : 'Stripe is in demo mode. Payments will be simulated. Set STRIPE_SECRET_KEY for real payments.',
  }
} 