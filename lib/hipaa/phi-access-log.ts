/**
 * PHI Access Logging Service
 * 
 * HIPAA requires tracking all access to Protected Health Information.
 * This service provides comprehensive logging of:
 * - Who accessed PHI
 * - What PHI was accessed
 * - When it was accessed
 * - Why it was accessed (purpose)
 * - From where (IP, device)
 * 
 * Logs are retained for 6 years as required by HIPAA.
 * 
 * @module hipaa/phi-access-log
 */

import { logger } from '@/lib/logger'

export type PHIAccessType = 
  | 'VIEW'      // Read/view PHI
  | 'CREATE'    // Create new PHI record
  | 'UPDATE'    // Modify existing PHI
  | 'DELETE'    // Delete PHI
  | 'EXPORT'    // Export/download PHI
  | 'TRANSMIT'  // Send PHI to external party
  | 'PRINT'     // Print PHI
  | 'COPY'      // Copy PHI data

export type PHIAccessReason =
  | 'TREATMENT'           // Healthcare operations
  | 'PAYMENT'             // Billing/payment operations
  | 'HEALTHCARE_OPS'      // Healthcare operations
  | 'PATIENT_REQUEST'     // Patient requested access
  | 'LEGAL_REQUIREMENT'   // Legal/regulatory requirement
  | 'EMERGENCY'           // Emergency access
  | 'RESEARCH'            // Approved research (with proper authorization)
  | 'AUDIT'               // Internal audit
  | 'ADMIN'               // System administration

export interface PHIAccessLogEntry {
  // Who
  actorId: string
  actorEmail?: string
  actorRole?: string
  
  // What
  accessType: PHIAccessType
  entityType: string      // e.g., 'Patient', 'Application'
  entityId: string
  fieldsAccessed?: string[] // Specific PHI fields accessed
  
  // When
  timestamp: Date
  
  // Why
  reason: PHIAccessReason
  reasonDetail?: string
  
  // Where
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  
  // Additional context
  success: boolean
  errorMessage?: string
  metadata?: Record<string, any>
}

/**
 * Check if database is available for logging
 */
async function canUsePrisma(): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL) return false
    const { prisma } = await import('@/lib/prisma')
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

/**
 * Log PHI access event
 * This is the primary function for tracking all PHI access
 */
export async function logPHIAccess(entry: PHIAccessLogEntry): Promise<void> {
  try {
    const dbAvailable = await canUsePrisma()
    
    const logData = {
      action: `phi.${entry.accessType.toLowerCase()}`,
      entityType: entry.entityType,
      entityId: entry.entityId,
      actorId: entry.actorId,
      actorEmail: entry.actorEmail,
      actorRole: entry.actorRole,
      description: `PHI ${entry.accessType} - ${entry.reason}${entry.reasonDetail ? `: ${entry.reasonDetail}` : ''}`,
      metadata: {
        accessType: entry.accessType,
        reason: entry.reason,
        reasonDetail: entry.reasonDetail,
        fieldsAccessed: entry.fieldsAccessed,
        success: entry.success,
        errorMessage: entry.errorMessage,
        sessionId: entry.sessionId,
        ...entry.metadata,
      },
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
    }
    
    if (dbAvailable) {
      const { prisma } = await import('@/lib/prisma')
      await prisma.auditLog.create({
        data: logData,
      })
    } else {
      // Fallback to structured logging
      logger.info('PHI Access Log', {
        ...logData,
        timestamp: entry.timestamp.toISOString(),
        _hipaaLog: true,
      })
    }
  } catch (error) {
    // PHI access logging must never fail silently - log to console as last resort
    logger.error('CRITICAL: Failed to log PHI access', {
      entry: {
        ...entry,
        // Don't log actual PHI field values, just field names
        fieldsAccessed: entry.fieldsAccessed,
      },
      error,
    })
  }
}

/**
 * Log when PHI is viewed
 */
export async function logPHIView(params: {
  actorId: string
  actorEmail?: string
  actorRole?: string
  entityType: string
  entityId: string
  fieldsAccessed?: string[]
  reason: PHIAccessReason
  reasonDetail?: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
}): Promise<void> {
  await logPHIAccess({
    ...params,
    accessType: 'VIEW',
    timestamp: new Date(),
    success: true,
  })
}

/**
 * Log when PHI is created
 */
export async function logPHICreate(params: {
  actorId: string
  actorEmail?: string
  actorRole?: string
  entityType: string
  entityId: string
  fieldsCreated?: string[]
  reason: PHIAccessReason
  reasonDetail?: string
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  await logPHIAccess({
    ...params,
    accessType: 'CREATE',
    fieldsAccessed: params.fieldsCreated,
    timestamp: new Date(),
    success: true,
  })
}

/**
 * Log when PHI is updated
 */
export async function logPHIUpdate(params: {
  actorId: string
  actorEmail?: string
  actorRole?: string
  entityType: string
  entityId: string
  fieldsUpdated?: string[]
  reason: PHIAccessReason
  reasonDetail?: string
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  await logPHIAccess({
    ...params,
    accessType: 'UPDATE',
    fieldsAccessed: params.fieldsUpdated,
    timestamp: new Date(),
    success: true,
  })
}

/**
 * Log when PHI is exported/downloaded
 */
export async function logPHIExport(params: {
  actorId: string
  actorEmail?: string
  actorRole?: string
  entityType: string
  entityId: string
  exportFormat?: string
  fieldsExported?: string[]
  reason: PHIAccessReason
  reasonDetail?: string
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  await logPHIAccess({
    ...params,
    accessType: 'EXPORT',
    fieldsAccessed: params.fieldsExported,
    timestamp: new Date(),
    success: true,
    metadata: {
      exportFormat: params.exportFormat,
    },
  })
}

/**
 * Log when PHI is transmitted to external party
 */
export async function logPHITransmit(params: {
  actorId: string
  actorEmail?: string
  actorRole?: string
  entityType: string
  entityId: string
  recipientType: string // e.g., 'lab', 'pharmacy', 'insurance'
  recipientName?: string
  fieldsTransmitted?: string[]
  reason: PHIAccessReason
  reasonDetail?: string
  ipAddress?: string
  userAgent?: string
  encryptionUsed?: boolean
}): Promise<void> {
  await logPHIAccess({
    ...params,
    accessType: 'TRANSMIT',
    fieldsAccessed: params.fieldsTransmitted,
    timestamp: new Date(),
    success: true,
    metadata: {
      recipientType: params.recipientType,
      recipientName: params.recipientName,
      encryptionUsed: params.encryptionUsed,
    },
  })
}

/**
 * Log unauthorized PHI access attempt
 */
export async function logUnauthorizedPHIAccess(params: {
  actorId?: string
  actorEmail?: string
  attemptedEntityType: string
  attemptedEntityId?: string
  attemptedAction: PHIAccessType
  reason: string
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  await logPHIAccess({
    actorId: params.actorId || 'UNKNOWN',
    actorEmail: params.actorEmail,
    accessType: params.attemptedAction,
    entityType: params.attemptedEntityType,
    entityId: params.attemptedEntityId || 'UNKNOWN',
    reason: 'AUDIT',
    reasonDetail: `UNAUTHORIZED ACCESS ATTEMPT: ${params.reason}`,
    timestamp: new Date(),
    success: false,
    errorMessage: 'Access denied - unauthorized',
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  })
}

/**
 * Log break-the-glass emergency access
 * This is for when authorized personnel need emergency access to PHI
 * that they wouldn't normally have access to
 */
export async function logEmergencyPHIAccess(params: {
  actorId: string
  actorEmail?: string
  actorRole?: string
  entityType: string
  entityId: string
  emergencyReason: string
  supervisorNotified?: string
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  await logPHIAccess({
    ...params,
    accessType: 'VIEW',
    reason: 'EMERGENCY',
    reasonDetail: `BREAK-THE-GLASS: ${params.emergencyReason}`,
    timestamp: new Date(),
    success: true,
    metadata: {
      emergencyAccess: true,
      supervisorNotified: params.supervisorNotified,
    },
  })
  
  // Also send immediate notification for emergency access
  logger.warn('EMERGENCY PHI ACCESS', {
    actorId: params.actorId,
    actorEmail: params.actorEmail,
    entityType: params.entityType,
    entityId: params.entityId,
    reason: params.emergencyReason,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Get PHI access history for an entity
 */
export async function getPHIAccessHistory(
  entityType: string,
  entityId: string,
  options?: {
    limit?: number
    startDate?: Date
    endDate?: Date
    accessTypes?: PHIAccessType[]
  }
): Promise<any[]> {
  try {
    const dbAvailable = await canUsePrisma()
    if (!dbAvailable) {
      logger.warn('Cannot retrieve PHI access history - database not available')
      return []
    }
    
    const { prisma } = await import('@/lib/prisma')
    
    const where: any = {
      entityType,
      entityId,
      action: {
        startsWith: 'phi.',
      },
    }
    
    if (options?.startDate) {
      where.createdAt = { gte: options.startDate }
    }
    
    if (options?.endDate) {
      where.createdAt = { ...where.createdAt, lte: options.endDate }
    }
    
    return prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 100,
      include: {
        actor: {
          select: { id: true, email: true, name: true },
        },
      },
    })
  } catch (error) {
    logger.error('Failed to get PHI access history', { entityType, entityId, error })
    return []
  }
}

/**
 * Generate PHI access report for compliance audits
 */
export async function generatePHIAccessReport(params: {
  startDate: Date
  endDate: Date
  entityType?: string
  actorId?: string
}): Promise<{
  totalAccesses: number
  byAccessType: Record<PHIAccessType, number>
  byReason: Record<PHIAccessReason, number>
  unauthorizedAttempts: number
  emergencyAccesses: number
}> {
  try {
    const dbAvailable = await canUsePrisma()
    if (!dbAvailable) {
      throw new Error('Database not available')
    }
    
    const { prisma } = await import('@/lib/prisma')
    
    const where: any = {
      action: { startsWith: 'phi.' },
      createdAt: {
        gte: params.startDate,
        lte: params.endDate,
      },
    }
    
    if (params.entityType) {
      where.entityType = params.entityType
    }
    
    if (params.actorId) {
      where.actorId = params.actorId
    }
    
    const logs = await prisma.auditLog.findMany({ where })
    
    const byAccessType: Record<string, number> = {}
    const byReason: Record<string, number> = {}
    let unauthorizedAttempts = 0
    let emergencyAccesses = 0
    
    for (const log of logs) {
      const metadata = log.metadata as any || {}
      
      // Count by access type
      const accessType = metadata.accessType || 'UNKNOWN'
      byAccessType[accessType] = (byAccessType[accessType] || 0) + 1
      
      // Count by reason
      const reason = metadata.reason || 'UNKNOWN'
      byReason[reason] = (byReason[reason] || 0) + 1
      
      // Count unauthorized attempts
      if (!metadata.success) {
        unauthorizedAttempts++
      }
      
      // Count emergency accesses
      if (metadata.emergencyAccess) {
        emergencyAccesses++
      }
    }
    
    return {
      totalAccesses: logs.length,
      byAccessType: byAccessType as Record<PHIAccessType, number>,
      byReason: byReason as Record<PHIAccessReason, number>,
      unauthorizedAttempts,
      emergencyAccesses,
    }
  } catch (error) {
    logger.error('Failed to generate PHI access report', { params, error })
    throw error
  }
}
