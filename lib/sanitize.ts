/**
 * Input Sanitization and XSS Protection
 * 
 * Sanitizes user input to prevent XSS attacks
 */

// Simple HTML sanitization without external dependencies
// For production, consider using DOMPurify or similar

/**
 * Sanitize HTML content
 * Removes all HTML tags and returns plain text
 */
export function sanitizeHtml(dirty: string): string {
  return sanitizeText(dirty)
}

/**
 * Sanitize plain text (removes HTML and escapes special characters)
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') {
    return String(input)
  }
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Escape HTML entities
  sanitized = escapeHtml(sanitized)
  
  // Remove null bytes and control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  return sanitized.trim()
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (US format)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\(\)]+$/
  const digitsOnly = phone.replace(/\D/g, '')
  return phoneRegex.test(phone) && digitsOnly.length >= 10 && digitsOnly.length <= 15
}

/**
 * Validate NPI (10 digits)
 */
export function validateNPI(npi: string): boolean {
  return /^\d{10}$/.test(npi)
}

/**
 * Escape HTML entities
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeText(obj) as T
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject) as T
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized = {} as T
    for (const [key, value] of Object.entries(obj)) {
      ;(sanitized as any)[key] = sanitizeObject(value)
    }
    return sanitized
  }
  
  return obj
}
