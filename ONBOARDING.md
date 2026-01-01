# BaseHealth Onboarding System

This document describes the comprehensive onboarding system for Providers and Caregivers, designed with compliance, data minimization, and user experience in mind.

## Table of Contents

1. [Overview](#overview)
2. [User Flows](#user-flows)
3. [Requirements Engine](#requirements-engine)
4. [Verification Services](#verification-services)
5. [Admin Review Console](#admin-review-console)
6. [Audit Logging](#audit-logging)
7. [API Reference](#api-reference)
8. [Configuration](#configuration)

---

## Overview

The onboarding system supports two roles:

- **Providers**: Licensed healthcare professionals (MD, DO, NP, PA, RN, etc.)
- **Caregivers**: Non-licensed support workers (home care, companion care, etc.)

### Key Principles

1. **Fast & Easy**: Complete signup in under 3 minutes
2. **Progressive Disclosure**: Collect only what's needed at each step
3. **Data Minimization**: Only collect necessary info with clear reasons
4. **Compliance First**: Default status = PENDING until verified
5. **Configurable**: Rules vary by country/state

---

## User Flows

### Provider Onboarding (5 Steps)

| Step | Title | Fields | Time |
|------|-------|--------|------|
| 0 | Role & Region | Role, Country, States of practice | ~1 min |
| 1 | Account | Email, Password, Name, Phone | ~1 min |
| 2 | Profile | Profession type, Specialty | ~2 min |
| 3 | Verification | NPI (with autofill), License number, State, Expiry | ~2 min |
| 4 | Review | Attestations, Submit | ~1 min |

### Caregiver Onboarding (4 Steps)

| Step | Title | Fields | Time |
|------|-------|--------|------|
| 0 | Role & Region | Role, Country, Service area | ~1 min |
| 1 | Account | Email, Password, First/Last Name, Phone | ~1 min |
| 2 | Profile | Services offered, Experience, Bio, Transport | ~2 min |
| 3 | Review | Attestations, Submit | ~1 min |

### Features

- **Save & Continue Later**: Draft applications are preserved
- **NPI Autofill**: Enter NPI to auto-populate name, specialty, license info
- **Progress Indicator**: Shows current step and estimated time
- **Inline Help**: "Why we ask this" explanations

---

## Requirements Engine

The requirements engine (`lib/onboarding/requirements-engine.ts`) determines what fields, documents, and checks are required based on:

- Role (PROVIDER / CAREGIVER)
- Country (US, CA, GB, etc.)
- Region/State (for state-specific rules)
- Profession type (for conditional requirements)

### Example: US Provider Requirements

```typescript
{
  fieldName: "npiNumber",
  label: "NPI Number",
  required: false,  // Recommended but not required
  recommended: true,
  helpText: "Enter to autofill your information"
}

{
  fieldName: "licenseNumber",
  label: "License Number",
  required: true,
  helpText: "Your state medical license"
}

{
  fieldName: "deaNumber",
  label: "DEA Number",
  required: false,
  condition: { professionType: ["MD", "DO", "NP", "PA"] }  // Only if prescribing
}
```

### Verification Checks by Country

| Check | US Providers | US Caregivers | Canada Providers |
|-------|-------------|---------------|------------------|
| NPI Lookup | Recommended | N/A | N/A |
| License Check | Required | N/A | Required |
| OIG LEIE | Required | N/A | N/A |
| SAM Exclusion | Required | N/A | N/A |
| Background Check | N/A | State-dependent | N/A |

### Adding New Country Requirements

1. Define requirements array in `requirements-engine.ts`
2. Add to `getRequirements()` switch statement
3. Add verification checks to `getVerificationChecks()`

---

## Verification Services

Located in `lib/onboarding/verification-service.ts`:

### 1. NPI Lookup (NPPES API)

- **Endpoint**: `https://npiregistry.cms.hhs.gov/api/`
- **Purpose**: Autofill provider info, verify NPI exists
- **Note**: NPI alone does NOT prove licensure

```typescript
const result = await lookupNPI("1234567890")
// Returns: name, credential, taxonomies, addresses
```

### 2. OIG LEIE Check

- **Source**: HHS OIG List of Excluded Individuals/Entities
- **Purpose**: Detect excluded providers (HARD STOP if found)
- **Implementation**: Currently placeholder - integrate with LEIE file or vendor API

### 3. SAM.gov Exclusion Check

- **Source**: System for Award Management
- **Purpose**: Federal exclusions screening
- **Implementation**: Currently placeholder - register for SAM API access

### 4. License Verification

- **Purpose**: Verify state medical license is valid
- **Implementation**: Placeholder - integrate with state medical board APIs

### Running Verifications

```typescript
// Run single verification
await runVerification(applicationId, "OIG_LEIE")

// Run all required verifications
await runAllVerifications(applicationId)
```

### Verification Schedule

- **On submission**: All required checks run
- **On admin request**: Manual re-run available
- **Periodic**: Monthly re-check for approved providers (OIG/SAM)

---

## Admin Review Console

### Pages

1. **Applications List**: `/admin/applications-new`
   - Filter by status, role, search
   - Shows verification issues with red flag

2. **Application Review**: `/admin/review/[id]`
   - Full application details
   - Verification results panel
   - Admin action buttons

### Admin Actions

| Action | Result |
|--------|--------|
| Approve | Creates Provider/Caregiver record, sets status = APPROVED |
| Reject | Sets status = REJECTED |
| Request Info | Sets status = PENDING_INFO, sends email |

### Exclusion Blocking

If OIG or SAM check fails:
- Application shows red "Exclusion" badge
- Approve button is disabled
- Admin must investigate before proceeding

### Verification Panel

Shows status of each check:
- ✅ PASSED (green)
- ❌ FAILED (red)
- ⏳ PENDING (amber)
- ⚠️ ERROR (gray)

Admin can re-run verifications with "Run Check" buttons.

---

## Audit Logging

All significant actions are logged (`lib/onboarding/audit-service.ts`):

### Logged Events

| Action | Description |
|--------|-------------|
| application.created | New application started |
| application.submitted | Application submitted for review |
| admin.viewed_application | Admin opened application |
| admin.approved | Admin approved application |
| admin.rejected | Admin rejected application |
| verification.completed | Verification check passed |
| verification.failed | Verification check failed |
| document.uploaded | Document uploaded |

### Audit Log Fields

```typescript
{
  actorId: string      // User ID of actor
  actorEmail: string   // Email (preserved even if user deleted)
  actorRole: string    // ADMIN, PROVIDER, etc.
  action: string       // e.g., "admin.approved"
  entityType: string   // e.g., "Application"
  entityId: string     // ID of affected entity
  description: string  // Human-readable description
  metadata: object     // Additional context
  ipAddress: string    // Client IP
  createdAt: Date      // Timestamp
}
```

---

## API Reference

### Onboarding APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/onboarding/application` | Create new application |
| PUT | `/api/onboarding/application` | Update/submit application |
| GET | `/api/onboarding/application?id=xxx` | Get application status |
| GET | `/api/onboarding/npi-lookup?npi=xxx` | NPI lookup with autofill |
| GET | `/api/onboarding/requirements?role=PROVIDER&country=US` | Get requirements |

### Admin APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/applications` | List all applications |
| GET | `/api/admin/applications/[id]` | Get single application |
| POST | `/api/admin/applications/[id]/review` | Approve/reject/request info |
| POST | `/api/admin/applications/[id]/verify` | Run verification check |

---

## Configuration

### Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...

# Optional: For real integrations
SAM_API_KEY=...
OIG_LEIE_API_KEY=...
```

### Database Models

Key models in `prisma/schema.prisma`:

- `Application`: Stores all application data
- `Document`: Uploaded files
- `Verification`: Verification check results
- `AuditLog`: Activity tracking
- `OnboardingRequirement`: Configurable requirements (optional)

### Extending Requirements

To add admin-configurable requirements:

1. Use the `OnboardingRequirement` model in Prisma
2. Load requirements from database in `RequirementsEngine`
3. Build admin UI to edit requirements

---

## Testing

### Test Accounts

For development, you can create test applications at `/onboarding`.

### NPI Test Numbers

Use these real NPI numbers for testing lookup:
- 1234567893 (test provider)
- Search your own state's NPPES registry

### Verification Testing

Current verification services are placeholders that always return "passed". In production:

1. Integrate with real OIG LEIE data (monthly file download)
2. Register for SAM.gov API access
3. Integrate with state medical board APIs for license verification

---

## Compliance Notes

### Data Minimization

- Only collect what's necessary
- Show "Why we ask this" for sensitive fields
- Don't store raw verification responses (redact sensitive data)

### Audit Trail

- All admin decisions are logged
- Audit logs are immutable
- IP address and timestamp recorded

### Exclusion Screening

Per HHS OIG guidance:
- Check LEIE on application
- Check periodically (monthly recommended)
- Hard stop if exclusion found

---

## Future Enhancements

1. **Real OIG/SAM Integration**: Download LEIE file, register for SAM API
2. **State License APIs**: Integrate with individual state medical boards
3. **Background Check Vendor**: Integrate with Checkr, Sterling, etc.
4. **Email Notifications**: Send status updates to applicants
5. **Multi-Language Support**: Internationalization
6. **Mobile App**: Native onboarding experience
