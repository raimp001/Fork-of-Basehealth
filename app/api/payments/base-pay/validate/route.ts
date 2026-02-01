/**
 * Base Pay User Info Validation API
 * 
 * Called by Base Pay SDK during checkout to validate user-provided
 * information (email, phone, address) before the transaction is submitted.
 */

import { NextRequest, NextResponse } from 'next/server'

// Blocked email domains (temporary/disposable emails)
const BLOCKED_EMAIL_DOMAINS = [
  'tempmail.com',
  'throwaway.com',
  'guerrillamail.com',
  'mailinator.com',
  '10minutemail.com',
]

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json()
    const { requestedInfo } = requestData.capabilities?.dataCallback || {}
    
    if (!requestedInfo) {
      // No info to validate, proceed with transaction
      return NextResponse.json({ request: requestData })
    }
    
    const errors: Record<string, string | Record<string, string>> = {}
    
    // Validate email
    if (requestedInfo.email) {
      const email = requestedInfo.email.toLowerCase()
      const domain = email.split('@')[1]
      
      if (BLOCKED_EMAIL_DOMAINS.includes(domain)) {
        errors.email = 'Please use a valid email address, not a temporary one.'
      }
      
      // Basic email format check
      if (!email.includes('@') || !email.includes('.')) {
        errors.email = 'Please enter a valid email address.'
      }
    }
    
    // Validate phone number (if provided)
    if (requestedInfo.phoneNumber) {
      const phone = requestedInfo.phoneNumber.number
      // Basic validation - should have at least 10 digits
      const digitsOnly = phone.replace(/\D/g, '')
      if (digitsOnly.length < 10) {
        errors.phoneNumber = 'Please enter a valid phone number.'
      }
    }
    
    // Validate shipping address (if provided)
    if (requestedInfo.physicalAddress) {
      const addr = requestedInfo.physicalAddress
      
      // Currently only support US addresses for healthcare services
      const supportedCountries = ['US', 'USA']
      if (!supportedCountries.includes(addr.countryCode?.toUpperCase())) {
        errors.physicalAddress = {
          countryCode: 'We currently only serve patients in the United States.',
        }
      }
      
      // Require ZIP code
      if (!addr.postalCode || addr.postalCode.length < 5) {
        errors.physicalAddress = {
          postalCode: 'Please enter a valid ZIP code.',
        }
      }
    }
    
    // Return errors if validation failed
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors })
    }
    
    // Validation passed - proceed with transaction
    return NextResponse.json({ request: requestData })
    
  } catch (error) {
    console.error('Base Pay validation error:', error)
    // On error, allow transaction to proceed (fail open for UX)
    // Server-side verification will catch any issues
    return NextResponse.json({ request: await request.json() })
  }
}
