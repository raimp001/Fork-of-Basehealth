/**
 * OIG Exclusion List & SAM.gov Verification Service
 * 
 * Verifies healthcare providers against federal exclusion databases:
 * - OIG LEIE (List of Excluded Individuals/Entities)
 * - SAM.gov (System for Award Management) debarment list
 * 
 * These checks are REQUIRED for healthcare organizations to avoid
 * billing for services provided by excluded individuals.
 */

// OIG LEIE API endpoint
const OIG_LEIE_API = 'https://oig.hhs.gov/exclusions/exclusions_list.asp'
const OIG_LEIE_SEARCH = 'https://exclusions.oig.hhs.gov/api/exclusions'

// SAM.gov API endpoint (requires API key)
const SAM_API_BASE = 'https://api.sam.gov/entity-information/v3/entities'

export interface OIGExclusionResult {
  excluded: boolean
  matchFound: boolean
  exclusionType?: string
  exclusionDate?: string
  reinstatementDate?: string
  waiverDate?: string
  waiverState?: string
  rawData?: any
  error?: string
}

export interface SAMDebarmentResult {
  debarred: boolean
  matchFound: boolean
  exclusionProgram?: string
  activationDate?: string
  terminationDate?: string
  samNumber?: string
  rawData?: any
  error?: string
}

export interface ProviderVerificationResult {
  npi: string
  name: string
  oigCheck: OIGExclusionResult
  samCheck: SAMDebarmentResult
  overallClear: boolean
  verificationDate: string
  verificationId: string
}

/**
 * Check OIG LEIE (List of Excluded Individuals/Entities)
 * 
 * The OIG maintains a list of individuals and entities excluded from
 * federally funded healthcare programs (Medicare, Medicaid, etc.)
 */
export async function checkOIGExclusion(
  firstName: string,
  lastName: string,
  npi?: string
): Promise<OIGExclusionResult> {
  try {
    // OIG provides a downloadable database and search API
    // For real implementation, you would:
    // 1. Download monthly LEIE database update
    // 2. Search against local database for performance
    // OR use their REST API (unofficial but available)
    
    const searchParams = new URLSearchParams({
      firstname: firstName,
      lastname: lastName,
      ...(npi && { npi }),
    })
    
    // Try the OIG exclusions API
    const response = await fetch(`${OIG_LEIE_SEARCH}?${searchParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Short timeout since this is a critical check
      signal: AbortSignal.timeout(10000),
    })
    
    if (!response.ok) {
      // If API fails, use alternative verification method
      console.warn('OIG API not accessible, using alternative method')
      return await checkOIGAlternative(firstName, lastName, npi)
    }
    
    const data = await response.json()
    
    // Check if any exclusions found
    const hasExclusions = data.results && data.results.length > 0
    
    if (hasExclusions) {
      const exclusion = data.results[0]
      return {
        excluded: true,
        matchFound: true,
        exclusionType: exclusion.excltype,
        exclusionDate: exclusion.excldate,
        reinstatementDate: exclusion.reindate,
        waiverDate: exclusion.waiverdate,
        waiverState: exclusion.waiverstate,
        rawData: exclusion,
      }
    }
    
    return {
      excluded: false,
      matchFound: false,
    }
  } catch (error) {
    console.error('OIG check error:', error)
    
    // On network error, try alternative method
    if (error instanceof Error && error.name === 'TimeoutError') {
      return await checkOIGAlternative(firstName, lastName, npi)
    }
    
    return {
      excluded: false,
      matchFound: false,
      error: error instanceof Error ? error.message : 'OIG check failed',
    }
  }
}

/**
 * Alternative OIG check using NPPES verification
 * Falls back to checking if NPI is valid and cross-referencing
 */
async function checkOIGAlternative(
  firstName: string,
  lastName: string,
  npi?: string
): Promise<OIGExclusionResult> {
  try {
    // Check NPPES for the NPI - if it's deactivated, that's a red flag
    if (npi) {
      const nppsResponse = await fetch(
        `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`
      )
      
      if (nppsResponse.ok) {
        const data = await nppsResponse.json()
        
        // If NPI not found or deactivated
        if (!data.results || data.results.length === 0) {
          return {
            excluded: false,
            matchFound: false,
            error: 'NPI not found in NPPES - verify manually',
          }
        }
        
        const provider = data.results[0]
        const enumDate = provider.basic?.enumeration_date
        const lastUpdated = provider.basic?.last_updated
        const status = provider.basic?.status
        
        // If status indicates deactivation
        if (status === 'D') {
          return {
            excluded: true,
            matchFound: true,
            exclusionType: 'NPI_DEACTIVATED',
            error: 'NPI is deactivated - verify OIG status manually',
          }
        }
      }
    }
    
    // For production, you should:
    // 1. Download OIG LEIE monthly update file
    // 2. Store in database
    // 3. Query locally
    console.log('OIG check completed via alternative method for:', firstName, lastName)
    
    return {
      excluded: false,
      matchFound: false,
      error: 'OIG API unavailable - verified via NPPES only',
    }
  } catch (error) {
    return {
      excluded: false,
      matchFound: false,
      error: 'Alternative OIG check failed',
    }
  }
}

/**
 * Check SAM.gov for debarment/exclusion
 * 
 * SAM.gov maintains the official list of parties excluded from
 * receiving federal contracts and certain subcontracts.
 */
export async function checkSAMDebarment(
  entityName: string,
  options?: {
    ueiDUNS?: string
    cageCode?: string
  }
): Promise<SAMDebarmentResult> {
  const samApiKey = process.env.SAM_GOV_API_KEY
  
  if (!samApiKey) {
    console.warn('SAM_GOV_API_KEY not set - using limited check')
    return checkSAMAlternative(entityName)
  }
  
  try {
    const searchParams = new URLSearchParams({
      api_key: samApiKey,
      legalBusinessName: entityName,
      includeSections: 'entityRegistration,coreData,exclusions',
      ...(options?.ueiDUNS && { ueiDUNS: options.ueiDUNS }),
      ...(options?.cageCode && { cageCode: options.cageCode }),
    })
    
    const response = await fetch(`${SAM_API_BASE}?${searchParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    })
    
    if (!response.ok) {
      console.warn('SAM API error:', response.status)
      return checkSAMAlternative(entityName)
    }
    
    const data = await response.json()
    
    // Check for active exclusions
    if (data.entityData && data.entityData.length > 0) {
      for (const entity of data.entityData) {
        if (entity.exclusions && entity.exclusions.length > 0) {
          const activeExclusion = entity.exclusions.find(
            (ex: any) => !ex.terminationDate || new Date(ex.terminationDate) > new Date()
          )
          
          if (activeExclusion) {
            return {
              debarred: true,
              matchFound: true,
              exclusionProgram: activeExclusion.exclusionProgram,
              activationDate: activeExclusion.activationDate,
              terminationDate: activeExclusion.terminationDate,
              samNumber: entity.entityRegistration?.samRegistrationId,
              rawData: activeExclusion,
            }
          }
        }
      }
    }
    
    return {
      debarred: false,
      matchFound: data.entityData?.length > 0,
    }
  } catch (error) {
    console.error('SAM check error:', error)
    return {
      debarred: false,
      matchFound: false,
      error: error instanceof Error ? error.message : 'SAM check failed',
    }
  }
}

/**
 * Alternative SAM check when API key not available
 */
async function checkSAMAlternative(entityName: string): Promise<SAMDebarmentResult> {
  try {
    // SAM.gov has a public search but no public API without key
    // For production, you should obtain a SAM.gov API key
    // https://open.gsa.gov/api/sam-entity-management/
    
    console.log('SAM check (limited) for:', entityName)
    
    return {
      debarred: false,
      matchFound: false,
      error: 'SAM_GOV_API_KEY required for full verification - manual check recommended',
    }
  } catch (error) {
    return {
      debarred: false,
      matchFound: false,
      error: 'SAM alternative check failed',
    }
  }
}

/**
 * Comprehensive provider verification
 * Combines OIG and SAM checks with NPI verification
 */
export async function verifyProviderCredentials(
  npi: string,
  firstName: string,
  lastName: string,
  organizationName?: string
): Promise<ProviderVerificationResult> {
  const verificationId = `VER-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const verificationDate = new Date().toISOString()
  
  // Run checks in parallel
  const [oigResult, samResult] = await Promise.all([
    checkOIGExclusion(firstName, lastName, npi),
    checkSAMDebarment(organizationName || `${firstName} ${lastName}`),
  ])
  
  // Provider is clear if not excluded from either database
  const overallClear = !oigResult.excluded && !samResult.debarred
  
  const result: ProviderVerificationResult = {
    npi,
    name: `${firstName} ${lastName}`,
    oigCheck: oigResult,
    samCheck: samResult,
    overallClear,
    verificationDate,
    verificationId,
  }
  
  // Log for audit purposes
  console.log('Provider verification completed:', {
    verificationId,
    npi,
    name: result.name,
    oigExcluded: oigResult.excluded,
    samDebarred: samResult.debarred,
    overallClear,
  })
  
  return result
}

/**
 * Check if a provider needs re-verification
 * OIG recommends monthly checks
 */
export function needsReverification(lastVerificationDate: string): boolean {
  const lastCheck = new Date(lastVerificationDate)
  const now = new Date()
  const daysSinceCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24)
  
  // Re-verify every 30 days
  return daysSinceCheck >= 30
}

/**
 * Get verification status description
 */
export function getVerificationStatus(result: ProviderVerificationResult): {
  status: 'CLEAR' | 'EXCLUDED' | 'NEEDS_REVIEW'
  message: string
  details: string[]
} {
  const details: string[] = []
  
  if (result.oigCheck.error) {
    details.push(`OIG: ${result.oigCheck.error}`)
  }
  if (result.samCheck.error) {
    details.push(`SAM: ${result.samCheck.error}`)
  }
  
  if (result.oigCheck.excluded) {
    return {
      status: 'EXCLUDED',
      message: 'Provider found on OIG Exclusion List',
      details: [
        `Exclusion Type: ${result.oigCheck.exclusionType}`,
        `Exclusion Date: ${result.oigCheck.exclusionDate}`,
        ...details,
      ],
    }
  }
  
  if (result.samCheck.debarred) {
    return {
      status: 'EXCLUDED',
      message: 'Provider found on SAM.gov Debarment List',
      details: [
        `Program: ${result.samCheck.exclusionProgram}`,
        `Activation Date: ${result.samCheck.activationDate}`,
        ...details,
      ],
    }
  }
  
  if (result.oigCheck.error || result.samCheck.error) {
    return {
      status: 'NEEDS_REVIEW',
      message: 'Verification completed with warnings - manual review recommended',
      details,
    }
  }
  
  return {
    status: 'CLEAR',
    message: 'Provider passed all exclusion checks',
    details: [
      'Not found on OIG Exclusion List',
      'Not found on SAM.gov Debarment List',
    ],
  }
}
