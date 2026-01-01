/**
 * Onboarding Application API
 * 
 * Handles creating, updating, and submitting applications.
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { runAllVerifications } from "@/lib/onboarding/verification-service"
import { logApplicationSubmitted, createAuditLog, AuditActions } from "@/lib/onboarding/audit-service"
import { requirementsEngine } from "@/lib/onboarding/requirements-engine"
import { ApplicationRole, ApplicationStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

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

    // Check for existing application
    const existing = await prisma.application.findFirst({
      where: {
        email,
        status: { notIn: ["REJECTED"] },
      },
    })

    if (existing) {
      // Return existing draft or pending application
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

    // Hash password if provided
    let passwordHash = null
    if (password) {
      passwordHash = await bcrypt.hash(password, 10)
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        role: role as ApplicationRole,
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
  } catch (error) {
    logger.error("Failed to create application", error)
    return NextResponse.json(
      { error: "Failed to create application" },
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

    // Map incoming data to schema fields
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

    for (const [key, value] of Object.entries(data || {})) {
      if (fieldMappings[key] && value !== undefined) {
        // Handle date conversions
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
      // Validate application
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

      // Set attestation timestamp
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

    // Log action
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
      // Run verifications asynchronously
      runAllVerifications(applicationId).catch(err => {
        logger.error("Background verification failed", { applicationId, error: err })
      })
    }

    return NextResponse.json({
      success: true,
      application: updated,
      submitted: submit,
    })
  } catch (error) {
    logger.error("Failed to update application", error)
    return NextResponse.json(
      { error: "Failed to update application" },
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
  } catch (error) {
    logger.error("Failed to get application", error)
    return NextResponse.json(
      { error: "Failed to get application" },
      { status: 500 }
    )
  }
}
