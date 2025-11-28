/**
 * PHI (Protected Health Information) Scrubber
 * 
 * This module sanitizes user input by detecting and replacing PHI with tokens.
 * This ensures that no real patient data is sent to external AI services.
 * 
 * IMPORTANT: This is a basic implementation. For production HIPAA compliance,
 * consider using a more sophisticated solution or a dedicated PHI detection service.
 */

export interface PHIScrubResult {
  cleanedText: string
  mapping: Record<string, string>
}

// Counter for generating unique tokens
let nameCounter = 1
let dateCounter = 1
let idCounter = 1

/**
 * Sanitizes input text by replacing PHI with tokens
 * @param input - The original text that may contain PHI
 * @returns Object containing cleaned text and mapping of original values to tokens
 */
export function sanitizeInput(input: string): PHIScrubResult {
  // Reset counters for each new sanitization
  nameCounter = 1
  dateCounter = 1
  idCounter = 1
  
  const mapping: Record<string, string> = {}
  let cleanedText = input

  // 1. Detect and replace email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  cleanedText = cleanedText.replace(emailRegex, (match) => {
    if (!mapping[match]) {
      mapping[match] = '[EMAIL]'
    }
    return mapping[match]
  })

  // 2. Detect and replace phone numbers (various formats)
  const phoneRegex = /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g
  cleanedText = cleanedText.replace(phoneRegex, (match) => {
    if (!mapping[match]) {
      mapping[match] = '[PHONE]'
    }
    return mapping[match]
  })

  // 3. Detect and replace ZIP codes (5 digits, optionally with +4)
  const zipRegex = /\b\d{5}(?:-\d{4})?\b/g
  cleanedText = cleanedText.replace(zipRegex, (match) => {
    if (!mapping[match]) {
      mapping[match] = '[ZIP]'
    }
    return mapping[match]
  })

  // 4. Detect and replace physical addresses (common patterns)
  // Street addresses: "123 Main St", "456 Oak Avenue", etc.
  const streetAddressRegex = /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Place|Pl|Way|Circle|Cir)\b/gi
  cleanedText = cleanedText.replace(streetAddressRegex, (match) => {
    if (!mapping[match]) {
      mapping[match] = '[ADDRESS]'
    }
    return mapping[match]
  })

  // 5. Detect and replace dates of birth (common formats)
  // MM/DD/YYYY, MM-DD-YYYY, YYYY-MM-DD, etc.
  const dobRegex = /\b(?:\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/g
  cleanedText = cleanedText.replace(dobRegex, (match) => {
    // Check if it's likely a DOB (years 1900-2010 or age calculation)
    const yearMatch = match.match(/\d{4}/)
    if (yearMatch) {
      const year = parseInt(yearMatch[0])
      if (year >= 1900 && year <= 2010) {
        if (!mapping[match]) {
          mapping[match] = '[DOB]'
        }
        return mapping[match]
      }
    }
    return match // Don't replace if not likely a DOB
  })

  // 6. Detect and replace full dates (for general date scrubbing)
  const dateRegex = /\b(?:\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/g
  cleanedText = cleanedText.replace(dateRegex, (match) => {
    if (!mapping[match] && !match.includes('[DOB]')) {
      const token = `[DATE_${dateCounter}]`
      dateCounter++
      mapping[match] = token
      return token
    }
    return match
  })

  // 7. Detect and replace names (common name patterns)
  // Look for "Dr. FirstName LastName", "FirstName LastName", etc.
  // This is a simple heuristic - more sophisticated NLP would be better
  const namePatterns = [
    /\b(?:Dr\.?|Doctor|Mr\.?|Mrs\.?|Ms\.?|Miss)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g,
    /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/g, // FirstName LastName
  ]
  
  namePatterns.forEach((pattern) => {
    cleanedText = cleanedText.replace(pattern, (match, namePart) => {
      const name = namePart || match
      // Skip if it's already been replaced or if it's too short
      if (name.length < 3 || name.split(' ').length < 2) {
        return match
      }
      if (!mapping[name]) {
        const token = `[NAME_${nameCounter}]`
        nameCounter++
        mapping[name] = token
      }
      return match.replace(name, mapping[name])
    })
  })

  // 8. Detect and replace obvious IDs / MRNs (Medical Record Numbers)
  // Common patterns: MRN-12345, ID: ABC123, etc.
  const idRegex = /\b(?:MRN|ID|Patient\s*ID|Record\s*#?)[\s:-\-]?([A-Z0-9]{4,})\b/gi
  cleanedText = cleanedText.replace(idRegex, (match) => {
    if (!mapping[match]) {
      mapping[match] = '[ID]'
    }
    return mapping[match]
  })

  // 9. Detect and replace SSN patterns (XXX-XX-XXXX)
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g
  cleanedText = cleanedText.replace(ssnRegex, (match) => {
    if (!mapping[match]) {
      mapping[match] = '[SSN]'
    }
    return mapping[match]
  })

  // 10. Detect and replace age mentions (if followed by "years old", "age", etc.)
  const ageRegex = /\b(\d{1,3})\s*(?:years?\s*old|y\.?o\.?|age)\b/gi
  cleanedText = cleanedText.replace(ageRegex, (match, ageNum) => {
    const age = parseInt(ageNum)
    if (age >= 0 && age <= 120) {
      if (!mapping[match]) {
        // Convert to age range for privacy
        const ageRange = age < 18 ? '[AGE_MINOR]' : age < 65 ? '[AGE_ADULT]' : '[AGE_SENIOR]'
        mapping[match] = ageRange
      }
      return mapping[match]
    }
    return match
  })

  return {
    cleanedText,
    mapping,
  }
}

/**
 * Validates that text has been properly scrubbed
 * @param text - Text to validate
 * @returns true if text appears to be scrubbed (contains tokens)
 */
export function isScrubbed(text: string): boolean {
  return /\[(EMAIL|PHONE|ZIP|ADDRESS|DOB|DATE_\d+|NAME_\d+|ID|SSN|AGE_\w+)\]/.test(text)
}

