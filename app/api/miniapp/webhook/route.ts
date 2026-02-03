/**
 * Mini App Webhook
 * 
 * Receives notifications and events from the Base app.
 * Used for engagement tracking and user notifications.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Mini app webhook received:', body)
    
    // Handle different event types
    const { type, data } = body
    
    switch (type) {
      case 'app_installed':
        console.log('New mini app install:', data?.userId)
        break
      
      case 'app_opened':
        console.log('App opened by:', data?.userId)
        break
      
      case 'notification_clicked':
        console.log('Notification clicked:', data?.notificationId)
        break
      
      default:
        console.log('Unknown webhook event:', type)
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Mini app webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'BaseHealth mini app webhook endpoint',
    version: '1.0',
  })
}
