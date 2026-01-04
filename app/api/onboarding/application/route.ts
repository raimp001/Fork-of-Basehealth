/**
 * Onboarding Application API
 * 
 * Handles creating, updating, and submitting applications.
 * Uses Prisma when database is available, falls back to in-memory store otherwise.
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
import bcrypt from "bcryptjs"

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

      for (const [key, value] of Object.entries(data || {})) {
        if (fieldMappings[key] && value !== undefined) {
          if (key.includes("Expiry") || key === "dateOfBirth") {
            updateData[fieldMappings[key]] = value ? new Date(value as string) : null
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

      for (const [key, value] of Object.entries(data || {})) {
        if (fieldMappings[key] && value !== undefined) {
          if (key.includes("Expiry") || key === "dateOfBirth") {
            (updateData as any)[fieldMappings[key]] = value ? new Date(value as string) : null
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
