/**
 * Rate Limiter
 * 
 * Simple in-memory rate limiter for API routes
 * In production, use Redis or a dedicated service
 */

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

interface RequestRecord {
  count: number
  resetTime: number
}

// In-memory store (use Redis in production)
const requestStore = new Map<string, RequestRecord>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of requestStore.entries()) {
    if (now > record.resetTime) {
      requestStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60 * 1000, maxRequests: 100 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = requestStore.get(identifier)

  if (!record || now > record.resetTime) {
    // New window or expired record
    const newRecord: RequestRecord = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    requestStore.set(identifier, newRecord)
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newRecord.resetTime,
    }
  }

  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  // Increment count
  record.count++
  requestStore.set(identifier, record)

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  // In production, you might want to combine IP with user ID if authenticated
  return ip
}
