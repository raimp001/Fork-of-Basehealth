/**
 * Base Integration Client
 * 
 * Production-ready HTTP client for healthcare vendor integrations.
 * 
 * IMPORTANT HIPAA COMPLIANCE NOTES:
 * - These calls are intended for HIPAA-compliant integration vendors with BAAs (Business Associate Agreements)
 * - PHI must ONLY be sent from a secured backend environment, NEVER from the browser
 * - API keys and base URLs must be stored in environment variables, NEVER hard-coded
 * - All vendor communications should be encrypted (HTTPS)
 * 
 * Supported vendors: Redox, Particle Health, Zus, e-prescribing partners, etc.
 */

interface BaseClientConfig {
  baseUrl: string
  apiKey: string
  timeout?: number // Request timeout in milliseconds
}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  body?: any
  headers?: Record<string, string>
}

export class IntegrationClient {
  private config: BaseClientConfig

  constructor(config: BaseClientConfig) {
    this.config = {
      ...config,
      timeout: config.timeout || 30000, // Default 30 second timeout
    }
  }

  /**
   * Make an HTTP request to the vendor API
   * 
   * @param path - API endpoint path (e.g., '/orders/lab')
   * @param method - HTTP method
   * @param body - Request body (will be JSON stringified)
   * @param customHeaders - Additional headers to include
   * @returns Promise with vendor response
   */
  async callVendor(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    body?: any,
    customHeaders?: Record<string, string>
  ): Promise<any> {
    const url = `${this.config.baseUrl}${path.startsWith('/') ? path : `/${path}`}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Accept': 'application/json',
      ...customHeaders,
    }

    const requestOptions: RequestInit = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    }

    try {
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle non-2xx responses
      if (!response.ok) {
        const errorText = await response.text()
        let errorData: any
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}` }
        }

        throw new IntegrationError(
          `Vendor API error: ${response.status} ${response.statusText}`,
          response.status,
          errorData
        )
      }

      // Parse JSON response
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }

      // Return text if not JSON
      return await response.text()
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new IntegrationError('Request timeout', 408, { timeout: this.config.timeout })
      }

      // Network or other errors
      throw new IntegrationError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        { originalError: error }
      )
    }
  }

  /**
   * GET request helper
   */
  async get(path: string, customHeaders?: Record<string, string>): Promise<any> {
    return this.callVendor(path, 'GET', undefined, customHeaders)
  }

  /**
   * POST request helper
   */
  async post(path: string, body: any, customHeaders?: Record<string, string>): Promise<any> {
    return this.callVendor(path, 'POST', body, customHeaders)
  }

  /**
   * PUT request helper
   */
  async put(path: string, body: any, customHeaders?: Record<string, string>): Promise<any> {
    return this.callVendor(path, 'PUT', body, customHeaders)
  }
}

/**
 * Custom error class for integration errors
 */
export class IntegrationError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public vendorError?: any
  ) {
    super(message)
    this.name = 'IntegrationError'
  }
}

/**
 * Create a configured integration client from environment variables
 * 
 * Reads from:
 * - HEALTH_INTEGRATION_BASE_URL
 * - HEALTH_INTEGRATION_API_KEY
 */
export function createIntegrationClient(): IntegrationClient {
  const baseUrl = process.env.HEALTH_INTEGRATION_BASE_URL
  const apiKey = process.env.HEALTH_INTEGRATION_API_KEY

  if (!baseUrl || !apiKey) {
    throw new Error(
      'Integration client requires HEALTH_INTEGRATION_BASE_URL and HEALTH_INTEGRATION_API_KEY environment variables'
    )
  }

  return new IntegrationClient({
    baseUrl,
    apiKey,
    timeout: parseInt(process.env.HEALTH_INTEGRATION_TIMEOUT || '30000', 10),
  })
}

