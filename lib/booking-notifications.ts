/**
 * Booking Notification Service
 * 
 * Handles sending notifications to providers and patients for bookings.
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@basehealth.xyz'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@basehealth.xyz'

interface BookingDetails {
  bookingId: string
  patientName: string
  patientEmail: string
  providerName: string
  providerEmail?: string
  serviceType: string
  appointmentDate: string
  amount: number
  currency: string
  txHash?: string
  location?: {
    city?: string
    state?: string
    zipCode?: string
  }
}

/**
 * Send receipt to patient after successful payment
 */
export async function sendPatientReceipt(booking: BookingDetails): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not set, skipping email')
      return false
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.patientEmail,
      subject: `Payment Receipt - ${booking.serviceType}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; margin-bottom: 24px;">Payment Receipt</h1>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; color: #666;">Amount Paid</p>
            <p style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">
              $${booking.amount.toFixed(2)} ${booking.currency}
            </p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Service</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; color: #1a1a1a;">${booking.serviceType}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Provider</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; color: #1a1a1a;">${booking.providerName}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Date</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; color: #1a1a1a;">${booking.appointmentDate}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Booking ID</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; color: #1a1a1a; font-family: monospace;">${booking.bookingId}</td>
            </tr>
            ${booking.txHash ? `
            <tr>
              <td style="padding: 12px 0; color: #666;">Transaction</td>
              <td style="padding: 12px 0; text-align: right;">
                <a href="https://sepolia.basescan.org/tx/${booking.txHash}" style="color: #0052FF;">View on BaseScan</a>
              </td>
            </tr>
            ` : ''}
          </table>
          
          <p style="margin-top: 24px; color: #666; font-size: 14px;">
            The provider will contact you to confirm your appointment. If you have questions, reply to this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          
          <p style="color: #999; font-size: 12px;">
            BaseHealth • Secure Healthcare Payments on Base
          </p>
        </div>
      `,
    })
    
    console.log('Patient receipt sent to:', booking.patientEmail)
    return true
  } catch (error) {
    console.error('Failed to send patient receipt:', error)
    return false
  }
}

/**
 * Notify provider of new booking
 */
export async function notifyProviderOfBooking(booking: BookingDetails): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not set, skipping email')
      return false
    }

    const providerEmail = booking.providerEmail || ADMIN_EMAIL

    await resend.emails.send({
      from: FROM_EMAIL,
      to: providerEmail,
      subject: `New Booking - ${booking.patientName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; margin-bottom: 24px;">New Patient Booking</h1>
          
          <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #4caf50;">
            <p style="margin: 0; color: #2e7d32; font-weight: 500;">Payment Received</p>
            <p style="margin: 8px 0 0 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">
              $${booking.amount.toFixed(2)} ${booking.currency}
            </p>
          </div>
          
          <h2 style="color: #1a1a1a; font-size: 18px; margin-bottom: 16px;">Patient Information</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Patient Name</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; color: #1a1a1a; font-weight: 500;">${booking.patientName}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Email</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">
                <a href="mailto:${booking.patientEmail}" style="color: #0052FF;">${booking.patientEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Service Requested</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; color: #1a1a1a;">${booking.serviceType}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Preferred Date</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; color: #1a1a1a;">${booking.appointmentDate}</td>
            </tr>
            ${booking.location?.city ? `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Location</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; color: #1a1a1a;">
                ${booking.location.city}, ${booking.location.state} ${booking.location.zipCode || ''}
              </td>
            </tr>
            ` : ''}
          </table>
          
          <div style="margin-top: 24px; padding: 16px; background: #fff3e0; border-radius: 8px;">
            <p style="margin: 0; color: #e65100; font-weight: 500;">Action Required</p>
            <p style="margin: 8px 0 0 0; color: #666;">
              Please contact the patient within 24 hours to confirm the appointment. 
              If you cannot provide service in their area, you can issue a refund from your admin dashboard.
            </p>
          </div>
          
          <div style="margin-top: 24px;">
            <a href="https://basehealth.xyz/admin/bookings" 
               style="display: inline-block; background: #1a1a1a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
              View Booking Details
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          
          <p style="color: #999; font-size: 12px;">
            Booking ID: ${booking.bookingId}<br/>
            BaseHealth • Secure Healthcare Payments on Base
          </p>
        </div>
      `,
    })
    
    console.log('Provider notification sent to:', providerEmail)
    return true
  } catch (error) {
    console.error('Failed to notify provider:', error)
    return false
  }
}

/**
 * Send refund notification to patient
 */
export async function sendRefundNotification(
  patientEmail: string,
  details: {
    bookingId: string
    amount: number
    currency: string
    reason: string
    providerName: string
  }
): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not set, skipping email')
      return false
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: patientEmail,
      subject: `Refund Processed - $${details.amount.toFixed(2)}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; margin-bottom: 24px;">Refund Processed</h1>
          
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; color: #1565c0;">Refund Amount</p>
            <p style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">
              $${details.amount.toFixed(2)} ${details.currency}
            </p>
          </div>
          
          <p style="color: #666; margin-bottom: 24px;">
            Your payment has been refunded. The funds will be returned to your original payment method.
          </p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Provider</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; color: #1a1a1a;">${details.providerName}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Reason</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; color: #1a1a1a;">${details.reason}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #666;">Booking ID</td>
              <td style="padding: 12px 0; text-align: right; color: #1a1a1a; font-family: monospace;">${details.bookingId}</td>
            </tr>
          </table>
          
          <p style="margin-top: 24px; color: #666; font-size: 14px;">
            We apologize for any inconvenience. You can search for other providers in your area at basehealth.xyz
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          
          <p style="color: #999; font-size: 12px;">
            BaseHealth • Secure Healthcare Payments on Base
          </p>
        </div>
      `,
    })
    
    console.log('Refund notification sent to:', patientEmail)
    return true
  } catch (error) {
    console.error('Failed to send refund notification:', error)
    return false
  }
}

/**
 * Notify admin of new booking for review
 */
export async function notifyAdminOfBooking(booking: BookingDetails): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not set, skipping email')
      return false
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[Admin] New Booking - ${booking.serviceType}`,
      html: `
        <div style="font-family: monospace; padding: 20px;">
          <h2>New Booking Received</h2>
          <pre style="background: #f5f5f5; padding: 16px; border-radius: 4px;">
Booking ID: ${booking.bookingId}
Amount: $${booking.amount.toFixed(2)} ${booking.currency}
Patient: ${booking.patientName} (${booking.patientEmail})
Provider: ${booking.providerName}
Service: ${booking.serviceType}
Date: ${booking.appointmentDate}
Location: ${booking.location?.city || 'N/A'}, ${booking.location?.state || 'N/A'}
TX Hash: ${booking.txHash || 'N/A'}
          </pre>
          <p><a href="https://basehealth.xyz/admin/bookings">View in Admin</a></p>
        </div>
      `,
    })
    
    return true
  } catch (error) {
    console.error('Failed to notify admin:', error)
    return false
  }
}
