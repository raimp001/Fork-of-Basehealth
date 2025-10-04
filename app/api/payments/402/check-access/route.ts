import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { hasUserPaid } from '@/lib/http-402-service'

/**
 * POST /api/payments/402/check-access
 * Check if user has paid for access to a resource
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

    const { resource, sessionId } = await request.json()

    if (!resource) {
      return NextResponse.json(
        { error: 'Missing resource parameter' },
        { status: 400 }
      )
    }

    const userId = session.user.id || session.user.email!
    const hasAccess = await hasUserPaid(userId, resource, sessionId)

    return NextResponse.json({
      hasAccess,
      resource,
      userId,
      message: hasAccess 
        ? 'Access granted' 
        : 'Payment required for this resource',
    })

  } catch (error) {
    console.error('Check access error:', error)
    return NextResponse.json(
      { error: 'Failed to check access' },
      { status: 500 }
    )
  }
}

