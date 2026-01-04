/**
 * Audit Logging Service
 * 
 * Tracks all significant actions for compliance and accountability.
 * Falls back to console logging when database is unavailable.
 */

import { logger } from "@/lib/logger"

export interface AuditLogParams {
  actorId?: string
  actorEmail?: string
  actorRole?: string
  action: string
  entityType: string
  entityId?: string
  description?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

/**
 * Check if database is available for audit logging
 */
async function canUsePrisma(): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL) return false
    const { prisma } = await import("@/lib/prisma")
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    const dbAvailable = await canUsePrisma()
    
    if (dbAvailable) {
      const { prisma } = await import("@/lib/prisma")
      await prisma.auditLog.create({
        data: {
          actorId: params.actorId,
          actorEmail: params.actorEmail,
          actorRole: params.actorRole,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          description: params.description,
          metadata: params.metadata,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
      })
    } else {
      // Fallback to console logging
      logger.info("Audit log (no DB)", {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        actorEmail: params.actorEmail,
        description: params.description,
      })
    }
  } catch (error) {
    // Log but don't throw - audit logging shouldn't break the main flow
    logger.error("Failed to create audit log", { params, error })
  }
}

// ============================================================================
// COMMON AUDIT ACTIONS
// ============================================================================

export const AuditActions = {
  // Application lifecycle
  APPLICATION_CREATED: "application.created",
  APPLICATION_UPDATED: "application.updated",
  APPLICATION_SUBMITTED: "application.submitted",
  APPLICATION_SAVED_DRAFT: "application.saved_draft",
  
  // Admin actions
  ADMIN_VIEWED_APPLICATION: "admin.viewed_application",
  ADMIN_APPROVED: "admin.approved",
  ADMIN_REJECTED: "admin.rejected",
  ADMIN_REQUESTED_INFO: "admin.requested_info",
  ADMIN_SUSPENDED: "admin.suspended",
  ADMIN_REACTIVATED: "admin.reactivated",
  ADMIN_NOTES_ADDED: "admin.notes_added",
  
  // Verification events
  VERIFICATION_STARTED: "verification.started",
  VERIFICATION_COMPLETED: "verification.completed",
  VERIFICATION_FAILED: "verification.failed",
  
  // Document events
  DOCUMENT_UPLOADED: "document.uploaded",
  DOCUMENT_VERIFIED: "document.verified",
  DOCUMENT_REJECTED: "document.rejected",
  
  // Account events
  ACCOUNT_CREATED: "account.created",
  ACCOUNT_ACTIVATED: "account.activated",
  ACCOUNT_LOGIN: "account.login",
  PASSWORD_CHANGED: "account.password_changed",
} as const

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export async function logApplicationSubmitted(
  applicationId: string,
  applicantEmail: string,
  role: string,
  ipAddress?: string
): Promise<void> {
  await createAuditLog({
    action: AuditActions.APPLICATION_SUBMITTED,
    entityType: "Application",
    entityId: applicationId,
    actorEmail: applicantEmail,
    description: `${role} application submitted`,
    metadata: { role },
    ipAddress,
  })
}

export async function logAdminDecision(
  applicationId: string,
  adminId: string,
  adminEmail: string,
  decision: "approved" | "rejected" | "requested_info",
  notes?: string,
  ipAddress?: string
): Promise<void> {
  const actionMap = {
    approved: AuditActions.ADMIN_APPROVED,
    rejected: AuditActions.ADMIN_REJECTED,
    requested_info: AuditActions.ADMIN_REQUESTED_INFO,
  }

  await createAuditLog({
    action: actionMap[decision],
    entityType: "Application",
    entityId: applicationId,
    actorId: adminId,
    actorEmail: adminEmail,
    actorRole: "ADMIN",
    description: `Application ${decision}${notes ? `: ${notes}` : ""}`,
    metadata: { decision, notes },
    ipAddress,
  })
}

export async function logVerificationResult(
  applicationId: string,
  verificationType: string,
  passed: boolean,
  details?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    action: passed ? AuditActions.VERIFICATION_COMPLETED : AuditActions.VERIFICATION_FAILED,
    entityType: "Application",
    entityId: applicationId,
    description: `${verificationType} check ${passed ? "passed" : "failed"}`,
    metadata: { verificationType, passed, ...details },
  })
}

export async function logDocumentUpload(
  applicationId: string,
  documentType: string,
  fileName: string,
  uploaderEmail: string
): Promise<void> {
  await createAuditLog({
    action: AuditActions.DOCUMENT_UPLOADED,
    entityType: "Document",
    entityId: applicationId,
    actorEmail: uploaderEmail,
    description: `Uploaded ${documentType}: ${fileName}`,
    metadata: { documentType, fileName },
  })
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

export async function getAuditLogsForEntity(
  entityType: string,
  entityId: string,
  limit = 50
) {
  try {
    const dbAvailable = await canUsePrisma()
    if (!dbAvailable) {
      logger.warn("Cannot retrieve audit logs - database not available")
      return []
    }
    
    const { prisma } = await import("@/lib/prisma")
    return prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        actor: {
          select: { id: true, email: true, name: true },
        },
      },
    })
  } catch (error) {
    logger.error("Failed to get audit logs", { entityType, entityId, error })
    return []
  }
}

export async function getRecentAuditLogs(limit = 100) {
  try {
    const dbAvailable = await canUsePrisma()
    if (!dbAvailable) {
      logger.warn("Cannot retrieve audit logs - database not available")
      return []
    }
    
    const { prisma } = await import("@/lib/prisma")
    return prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        actor: {
          select: { id: true, email: true, name: true },
        },
      },
    })
  } catch (error) {
    logger.error("Failed to get recent audit logs", { error })
    return []
  }
}

export async function getAuditLogsByAction(action: string, limit = 100) {
  try {
    const dbAvailable = await canUsePrisma()
    if (!dbAvailable) {
      logger.warn("Cannot retrieve audit logs - database not available")
      return []
    }
    
    const { prisma } = await import("@/lib/prisma")
    return prisma.auditLog.findMany({
      where: { action },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        actor: {
          select: { id: true, email: true, name: true },
        },
      },
    })
  } catch (error) {
    logger.error("Failed to get audit logs by action", { action, error })
    return []
  }
}
