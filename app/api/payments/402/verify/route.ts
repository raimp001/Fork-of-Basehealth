import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { verifyPaymentProof, recordPayment, type PaymentProof, type PaymentRequirement } from '@/lib/http-402-service'

/**
 * POST /api/payments/402/verify
 * Verify payment proof for HTTP 402 gated resources
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { proof, requirement }: { proof: PaymentProof; requirement: PaymentRequirement } = body

    if (!proof || !requirement) {
      return NextResponse.json(
        { error: 'Missing proof or requirement' },
        { status: 400 }
      )
    }

    // Verify the payment proof
    const isValid = await verifyPaymentProof(proof, requirement)

    if (!isValid) {
      return NextResponse.json(
        { 
          verified: false,
          error: 'Invalid payment proof',
          message: 'The payment could not be verified. Please ensure the transaction was successful and try again.'
        },
        { status: 402 }
      )
    }

    // Record the payment in database
    await recordPayment(session.user.id || session.user.email!, proof, requirement)

    return NextResponse.json({
      verified: true,
      transactionHash: proof.transactionHash,
      resource: requirement.resource,
      message: 'Payment verified successfully',
      accessGranted: true,
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { 
        verified: false,
        error: 'Verification failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

