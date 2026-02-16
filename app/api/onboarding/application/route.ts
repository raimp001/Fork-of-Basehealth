/**
 * Onboarding Application API
 * 
 * Handles creating, updating, and submitting applications.
 * Uses Prisma when database is available, falls back to in-memory store otherwise.
 * 
 * v2: Fixed integer field handling (experienceYears)
 */

import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import {
  isDatabaseAvailable,
  findApplicationByEmail,
  findApplicationById,
  createApplication as createInMemoryApplication,
  updateApplication as updateInMemoryApplication,
  StoredApplication
} from "@/lib/application-store"
import { getPrimaryAdminEmail } from "@/lib/admin-access"

// ============================================================================
// ADMIN NOTIFICATION FUNCTION
// ============================================================================

interface NotificationData {
  applicationId: string
  role: string
  email: string
  fullName: string
  specialty?: string | null
}

async function notifyAdminOfNewApplication(data: NotificationData): Promise<void> {
  const adminEmail = getPrimaryAdminEmail()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.basehealth.xyz"
  
  // Log the notification (always)
  logger.info("New application submitted", {
    applicationId: data.applicationId,
    role: data.role,
    email: data.email,
    fullName: data.fullName,
    specialty: data.specialty,
    adminNotificationTarget: adminEmail || 'not configured',
  })

  // If we have an admin email configured, try to send email notification
  if (adminEmail) {
    try {
      // Check if we have email sending capability
      const resendApiKey = process.env.RESEND_API_KEY
      
      if (resendApiKey) {
        // Send via Resend API
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'BaseHealth <notifications@basehealth.xyz>',
            to: adminEmail,
            subject: `[BaseHealth] New ${data.role} Application - ${data.fullName}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #0891b2, #3b82f6); padding: 20px; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">New Application Submitted</h1>
                </div>
                <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: 0; border-radius: 0 0 12px 12px;">
                  <p style="color: #475569; margin: 0 0 16px;">A new ${data.role.toLowerCase()} application has been submitted and requires your review.</p>
                  
                  <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Applicant:</td>
                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.fullName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email:</td>
                        <td style="padding: 8px 0; color: #0f172a;">${data.email}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Role:</td>
                        <td style="padding: 8px 0;">
                          <span style="background: ${data.role === 'PROVIDER' ? '#dbeafe' : '#fce7f3'}; color: ${data.role === 'PROVIDER' ? '#1e40af' : '#9d174d'}; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600;">
                            ${data.role}
                          </span>
                        </td>
                      </tr>
                      ${data.specialty ? `
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Specialty:</td>
                        <td style="padding: 8px 0; color: #0f172a;">${data.specialty}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Application ID:</td>
                        <td style="padding: 8px 0; color: #64748b; font-family: monospace; font-size: 12px;">${data.applicationId}</td>
                      </tr>
                    </table>
                  </div>

                  <a href="${appUrl}/admin/${data.role === 'PROVIDER' ? 'provider-applications' : 'caregiver-applications'}" 
                     style="display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-right: 8px;">
                    Review Application →
                  </a>
                  
                  <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
                    This notification was sent automatically by BaseHealth. 
                    <a href="${appUrl}/admin" style="color: #0891b2;">Open Admin Portal</a>
                  </p>
                </div>
              </div>
            `,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          logger.warn("Failed to send admin notification email via Resend", { error: errorData })
        } else {
          logger.info("Admin notification email sent successfully", { to: adminEmail, applicationId: data.applicationId })
        }
      } else {
        // No email service configured - just log
        logger.info("Admin notification email skipped (no RESEND_API_KEY configured)", { 
          wouldHaveSentTo: adminEmail,
          applicationId: data.applicationId 
        })
      }
    } catch (emailError) {
      logger.error("Failed to send admin notification email", { error: emailError })
    }
  }
  
  // Also store in database for admin dashboard display if available
  try {
    const dbAvailable = await isDatabaseAvailable()
    if (dbAvailable) {
      // Could store in a notifications table here if implemented
      logger.debug("Would store notification in database", { applicationId: data.applicationId })
    }
  } catch (dbError) {
    logger.debug("Could not store notification in database", { error: dbError })
  }
}

// Field mappings for updates
const fieldMappings: Record<string, string> = {
  regions: "regions",
  firstName: "firstName",
  lastName: "lastName",
  fullName: "fullName",
  organizationName: "organizationName",
  phone: "phone",
  providerType: "providerType",
  professionType: "professionType",
  specialty: "specialty",
  taxonomyCode: "taxonomyCode",
  npiNumber: "npiNumber",
  licenseNumber: "licenseNumber",
  licenseState: "licenseState",
  licenseExpiry: "licenseExpiry",
  deaNumber: "deaNumber",
  deaExpiry: "deaExpiry",
  malpracticeCarrier: "malpracticeCarrier",
  malpracticePolicyNumber: "malpracticePolicyNumber",
  malpracticeExpiry: "malpracticeExpiry",
  servicesOffered: "servicesOffered",
  experienceYears: "experienceYears",
  bio: "bio",
  availability: "availability",
  hasTransport: "hasTransport",
  certifications: "certifications",
  languages: "languages",
  dateOfBirth: "dateOfBirth",
  attestedAccuracy: "attestedAccuracy",
  attestedLicenseScope: "attestedLicenseScope",
  consentToVerification: "consentToVerification",
  consentToBackgroundCheck: "consentToBackgroundCheck",
}

// POST - Create new application
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { role, country, email, password } = body

    // Validate required fields
    if (!role || !country || !email) {
      return NextResponse.json(
        { error: "Role, country, and email are required" },
        { status: 400 }
      )
    }

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable) {
      // Use Prisma
      const { prisma } = await import("@/lib/prisma")
      const { ApplicationRole } = await import("@prisma/client")
      const { createAuditLog, AuditActions } = await import("@/lib/onboarding/audit-service")

      // Check for existing application
      const existing = await prisma.application.findFirst({
        where: {
          email,
          status: { notIn: ["REJECTED"] },
        },
      })

      if (existing) {
        if (existing.status === "DRAFT") {
          return NextResponse.json({
            success: true,
            application: existing,
            resuming: true,
          })
        }
        return NextResponse.json(
          { error: "An application with this email already exists" },
          { status: 409 }
        )
      }

      // Create application
      const application = await prisma.application.create({
        data: {
          role: role as typeof ApplicationRole[keyof typeof ApplicationRole],
          country,
          email,
          status: "DRAFT",
          currentStep: 0,
          stepsCompleted: {},
        },
      })

      await createAuditLog({
        action: AuditActions.APPLICATION_CREATED,
        entityType: "Application",
        entityId: application.id,
        actorEmail: email,
        description: `New ${role} application started`,
        metadata: { role, country },
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
      })

      return NextResponse.json({
        success: true,
        application,
      })
    } else {
      // Use in-memory fallback
      logger.info("Using in-memory application store (no database configured)")

      // Check for existing application
      const existing = findApplicationByEmail(email)
      if (existing) {
        if (existing.status === "DRAFT") {
          return NextResponse.json({
            success: true,
            application: existing,
            resuming: true,
          })
        }
        return NextResponse.json(
          { error: "An application with this email already exists" },
          { status: 409 }
        )
      }

      // Create application
      const application = createInMemoryApplication({
        role: role as 'PROVIDER' | 'CAREGIVER',
        country,
        email,
      })

      return NextResponse.json({
        success: true,
        application,
        note: "Using in-memory storage. For production, configure DATABASE_URL.",
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error("Failed to create application", { error: errorMessage, stack: error instanceof Error ? error.stack : undefined })
    return NextResponse.json(
      { error: `Failed to create application: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// PUT - Update application (save progress)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { applicationId, step, data, submit } = body

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      )
    }

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable) {
      // Use Prisma
      const { prisma } = await import("@/lib/prisma")
      const { runAllVerifications } = await import("@/lib/onboarding/verification-service")
      const { createAuditLog, AuditActions } = await import("@/lib/onboarding/audit-service")
      const { requirementsEngine } = await import("@/lib/onboarding/requirements-engine")

      const application = await prisma.application.findUnique({
        where: { id: applicationId },
      })

      if (!application) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        )
      }

      if (application.status !== "DRAFT" && application.status !== "PENDING_INFO") {
        return NextResponse.json(
          { error: "Application cannot be modified" },
          { status: 400 }
        )
      }

      // Build update data
      const updateData: any = {
        updatedAt: new Date(),
      }

      // Fields that should be integers
      const integerFields = ['experienceYears']
      
      for (const [key, value] of Object.entries(data || {})) {
        if (fieldMappings[key] && value !== undefined) {
          if (key.includes("Expiry") || key === "dateOfBirth") {
            // Date fields: convert to Date or null
            updateData[fieldMappings[key]] = value ? new Date(value as string) : null
          } else if (integerFields.includes(key)) {
            // Integer fields: convert to number or null
            const numValue = parseInt(value as string, 10)
            updateData[fieldMappings[key]] = isNaN(numValue) ? null : numValue
          } else {
            updateData[fieldMappings[key]] = value
          }
        }
      }

      // Update step tracking
      if (step !== undefined) {
        const stepsCompleted = (application.stepsCompleted as Record<string, boolean>) || {}
        stepsCompleted[step.toString()] = true
        updateData.stepsCompleted = stepsCompleted
        updateData.currentStep = Math.max(application.currentStep, step + 1)
      }

      // Handle submission
      if (submit) {
        const validation = requirementsEngine.validateApplication(
          application.role,
          application.country,
          { ...application, ...updateData, ...data }
        )

        if (!validation.valid) {
          return NextResponse.json(
            { error: "Application incomplete", validationErrors: validation.errors },
            { status: 400 }
          )
        }

        if (data.attestedAccuracy) {
          updateData.attestedAt = new Date()
        }

        updateData.status = "SUBMITTED"
        updateData.submittedAt = new Date()
      }

      // Update application
      const updated = await prisma.application.update({
        where: { id: applicationId },
        data: updateData,
      })

      await createAuditLog({
        action: submit ? AuditActions.APPLICATION_SUBMITTED : AuditActions.APPLICATION_SAVED_DRAFT,
        entityType: "Application",
        entityId: applicationId,
        actorEmail: application.email,
        description: submit ? "Application submitted for review" : `Saved step ${step}`,
        metadata: { step, submit },
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
      })

      // Run verifications on submission
      if (submit && application.role === "PROVIDER" && application.country === "US") {
        runAllVerifications(applicationId).catch(err => {
          logger.error("Background verification failed", { applicationId, error: err })
        })
      }

      // Send admin notification on submission
      if (submit) {
        notifyAdminOfNewApplication({
          applicationId,
          role: application.role,
          email: application.email,
          fullName: updateData.fullName || data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown',
          specialty: data.specialty || null,
        }).catch(err => {
          logger.error("Failed to notify admin", { applicationId, error: err })
        })
      }

      return NextResponse.json({
        success: true,
        application: updated,
        submitted: submit,
      })
    } else {
      // Use in-memory fallback
      // In serverless environments, we need to handle the case where the application
      // was created in a different function instance. Use upsert pattern.
      let application = findApplicationById(applicationId)

      // If not found by ID, try to find by email from the data
      if (!application && data?.email) {
        application = findApplicationByEmail(data.email)
      }

      // If still not found, create it (upsert pattern for serverless)
      if (!application) {
        // We need role and country from the data to create
        const role = data?.role || 'PROVIDER'
        const country = data?.country || 'US'
        const email = data?.email
        
        if (!email) {
          return NextResponse.json(
            { error: "Email is required to create application" },
            { status: 400 }
          )
        }
        
        // Create the application on-the-fly
        application = createInMemoryApplication({
          role: role as 'PROVIDER' | 'CAREGIVER',
          country,
          email,
        })
        
        logger.info("Created application on-the-fly during update (serverless upsert)", { 
          applicationId: application.id,
          email 
        })
      }

      if (application.status !== "DRAFT" && application.status !== "PENDING_INFO") {
        return NextResponse.json(
          { error: "Application cannot be modified" },
          { status: 400 }
        )
      }

      // Build update data
      const updateData: Partial<StoredApplication> = {}

      // Fields that should be integers
      const integerFields = ['experienceYears']

      for (const [key, value] of Object.entries(data || {})) {
        if (fieldMappings[key] && value !== undefined) {
          if (key.includes("Expiry") || key === "dateOfBirth") {
            // Date fields: convert to Date or null
            (updateData as any)[fieldMappings[key]] = value ? new Date(value as string) : null
          } else if (integerFields.includes(key)) {
            // Integer fields: convert to number or null
            const numValue = parseInt(value as string, 10)
            ;(updateData as any)[fieldMappings[key]] = isNaN(numValue) ? null : numValue
          } else {
            (updateData as any)[fieldMappings[key]] = value
          }
        }
      }

      // Update step tracking
      if (step !== undefined) {
        const stepsCompleted = { ...application.stepsCompleted }
        stepsCompleted[step.toString()] = true
        updateData.stepsCompleted = stepsCompleted
        updateData.currentStep = Math.max(application.currentStep, step + 1)
      }

      // Handle submission
      if (submit) {
        // Simple validation for in-memory mode
        if (!data.attestedAccuracy) {
          return NextResponse.json(
            { error: "Application incomplete", validationErrors: ["Please confirm all attestations"] },
            { status: 400 }
          )
        }

        updateData.attestedAt = new Date()
        updateData.status = "SUBMITTED"
        updateData.submittedAt = new Date()
      }

      // Update application
      const updated = updateInMemoryApplication(application.id, updateData)

      if (!updated) {
        return NextResponse.json(
          { error: "Failed to update application" },
          { status: 500 }
        )
      }

      // Send admin notification on submission (in-memory mode)
      if (submit) {
        notifyAdminOfNewApplication({
          applicationId: application.id,
          role: application.role,
          email: application.email,
          fullName: updateData.fullName || data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown',
          specialty: data.specialty || null,
        }).catch(err => {
          logger.error("Failed to notify admin", { applicationId: application.id, error: err })
        })
      }

      return NextResponse.json({
        success: true,
        application: updated,
        submitted: submit,
        note: "Using in-memory storage. For production, configure DATABASE_URL for persistent storage.",
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error("Failed to update application", { error: errorMessage, stack: error instanceof Error ? error.stack : undefined })
    return NextResponse.json(
      { error: `Failed to update application: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// GET - Retrieve application status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const applicationId = searchParams.get("id")
    const email = searchParams.get("email")

    if (!applicationId && !email) {
      return NextResponse.json(
        { error: "Application ID or email required" },
        { status: 400 }
      )
    }

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable) {
      const { prisma } = await import("@/lib/prisma")

      const application = await prisma.application.findFirst({
        where: applicationId 
          ? { id: applicationId }
          : { email: email!, status: { notIn: ["REJECTED"] } },
        include: {
          documents: true,
          verifications: {
            orderBy: { checkedAt: "desc" },
          },
        },
      })

      if (!application) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        application,
      })
    } else {
      // Use in-memory fallback
      const application = applicationId 
        ? findApplicationById(applicationId)
        : email ? findApplicationByEmail(email) : null

      if (!application) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        application,
        note: "Using in-memory storage.",
      })
    }
  } catch (error) {
    logger.error("Failed to get application", error)
    return NextResponse.json(
      { error: "Failed to get application" },
      { status: 500 }
    )
  }
}
