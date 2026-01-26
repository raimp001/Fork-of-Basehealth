# HIPAA Compliance Guide for BaseHealth

## Overview

This document outlines the HIPAA (Health Insurance Portability and Accountability Act) compliance implementation for BaseHealth. HIPAA compliance is **mandatory** for any application that handles Protected Health Information (PHI).

## Current Database: Neon PostgreSQL

BaseHealth uses **Neon PostgreSQL** as its primary database. Neon supports HIPAA compliance, but you must take the following steps:

### Required Actions for HIPAA Compliance

| Priority | Action | Status | Details |
|----------|--------|--------|---------|
| **CRITICAL** | Sign BAA with Neon | ❌ Pending | Contact Neon sales to sign a Business Associate Agreement |
| **CRITICAL** | Upgrade Neon Plan | ❌ Pending | Ensure you're on a plan that supports BAA (Business or Enterprise) |
| **CRITICAL** | Set encryption key | ❌ Pending | Set `HIPAA_ENCRYPTION_KEY` environment variable |
| **HIGH** | Verify SSL connection | ✅ Done | Connection string includes `sslmode=require` |
| **HIGH** | Enable audit logging | ✅ Done | Implemented in `lib/hipaa/phi-access-log.ts` |
| **MEDIUM** | Staff HIPAA training | ❌ Pending | All staff handling PHI must complete training |
| **MEDIUM** | Document policies | ❌ Pending | Create written HIPAA policies and procedures |

## Environment Variables Required

Add these to your `.env.local` or production environment:

```bash
# HIPAA Encryption (REQUIRED)
# Generate with: openssl rand -base64 32
HIPAA_ENCRYPTION_KEY=your-32-character-encryption-key-here

# Optional: Custom salt for encryption (recommended to change default)
HIPAA_ENCRYPTION_SALT=your-custom-salt-here

# Optional: Salt for searchable encrypted fields
HIPAA_SEARCH_SALT=your-search-salt-here

# BAA Status (set to 'true' after signing BAA with Neon)
NEON_BAA_SIGNED=false

# Session timeout in minutes (default: 15, max recommended: 30)
HIPAA_SESSION_TIMEOUT_MINUTES=15

# Audit log retention in days (minimum: 2190 = 6 years)
HIPAA_AUDIT_LOG_RETENTION_DAYS=2190
```

## HIPAA Module Structure

The HIPAA compliance utilities are located in `lib/hipaa/`:

```
lib/hipaa/
├── index.ts              # Main exports
├── config.ts             # HIPAA configuration and PHI field definitions
├── encryption.ts         # Field-level encryption for PHI
├── phi-access-log.ts     # PHI access logging for audit trail
└── middleware.ts         # API route middleware for HIPAA compliance
```

## Using the HIPAA Module

### 1. Encrypting PHI Fields

```typescript
import { encryptPHI, decryptPHI, maskPHI } from '@/lib/hipaa'

// Encrypt before storing
const encryptedSSN = encryptPHI(patient.ssn)

// Decrypt when retrieving (authorized access only)
const ssn = decryptPHI(encryptedSSN)

// Mask for display
const maskedSSN = maskPHI(ssn, 4) // Returns "***-**-1234"
```

### 2. Logging PHI Access

```typescript
import { logPHIView, logPHIUpdate, logPHIExport } from '@/lib/hipaa'

// Log when viewing patient data
await logPHIView({
  actorId: currentUser.id,
  actorEmail: currentUser.email,
  actorRole: currentUser.role,
  entityType: 'Patient',
  entityId: patient.id,
  fieldsAccessed: ['dateOfBirth', 'medications', 'allergies'],
  reason: 'TREATMENT',
  reasonDetail: 'Reviewing patient history for appointment',
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
})

// Log when updating patient data
await logPHIUpdate({
  actorId: currentUser.id,
  entityType: 'Patient',
  entityId: patient.id,
  fieldsUpdated: ['medications'],
  reason: 'TREATMENT',
  reasonDetail: 'Adding new prescription',
})

// Log when exporting/downloading data
await logPHIExport({
  actorId: currentUser.id,
  entityType: 'Patient',
  entityId: patient.id,
  exportFormat: 'PDF',
  fieldsExported: ['name', 'dateOfBirth', 'conditions'],
  reason: 'PATIENT_REQUEST',
  reasonDetail: 'Patient requested medical records',
})
```

### 3. Using HIPAA Middleware

```typescript
import { withHIPAACompliance, logAPIPhiAccess } from '@/lib/hipaa'

export const GET = withHIPAACompliance(async (request, { hipaa }) => {
  // Fetch patient data
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  })

  // Log the PHI access
  await logAPIPhiAccess(
    hipaa,
    'Patient',
    patientId,
    ['dateOfBirth', 'medications']
  )

  return NextResponse.json(patient)
})
```

### 4. Scrubbing PHI from Logs

```typescript
import { sanitizeInput, getPHISummary } from '@/lib/phiScrubber'

// Before logging any user input
const { cleanedText, mapping } = sanitizeInput(userMessage)
console.log(cleanedText) // PHI replaced with tokens

// Check if text contains PHI (without modifying it)
const summary = getPHISummary(userMessage)
if (summary.hasPHI) {
  console.warn(`PHI detected: ${summary.phiTypes.join(', ')}`)
}
```

## PHI Fields in the Database

The following fields are marked as PHI in the Prisma schema (look for `/// @phi` comments):

### Patient Model
- `dateOfBirth` - DATE identifier
- `phone` - PHONE identifier
- `address` - GEOGRAPHIC identifier
- `emergencyContact` - NAME/PHONE identifiers
- `bloodType`, `allergies`, `conditions`, `medications` - HEALTH_INFO

### User Model
- `email` - EMAIL identifier
- `name` - NAME identifier

### Application Model
- `email`, `phone`, `firstName`, `lastName`, `fullName` - Personal identifiers
- `npiNumber`, `licenseNumber`, `deaNumber` - LICENSE_NUMBER identifiers
- `dateOfBirth` - DATE identifier

### Provider/Caregiver Models
- Similar personal and professional identifiers

### Booking Model
- `careType`, `requirements`, `specialNeeds`, `notes` - HEALTH_INFO

## Audit Log Retention

**HIPAA requires audit logs to be retained for 6 years (45 CFR 164.530(j)).**

The `audit_logs` table stores all PHI access events. Do NOT delete these records. Configure your retention policy:

```sql
-- DO NOT RUN: Example of what NOT to do
-- DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '6 years';
```

Instead, archive old logs to cold storage if needed for performance.

## Security Checklist

### Technical Safeguards
- [x] Encryption in transit (SSL/TLS) - via Neon connection string
- [x] Field-level encryption at rest - via `lib/hipaa/encryption.ts`
- [x] Audit logging - via `lib/hipaa/phi-access-log.ts`
- [x] PHI scrubbing for external services - via `lib/phiScrubber.ts`
- [x] Session timeout configuration - via `lib/hipaa/middleware.ts`
- [x] Role-based access control - via middleware
- [ ] Intrusion detection system
- [ ] Regular security audits

### Administrative Safeguards
- [ ] Signed BAA with Neon (database provider)
- [ ] Signed BAA with Vercel (hosting provider) - if storing PHI
- [ ] Staff HIPAA training documentation
- [ ] Incident response plan
- [ ] Data breach notification procedures
- [ ] Regular risk assessments

### Physical Safeguards
- [x] Cloud provider physical security (Neon/Azure)
- [ ] Workstation security policies
- [ ] Device encryption requirements

## Incident Response

If a potential PHI breach is detected:

1. **Contain** - Immediately restrict access to affected systems
2. **Assess** - Determine scope and nature of breach
3. **Notify** - HIPAA requires notification within 60 days for breaches affecting 500+ individuals
4. **Document** - Record all details for compliance

Contact: [Add your security officer contact here]

## Compliance Verification

Run the compliance check:

```typescript
import { checkHIPAACompliance } from '@/lib/hipaa'

const status = checkHIPAACompliance()

if (!status.isCompliant) {
  console.error('HIPAA Compliance Issues:', status.issues)
}

console.log('Warnings:', status.warnings)
console.log('Recommendations:', status.recommendations)
```

## Additional Resources

- [Neon HIPAA Documentation](https://neon.tech/docs/security/hipaa)
- [HHS HIPAA Guidelines](https://www.hhs.gov/hipaa/index.html)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [Safe Harbor De-identification](https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html)

## Contact

For HIPAA compliance questions or to report a potential breach:
- Security Officer: [Add contact]
- Privacy Officer: [Add contact]

---

**Last Updated:** January 2026
**Version:** 1.0.0
