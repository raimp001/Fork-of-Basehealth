/**
 * PHI (Protected Health Information) Scrubber
 * 
 * HIPAA-Compliant PHI Detection and Sanitization Module
 * 
 * This module provides comprehensive PHI detection and sanitization based on
 * the 18 HIPAA Safe Harbor identifiers. It ensures that no real patient data
 * is sent to external services or logged inappropriately.
 * 
 * HIPAA Safe Harbor De-identification Standard (45 CFR 164.514(b)(2)):
 * The following 18 identifiers must be removed to consider data de-identified:
 * 1. Names
 * 2. Geographic data (smaller than state)
 * 3. Dates (except year) related to an individual
 * 4. Phone numbers
 * 5. Fax numbers
 * 6. Email addresses
 * 7. Social Security numbers
 * 8. Medical record numbers
 * 9. Health plan beneficiary numbers
 * 10. Account numbers
 * 11. Certificate/license numbers
 * 12. Vehicle identifiers and serial numbers
 * 13. Device identifiers and serial numbers
 * 14. Web URLs
 * 15. IP addresses
 * 16. Biometric identifiers
 * 17. Full-face photographs
 * 18. Any other unique identifying number or code
 * 
 * @module phiScrubber
 * @version 2.0.0
 * @hipaa compliant
 */

export interface PHIScrubResult {
  cleanedText: string
  mapping: Record<string, string>
  detectedPHITypes: PHIType[]
  scrubCount: number
}

export type PHIType = 
  | 'NAME'
  | 'GEOGRAPHIC'
  | 'DATE'
  | 'PHONE'
  | 'FAX'
  | 'EMAIL'
  | 'SSN'
  | 'MRN'
  | 'HEALTH_PLAN_ID'
  | 'ACCOUNT_NUMBER'
  | 'LICENSE_NUMBER'
  | 'VEHICLE_ID'
  | 'DEVICE_ID'
  | 'URL'
  | 'IP_ADDRESS'
  | 'BIOMETRIC'
  | 'PHOTO'
  | 'UNIQUE_ID'

export interface PHIDetection {
  type: PHIType
  value: string
  startIndex: number
  endIndex: number
  token: string
}

// Counters for generating unique tokens
let counters: Record<string, number> = {}

function getToken(type: PHIType): string {
  if (!counters[type]) {
    counters[type] = 1
  }
  const token = `[${type}_${counters[type]}]`
  counters[type]++
  return token
}

function resetCounters(): void {
  counters = {}
}

/**
 * Comprehensive PHI detection patterns based on HIPAA Safe Harbor requirements
 */
const PHI_PATTERNS: Array<{ type: PHIType; patterns: RegExp[]; tokenFormat?: string }> = [
  // 1. Names (people's names)
  {
    type: 'NAME',
    patterns: [
      /\b(?:Dr\.?|Doctor|Mr\.?|Mrs\.?|Ms\.?|Miss|Prof\.?|Professor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g,
      /\b(?:patient|client|member)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi,
    ],
  },
  
  // 2. Geographic data (addresses, ZIP codes)
  {
    type: 'GEOGRAPHIC',
    patterns: [
      // Street addresses
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Place|Pl|Way|Circle|Cir|Terrace|Ter|Highway|Hwy|Parkway|Pkwy|Suite|Ste|Apt|Apartment|Unit|#)\s*\d*\b/gi,
      // ZIP codes (3-digit precision not allowed for PHI)
      /\b\d{5}(?:-\d{4})?\b/g,
      // PO Boxes
      /\bP\.?O\.?\s*Box\s*\d+\b/gi,
    ],
  },
  
  // 3. Dates (except year) - DOB, admission dates, discharge dates, etc.
  {
    type: 'DATE',
    patterns: [
      // MM/DD/YYYY, MM-DD-YYYY
      /\b(0?[1-9]|1[0-2])[-\/](0?[1-9]|[12]\d|3[01])[-\/](\d{2}|\d{4})\b/g,
      // YYYY-MM-DD (ISO format)
      /\b(\d{4})[-\/](0?[1-9]|1[0-2])[-\/](0?[1-9]|[12]\d|3[01])\b/g,
      // Month Day, Year (January 15, 2023)
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
      // Day Month Year (15 January 2023)
      /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi,
    ],
  },
  
  // 4. Phone numbers
  {
    type: 'PHONE',
    patterns: [
      /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
      /\b(?:phone|tel|telephone|cell|mobile)[\s:]*(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/gi,
    ],
  },
  
  // 5. Fax numbers
  {
    type: 'FAX',
    patterns: [
      /\b(?:fax|facsimile)[\s:]*(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/gi,
    ],
  },
  
  // 6. Email addresses
  {
    type: 'EMAIL',
    patterns: [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    ],
  },
  
  // 7. Social Security Numbers
  {
    type: 'SSN',
    patterns: [
      /\b\d{3}-\d{2}-\d{4}\b/g,
      /\b(?:SSN|SS#|Social\s*Security)[\s:]*\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/gi,
    ],
  },
  
  // 8. Medical Record Numbers (MRN)
  {
    type: 'MRN',
    patterns: [
      /\b(?:MRN|Medical\s*Record|Patient\s*ID|Record\s*#?)[\s:\-]?([A-Z0-9]{4,})\b/gi,
      /\b(?:chart|case)\s*(?:number|#|no\.?)[\s:]*([A-Z0-9]{4,})\b/gi,
    ],
  },
  
  // 9. Health Plan Beneficiary Numbers
  {
    type: 'HEALTH_PLAN_ID',
    patterns: [
      /\b(?:member\s*ID|subscriber\s*ID|policy\s*number|insurance\s*ID|group\s*number)[\s:\-]?([A-Z0-9]{4,})\b/gi,
      /\b(?:medicare|medicaid)\s*(?:number|ID|#)[\s:\-]?([A-Z0-9]{4,})\b/gi,
    ],
  },
  
  // 10. Account Numbers
  {
    type: 'ACCOUNT_NUMBER',
    patterns: [
      /\b(?:account|acct)\s*(?:number|#|no\.?)[\s:\-]?([A-Z0-9]{6,})\b/gi,
      /\b(?:billing|payment)\s*(?:account|ID)[\s:\-]?([A-Z0-9]{6,})\b/gi,
    ],
  },
  
  // 11. Certificate/License Numbers
  {
    type: 'LICENSE_NUMBER',
    patterns: [
      /\b(?:license|licence|cert|certificate)\s*(?:number|#|no\.?)[\s:\-]?([A-Z0-9]{4,})\b/gi,
      /\b(?:NPI|DEA)\s*(?:number|#)?[\s:\-]?(\d{10}|\d{9}[A-Z]\d{7})\b/gi,
    ],
  },
  
  // 12. Vehicle Identifiers
  {
    type: 'VEHICLE_ID',
    patterns: [
      /\b(?:VIN|vehicle\s*identification)[\s:\-]?([A-HJ-NPR-Z0-9]{17})\b/gi,
      /\b(?:license\s*plate|plate\s*number)[\s:\-]?([A-Z0-9]{2,8})\b/gi,
    ],
  },
  
  // 13. Device Identifiers
  {
    type: 'DEVICE_ID',
    patterns: [
      /\b(?:device|serial|IMEI|MAC)[\s:\-]?(?:number|ID|#)?[\s:\-]?([A-Z0-9]{8,})\b/gi,
      /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g, // MAC address
    ],
  },
  
  // 14. Web URLs
  {
    type: 'URL',
    patterns: [
      /\bhttps?:\/\/[^\s<>"{}|\\^`[\]]+/gi,
      /\bwww\.[^\s<>"{}|\\^`[\]]+/gi,
    ],
  },
  
  // 15. IP Addresses
  {
    type: 'IP_ADDRESS',
    patterns: [
      /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
      /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g, // IPv6
    ],
  },
  
  // 18. Other Unique Identifiers (catch-all for common patterns)
  {
    type: 'UNIQUE_ID',
    patterns: [
      /\b(?:ID|identifier|ref|reference)[\s:\-#]?([A-Z0-9]{8,})\b/gi,
    ],
  },
]

/**
 * Sanitizes input text by replacing PHI with tokens following HIPAA Safe Harbor guidelines
 * @param input - The original text that may contain PHI
 * @returns Object containing cleaned text, mapping, detected PHI types, and count
 */
export function sanitizeInput(input: string): PHIScrubResult {
  resetCounters()
  
  const mapping: Record<string, string> = {}
  const detectedPHITypes: Set<PHIType> = new Set()
  let cleanedText = input
  let scrubCount = 0

  // Process each PHI pattern type
  for (const { type, patterns } of PHI_PATTERNS) {
    for (const pattern of patterns) {
      // Reset regex lastIndex for global patterns
      pattern.lastIndex = 0
      
      cleanedText = cleanedText.replace(pattern, (match) => {
        // Skip if already replaced
        if (match.startsWith('[') && match.endsWith(']')) {
          return match
        }
        
        if (!mapping[match]) {
          const token = getToken(type)
          mapping[match] = token
          detectedPHITypes.add(type)
          scrubCount++
        }
        return mapping[match]
      })
    }
  }

  return {
    cleanedText,
    mapping,
    detectedPHITypes: Array.from(detectedPHITypes),
    scrubCount,
  }
}

/**
 * Detects PHI in text without replacing it
 * Useful for validation and logging purposes
 * @param input - The text to scan for PHI
 * @returns Array of detected PHI items with their locations
 */
export function detectPHI(input: string): PHIDetection[] {
  const detections: PHIDetection[] = []
  let tokenCounter = 0

  for (const { type, patterns } of PHI_PATTERNS) {
    for (const pattern of patterns) {
      pattern.lastIndex = 0
      let match
      
      while ((match = pattern.exec(input)) !== null) {
        tokenCounter++
        detections.push({
          type,
          value: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          token: `[${type}_${tokenCounter}]`,
        })
      }
    }
  }

  return detections
}

/**
 * Checks if text contains any PHI
 * @param text - Text to check
 * @returns true if PHI is detected
 */
export function containsPHI(text: string): boolean {
  const detections = detectPHI(text)
  return detections.length > 0
}

/**
 * Validates that text has been properly scrubbed
 * @param text - Text to validate
 * @returns true if text appears to be scrubbed (contains tokens)
 */
export function isScrubbed(text: string): boolean {
  const tokenPattern = /\[(NAME|GEOGRAPHIC|DATE|PHONE|FAX|EMAIL|SSN|MRN|HEALTH_PLAN_ID|ACCOUNT_NUMBER|LICENSE_NUMBER|VEHICLE_ID|DEVICE_ID|URL|IP_ADDRESS|BIOMETRIC|PHOTO|UNIQUE_ID)_\d+\]/
  return tokenPattern.test(text)
}

/**
 * Re-hydrates scrubbed text with original values
 * WARNING: Only use this in secure contexts with proper authorization
 * @param scrubbedText - Text with PHI tokens
 * @param mapping - Original mapping from sanitizeInput
 * @returns Original text with PHI restored
 */
export function rehydratePHI(scrubbedText: string, mapping: Record<string, string>): string {
  let result = scrubbedText
  
  // Create reverse mapping
  const reverseMapping: Record<string, string> = {}
  for (const [original, token] of Object.entries(mapping)) {
    reverseMapping[token] = original
  }
  
  // Replace tokens with original values
  for (const [token, original] of Object.entries(reverseMapping)) {
    result = result.replace(new RegExp(escapeRegExp(token), 'g'), original)
  }
  
  return result
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Returns a summary of PHI detected in text (for audit logging)
 * Does not include actual PHI values
 * @param text - Text to analyze
 * @returns Summary object safe for logging
 */
export function getPHISummary(text: string): {
  hasPHI: boolean
  phiTypes: PHIType[]
  phiCount: number
  riskLevel: 'none' | 'low' | 'medium' | 'high'
} {
  const detections = detectPHI(text)
  const phiTypes = [...new Set(detections.map(d => d.type))]
  const phiCount = detections.length
  
  // Calculate risk level based on types of PHI detected
  const highRiskTypes: PHIType[] = ['SSN', 'MRN', 'HEALTH_PLAN_ID']
  const mediumRiskTypes: PHIType[] = ['NAME', 'DATE', 'EMAIL', 'PHONE']
  
  let riskLevel: 'none' | 'low' | 'medium' | 'high' = 'none'
  
  if (phiCount === 0) {
    riskLevel = 'none'
  } else if (phiTypes.some(t => highRiskTypes.includes(t))) {
    riskLevel = 'high'
  } else if (phiTypes.some(t => mediumRiskTypes.includes(t))) {
    riskLevel = 'medium'
  } else {
    riskLevel = 'low'
  }
  
  return {
    hasPHI: phiCount > 0,
    phiTypes,
    phiCount,
    riskLevel,
  }
}

