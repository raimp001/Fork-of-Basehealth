import type { Application, ReviewAction } from "@/types/admin"
import { getPrimaryAdminEmail } from "@/lib/admin-access"

export interface NotificationTemplate {
  subject: string
  body: string
  type: 'email' | 'sms' | 'in_app'
}

export interface NotificationConfig {
  applicant: NotificationTemplate
  admin?: NotificationTemplate
  internal?: NotificationTemplate
}

// Email templates for different review actions
export const notificationTemplates: Record<ReviewAction['type'], NotificationConfig> = {
  approve: {
    applicant: {
      subject: "🎉 Your BaseHealth Application Has Been Approved!",
      body: `
Dear {{firstName}},

Congratulations! We're excited to inform you that your application to join the BaseHealth platform has been approved.

**Next Steps:**
1. Complete your profile setup
2. Upload required documentation
3. Review platform guidelines
4. Start connecting with patients/clients

**What You Can Expect:**
- Access to our secure platform within 24 hours
- Welcome orientation materials
- Support from our onboarding team

If you have any questions, please don't hesitate to contact our support team at support@basehealth.com.

Welcome to the BaseHealth family!

Best regards,
The BaseHealth Team

---
Review Notes: {{reviewNotes}}
Application ID: {{applicationId}}
      `,
      type: 'email'
    },
    internal: {
      subject: "Application Approved - {{firstName}} {{lastName}}",
      body: `
Application {{applicationId}} has been approved by {{reviewer}}.

Applicant: {{firstName}} {{lastName}}
Type: {{applicationType}}
Email: {{email}}
Review Date: {{reviewDate}}

Review Notes: {{reviewNotes}}

Next actions required:
- Send welcome materials
- Set up platform access
- Schedule orientation (if applicable)
      `,
      type: 'email'
    }
  },

  reject: {
    applicant: {
      subject: "Update on Your BaseHealth Application",
      body: `
Dear {{firstName}},

Thank you for your interest in joining the BaseHealth platform. After careful review of your application, we regret to inform you that we are unable to move forward with your application at this time.

**Reason for Decision:**
{{reviewNotes}}

**What's Next:**
- You may reapply after addressing the concerns noted above
- Consider gaining additional experience or certifications
- Feel free to contact us if you have questions about the decision

We appreciate the time you invested in your application and encourage you to apply again in the future when you meet our requirements.

Best regards,
The BaseHealth Team

---
Application ID: {{applicationId}}
Review Date: {{reviewDate}}
      `,
      type: 'email'
    },
    internal: {
      subject: "Application Rejected - {{firstName}} {{lastName}}",
      body: `
Application {{applicationId}} has been rejected by {{reviewer}}.

Applicant: {{firstName}} {{lastName}}
Type: {{applicationType}}
Email: {{email}}
Review Date: {{reviewDate}}

Review Notes: {{reviewNotes}}

Next actions:
- Application archived
- Feedback sent to applicant
- Updated in compliance records
      `,
      type: 'email'
    }
  },

  request_info: {
    applicant: {
      subject: "Additional Information Needed for Your BaseHealth Application",
      body: `
Dear {{firstName}},

Thank you for your application to join the BaseHealth platform. We're currently reviewing your submission and need some additional information to proceed.

**Information Requested:**
{{reviewNotes}}

**How to Submit:**
1. Log into your application portal
2. Upload the requested documents
3. Update any incomplete sections
4. Resubmit for review

**Important:**
- Please provide the requested information within 14 days
- Your application will remain active during this period
- Contact us if you need assistance or have questions

We appreciate your patience and look forward to completing your review.

Best regards,
The BaseHealth Team

---
Application ID: {{applicationId}}
Review Date: {{reviewDate}}
      `,
      type: 'email'
    },
    internal: {
      subject: "Information Requested - {{firstName}} {{lastName}}",
      body: `
Additional information has been requested for application {{applicationId}} by {{reviewer}}.

Applicant: {{firstName}} {{lastName}}
Type: {{applicationType}}
Email: {{email}}
Review Date: {{reviewDate}}

Information Requested: {{reviewNotes}}

Follow-up required:
- Monitor for applicant response
- Send reminder in 7 days if no response
- Auto-close application after 14 days if no response
      `,
      type: 'email'
    }
  },

  schedule_interview: {
    applicant: {
      subject: "Interview Invitation - BaseHealth Application",
      body: `
Dear {{firstName}},

Congratulations! Your BaseHealth application has progressed to the interview stage. We would like to schedule a conversation to learn more about your experience and discuss the opportunity.

**Interview Details:**
- Duration: 30-45 minutes
- Format: Video call or phone interview
- Topics: Experience, platform expectations, questions

**Next Steps:**
1. A team member will contact you within 2 business days
2. We'll schedule a convenient time for both parties
3. You'll receive interview preparation materials

**What to Expect:**
- Discussion of your professional background
- Overview of platform policies and procedures
- Opportunity to ask questions about BaseHealth

We're excited to speak with you and learn more about your qualifications.

Best regards,
The BaseHealth Team

---
Review Notes: {{reviewNotes}}
Application ID: {{applicationId}}
      `,
      type: 'email'
    },
    internal: {
      subject: "Interview Scheduled - {{firstName}} {{lastName}}",
      body: `
Interview has been scheduled for application {{applicationId}} by {{reviewer}}.

Applicant: {{firstName}} {{lastName}}
Type: {{applicationType}}
Email: {{email}}
Phone: {{phone}}
Review Date: {{reviewDate}}

Interview Notes: {{reviewNotes}}

Next actions:
- Contact applicant within 2 business days
- Schedule interview time
- Send preparation materials
- Assign interviewer
      `,
      type: 'email'
    }
  }
}

// Function to process template variables
export function processTemplate(template: string, variables: Record<string, string>): string {
  let processed = template
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    processed = processed.replace(new RegExp(placeholder, 'g'), value)
  })
  
  return processed
}

// Function to generate notification variables from application data
export function generateNotificationVariables(
  application: Application, 
  action: ReviewAction,
  reviewer: string = 'Admin Team'
): Record<string, string> {
  const baseVariables = {
    firstName: application.personalInfo.firstName,
    lastName: application.personalInfo.lastName,
    email: application.personalInfo.email,
    phone: application.personalInfo.phone,
    applicationId: application.id,
    applicationType: application.type,
    reviewDate: new Date().toLocaleDateString(),
    reviewer: reviewer,
    reviewNotes: action.notes
  }

  // Add type-specific variables
  if (application.type === 'provider') {
    const providerApp = application as import('@/types/admin').ProviderApplication
    return {
      ...baseVariables,
      specialty: providerApp.practiceInfo.specialty,
      practiceName: providerApp.practiceInfo.practiceName,
      npiNumber: providerApp.personalInfo.npiNumber || 'Not provided'
    }
  } else {
    const caregiverApp = application as import('@/types/admin').CaregiverApplication
    return {
      ...baseVariables,
      specialties: caregiverApp.professionalInfo.specialties.join(', '),
      experience: caregiverApp.professionalInfo.experience,
      hourlyRate: caregiverApp.professionalInfo.hourlyRate.toString()
    }
  }
}

// Mock notification service
export class NotificationService {
  private readonly adminEmail = getPrimaryAdminEmail()

  async sendNotification(
    recipient: string,
    template: NotificationTemplate,
    variables: Record<string, string>
  ): Promise<boolean> {
    try {
      const subject = processTemplate(template.subject, variables)
      const body = processTemplate(template.body, variables)
      
      console.log('📧 Sending notification:', {
        to: recipient,
        type: template.type,
        subject: subject,
        bodyPreview: body.substring(0, 100) + '...'
      })
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // In a real application, you would integrate with:
      // - Email service (SendGrid, AWS SES, etc.)
      // - SMS service (Twilio, AWS SNS, etc.)
      // - In-app notification system
      
      return true
    } catch (error) {
      console.error('Failed to send notification:', error)
      return false
    }
  }

  async sendReviewNotifications(
    application: Application,
    action: ReviewAction,
    reviewer: string = 'Admin Team'
  ): Promise<{
    applicantNotified: boolean
    internalNotified: boolean
  }> {
    const variables = generateNotificationVariables(application, action, reviewer)
    const templates = notificationTemplates[action.type]
    
    const results = {
      applicantNotified: false,
      internalNotified: false
    }

    // Send notification to applicant
    if (templates.applicant) {
      results.applicantNotified = await this.sendNotification(
        application.personalInfo.email,
        templates.applicant,
        variables
      )
    }

    // Send internal notification
    if (templates.internal) {
      results.internalNotified = await this.sendNotification(
        this.adminEmail,
        templates.internal,
        variables
      )
    }

    return results
  }
}

// Export singleton instance
export const notificationService = new NotificationService()
