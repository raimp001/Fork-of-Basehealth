/**
 * Verification Service
 * 
 * Handles all verification checks for provider and caregiver onboarding:
 * - NPI Lookup (NPPES API)
 * - OIG LEIE Exclusions Check
 * - SAM.gov Exclusions Check
 * - License Verification (placeholder for integration)
 */

import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { VerificationStatus, VerificationType } from "@prisma/client"

// ============================================================================
// TYPES
// ============================================================================

export interface NPIResult {
  found: boolean
  npiNumber?: string
  firstName?: string
  lastName?: string
  fullName?: string
  credential?: string
  gender?: string
  enumerationDate?: string
  taxonomies?: Array<{
    code: string
    desc: string
    primary: boolean
    state?: string
    license?: string
  }>
  addresses?: Array<{
    type: string
    address1: string
    city: string
    state: string
    postalCode: string
    phone?: string
  }>
  rawData?: any
}

export interface ExclusionResult {
  excluded: boolean
  matchType?: "exact" | "partial" | "none"
  matchScore?: number
  exclusionDate?: string
  reinstateDate?: string
  exclusionType?: string
  rawData?: any
}

export interface VerificationResult {
  type: VerificationType
  status: VerificationStatus
  passed: boolean
  matchScore?: number
  data?: any
  error?: string
}

// ============================================================================
// NPI LOOKUP (NPPES API)
// ============================================================================

const NPPES_API_URL = "https://npiregistry.cms.hhs.gov/api/"

export async function lookupNPI(npiNumber: string): Promise<NPIResult> {
  try {
    const params = new URLSearchParams({
      version: "2.1",
      number: npiNumber,
    })

    const response = await fetch(`${NPPES_API_URL}?${params}`)
    
    if (!response.ok) {
      throw new Error(`NPPES API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      return { found: false }
    }

    const provider = data.results[0]
    const basic = provider.basic || {}
    const primaryTaxonomy = provider.taxonomies?.find((t: any) => t.primary)
    const practiceAddress = provider.addresses?.find((a: any) => a.address_purpose === "LOCATION")

    return {
      found: true,
      npiNumber: provider.number,
      firstName: basic.first_name,
      lastName: basic.last_name,
      fullName: `${basic.first_name || ""} ${basic.last_name || ""}`.trim(),
      credential: basic.credential,
      gender: basic.gender,
      enumerationDate: basic.enumeration_date,
      taxonomies: provider.taxonomies?.map((t: any) => ({
        code: t.code,
        desc: t.desc,
        primary: t.primary,
        state: t.state,
        license: t.license,
      })),
      addresses: provider.addresses?.map((a: any) => ({
        type: a.address_purpose,
        address1: a.address_1,
        city: a.city,
        state: a.state,
        postalCode: a.postal_code,
        phone: a.telephone_number,
      })),
      rawData: provider,
    }
  } catch (error) {
    logger.error("NPI lookup failed", error)
    throw error
  }
}

export async function searchNPIByName(
  firstName: string,
  lastName: string,
  state?: string
): Promise<NPIResult[]> {
  try {
    const params = new URLSearchParams({
      version: "2.1",
      first_name: firstName,
      last_name: lastName,
      limit: "10",
    })

    if (state) {
      params.append("state", state)
    }

    const response = await fetch(`${NPPES_API_URL}?${params}`)
    
    if (!response.ok) {
      throw new Error(`NPPES API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      return []
    }

    return data.results.map((provider: any) => {
      const basic = provider.basic || {}
      return {
        found: true,
        npiNumber: provider.number,
        firstName: basic.first_name,
        lastName: basic.last_name,
        fullName: `${basic.first_name || ""} ${basic.last_name || ""}`.trim(),
        credential: basic.credential,
        taxonomies: provider.taxonomies?.map((t: any) => ({
          code: t.code,
          desc: t.desc,
          primary: t.primary,
        })),
      }
    })
  } catch (error) {
    logger.error("NPI search failed", error)
    return []
  }
}

// ============================================================================
// OIG LEIE EXCLUSIONS CHECK
// ============================================================================

/**
 * Check OIG LEIE (List of Excluded Individuals/Entities)
 * 
 * Note: The OIG LEIE doesn't have a public API. Options:
 * 1. Download monthly file and search locally
 * 2. Use a third-party API service
 * 3. Scrape the OIG website (not recommended)
 * 
 * For now, we implement a placeholder that simulates the check.
 * In production, integrate with a compliance vendor or download the LEIE file.
 */

const OIG_LEIE_URL = "https://oig.hhs.gov/exclusions/exclusions_list.asp"

export async function checkOIGExclusion(
  firstName: string,
  lastName: string,
  npiNumber?: string
): Promise<ExclusionResult> {
  try {
    // In production, this would:
    // 1. Query a local database of LEIE records (updated monthly)
    // 2. Or call a third-party compliance API
    
    // For now, we simulate by checking name patterns
    // This is a PLACEHOLDER - replace with real integration
    
    logger.info("OIG LEIE check initiated", { firstName, lastName, npiNumber })
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // In real implementation:
    // - Download LEIE file from OIG website monthly
    // - Parse and store in database
    // - Search by name + NPI if available
    // - Return match with confidence score
    
    return {
      excluded: false,
      matchType: "none",
      matchScore: 0,
      rawData: {
        checkedAt: new Date().toISOString(),
        source: "OIG_LEIE",
        note: "Placeholder check - integrate with real LEIE data",
      },
    }
  } catch (error) {
    logger.error("OIG LEIE check failed", error)
    throw error
  }
}

// ============================================================================
// SAM.GOV EXCLUSIONS CHECK
// ============================================================================

/**
 * Check SAM.gov Exclusions
 * 
 * SAM.gov has an API but requires registration.
 * See: https://sam.gov/data-services/SAM-Public-APIs
 * 
 * For now, we implement a placeholder.
 * In production, register for SAM API access and integrate.
 */

const SAM_API_URL = "https://api.sam.gov/entity-information/v3/exclusions"

export async function checkSAMExclusion(
  name: string,
  npiNumber?: string
): Promise<ExclusionResult> {
  try {
    logger.info("SAM exclusion check initiated", { name, npiNumber })
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // In production:
    // 1. Register for SAM.gov API access
    // 2. Call the exclusions API with entity name/DUNS/etc.
    // 3. Parse results for exclusion status
    
    // Placeholder response
    return {
      excluded: false,
      matchType: "none",
      matchScore: 0,
      rawData: {
        checkedAt: new Date().toISOString(),
        source: "SAM.gov",
        note: "Placeholder check - register for SAM API access",
      },
    }
  } catch (error) {
    logger.error("SAM exclusion check failed", error)
    throw error
  }
}

// ============================================================================
// COMBINED VERIFICATION RUNNER
// ============================================================================

export async function runVerification(
  applicationId: string,
  type: VerificationType
): Promise<VerificationResult> {
  try {
    // Get application data
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      throw new Error("Application not found")
    }

    let result: VerificationResult = {
      type,
      status: "PENDING" as VerificationStatus,
      passed: false,
    }

    switch (type) {
      case "NPI_LOOKUP": {
        if (!application.npiNumber) {
          result = { type, status: "PASSED", passed: true, data: { skipped: true, reason: "No NPI provided" } }
        } else {
          const npiResult = await lookupNPI(application.npiNumber)
          
          if (npiResult.found) {
            // Check if names match (fuzzy)
            const appName = (application.fullName || "").toLowerCase()
            const npiName = (npiResult.fullName || "").toLowerCase()
            const nameMatch = appName.includes(npiResult.lastName?.toLowerCase() || "") ||
                             npiName.includes(application.lastName?.toLowerCase() || "")
            
            result = {
              type,
              status: nameMatch ? "PASSED" : "FAILED",
              passed: nameMatch,
              matchScore: nameMatch ? 1 : 0.5,
              data: npiResult,
            }
            
            // Update application with NPI data
            await prisma.application.update({
              where: { id: applicationId },
              data: {
                npiVerified: nameMatch,
                npiData: npiResult.rawData,
              },
            })
          } else {
            result = { type, status: "FAILED", passed: false, data: { found: false } }
          }
        }
        break
      }

      case "OIG_LEIE": {
        const firstName = application.firstName || application.fullName?.split(" ")[0] || ""
        const lastName = application.lastName || application.fullName?.split(" ").slice(-1)[0] || ""
        
        const oigResult = await checkOIGExclusion(firstName, lastName, application.npiNumber || undefined)
        
        result = {
          type,
          status: oigResult.excluded ? "FAILED" : "PASSED",
          passed: !oigResult.excluded,
          matchScore: oigResult.matchScore,
          data: oigResult,
        }
        break
      }

      case "SAM_EXCLUSION": {
        const name = application.fullName || `${application.firstName} ${application.lastName}`
        
        const samResult = await checkSAMExclusion(name, application.npiNumber || undefined)
        
        result = {
          type,
          status: samResult.excluded ? "FAILED" : "PASSED",
          passed: !samResult.excluded,
          matchScore: samResult.matchScore,
          data: samResult,
        }
        break
      }

      case "LICENSE_CHECK": {
        // Placeholder for license verification
        // In production, integrate with state medical board APIs
        result = {
          type,
          status: "PASSED",
          passed: true,
          data: { note: "Manual verification required" },
        }
        break
      }

      default:
        result = { type, status: "ERROR", passed: false, error: "Unknown verification type" }
    }

    // Store verification result
    await prisma.verification.create({
      data: {
        applicationId,
        type,
        status: result.status,
        passed: result.passed,
        matchScore: result.matchScore,
        rawResponse: result.data,
        errorMessage: result.error,
        checkedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    return result
  } catch (error) {
    logger.error("Verification failed", { applicationId, type, error })
    
    // Store error
    await prisma.verification.create({
      data: {
        applicationId,
        type,
        status: "ERROR",
        passed: false,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        checkedAt: new Date(),
      },
    })

    return {
      type,
      status: "ERROR",
      passed: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Run all required verifications for an application
 */
export async function runAllVerifications(applicationId: string): Promise<VerificationResult[]> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  })

  if (!application) {
    throw new Error("Application not found")
  }

  const results: VerificationResult[] = []

  if (application.role === "PROVIDER" && application.country === "US") {
    // Run US provider verifications
    if (application.npiNumber) {
      results.push(await runVerification(applicationId, "NPI_LOOKUP"))
    }
    results.push(await runVerification(applicationId, "OIG_LEIE"))
    results.push(await runVerification(applicationId, "SAM_EXCLUSION"))
    results.push(await runVerification(applicationId, "LICENSE_CHECK"))
  }

  if (application.role === "CAREGIVER") {
    // Caregiver verifications are optional/state-dependent
    // Background check would be triggered here if required
  }

  return results
}

/**
 * Check if an application has passed all required verifications
 */
export async function hasPassedVerifications(applicationId: string): Promise<boolean> {
  const verifications = await prisma.verification.findMany({
    where: {
      applicationId,
      type: {
        in: ["OIG_LEIE", "SAM_EXCLUSION"], // Critical checks
      },
    },
    orderBy: { checkedAt: "desc" },
  })

  // Group by type and check latest status
  const byType = new Map<string, typeof verifications[0]>()
  for (const v of verifications) {
    if (!byType.has(v.type)) {
      byType.set(v.type, v)
    }
  }

  // Check if all required verifications passed
  for (const [type, verification] of byType) {
    if (verification.status === "FAILED" || verification.passed === false) {
      return false
    }
  }

  return true
}
