/**
 * Form Validation Utilities
 * 
 * Centralized validation functions for consistent form validation
 */

import { validateEmail, validatePhone, validateNPI } from './sanitize'

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/**
 * Validate provider signup form
 */
export function validateProviderSignup(data: {
  type: 'PHYSICIAN' | 'APP'
  email: string
  password: string
  fullName?: string
  organizationName?: string
  npi?: string
  licenseNumber?: string
  licenseState?: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  // Common validations
  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Valid email is required'
  }

  if (!data.password || data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }

  // Type-specific validations
  if (data.type === 'PHYSICIAN') {
    if (!data.fullName || data.fullName.trim().length < 2) {
      errors.fullName = 'Full name is required'
    }

    if (!data.npi) {
      errors.npi = 'NPI number is required'
    } else if (!validateNPI(data.npi)) {
      errors.npi = 'NPI must be exactly 10 digits'
    }

    if (!data.licenseNumber || data.licenseNumber.trim().length === 0) {
      errors.licenseNumber = 'State medical board number is required'
    }

    if (!data.licenseState || data.licenseState.trim().length === 0) {
      errors.licenseState = 'License state is required'
    } else if (!/^[A-Z]{2}$/i.test(data.licenseState)) {
      errors.licenseState = 'License state must be a 2-letter state code'
    }
  } else if (data.type === 'APP') {
    if (!data.organizationName || data.organizationName.trim().length < 2) {
      errors.organizationName = 'Organization name is required'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validate login form
 */
export function validateLogin(data: {
  email: string
  password: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Valid email is required'
  }

  if (!data.password || data.password.length === 0) {
    errors.password = 'Password is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validate caregiver signup form
 */
export function validateCaregiverSignup(data: {
  firstName: string
  lastName: string
  email: string
  phone: string
  primarySpecialty: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.firstName = 'First name is required'
  }

  if (!data.lastName || data.lastName.trim().length < 2) {
    errors.lastName = 'Last name is required'
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Valid email is required'
  }

  if (!data.phone || !validatePhone(data.phone)) {
    errors.phone = 'Valid phone number is required'
  }

  if (!data.primarySpecialty || data.primarySpecialty.trim().length === 0) {
    errors.primarySpecialty = 'Primary specialty is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validate patient registration form
 */
export function validatePatientRegistration(data: {
  email: string
  password: string
  name: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name is required'
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Valid email is required'
  }

  if (!data.password || data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
