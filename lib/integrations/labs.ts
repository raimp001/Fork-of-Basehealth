/**
 * Labs Integration - Production Ready
 * 
 * REAL implementation for healthcare lab vendor integrations.
 * 
 * HIPAA COMPLIANCE NOTES:
 * - These calls are intended for HIPAA-compliant integration vendors with BAAs
 * - PHI must ONLY be sent from a secured backend environment, NEVER from the browser
 * - API keys and URLs must be stored in environment variables, NEVER hard-coded
 * - All vendor communications are encrypted (HTTPS)
 * 
 * Supported vendors: Redox, Particle Health, LabCorp, Quest Diagnostics, etc.
 * 
 * Environment variables required:
 * - HEALTH_INTEGRATION_BASE_URL (e.g., https://api.redoxengine.com or vendor sandbox URL)
 * - HEALTH_INTEGRATION_API_KEY (vendor-provided API key/token)
 */

export interface LabOrderInput {
  patientId: string // Internal patient ID (not real-world identifier)
  providerId: string // Internal provider ID
  testCodes: string[] // LOINC codes (e.g., ["24323-8", "2093-3"])
  testNames: string[] // Human-readable test names
  priority: "routine" | "urgent" | "stat"
  notes?: string
  orderDate?: string // ISO date string
}

import { createIntegrationClient, IntegrationError } from './baseClient'

export interface LabOrderResponse {
  success: boolean
  orderId: string
  status: "pending" | "sent" | "received" | "completed"
  estimatedCompletionDate?: string // ISO date string
  message?: string
  vendorResponse?: any // Raw vendor response
}

export interface LabResult {
  orderId: string
  resultId: string
  testCode: string // LOINC code
  testName: string
  result: string
  unit?: string
  referenceRange?: string
  status: "normal" | "abnormal" | "critical"
  completedDate: string // ISO date string
  vendorData?: any // Raw vendor response data
}

/**
 * Create a lab order
 * 
 * Sends a lab order to the vendor API (e.g., Redox, Particle Health).
 * 
 * Expected vendor endpoint: POST /orders/lab
 * 
 * @param order - Lab order details with internal patient/provider IDs
 * @returns Lab order response with vendor order ID
 */
export async function createLabOrder(order: LabOrderInput): Promise<LabOrderResponse> {
  const client = createIntegrationClient()

  // Prepare request payload (FHIR-style structure)
  // NOTE: Uses internal patient/provider IDs - vendor will map to their patient/provider records
  const payload = {
    patientId: order.patientId, // Internal patient ID
    providerId: order.providerId, // Internal provider ID
    orderDate: order.orderDate || new Date().toISOString(),
    priority: order.priority,
    tests: order.testCodes.map((code, index) => ({
      loincCode: code,
      testName: order.testNames[index] || code,
    })),
    notes: order.notes,
    // Vendor-specific fields may be added here based on vendor documentation
  }

  try {
    // Call vendor API
    const vendorResponse = await client.post('/orders/lab', payload)

    // Parse vendor response (structure may vary by vendor)
    return {
      success: true,
      orderId: vendorResponse.orderId || vendorResponse.id || vendorResponse.order_id,
      status: vendorResponse.status || 'sent',
      estimatedCompletionDate: vendorResponse.estimatedCompletionDate || vendorResponse.estimated_completion_date,
      message: vendorResponse.message || 'Lab order placed successfully',
      vendorResponse, // Include full vendor response for debugging
    }
  } catch (error) {
    if (error instanceof IntegrationError) {
      console.error('Lab order API error:', {
        statusCode: error.statusCode,
        vendorError: error.vendorError,
      })
      throw error
    }
    throw error
  }
}

/**
 * Legacy function name for backward compatibility
 */
export async function placeLabOrder(order: LabOrderInput): Promise<LabOrderResponse> {
  return createLabOrder(order)
}

/**
 * Get lab result by result ID
 * 
 * Retrieves a specific lab result from the vendor API.
 * 
 * Expected vendor endpoint: GET /results/lab/{id}
 * 
 * @param resultId - Vendor-provided result ID (from order response or webhook)
 * @returns Lab result data
 */
export async function getLabResult(resultId: string): Promise<LabResult> {
  const client = createIntegrationClient()

  try {
    const vendorResponse = await client.get(`/results/lab/${resultId}`)

    // Parse vendor response (structure may vary by vendor)
    return {
      orderId: vendorResponse.orderId || vendorResponse.order_id,
      resultId: vendorResponse.resultId || vendorResponse.id || resultId,
      testCode: vendorResponse.testCode || vendorResponse.loincCode || vendorResponse.loinc_code,
      testName: vendorResponse.testName || vendorResponse.test_name,
      result: vendorResponse.result || vendorResponse.value,
      unit: vendorResponse.unit,
      referenceRange: vendorResponse.referenceRange || vendorResponse.reference_range,
      status: vendorResponse.status || 'normal',
      completedDate: vendorResponse.completedDate || vendorResponse.completed_date || new Date().toISOString(),
      vendorData: vendorResponse, // Include full vendor response
    }
  } catch (error) {
    if (error instanceof IntegrationError) {
      console.error('Lab result API error:', {
        resultId,
        statusCode: error.statusCode,
        vendorError: error.vendorError,
      })
      throw error
    }
    throw error
  }
}

/**
 * Get all lab results for an order
 * 
 * Retrieves all results associated with a lab order.
 * 
 * Expected vendor endpoint: GET /results/lab?orderId={orderId}
 * 
 * @param orderId - Vendor-provided order ID
 * @returns Array of lab results
 */
export async function getLabResults(orderId: string): Promise<LabResult[]> {
  const client = createIntegrationClient()

  try {
    const vendorResponse = await client.get(`/results/lab?orderId=${orderId}`)

    // Handle different vendor response formats
    const results = Array.isArray(vendorResponse) 
      ? vendorResponse 
      : vendorResponse.results || vendorResponse.data || []

    return results.map((result: any) => ({
      orderId: result.orderId || result.order_id || orderId,
      resultId: result.resultId || result.id,
      testCode: result.testCode || result.loincCode || result.loinc_code,
      testName: result.testName || result.test_name,
      result: result.result || result.value,
      unit: result.unit,
      referenceRange: result.referenceRange || result.reference_range,
      status: result.status || 'normal',
      completedDate: result.completedDate || result.completed_date || new Date().toISOString(),
      vendorData: result,
    }))
  } catch (error) {
    if (error instanceof IntegrationError) {
      console.error('Lab results API error:', {
        orderId,
        statusCode: error.statusCode,
        vendorError: error.vendorError,
      })
      throw error
    }
    throw error
  }
}

