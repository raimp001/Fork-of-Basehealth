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
 * The OIG publishes the LEIE as downloadable files:
 * https://oig.hhs.gov/exclusions/exclusions_list.asp
 * 
 * Files available:
 * - UPDATED.csv - Monthly updated exclusion list
 * - REINSTATE.csv - Reinstated individuals
 * 
 * Implementation:
 * 1. Cron job downloads LEIE files monthly
 * 2. Parse and store in Prisma (ExclusionRecord table)
 * 3. This function queries the local database
 */

// OIG LEIE download URLs
const OIG_LEIE_UPDATED_URL = "https://oig.hhs.gov/exclusions/downloadables/UPDATED.csv"
const OIG_LEIE_REINSTATE_URL = "https://oig.hhs.gov/exclusions/downloadables/REINSTATE.csv"

// In-memory cache for quick lookups (populated from DB or file)
let leieCache: Map<string, LEIERecord> | null = null
let leieCacheLastUpdated: Date | null = null

interface LEIERecord {
  lastName: string
  firstName: string
  middleName?: string
  busName?: string
  general?: string
  specialty?: string
  upin?: string
  npi?: string
  dob?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  exclType: string
  exclDate: string
  reinDate?: string
  waiverDate?: string
  waiverState?: string
}

/**
 * Parse OIG LEIE CSV file
 */
function parseLEIECSV(csvContent: string): LEIERecord[] {
  const lines = csvContent.split('\n')
  const records: LEIERecord[] = []
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // CSV format: LASTNAME,FIRSTNAME,MIDNAME,BUSNAME,GENERAL,SPECIALTY,UPIN,NPI,DOB,ADDRESS,CITY,STATE,ZIP,EXCLTYPE,EXCLDATE,REINDATE,WAIVERDATE,WAIVERSTATE
    const parts = line.split(',').map(p => p.replace(/^"|"$/g, '').trim())
    
    if (parts.length >= 15) {
      records.push({
        lastName: parts[0],
        firstName: parts[1],
        middleName: parts[2] || undefined,
        busName: parts[3] || undefined,
        general: parts[4] || undefined,
        specialty: parts[5] || undefined,
        upin: parts[6] || undefined,
        npi: parts[7] || undefined,
        dob: parts[8] || undefined,
        address: parts[9] || undefined,
        city: parts[10] || undefined,
        state: parts[11] || undefined,
        zip: parts[12] || undefined,
        exclType: parts[13],
        exclDate: parts[14],
        reinDate: parts[15] || undefined,
        waiverDate: parts[16] || undefined,
        waiverState: parts[17] || undefined,
      })
    }
  }
  
  return records
}

/**
 * Load LEIE data from OIG website
 */
async function loadLEIEData(): Promise<Map<string, LEIERecord>> {
  const cache = new Map<string, LEIERecord>()
  
  try {
    logger.info("Fetching OIG LEIE data...")
    
    const response = await fetch(OIG_LEIE_UPDATED_URL, {
      headers: { 'User-Agent': 'BaseHealth-Verification/1.0' },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch LEIE: ${response.status}`)
    }
    
    const csvContent = await response.text()
    const records = parseLEIECSV(csvContent)
    
    logger.info(`Loaded ${records.length} LEIE exclusion records`)
    
    // Index by name (lowercased) and NPI
    for (const record of records) {
      // Skip if reinstated
      if (record.reinDate && new Date(record.reinDate) < new Date()) {
        continue
      }
      
      const nameKey = `${record.lastName.toLowerCase()}_${record.firstName.toLowerCase()}`
      cache.set(nameKey, record)
      
      if (record.npi) {
        cache.set(`npi_${record.npi}`, record)
      }
    }
    
    return cache
  } catch (error) {
    logger.error("Failed to load LEIE data", error)
    return cache
  }
}

/**
 * Get or refresh LEIE cache
 */
async function getLEIECache(): Promise<Map<string, LEIERecord>> {
  const ONE_DAY = 24 * 60 * 60 * 1000
  
  if (leieCache && leieCacheLastUpdated && (Date.now() - leieCacheLastUpdated.getTime()) < ONE_DAY) {
    return leieCache
  }
  
  leieCache = await loadLEIEData()
  leieCacheLastUpdated = new Date()
  
  return leieCache
}

/**
 * Calculate name similarity score (0-1)
 */
function calculateNameSimilarity(name1: string, name2: string): number {
  const n1 = name1.toLowerCase().trim()
  const n2 = name2.toLowerCase().trim()
  
  if (n1 === n2) return 1.0
  
  // Check if one contains the other
  if (n1.includes(n2) || n2.includes(n1)) return 0.9
  
  // Levenshtein-like simple check
  const longer = n1.length > n2.length ? n1 : n2
  const shorter = n1.length > n2.length ? n2 : n1
  
  if (longer.length === 0) return 1.0
  
  let matches = 0
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++
  }
  
  return matches / longer.length
}

export async function checkOIGExclusion(
  firstName: string,
  lastName: string,
  npiNumber?: string
): Promise<ExclusionResult> {
  try {
    logger.info("OIG LEIE check initiated", { firstName, lastName, npiNumber })
    
    const cache = await getLEIECache()
    
    // Check by NPI first (most accurate)
    if (npiNumber) {
      const npiMatch = cache.get(`npi_${npiNumber}`)
      if (npiMatch) {
        logger.warn("OIG LEIE exclusion found by NPI", { npiNumber, record: npiMatch })
        return {
          excluded: true,
          matchType: "exact",
          matchScore: 1.0,
          exclusionDate: npiMatch.exclDate,
          reinstateDate: npiMatch.reinDate,
          exclusionType: npiMatch.exclType,
          rawData: {
            checkedAt: new Date().toISOString(),
            source: "OIG_LEIE",
            matchMethod: "NPI",
            record: npiMatch,
          },
        }
      }
    }
    
    // Check by name
    const nameKey = `${lastName.toLowerCase()}_${firstName.toLowerCase()}`
    const nameMatch = cache.get(nameKey)
    
    if (nameMatch) {
      // Verify it's not a false positive by checking additional fields
      const similarity = calculateNameSimilarity(
        `${firstName} ${lastName}`,
        `${nameMatch.firstName} ${nameMatch.lastName}`
      )
      
      if (similarity >= 0.9) {
        logger.warn("OIG LEIE exclusion found by name", { firstName, lastName, record: nameMatch })
        return {
          excluded: true,
          matchType: similarity === 1.0 ? "exact" : "partial",
          matchScore: similarity,
          exclusionDate: nameMatch.exclDate,
          reinstateDate: nameMatch.reinDate,
          exclusionType: nameMatch.exclType,
          rawData: {
            checkedAt: new Date().toISOString(),
            source: "OIG_LEIE",
            matchMethod: "NAME",
            similarity,
            record: nameMatch,
          },
        }
      }
    }
    
    // No exclusion found
    return {
      excluded: false,
      matchType: "none",
      matchScore: 0,
      rawData: {
        checkedAt: new Date().toISOString(),
        source: "OIG_LEIE",
        cacheSize: cache.size,
        cacheUpdated: leieCacheLastUpdated?.toISOString(),
      },
    }
  } catch (error) {
    logger.error("OIG LEIE check failed", error)
    // On error, return non-excluded but flag for manual review
    return {
      excluded: false,
      matchType: "none",
      matchScore: 0,
      rawData: {
        checkedAt: new Date().toISOString(),
        source: "OIG_LEIE",
        error: error instanceof Error ? error.message : "Unknown error",
        requiresManualReview: true,
      },
    }
  }
}

// ============================================================================
// SAM.GOV EXCLUSIONS CHECK
// ============================================================================

/**
 * Check SAM.gov Exclusions
 * 
 * SAM.gov Entity Information API:
 * https://api.sam.gov/entity-information/v3/exclusions
 * 
 * Requires API key from https://sam.gov/data-services
 * Set SAM_GOV_API_KEY in environment
 */

const SAM_API_URL = "https://api.sam.gov/entity-information/v3/exclusions"
const SAM_API_KEY = process.env.SAM_GOV_API_KEY

interface SAMExclusionRecord {
  classificationType: string
  exclusionProgram: string
  excludingAgencyCode: string
  excludingAgencyName: string
  exclusionType: string
  samNumber: string
  ueiNumber?: string
  cageCode?: string
  npi?: string
  firstName?: string
  middleName?: string
  lastName?: string
  suffix?: string
  name?: string
  activeDate: string
  terminationDate?: string
  createDate: string
  updateDate: string
  addressLine1?: string
  city?: string
  stateOrProvinceCode?: string
  zipCode?: string
  country?: string
}

interface SAMAPIResponse {
  totalRecords: number
  entityData: SAMExclusionRecord[]
}

export async function checkSAMExclusion(
  name: string,
  npiNumber?: string
): Promise<ExclusionResult> {
  try {
    logger.info("SAM exclusion check initiated", { name, npiNumber })
    
    // If no API key, log warning and return non-excluded
    if (!SAM_API_KEY) {
      logger.warn("SAM_GOV_API_KEY not configured - skipping SAM check")
      return {
        excluded: false,
        matchType: "none",
        matchScore: 0,
        rawData: {
          checkedAt: new Date().toISOString(),
          source: "SAM.gov",
          skipped: true,
          reason: "SAM_GOV_API_KEY not configured",
          requiresManualReview: true,
        },
      }
    }
    
    // Build search query
    const params = new URLSearchParams({
      api_key: SAM_API_KEY,
      format: 'json',
      // Search active exclusions only
      isActive: 'true',
    })
    
    // Search by NPI if available
    if (npiNumber) {
      params.append('npi', npiNumber)
    }
    
    // Also search by name
    const nameParts = name.trim().split(/\s+/)
    if (nameParts.length >= 2) {
      params.append('lastName', nameParts[nameParts.length - 1])
      params.append('firstName', nameParts[0])
    } else if (nameParts.length === 1) {
      params.append('lastName', nameParts[0])
    }
    
    const response = await fetch(`${SAM_API_URL}?${params}`, {
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`SAM API error: ${response.status} ${response.statusText}`)
    }
    
    const data: SAMAPIResponse = await response.json()
    
    if (data.totalRecords > 0 && data.entityData?.length > 0) {
      // Found exclusions - check if any are active
      const activeExclusions = data.entityData.filter(e => {
        if (!e.terminationDate) return true // No termination = still active
        return new Date(e.terminationDate) > new Date()
      })
      
      if (activeExclusions.length > 0) {
        const match = activeExclusions[0]
        
        // Calculate match confidence
        let matchScore = 0.5
        if (npiNumber && match.npi === npiNumber) {
          matchScore = 1.0
        } else {
          const searchName = name.toLowerCase()
          const recordName = `${match.firstName || ''} ${match.lastName || ''}`.toLowerCase().trim()
          matchScore = calculateNameSimilarity(searchName, recordName)
        }
        
        if (matchScore >= 0.8) {
          logger.warn("SAM exclusion found", { name, npiNumber, record: match })
          return {
            excluded: true,
            matchType: matchScore >= 0.95 ? "exact" : "partial",
            matchScore,
            exclusionDate: match.activeDate,
            reinstateDate: match.terminationDate,
            exclusionType: match.exclusionType,
            rawData: {
              checkedAt: new Date().toISOString(),
              source: "SAM.gov",
              samNumber: match.samNumber,
              record: match,
            },
          }
        }
      }
    }
    
    // No active exclusion found
    return {
      excluded: false,
      matchType: "none",
      matchScore: 0,
      rawData: {
        checkedAt: new Date().toISOString(),
        source: "SAM.gov",
        totalRecordsChecked: data.totalRecords || 0,
      },
    }
  } catch (error) {
    logger.error("SAM exclusion check failed", error)
    return {
      excluded: false,
      matchType: "none",
      matchScore: 0,
      rawData: {
        checkedAt: new Date().toISOString(),
        source: "SAM.gov",
        error: error instanceof Error ? error.message : "Unknown error",
        requiresManualReview: true,
      },
    }
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

// ============================================================================
// VERIFICATION → ATTESTATION BRIDGE
// ============================================================================

/**
 * Get verification summary for an application
 * Used to determine if attestation can proceed
 */
export interface VerificationSummary {
  applicationId: string
  providerId?: string
  allPassed: boolean
  readyForAttestation: boolean
  checks: {
    type: string
    status: string
    passed: boolean
    checkedAt: Date | null
    requiresManualReview: boolean
  }[]
  blockers: string[]
  warnings: string[]
}

export async function getVerificationSummary(applicationId: string): Promise<VerificationSummary> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      verifications: {
        orderBy: { checkedAt: "desc" },
      },
    },
  })

  if (!application) {
    throw new Error("Application not found")
  }

  // Get latest verification of each type
  const latestByType = new Map<string, typeof application.verifications[0]>()
  for (const v of application.verifications) {
    if (!latestByType.has(v.type)) {
      latestByType.set(v.type, v)
    }
  }

  const checks: VerificationSummary["checks"] = []
  const blockers: string[] = []
  const warnings: string[] = []

  // Required checks for US providers
  const requiredChecks = ["NPI_LOOKUP", "OIG_LEIE", "SAM_EXCLUSION", "LICENSE_CHECK"]

  for (const checkType of requiredChecks) {
    const v = latestByType.get(checkType)
    
    if (!v) {
      checks.push({
        type: checkType,
        status: "NOT_RUN",
        passed: false,
        checkedAt: null,
        requiresManualReview: false,
      })
      blockers.push(`${checkType} verification not yet run`)
    } else {
      const rawResponse = v.rawResponse as any
      const requiresManualReview = rawResponse?.requiresManualReview === true
      
      checks.push({
        type: v.type,
        status: v.status,
        passed: v.passed || false,
        checkedAt: v.checkedAt,
        requiresManualReview,
      })
      
      if (v.status === "FAILED" || v.passed === false) {
        if (v.type === "OIG_LEIE" || v.type === "SAM_EXCLUSION") {
          blockers.push(`${v.type} check FAILED - provider is excluded`)
        } else {
          blockers.push(`${v.type} check failed`)
        }
      }
      
      if (requiresManualReview) {
        warnings.push(`${v.type} requires manual review due to API error`)
      }
      
      if (v.status === "ERROR") {
        warnings.push(`${v.type} had an error - consider re-running`)
      }
    }
  }

  const allPassed = blockers.length === 0 && 
    checks.every(c => c.status !== "NOT_RUN" && (c.passed || c.status === "PASSED"))

  // Ready for attestation if:
  // 1. All critical checks passed
  // 2. Application is approved
  // 3. Provider has a wallet address
  const readyForAttestation = allPassed && 
    application.status === "APPROVED" &&
    !!application.walletAddress

  if (allPassed && !readyForAttestation) {
    if (application.status !== "APPROVED") {
      warnings.push("Application not yet approved by admin")
    }
    if (!application.walletAddress) {
      warnings.push("Provider wallet address not configured")
    }
  }

  return {
    applicationId,
    providerId: undefined, // Would link to Provider record if created
    allPassed,
    readyForAttestation,
    checks,
    blockers,
    warnings,
  }
}

/**
 * Run full verification pipeline and return attestation eligibility
 * 
 * This is the main function called during provider approval flow:
 * 1. Runs all required verifications
 * 2. Returns summary with pass/fail status
 * 3. If all pass, provider can be attested on-chain
 */
export async function runVerificationPipeline(
  applicationId: string
): Promise<{
  success: boolean
  summary: VerificationSummary
  canAttest: boolean
  nextSteps: string[]
}> {
  logger.info("Starting verification pipeline", { applicationId })

  // Run all verifications
  const results = await runAllVerifications(applicationId)
  
  logger.info("Verification pipeline complete", {
    applicationId,
    results: results.map(r => ({ type: r.type, status: r.status, passed: r.passed })),
  })

  // Get summary
  const summary = await getVerificationSummary(applicationId)

  // Determine next steps
  const nextSteps: string[] = []
  
  if (summary.blockers.length > 0) {
    nextSteps.push("Review verification blockers")
    nextSteps.push("Provider cannot be approved with exclusions")
  } else if (summary.warnings.length > 0) {
    nextSteps.push("Review verification warnings")
    nextSteps.push("Manual review may be required")
    if (summary.allPassed) {
      nextSteps.push("Admin can proceed with approval if warnings are acceptable")
    }
  } else if (summary.allPassed) {
    if (!summary.readyForAttestation) {
      nextSteps.push("Admin approval required")
      nextSteps.push("Provider should add wallet address for on-chain attestation")
    } else {
      nextSteps.push("Ready for on-chain attestation")
      nextSteps.push("Approve provider to trigger attestation")
    }
  }

  return {
    success: summary.blockers.length === 0,
    summary,
    canAttest: summary.readyForAttestation,
    nextSteps,
  }
}

/**
 * Pre-attestation check
 * Call this before creating an attestation to ensure all verifications passed
 */
export async function canCreateAttestation(
  providerId: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    // Get provider
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    })

    if (!provider) {
      return { allowed: false, reason: "Provider not found" }
    }

    if (provider.status !== "APPROVED") {
      return { allowed: false, reason: "Provider not approved" }
    }

    if (!provider.walletAddress) {
      return { allowed: false, reason: "Provider wallet address not configured" }
    }

    // Check if there's a linked application with verifications
    if (provider.applicationId) {
      const summary = await getVerificationSummary(provider.applicationId)
      
      if (!summary.allPassed) {
        return { 
          allowed: false, 
          reason: `Verification blockers: ${summary.blockers.join(", ")}` 
        }
      }
    }

    // Check OIG/SAM directly on provider record
    if (provider.oigClear === false) {
      return { allowed: false, reason: "Provider failed OIG exclusion check" }
    }

    if (provider.samClear === false) {
      return { allowed: false, reason: "Provider failed SAM exclusion check" }
    }

    return { allowed: true }
  } catch (error) {
    logger.error("Error checking attestation eligibility", error)
    return { 
      allowed: false, 
      reason: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}
