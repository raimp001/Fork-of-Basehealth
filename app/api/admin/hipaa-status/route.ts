/**
 * HIPAA Compliance Status API
 * 
 * Returns the current HIPAA compliance status for the application.
 * This endpoint should be protected and only accessible to admins.
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkHIPAACompliance, getHIPAAConfig } from '@/lib/hipaa'
import { addHIPAAHeaders } from '@/lib/hipaa/middleware'

export async function GET(request: NextRequest) {
  // TODO: Add authentication check - only admins should access this
  // const session = await getServerSession(authOptions)
  // if (!session || session.user.role !== 'ADMIN') {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // }

  try {
    const config = getHIPAAConfig()
    const complianceStatus = checkHIPAACompliance()
    
    // Check database SSL
    const dbUrl = process.env.DATABASE_URL || ''
    const hasSSL = dbUrl.includes('sslmode=require') || dbUrl.includes('ssl=true')
    
    // Check encryption key
    const hasEncryptionKey = !!process.env.HIPAA_ENCRYPTION_KEY
    const encryptionKeyLength = process.env.HIPAA_ENCRYPTION_KEY?.length || 0
    
    const response = NextResponse.json({
      timestamp: new Date().toISOString(),
      overallStatus: complianceStatus.isCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
      
      // Critical checks
      criticalChecks: {
        baaWithNeon: {
          status: process.env.NEON_BAA_SIGNED === 'true',
          message: process.env.NEON_BAA_SIGNED === 'true' 
            ? 'BAA signed with Neon' 
            : 'BAA with Neon required - contact sales@neon.tech',
        },
        databaseSSL: {
          status: hasSSL,
          message: hasSSL ? 'SSL enabled' : 'SSL not detected in connection string',
        },
        encryptionKey: {
          status: hasEncryptionKey && encryptionKeyLength >= 32,
          message: !hasEncryptionKey 
            ? 'HIPAA_ENCRYPTION_KEY not set' 
            : encryptionKeyLength < 32 
              ? 'Encryption key too short (min 32 chars)' 
              : 'Encryption key configured',
        },
        auditLogging: {
          status: config.auditLogging.enabled,
          message: config.auditLogging.enabled 
            ? 'Audit logging enabled' 
            : 'Audit logging disabled',
        },
      },
      
      // Configuration summary
      configuration: {
        encryption: {
          enabled: config.encryption.enabled,
          algorithm: config.encryption.algorithm,
          keyRotationDays: config.encryption.keyRotationDays,
        },
        session: {
          timeoutMinutes: config.session.timeoutMinutes,
          requireReauthForPHI: config.session.requireReauthForPHI,
        },
        auditLogging: {
          enabled: config.auditLogging.enabled,
          logPHIAccess: config.auditLogging.logPHIAccess,
          retentionDays: config.auditLogging.retentionDays,
        },
        dataHandling: {
          autoScrubLogs: config.dataHandling.autoScrubLogs,
          preventPHIInUrls: config.dataHandling.preventPHIInUrls,
        },
      },
      
      // Issues and warnings
      issues: complianceStatus.issues,
      warnings: complianceStatus.warnings,
      recommendations: complianceStatus.recommendations,
      
      // Action items
      actionRequired: [
        ...(!process.env.NEON_BAA_SIGNED ? ['Sign BAA with Neon database provider'] : []),
        ...(!hasEncryptionKey ? ['Set HIPAA_ENCRYPTION_KEY environment variable'] : []),
        ...(!hasSSL ? ['Enable SSL in database connection'] : []),
        ...complianceStatus.issues,
      ],
    })
    
    return addHIPAAHeaders(response)
  } catch (error) {
    console.error('Error checking HIPAA compliance:', error)
    return NextResponse.json(
      { error: 'Failed to check compliance status' },
      { status: 500 }
    )
  }
}
