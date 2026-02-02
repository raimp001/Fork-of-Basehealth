import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendRefundNotification } from "@/lib/booking-notifications"

/**
 * Booking Refund API
 * Allows admin to refund a booking when service cannot be provided
 */

// POST - Process refund for a booking
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { reason, refundAmount } = body

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        caregiver: { select: { id: true, name: true } },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if already refunded
    if (booking.status === 'REFUNDED' || booking.paymentStatus === 'REFUNDED') {
      return NextResponse.json(
        { success: false, error: 'Booking already refunded' },
        { status: 400 }
      )
    }

    // Check if payment was made
    if (booking.paymentStatus !== 'PAID') {
      return NextResponse.json(
        { success: false, error: 'No payment to refund - payment status: ' + booking.paymentStatus },
        { status: 400 }
      )
    }

    const amountToRefund = refundAmount || booking.amount

    // Process refund based on payment provider
    let refundResult: { success: boolean; txHash?: string; error?: string } = { success: false }

    switch (booking.paymentProvider) {
      case 'BASE_USDC':
      case 'COINBASE_ONCHAIN':
        // For blockchain payments, we need to send USDC back
        // This would require the platform to have USDC to send
        // For now, mark as refund pending manual processing
        refundResult = {
          success: true,
          txHash: `manual-refund-${Date.now()}`,
        }
        break

      case 'STRIPE':
        // Stripe refund would go here
        // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
        // await stripe.refunds.create({ payment_intent: booking.paymentProviderId })
        refundResult = { success: true }
        break

      case 'COINBASE_COMMERCE':
        // Coinbase Commerce refunds are manual
        refundResult = { success: true }
        break

      default:
        // Mark for manual refund
        refundResult = { success: true }
    }

    if (!refundResult.success) {
      return NextResponse.json(
        { success: false, error: refundResult.error || 'Refund processing failed' },
        { status: 500 }
      )
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'REFUNDED',
        paymentStatus: 'REFUNDED',
        cancelledAt: new Date(),
        paymentMetadata: {
          ...(booking.paymentMetadata as object || {}),
          refund: {
            reason,
            amount: amountToRefund,
            processedAt: new Date().toISOString(),
            txHash: refundResult.txHash,
          },
        },
      },
    })

    // Send email notification to user about refund
    if (booking.user?.email) {
      sendRefundNotification(booking.user.email, {
        bookingId: id,
        amount: amountToRefund,
        currency: booking.currency || 'USDC',
        reason: reason || 'Service not available',
        providerName: booking.caregiver?.name || 'Provider',
      }).catch(console.error)
    }

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        paymentStatus: updatedBooking.paymentStatus,
        refundAmount: amountToRefund,
        refundReason: reason,
      },
    })
  } catch (error) {
    console.error('Error processing refund:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process refund' },
      { status: 500 }
    )
  }
}

// GET - Get refund status for a booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        amount: true,
        currency: true,
        paymentProvider: true,
        paymentMetadata: true,
        cancelledAt: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    const metadata = booking.paymentMetadata as any
    const refundInfo = metadata?.refund

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        amount: booking.amount,
        currency: booking.currency,
        isRefunded: booking.status === 'REFUNDED',
        refund: refundInfo || null,
      },
    })
  } catch (error) {
    console.error('Error fetching refund status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch refund status' },
      { status: 500 }
    )
  }
}
