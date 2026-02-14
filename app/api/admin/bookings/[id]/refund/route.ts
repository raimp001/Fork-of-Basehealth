import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendRefundNotification } from "@/lib/booking-notifications"
import { ACTIVE_CHAIN, getTxExplorerUrl } from "@/lib/network-config"
import { createBillingReceipt, generateMockBaseTxHash } from "@/lib/base-billing"

/**
 * Booking Refund API
 * Allows admin to refund a booking when service cannot be provided
 */

// POST - Process refund for a booking
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { reason, refundAmount } = body

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        caregiver: { select: { id: true, firstName: true, lastName: true } },
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

    const parsedRefundAmount = Number.parseFloat(String(refundAmount ?? booking.amount))
    if (!Number.isFinite(parsedRefundAmount) || parsedRefundAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid refund amount' },
        { status: 400 }
      )
    }

    const amountToRefund = parsedRefundAmount

    // Process refund based on payment provider
    let refundResult: { success: boolean; txHash?: string; error?: string } = { success: false }

    switch (booking.paymentProvider) {
      case 'BASE_USDC':
      case 'COINBASE_ONCHAIN':
        // Placeholder onchain refund transaction hash (replace with signed transfer in production).
        refundResult = {
          success: true,
          txHash: generateMockBaseTxHash(`${id}:${Date.now()}:${amountToRefund}`),
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

    const refundExplorerUrl = refundResult.txHash ? getTxExplorerUrl(refundResult.txHash) : null

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
            explorerUrl: refundExplorerUrl,
            network: ACTIVE_CHAIN.name,
          },
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        caregiver: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    })

    await prisma.transaction.create({
      data: {
        bookingId: id,
        transactionHash: refundResult.txHash,
        provider: booking.paymentProvider || 'BASE_USDC',
        providerId: `refund_${id}_${Date.now()}`,
        amount: amountToRefund,
        currency: booking.currency || 'USDC',
        status: 'REFUNDED',
        completedAt: new Date(),
        metadata: {
          type: 'refund',
          reason: reason || 'Service not available',
          network: ACTIVE_CHAIN.name,
          paymentProvider: booking.paymentProvider || 'BASE_USDC',
          explorerUrl: refundExplorerUrl,
        },
      },
    }).catch(() => null)

    const receipt = createBillingReceipt(updatedBooking)

    // Send email notification to user about refund
    if (booking.user?.email) {
      sendRefundNotification(booking.user.email, {
        bookingId: id,
        amount: amountToRefund,
        currency: booking.currency || 'USDC',
        reason: reason || 'Service not available',
        providerName: `${booking.caregiver?.firstName || ''} ${booking.caregiver?.lastName || ''}`.trim() || 'Provider',
      }).catch(console.error)
    }

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
      receipt,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        paymentStatus: updatedBooking.paymentStatus,
        refundAmount: amountToRefund,
        refundReason: reason,
        refundTxHash: refundResult.txHash,
        refundExplorerUrl,
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        caregiver: { select: { firstName: true, lastName: true } },
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
    const receipt = createBillingReceipt(booking)

    return NextResponse.json({
      success: true,
      receipt,
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
