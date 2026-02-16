// Email service for provider and admin notifications
// In production, this would integrate with services like SendGrid, AWS SES, or similar

import { getPrimaryAdminEmail } from "@/lib/admin-access"

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

export interface ProviderApplicationData {
  applicationId: string
  firstName: string
  lastName: string
  email: string
  specialty: string
  submittedDate: string
}

export interface AdminNotificationData {
  applicationId: string
  providerName: string
  specialty: string
  submittedDate: string
}

export class EmailService {
  private apiKey: string
  private fromEmail: string
  private adminEmail: string

  constructor(apiKey: string = '', fromEmail: string = 'noreply@basehealth.app') {
    this.apiKey = apiKey
    this.fromEmail = fromEmail
    this.adminEmail = getPrimaryAdminEmail()
  }

  // Provider notification emails
  async sendApplicationConfirmation(data: ProviderApplicationData): Promise<boolean> {
    const email: EmailTemplate = {
      to: data.email,
      subject: 'Application Received - BaseHealth Provider Network',
      html: this.generateApplicationConfirmationHTML(data),
      text: this.generateApplicationConfirmationText(data)
    }

    return this.sendEmail(email)
  }

  async sendApplicationApproval(data: ProviderApplicationData): Promise<boolean> {
    const email: EmailTemplate = {
      to: data.email,
      subject: 'Welcome to BaseHealth - Application Approved! 🎉',
      html: this.generateApprovalHTML(data),
      text: this.generateApprovalText(data)
    }

    return this.sendEmail(email)
  }

  async sendApplicationRejection(data: ProviderApplicationData, reason: string): Promise<boolean> {
    const email: EmailTemplate = {
      to: data.email,
      subject: 'BaseHealth Provider Application Update',
      html: this.generateRejectionHTML(data, reason),
      text: this.generateRejectionText(data, reason)
    }

    return this.sendEmail(email)
  }

  // Admin notification emails
  async sendNewApplicationNotification(data: AdminNotificationData): Promise<boolean> {
    const email: EmailTemplate = {
      to: this.adminEmail,
      subject: `New Provider Application - ${data.providerName}`,
      html: this.generateAdminNotificationHTML(data),
      text: this.generateAdminNotificationText(data)
    }

    return this.sendEmail(email)
  }

  // Core email sending method
  private async sendEmail(email: EmailTemplate): Promise<boolean> {
    try {
      // In production, integrate with actual email service
      console.log('📧 Email would be sent:', {
        to: email.to,
        subject: email.subject,
        timestamp: new Date().toISOString()
      })

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 100))

      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  // HTML Email Templates
  private generateApplicationConfirmationHTML(data: ProviderApplicationData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .status-box { background: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
            .next-steps { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BaseHealth Provider Network</h1>
              <p>Application Received Successfully</p>
            </div>
            
            <div class="content">
              <h2>Hello Dr. ${data.firstName} ${data.lastName},</h2>
              
              <p>Thank you for your interest in joining the BaseHealth Provider Network. We have successfully received your application.</p>
              
              <div class="status-box">
                <strong>Application Details:</strong><br>
                Application ID: <strong>${data.applicationId}</strong><br>
                Specialty: <strong>${data.specialty}</strong><br>
                Submitted: <strong>${new Date(data.submittedDate).toLocaleDateString()}</strong><br>
                Status: <strong>Under Review</strong>
              </div>
              
              <div class="next-steps">
                <h3>What's Next?</h3>
                <ul>
                  <li>📋 Document verification (2-3 business days)</li>
                  <li>🔍 Background check (3-5 business days)</li>
                  <li>✅ Final approval and account setup</li>
                </ul>
              </div>
              
              <p>We'll send you an email update within 24 hours with the next steps. If you have any questions, please don't hesitate to contact our support team.</p>
              
              <p>Best regards,<br>The BaseHealth Team</p>
            </div>
            
            <div class="footer">
              <p>BaseHealth - Connecting Patients with Quality Healthcare Providers</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private generateApprovalHTML(data: ProviderApplicationData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f0fdf4; }
            .approval-box { background: #dcfce7; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; }
            .next-steps { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .cta-button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to BaseHealth!</h1>
              <p>Your application has been approved</p>
            </div>
            
            <div class="content">
              <h2>Congratulations Dr. ${data.firstName} ${data.lastName}!</h2>
              
              <p>We're excited to welcome you to the BaseHealth Provider Network. Your application has been approved and your account will be activated within 24 hours.</p>
              
              <div class="approval-box">
                <strong>✅ Application Approved</strong><br>
                Application ID: <strong>${data.applicationId}</strong><br>
                Specialty: <strong>${data.specialty}</strong><br>
                Approval Date: <strong>${new Date().toLocaleDateString()}</strong>
              </div>
              
              <div class="next-steps">
                <h3>Getting Started:</h3>
                <ol>
                  <li>You'll receive login credentials within 24 hours</li>
                  <li>Complete your provider profile setup</li>
                  <li>Set your availability and scheduling preferences</li>
                  <li>Start connecting with patients!</li>
                </ol>
                
                <a href="https://basehealth.app/providers/onboarding" class="cta-button">Complete Setup</a>
              </div>
              
              <p>Thank you for choosing BaseHealth to grow your practice and help patients access quality healthcare.</p>
              
              <p>Best regards,<br>The BaseHealth Team</p>
            </div>
            
            <div class="footer">
              <p>BaseHealth - Connecting Patients with Quality Healthcare Providers</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private generateRejectionHTML(data: ProviderApplicationData, reason: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #fef2f2; }
            .reason-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
            .reapply-box { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BaseHealth Provider Network</h1>
              <p>Application Status Update</p>
            </div>
            
            <div class="content">
              <h2>Dear Dr. ${data.firstName} ${data.lastName},</h2>
              
              <p>Thank you for your interest in joining the BaseHealth Provider Network. After careful review, we are unable to approve your application at this time.</p>
              
              <div class="reason-box">
                <strong>Reason for Rejection:</strong><br>
                ${reason}
              </div>
              
              <div class="reapply-box">
                <h3>Reapplication Process:</h3>
                <p>You may reapply after addressing the issues mentioned above. Please ensure all requirements are met before submitting a new application.</p>
                <p>If you have questions about this decision, please contact our support team at support@basehealth.app</p>
              </div>
              
              <p>We appreciate your interest in BaseHealth and wish you success in your practice.</p>
              
              <p>Best regards,<br>The BaseHealth Team</p>
            </div>
            
            <div class="footer">
              <p>BaseHealth - Connecting Patients with Quality Healthcare Providers</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private generateAdminNotificationHTML(data: AdminNotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #faf5ff; }
            .application-box { background: #ede9fe; border-left: 4px solid #7c3aed; padding: 15px; margin: 20px 0; }
            .cta-button { background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 New Provider Application</h1>
              <p>Admin Notification</p>
            </div>
            
            <div class="content">
              <h2>New Application Received</h2>
              
              <p>A new provider application has been submitted and requires review.</p>
              
              <div class="application-box">
                <strong>Application Details:</strong><br>
                Provider: <strong>${data.providerName}</strong><br>
                Specialty: <strong>${data.specialty}</strong><br>
                Application ID: <strong>${data.applicationId}</strong><br>
                Submitted: <strong>${new Date(data.submittedDate).toLocaleDateString()}</strong>
              </div>
              
              <p>Please review the application in the admin portal and take appropriate action.</p>
              
              <a href="https://basehealth.app/admin" class="cta-button">Review Application</a>
              
              <p>This is an automated notification from the BaseHealth Provider Management System.</p>
            </div>
            
            <div class="footer">
              <p>BaseHealth Admin Portal</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  // Text email templates (fallback)
  private generateApplicationConfirmationText(data: ProviderApplicationData): string {
    return `
BaseHealth Provider Network - Application Received

Hello Dr. ${data.firstName} ${data.lastName},

Thank you for your interest in joining the BaseHealth Provider Network. We have successfully received your application.

Application Details:
- Application ID: ${data.applicationId}
- Specialty: ${data.specialty}  
- Submitted: ${new Date(data.submittedDate).toLocaleDateString()}
- Status: Under Review

What's Next?
1. Document verification (2-3 business days)
2. Background check (3-5 business days)  
3. Final approval and account setup

We'll send you an email update within 24 hours with the next steps.

Best regards,
The BaseHealth Team
    `
  }

  private generateApprovalText(data: ProviderApplicationData): string {
    return `
BaseHealth Provider Network - Application Approved! 🎉

Congratulations Dr. ${data.firstName} ${data.lastName}!

Your application has been approved and your account will be activated within 24 hours.

Application ID: ${data.applicationId}
Specialty: ${data.specialty}
Approval Date: ${new Date().toLocaleDateString()}

Getting Started:
1. You'll receive login credentials within 24 hours
2. Complete your provider profile setup
3. Set your availability and scheduling preferences
4. Start connecting with patients!

Thank you for choosing BaseHealth!

Best regards,
The BaseHealth Team
    `
  }

  private generateRejectionText(data: ProviderApplicationData, reason: string): string {
    return `
BaseHealth Provider Network - Application Status Update

Dear Dr. ${data.firstName} ${data.lastName},

After careful review, we are unable to approve your application at this time.

Reason: ${reason}

You may reapply after addressing the issues mentioned above. Please contact support@basehealth.app if you have questions.

Best regards,
The BaseHealth Team
    `
  }

  private generateAdminNotificationText(data: AdminNotificationData): string {
    return `
BaseHealth Admin Notification - New Provider Application

New Application Details:
- Provider: ${data.providerName}
- Specialty: ${data.specialty}
- Application ID: ${data.applicationId}
- Submitted: ${new Date(data.submittedDate).toLocaleDateString()}

Please review the application in the admin portal.

This is an automated notification.
    `
  }
}

// Export a singleton instance
export const emailService = new EmailService()

// Helper functions for common use cases
export async function notifyProviderApplicationReceived(data: ProviderApplicationData): Promise<boolean> {
  return emailService.sendApplicationConfirmation(data)
}

export async function notifyProviderApproved(data: ProviderApplicationData): Promise<boolean> {
  return emailService.sendApplicationApproval(data)
}

export async function notifyProviderRejected(data: ProviderApplicationData, reason: string): Promise<boolean> {
  return emailService.sendApplicationRejection(data, reason)
}

export async function notifyAdminNewApplication(data: AdminNotificationData): Promise<boolean> {
  return emailService.sendNewApplicationNotification(data)
} 
