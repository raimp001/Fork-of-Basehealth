/**
 * HIPAA Compliance Middleware
 * 
 * Provides middleware for Next.js API routes to enforce HIPAA compliance:
 * - Session validation and timeout
 * - PHI access logging
 * - Request/response sanitization
 * - Audit trail creation
 * 
 * @module hipaa/middleware
 */

import { NextRequest, NextResponse } from 'next/server'
import { getHIPAAConfig, isPHIField, PHIFieldsMap } from './config'
import { logPHIView, logUnauthorizedPHIAccess } from './phi-access-log'
import { sanitizeInput, getPHISummary } from '@/lib/phiScrubber'
import { logger } from '@/lib/logger'

export interface HIPAAContext {
  actorId: string
  actorEmail?: string
  actorRole?: string
  sessionId?: string
  ipAddress: string
  userAgent: string
}

/**
 * Extract client IP from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

/**
 * Create HIPAA context from request
 */
export function createHIPAAContext(
  request: NextRequest,
  user?: { id: string; email?: string; role?: string }
): HIPAAContext {
  return {
    actorId: user?.id || 'anonymous',
    actorEmail: user?.email,
    actorRole: user?.role,
    sessionId: request.cookies.get('session_id')?.value,
    ipAddress: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
  }
}

/**
 * Validate that the request contains no PHI in URL parameters
 * PHI should never be in URLs as they may be logged
 */
export function validateNoPHIInURL(url: URL): { valid: boolean; issues: string[] } {
  const config = getHIPAAConfig()
  if (!config.dataHandling.preventPHIInUrls) {
    return { valid: true, issues: [] }
  }
  
  const issues: string[] = []
  
  // Check query parameters
  for (const [key, value] of url.searchParams.entries()) {
    const summary = getPHISummary(value)
    if (summary.hasPHI) {
      issues.push(`PHI detected in URL parameter '${key}': ${summary.phiTypes.join(', ')}`)
    }
  }
  
  // Check pathname for common PHI patterns
  const pathSummary = getPHISummary(url.pathname)
  if (pathSummary.hasPHI && pathSummary.riskLevel === 'high') {
    issues.push(`High-risk PHI detected in URL path: ${pathSummary.phiTypes.join(', ')}`)
  }
  
  return {
    valid: issues.length === 0,
    issues,
  }
}

/**
 * Sanitize request body to remove/flag PHI before logging
 */
export function sanitizeForLogging(data: any): any {
  if (!data) return data
  
  if (typeof data === 'string') {
    const result = sanitizeInput(data)
    return result.cleanedText
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForLogging(item))
  }
  
  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {}
    for (const [key, value] of Object.entries(data)) {
      // Skip sensitive fields entirely in logs
      if (['password', 'passwordHash', 'ssn', 'socialSecurityNumber'].includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = sanitizeForLogging(value)
      }
    }
    return sanitized
  }
  
  return data
}

/**
 * Check if user has permission to access specific PHI
 */
export function checkPHIAccessPermission(
  actorRole: string | undefined,
  entityType: keyof PHIFieldsMap,
  accessType: 'read' | 'write' | 'delete'
): { allowed: boolean; reason?: string } {
  // Define role-based access control for PHI
  const rolePermissions: Record<string, {
    canRead: (keyof PHIFieldsMap)[]
    canWrite: (keyof PHIFieldsMap)[]
    canDelete: (keyof PHIFieldsMap)[]
  }> = {
    ADMIN: {
      canRead: ['Patient', 'User', 'Application', 'Caregiver', 'Provider', 'Booking'],
      canWrite: ['Patient', 'User', 'Application', 'Caregiver', 'Provider', 'Booking'],
      canDelete: ['Patient', 'User', 'Application', 'Caregiver', 'Provider', 'Booking'],
    },
    PROVIDER: {
      canRead: ['Patient', 'Booking'],
      canWrite: ['Patient', 'Booking'],
      canDelete: [],
    },
    CAREGIVER: {
      canRead: ['Patient', 'Booking'],
      canWrite: ['Booking'],
      canDelete: [],
    },
    PATIENT: {
      canRead: ['Patient', 'Booking'], // Own records only
      canWrite: ['Patient'], // Own records only
      canDelete: [],
    },
  }
  
  const permissions = rolePermissions[actorRole || 'PATIENT'] || rolePermissions.PATIENT
  
  switch (accessType) {
    case 'read':
      if (!permissions.canRead.includes(entityType)) {
        return { allowed: false, reason: `Role ${actorRole} cannot read ${entityType} PHI` }
      }
      break
    case 'write':
      if (!permissions.canWrite.includes(entityType)) {
        return { allowed: false, reason: `Role ${actorRole} cannot write ${entityType} PHI` }
      }
      break
    case 'delete':
      if (!permissions.canDelete.includes(entityType)) {
        return { allowed: false, reason: `Role ${actorRole} cannot delete ${entityType} PHI` }
      }
      break
  }
  
  return { allowed: true }
}

/**
 * Wrapper to add HIPAA compliance to API route handlers
 */
export function withHIPAACompliance<T>(
  handler: (
    request: NextRequest,
    context: { hipaa: HIPAAContext }
  ) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T | { error: string }>> => {
    const config = getHIPAAConfig()
    
    // Validate no PHI in URL
    const url = new URL(request.url)
    const urlValidation = validateNoPHIInURL(url)
    if (!urlValidation.valid) {
      logger.warn('PHI detected in URL', {
        path: url.pathname,
        issues: urlValidation.issues,
      })
      
      if (config.dataHandling.preventPHIInUrls) {
        return NextResponse.json(
          { error: 'Request rejected: PHI should not be included in URL parameters' },
          { status: 400 }
        ) as NextResponse<{ error: string }>
      }
    }
    
    // Create HIPAA context (in real app, get user from session)
    const hipaaContext = createHIPAAContext(request)
    
    try {
      // Execute handler
      const response = await handler(request, { hipaa: hipaaContext })
      
      return response
    } catch (error) {
      logger.error('HIPAA-compliant route error', {
        path: url.pathname,
        error: error instanceof Error ? error.message : 'Unknown error',
        ipAddress: hipaaContext.ipAddress,
      })
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ) as NextResponse<{ error: string }>
    }
  }
}

/**
 * Helper to log PHI access within an API handler
 */
export async function logAPIPhiAccess(
  hipaaContext: HIPAAContext,
  entityType: string,
  entityId: string,
  fieldsAccessed?: string[]
): Promise<void> {
  await logPHIView({
    actorId: hipaaContext.actorId,
    actorEmail: hipaaContext.actorEmail,
    actorRole: hipaaContext.actorRole,
    entityType,
    entityId,
    fieldsAccessed,
    reason: 'HEALTHCARE_OPS',
    ipAddress: hipaaContext.ipAddress,
    userAgent: hipaaContext.userAgent,
    sessionId: hipaaContext.sessionId,
  })
}

/**
 * Validate session is still active (auto-logout check)
 */
export function validateSession(
  sessionCreatedAt: Date,
  lastActivityAt: Date
): { valid: boolean; reason?: string } {
  const config = getHIPAAConfig()
  const timeoutMs = config.session.timeoutMinutes * 60 * 1000
  
  const now = new Date()
  const timeSinceActivity = now.getTime() - lastActivityAt.getTime()
  
  if (timeSinceActivity > timeoutMs) {
    return {
      valid: false,
      reason: `Session timed out after ${config.session.timeoutMinutes} minutes of inactivity`,
    }
  }
  
  return { valid: true }
}

/**
 * Headers to add for HIPAA-compliant responses
 */
export function getHIPAASecurityHeaders(): Record<string, string> {
  return {
    // Prevent caching of PHI
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',
    
    // Security headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    
    // Prevent data leakage
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  }
}

/**
 * Add HIPAA security headers to response
 */
export function addHIPAAHeaders(response: NextResponse): NextResponse {
  const headers = getHIPAASecurityHeaders()
  
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value)
  }
  
  return response
}
