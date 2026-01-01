/**
 * Onboarding Requirements Engine
 * 
 * Config-driven requirements system for country/state-based requirements.
 * Determines what fields, documents, and checks are required for each role.
 */

import { ApplicationRole } from "@prisma/client"

export interface Requirement {
  fieldName: string
  label: string
  required: boolean
  recommended: boolean
  helpText?: string
  condition?: Record<string, string[]> // e.g., { professionType: ["MD", "DO"] }
  order: number
}

export interface RequirementSet {
  role: ApplicationRole
  country: string
  region?: string
  requirements: Requirement[]
}

// ============================================================================
// DEFAULT REQUIREMENTS BY COUNTRY/ROLE
// ============================================================================

const US_PROVIDER_REQUIREMENTS: Requirement[] = [
  // Step 0: Role & Region
  { fieldName: "country", label: "Country", required: true, recommended: false, order: 0 },
  { fieldName: "regions", label: "States where you'll practice", required: true, recommended: false, 
    helpText: "Select all states where you hold a license", order: 1 },
  
  // Step 1: Account Basics
  { fieldName: "email", label: "Email", required: true, recommended: false, order: 10 },
  { fieldName: "password", label: "Password", required: true, recommended: false, order: 11 },
  { fieldName: "phone", label: "Phone", required: false, recommended: true, order: 12 },
  
  // Step 2: Profile
  { fieldName: "fullName", label: "Full Name", required: true, recommended: false, order: 20 },
  { fieldName: "professionType", label: "Profession Type", required: true, recommended: false,
    helpText: "MD, DO, NP, PA, RN, PharmD, etc.", order: 21 },
  { fieldName: "specialty", label: "Primary Specialty", required: false, recommended: true, order: 22 },
  
  // Step 3: Verification Essentials
  { fieldName: "npiNumber", label: "NPI Number", required: false, recommended: true,
    helpText: "Your 10-digit National Provider Identifier. We'll use this to autofill your info.", order: 30 },
  { fieldName: "licenseNumber", label: "License Number", required: true, recommended: false,
    helpText: "Your state medical board license number", order: 31 },
  { fieldName: "licenseState", label: "License Issuing State", required: true, recommended: false, order: 32 },
  { fieldName: "licenseExpiry", label: "License Expiration Date", required: true, recommended: false, order: 33 },
  
  // Attestations
  { fieldName: "attestedAccuracy", label: "I attest that all information is accurate", required: true, recommended: false, order: 40 },
  { fieldName: "attestedLicenseScope", label: "I will only practice where I'm licensed", required: true, recommended: false, order: 41 },
  { fieldName: "consentToVerification", label: "I consent to credential verification", required: true, recommended: false, order: 42 },
  
  // Step 4: Optional Add-ons
  { fieldName: "deaNumber", label: "DEA Number", required: false, recommended: false,
    helpText: "Required only if prescribing controlled substances", 
    condition: { professionType: ["MD", "DO", "NP", "PA"] }, order: 50 },
  { fieldName: "malpracticeCarrier", label: "Malpractice Insurance Carrier", required: false, recommended: true, order: 51 },
  { fieldName: "malpracticePolicyNumber", label: "Policy Number", required: false, recommended: false, order: 52 },
  { fieldName: "boardCertification", label: "Board Certification", required: false, recommended: false, order: 53 },
]

const US_CAREGIVER_REQUIREMENTS: Requirement[] = [
  // Step 0: Role & Region
  { fieldName: "country", label: "Country", required: true, recommended: false, order: 0 },
  { fieldName: "regions", label: "Service Area (cities/zip codes)", required: true, recommended: false, order: 1 },
  
  // Step 1: Account Basics
  { fieldName: "email", label: "Email", required: true, recommended: false, order: 10 },
  { fieldName: "password", label: "Password", required: true, recommended: false, order: 11 },
  { fieldName: "firstName", label: "First Name", required: true, recommended: false, order: 12 },
  { fieldName: "lastName", label: "Last Name", required: true, recommended: false, order: 13 },
  { fieldName: "phone", label: "Phone", required: true, recommended: false, order: 14 },
  
  // Step 2: Profile
  { fieldName: "servicesOffered", label: "Services Offered", required: true, recommended: false,
    helpText: "Select all services you provide", order: 20 },
  { fieldName: "experienceYears", label: "Years of Experience", required: true, recommended: false, order: 21 },
  { fieldName: "bio", label: "Short Bio", required: true, recommended: false, 
    helpText: "Tell families about yourself (2-3 sentences)", order: 22 },
  { fieldName: "availability", label: "Availability", required: true, recommended: false, order: 23 },
  { fieldName: "hasTransport", label: "Do you have reliable transportation?", required: true, recommended: false, order: 24 },
  
  // Attestations
  { fieldName: "attestedAccuracy", label: "I attest that all information is accurate", required: true, recommended: false, order: 30 },
  { fieldName: "consentToBackgroundCheck", label: "I consent to background screening", required: true, recommended: false, 
    helpText: "Background check may be required based on your region", order: 31 },
  
  // Step 3: Optional
  { fieldName: "certifications", label: "Certifications", required: false, recommended: true,
    helpText: "CNA, HHA, BLS, CPR, etc.", order: 40 },
  { fieldName: "languages", label: "Languages Spoken", required: false, recommended: true, order: 41 },
]

const CANADA_PROVIDER_REQUIREMENTS: Requirement[] = [
  { fieldName: "country", label: "Country", required: true, recommended: false, order: 0 },
  { fieldName: "regions", label: "Provinces where you'll practice", required: true, recommended: false, order: 1 },
  { fieldName: "email", label: "Email", required: true, recommended: false, order: 10 },
  { fieldName: "fullName", label: "Full Name", required: true, recommended: false, order: 20 },
  { fieldName: "professionType", label: "Profession Type", required: true, recommended: false, order: 21 },
  { fieldName: "licenseNumber", label: "College Registration Number", required: true, recommended: false,
    helpText: "Your provincial medical college registration", order: 30 },
  { fieldName: "licenseState", label: "Issuing Province", required: true, recommended: false, order: 31 },
  { fieldName: "attestedAccuracy", label: "I attest that all information is accurate", required: true, recommended: false, order: 40 },
  { fieldName: "consentToVerification", label: "I consent to credential verification", required: true, recommended: false, order: 41 },
]

// Default requirements for countries without specific config
const DEFAULT_PROVIDER_REQUIREMENTS: Requirement[] = [
  { fieldName: "country", label: "Country", required: true, recommended: false, order: 0 },
  { fieldName: "regions", label: "Region(s) where you'll practice", required: true, recommended: false, order: 1 },
  { fieldName: "email", label: "Email", required: true, recommended: false, order: 10 },
  { fieldName: "fullName", label: "Full Name", required: true, recommended: false, order: 20 },
  { fieldName: "professionType", label: "Profession Type", required: true, recommended: false, order: 21 },
  { fieldName: "licenseNumber", label: "Professional License Number", required: true, recommended: false, order: 30 },
  { fieldName: "attestedAccuracy", label: "I attest that all information is accurate", required: true, recommended: false, order: 40 },
]

const DEFAULT_CAREGIVER_REQUIREMENTS: Requirement[] = [
  { fieldName: "country", label: "Country", required: true, recommended: false, order: 0 },
  { fieldName: "regions", label: "Service Area", required: true, recommended: false, order: 1 },
  { fieldName: "email", label: "Email", required: true, recommended: false, order: 10 },
  { fieldName: "firstName", label: "First Name", required: true, recommended: false, order: 12 },
  { fieldName: "lastName", label: "Last Name", required: true, recommended: false, order: 13 },
  { fieldName: "servicesOffered", label: "Services Offered", required: true, recommended: false, order: 20 },
  { fieldName: "experienceYears", label: "Years of Experience", required: true, recommended: false, order: 21 },
  { fieldName: "attestedAccuracy", label: "I attest that all information is accurate", required: true, recommended: false, order: 40 },
]

// ============================================================================
// VERIFICATION CHECKS BY COUNTRY
// ============================================================================

export interface VerificationCheck {
  type: string
  required: boolean
  runOnSubmit: boolean
  runPeriodically: boolean
  periodDays?: number
}

const US_PROVIDER_CHECKS: VerificationCheck[] = [
  { type: "NPI_LOOKUP", required: false, runOnSubmit: true, runPeriodically: false },
  { type: "LICENSE_CHECK", required: true, runOnSubmit: true, runPeriodically: true, periodDays: 90 },
  { type: "OIG_LEIE", required: true, runOnSubmit: true, runPeriodically: true, periodDays: 30 },
  { type: "SAM_EXCLUSION", required: true, runOnSubmit: true, runPeriodically: true, periodDays: 30 },
]

const US_CAREGIVER_CHECKS: VerificationCheck[] = [
  { type: "BACKGROUND_CHECK", required: false, runOnSubmit: false, runPeriodically: false },
  // Background check requirement varies by state - configured separately
]

// State-specific background check requirements
const STATE_BACKGROUND_CHECK_REQUIRED: Record<string, boolean> = {
  "CA": true,
  "NY": true,
  "TX": false,
  "FL": false,
  // Add more states as needed
}

// ============================================================================
// REQUIREMENTS ENGINE CLASS
// ============================================================================

export class RequirementsEngine {
  private customRequirements: Map<string, Requirement[]> = new Map()
  
  /**
   * Get requirements for a specific role, country, and optional region
   */
  getRequirements(role: ApplicationRole, country: string, region?: string): Requirement[] {
    const key = `${role}:${country}:${region || '*'}`
    
    // Check for custom requirements first
    if (this.customRequirements.has(key)) {
      return this.customRequirements.get(key)!
    }
    
    // Use built-in requirements
    if (role === "PROVIDER") {
      switch (country) {
        case "US":
          return US_PROVIDER_REQUIREMENTS
        case "CA": // Canada
          return CANADA_PROVIDER_REQUIREMENTS
        default:
          return DEFAULT_PROVIDER_REQUIREMENTS
      }
    } else {
      switch (country) {
        case "US":
          return US_CAREGIVER_REQUIREMENTS
        default:
          return DEFAULT_CAREGIVER_REQUIREMENTS
      }
    }
  }
  
  /**
   * Get verification checks for a specific role and country
   */
  getVerificationChecks(role: ApplicationRole, country: string, regions?: string[]): VerificationCheck[] {
    if (role === "PROVIDER" && country === "US") {
      return US_PROVIDER_CHECKS
    }
    
    if (role === "CAREGIVER" && country === "US") {
      // Check if any region requires background check
      const checks = [...US_CAREGIVER_CHECKS]
      const bgCheck = checks.find(c => c.type === "BACKGROUND_CHECK")
      
      if (bgCheck && regions) {
        const anyStateRequires = regions.some(r => STATE_BACKGROUND_CHECK_REQUIRED[r])
        if (anyStateRequires) {
          bgCheck.required = true
          bgCheck.runOnSubmit = true
        }
      }
      
      return checks
    }
    
    return []
  }
  
  /**
   * Check if a specific field is required
   */
  isFieldRequired(
    role: ApplicationRole, 
    country: string, 
    fieldName: string,
    applicationData?: Record<string, any>
  ): boolean {
    const requirements = this.getRequirements(role, country)
    const req = requirements.find(r => r.fieldName === fieldName)
    
    if (!req) return false
    if (!req.required) return false
    
    // Check conditional requirements
    if (req.condition && applicationData) {
      for (const [field, values] of Object.entries(req.condition)) {
        const appValue = applicationData[field]
        if (!values.includes(appValue)) {
          return false // Condition not met, field not required
        }
      }
    }
    
    return true
  }
  
  /**
   * Validate application data against requirements
   */
  validateApplication(
    role: ApplicationRole,
    country: string,
    data: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const requirements = this.getRequirements(role, country)
    const errors: string[] = []
    
    for (const req of requirements) {
      if (this.isFieldRequired(role, country, req.fieldName, data)) {
        const value = data[req.fieldName]
        if (value === undefined || value === null || value === "" || 
            (Array.isArray(value) && value.length === 0)) {
          errors.push(`${req.label} is required`)
        }
      }
    }
    
    return { valid: errors.length === 0, errors }
  }
  
  /**
   * Get grouped requirements by step
   */
  getRequirementsByStep(role: ApplicationRole, country: string): Map<number, Requirement[]> {
    const requirements = this.getRequirements(role, country)
    const grouped = new Map<number, Requirement[]>()
    
    for (const req of requirements) {
      const step = Math.floor(req.order / 10)
      if (!grouped.has(step)) {
        grouped.set(step, [])
      }
      grouped.get(step)!.push(req)
    }
    
    return grouped
  }
  
  /**
   * Add custom requirements (for admin configuration)
   */
  setCustomRequirements(role: ApplicationRole, country: string, region: string | null, requirements: Requirement[]) {
    const key = `${role}:${country}:${region || '*'}`
    this.customRequirements.set(key, requirements)
  }
}

// Export singleton instance
export const requirementsEngine = new RequirementsEngine()

// ============================================================================
// HELPER CONSTANTS
// ============================================================================

export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
]

export const PROFESSION_TYPES = [
  { code: "MD", name: "Doctor of Medicine (MD)" },
  { code: "DO", name: "Doctor of Osteopathic Medicine (DO)" },
  { code: "NP", name: "Nurse Practitioner (NP)" },
  { code: "PA", name: "Physician Assistant (PA)" },
  { code: "RN", name: "Registered Nurse (RN)" },
  { code: "PharmD", name: "Doctor of Pharmacy (PharmD)" },
  { code: "DDS", name: "Doctor of Dental Surgery (DDS)" },
  { code: "DMD", name: "Doctor of Dental Medicine (DMD)" },
  { code: "DPM", name: "Doctor of Podiatric Medicine (DPM)" },
  { code: "DC", name: "Doctor of Chiropractic (DC)" },
  { code: "OD", name: "Doctor of Optometry (OD)" },
  { code: "PT", name: "Physical Therapist (PT)" },
  { code: "OT", name: "Occupational Therapist (OT)" },
  { code: "LCSW", name: "Licensed Clinical Social Worker (LCSW)" },
  { code: "LPC", name: "Licensed Professional Counselor (LPC)" },
  { code: "PsyD", name: "Doctor of Psychology (PsyD)" },
  { code: "PhD", name: "Doctor of Philosophy in Psychology (PhD)" },
  { code: "OTHER", name: "Other Healthcare Provider" },
]

export const CAREGIVER_SERVICES = [
  { code: "COMPANIONSHIP", name: "Companionship" },
  { code: "ADL", name: "Activities of Daily Living (bathing, dressing, grooming)" },
  { code: "TRANSPORT", name: "Transportation to appointments" },
  { code: "MEAL_PREP", name: "Meal preparation" },
  { code: "MED_REMINDERS", name: "Medication reminders (non-clinical)" },
  { code: "LIGHT_HOUSEKEEPING", name: "Light housekeeping" },
  { code: "RESPITE", name: "Respite care" },
  { code: "ERRANDS", name: "Errands and shopping" },
  { code: "MOBILITY", name: "Mobility assistance" },
  { code: "OVERNIGHT", name: "Overnight care" },
  { code: "MEMORY_CARE", name: "Memory care support" },
  { code: "HOSPICE_SUPPORT", name: "Hospice support" },
]

export const CAREGIVER_CERTIFICATIONS = [
  { code: "CNA", name: "Certified Nursing Assistant (CNA)" },
  { code: "HHA", name: "Home Health Aide (HHA)" },
  { code: "BLS", name: "Basic Life Support (BLS)" },
  { code: "CPR", name: "CPR Certified" },
  { code: "FIRST_AID", name: "First Aid Certified" },
  { code: "DEMENTIA", name: "Dementia Care Training" },
  { code: "HOSPICE", name: "Hospice Care Training" },
  { code: "MEDICATION", name: "Medication Administration" },
]

export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "OTHER", name: "Other" },
]
