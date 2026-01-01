/**
 * Admin API - Review application (approve/reject/request info)
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { logAdminDecision, createAuditLog, AuditActions } from "@/lib/onboarding/audit-service"
import { ApplicationStatus, ProviderStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { action, notes, approvalScope } = body

    if (!action || !["approve", "reject", "request_info"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
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

    // Check for exclusion failures before approval
    if (action === "approve") {
      const hasExclusionFailure = application.verifications.some(
        (v) => (v.type === "OIG_LEIE" || v.type === "SAM_EXCLUSION") && v.passed === false
      )

      if (hasExclusionFailure) {
        return NextResponse.json(
          { error: "Cannot approve: Applicant appears on exclusion list" },
          { status: 400 }
        )
      }
    }

    // Map action to status
    const statusMap: Record<string, ApplicationStatus> = {
      approve: "APPROVED",
      reject: "REJECTED",
      request_info: "PENDING_INFO",
    }

    // Update application
    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: statusMap[action],
        reviewedAt: new Date(),
        reviewedBy: "Admin", // In real app, get from auth
        reviewNotes: notes,
        approvalScope: approvalScope || null,
      },
    })

    // If approved, create Provider or Caregiver record
    if (action === "approve") {
      if (application.role === "PROVIDER") {
        // Check if provider already exists
        const existingProvider = await prisma.provider.findUnique({
          where: { email: application.email },
        })

        if (!existingProvider) {
          await prisma.provider.create({
            data: {
              applicationId: application.id,
              type: (application.providerType as any) || "PHYSICIAN",
              fullName: application.fullName,
              email: application.email,
              phone: application.phone,
              npiNumber: application.npiNumber,
              licenseNumber: application.licenseNumber,
              licenseState: application.licenseState,
              licenseExpiry: application.licenseExpiry,
              specialties: application.specialty ? [application.specialty] : [],
              professionType: application.professionType,
              taxonomyCode: application.taxonomyCode,
              bio: application.bio,
              statesOfPractice: application.regions,
              country: application.country,
              status: "APPROVED",
              isVerified: true,
              lastOigCheck: new Date(),
              oigClear: true,
              lastSamCheck: new Date(),
              samClear: true,
            },
          })
        } else {
          // Update existing provider
          await prisma.provider.update({
            where: { email: application.email },
            data: {
              applicationId: application.id,
              status: "APPROVED",
              isVerified: true,
              statesOfPractice: application.regions,
              lastOigCheck: new Date(),
              oigClear: true,
              lastSamCheck: new Date(),
              samClear: true,
            },
          })
        }
      } else if (application.role === "CAREGIVER") {
        // Check if caregiver already exists
        const existingCaregiver = await prisma.caregiver.findUnique({
          where: { email: application.email },
        })

        if (!existingCaregiver) {
          await prisma.caregiver.create({
            data: {
              applicationId: application.id,
              firstName: application.firstName || "",
              lastName: application.lastName || "",
              email: application.email,
              phone: application.phone,
              specialties: application.servicesOffered,
              yearsExperience: application.experienceYears?.toString(),
              bio: application.bio,
              certifications: application.certifications,
              languagesSpoken: application.languages,
              serviceAreas: application.regions,
              status: "AVAILABLE",
              verified: true,
              applicationStatus: "approved",
              reviewedAt: new Date(),
              reviewedBy: "Admin",
            },
          })
        } else {
          await prisma.caregiver.update({
            where: { email: application.email },
            data: {
              applicationId: application.id,
              status: "AVAILABLE",
              verified: true,
              applicationStatus: "approved",
              reviewedAt: new Date(),
            },
          })
        }
      }
    }

    // Log the decision
    await logAdminDecision(
      id,
      "admin", // In real app, get from auth
      "admin@basehealth.xyz", // In real app, get from auth
      action as any,
      notes,
      req.headers.get("x-forwarded-for") || undefined
    )

    return NextResponse.json({
      success: true,
      application: updated,
      message: `Application ${action}d successfully`,
    })
  } catch (error) {
    logger.error("Failed to review application", error)
    return NextResponse.json(
      { error: "Failed to process review" },
      { status: 500 }
    )
  }
}
