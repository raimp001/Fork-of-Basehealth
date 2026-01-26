/**
 * HIPAA Configuration
 * 
 * Central configuration for HIPAA compliance settings.
 * These settings control encryption, logging, and data handling behaviors.
 */

export interface HIPAAConfig {
  // Encryption settings
  encryption: {
    enabled: boolean
    algorithm: 'aes-256-gcm' | 'aes-256-cbc'
    keyRotationDays: number
  }
  
  // Audit logging settings
  auditLogging: {
    enabled: boolean
    logPHIAccess: boolean
    logExternalTransmissions: boolean
    retentionDays: number // HIPAA requires 6 years minimum
  }
  
  // Session settings
  session: {
    timeoutMinutes: number
    requireReauthForPHI: boolean
  }
  
  // Data handling
  dataHandling: {
    minimumNecessary: boolean // Only access minimum PHI needed
    autoScrubLogs: boolean
    preventPHIInUrls: boolean
  }
  
  // Business Associate settings
  businessAssociate: {
    baaRequired: boolean
    approvedVendors: string[]
  }
}

/**
 * Default HIPAA configuration
 * Override these settings via environment variables or runtime configuration
 */
export const defaultHIPAAConfig: HIPAAConfig = {
  encryption: {
    enabled: true,
    algorithm: 'aes-256-gcm',
    keyRotationDays: 90,
  },
  
  auditLogging: {
    enabled: true,
    logPHIAccess: true,
    logExternalTransmissions: true,
    retentionDays: 2190, // 6 years as required by HIPAA
  },
  
  session: {
    timeoutMinutes: 15, // Auto-logout after inactivity
    requireReauthForPHI: true,
  },
  
  dataHandling: {
    minimumNecessary: true,
    autoScrubLogs: true,
    preventPHIInUrls: true,
  },
  
  businessAssociate: {
    baaRequired: true,
    approvedVendors: [
      'neon', // Database provider (requires signed BAA)
      'vercel', // Hosting (requires signed BAA for PHI)
      'sendgrid', // Email (if used for PHI, requires BAA)
    ],
  },
}

/**
 * Get current HIPAA configuration
 * Merges environment overrides with defaults
 */
export function getHIPAAConfig(): HIPAAConfig {
  const config = { ...defaultHIPAAConfig }
  
  // Override from environment variables
  if (process.env.HIPAA_ENCRYPTION_ENABLED === 'false') {
    config.encryption.enabled = false
  }
  
  if (process.env.HIPAA_AUDIT_LOGGING_ENABLED === 'false') {
    config.auditLogging.enabled = false
  }
  
  if (process.env.HIPAA_SESSION_TIMEOUT_MINUTES) {
    config.session.timeoutMinutes = parseInt(process.env.HIPAA_SESSION_TIMEOUT_MINUTES, 10)
  }
  
  return config
}

/**
 * PHI Field definitions for the application
 * These fields are considered Protected Health Information and require special handling
 */
export const PHI_FIELDS = {
  // Patient model
  Patient: [
    'dateOfBirth',
    'phone',
    'address',
    'emergencyContact',
    'bloodType',
    'allergies',
    'conditions',
    'medications',
  ],
  
  // User model (some fields may be PHI in healthcare context)
  User: [
    'email', // Can be PHI if contains identifiable info
    'name',
  ],
  
  // Application model
  Application: [
    'email',
    'phone',
    'firstName',
    'lastName',
    'fullName',
    'dateOfBirth',
    'npiNumber',
    'licenseNumber',
    'deaNumber',
    'ssn', // If collected
  ],
  
  // Caregiver model
  Caregiver: [
    'firstName',
    'lastName',
    'email',
    'phone',
    'licenseNumber',
    'bio',
  ],
  
  // Provider model
  Provider: [
    'fullName',
    'email',
    'phone',
    'npiNumber',
    'licenseNumber',
    'bio',
  ],
  
  // Booking model
  Booking: [
    'specialNeeds',
    'notes',
    'requirements',
  ],
} as const

export type PHIFieldsMap = typeof PHI_FIELDS

/**
 * Check if a field is considered PHI
 */
export function isPHIField(model: keyof PHIFieldsMap, field: string): boolean {
  const fields = PHI_FIELDS[model]
  return fields ? (fields as readonly string[]).includes(field) : false
}

/**
 * Get all PHI fields for a model
 */
export function getPHIFields(model: keyof PHIFieldsMap): readonly string[] {
  return PHI_FIELDS[model] || []
}

/**
 * HIPAA compliance status checker
 */
export interface HIPAAComplianceStatus {
  isCompliant: boolean
  issues: string[]
  warnings: string[]
  recommendations: string[]
}

export function checkHIPAACompliance(): HIPAAComplianceStatus {
  const issues: string[] = []
  const warnings: string[] = []
  const recommendations: string[] = []
  
  // Check encryption key
  if (!process.env.HIPAA_ENCRYPTION_KEY) {
    issues.push('HIPAA_ENCRYPTION_KEY environment variable is not set')
  } else if (process.env.HIPAA_ENCRYPTION_KEY.length < 32) {
    issues.push('HIPAA_ENCRYPTION_KEY must be at least 32 characters')
  }
  
  // Check database URL for SSL
  const dbUrl = process.env.DATABASE_URL || ''
  if (!dbUrl.includes('sslmode=require') && !dbUrl.includes('ssl=true')) {
    warnings.push('Database connection may not be using SSL encryption')
  }
  
  // Check for BAA documentation
  if (!process.env.NEON_BAA_SIGNED) {
    warnings.push('NEON_BAA_SIGNED flag not set - ensure BAA is signed with Neon')
  }
  
  // Check session configuration
  const sessionTimeout = parseInt(process.env.HIPAA_SESSION_TIMEOUT_MINUTES || '15', 10)
  if (sessionTimeout > 30) {
    warnings.push(`Session timeout of ${sessionTimeout} minutes exceeds recommended 15-30 minutes`)
  }
  
  // Recommendations
  if (!process.env.HIPAA_AUDIT_LOG_RETENTION_DAYS) {
    recommendations.push('Consider setting HIPAA_AUDIT_LOG_RETENTION_DAYS (minimum 2190 for 6 years)')
  }
  
  recommendations.push('Ensure all staff handling PHI have completed HIPAA training')
  recommendations.push('Schedule regular security audits and penetration testing')
  recommendations.push('Maintain documentation of all HIPAA policies and procedures')
  
  return {
    isCompliant: issues.length === 0,
    issues,
    warnings,
    recommendations,
  }
}
