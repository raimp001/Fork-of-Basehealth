/**
 * HealthDB.ai Integration Service
 *
 * Production-only behavior: no mock/simulated medical data.
 * If HealthDB is not configured or requests fail, methods return
 * `success: false` with an explicit error.
 */

interface HealthDBConfig {
  apiKey: string
  baseUrl: string
  version: string
}

interface MedicalCondition {
  id: string
  name: string
  description: string
  symptoms: string[]
  treatments: string[]
  specialists: string[]
  urgency: 'low' | 'medium' | 'high' | 'critical'
  relatedConditions: string[]
}

interface ClinicalGuideline {
  id: string
  title: string
  organization: string
  condition: string
  recommendations: string[]
  evidenceLevel: string
  lastUpdated: string
}

interface DrugInteraction {
  drug1: string
  drug2: string
  severity: 'minor' | 'moderate' | 'major'
  description: string
  management: string
}

interface HealthDBResponse<T> {
  success: boolean
  data: T
  error?: string
  metadata?: {
    confidence: number
    sources: string[]
    timestamp: string
  }
}

class HealthDBService {
  private config: HealthDBConfig

  constructor() {
    this.config = {
      apiKey: process.env.HEALTHDB_API_KEY || '',
      baseUrl: (process.env.HEALTHDB_BASE_URL || 'https://api.healthdb.ai').replace(/\/$/, ''),
      version: process.env.HEALTHDB_API_VERSION || 'v1',
    }
  }

  private isConfigured(): boolean {
    return Boolean(this.config.apiKey)
  }

  private failure<T>(data: T, error: string): HealthDBResponse<T> {
    return {
      success: false,
      data,
      error,
      metadata: {
        confidence: 0,
        sources: ['HealthDB.ai'],
        timestamp: new Date().toISOString(),
      },
    }
  }

  private success<T>(data: T, source = 'HealthDB.ai', confidence = 0.8): HealthDBResponse<T> {
    return {
      success: true,
      data,
      metadata: {
        confidence,
        sources: [source],
        timestamp: new Date().toISOString(),
      },
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<HealthDBResponse<T>> {
    if (!this.isConfigured()) {
      return this.failure<T>(null as T, 'HealthDB integration is not configured')
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/${this.config.version}${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'BaseHealth/1.0',
          ...(options.headers || {}),
        },
        body: options.body,
      })

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        return this.failure<T>(null as T, `HealthDB API error (${response.status}): ${text || response.statusText}`)
      }

      const payload = await response.json()
      return this.success<T>(payload as T)
    } catch (error) {
      return this.failure<T>(
        null as T,
        error instanceof Error ? error.message : 'HealthDB request failed',
      )
    }
  }

  private normalizeArray<T>(value: unknown): T[] {
    if (Array.isArray(value)) return value as T[]
    if (Array.isArray((value as any)?.results)) return (value as any).results as T[]
    if (Array.isArray((value as any)?.items)) return (value as any).items as T[]
    return []
  }

  async searchConditions(
    query: string,
    options?: {
      includeSymptoms?: boolean
      includeTreatments?: boolean
      limit?: number
    },
  ): Promise<HealthDBResponse<MedicalCondition[]>> {
    if (!query?.trim()) {
      return this.success<MedicalCondition[]>([])
    }

    const params = new URLSearchParams({
      q: query.trim(),
      limit: String(options?.limit || 10),
      includeSymptoms: String(Boolean(options?.includeSymptoms)),
      includeTreatments: String(Boolean(options?.includeTreatments)),
    })

    const response = await this.makeRequest<unknown>(`/conditions/search?${params.toString()}`)
    if (!response.success) {
      return this.failure<MedicalCondition[]>([], response.error || 'Condition search failed')
    }

    return this.success<MedicalCondition[]>(this.normalizeArray<MedicalCondition>(response.data))
  }

  async getClinicalGuidelines(condition: string): Promise<HealthDBResponse<ClinicalGuideline[]>> {
    if (!condition?.trim()) {
      return this.success<ClinicalGuideline[]>([])
    }

    const params = new URLSearchParams({ condition: condition.trim() })
    const response = await this.makeRequest<unknown>(`/guidelines?${params.toString()}`)
    if (!response.success) {
      return this.failure<ClinicalGuideline[]>([], response.error || 'Guideline lookup failed')
    }

    return this.success<ClinicalGuideline[]>(this.normalizeArray<ClinicalGuideline>(response.data))
  }

  async checkDrugInteractions(medications: string[]): Promise<HealthDBResponse<DrugInteraction[]>> {
    const meds = (medications || []).map((m) => m.trim()).filter(Boolean)
    if (meds.length < 2) {
      return this.success<DrugInteraction[]>([])
    }

    const response = await this.makeRequest<unknown>('/drug-interactions/check', {
      method: 'POST',
      body: JSON.stringify({ medications: meds }),
    })

    if (!response.success) {
      return this.failure<DrugInteraction[]>([], response.error || 'Drug interaction check failed')
    }

    return this.success<DrugInteraction[]>(this.normalizeArray<DrugInteraction>(response.data))
  }

  async getProviderRecommendations(
    condition: string,
    location: string,
    specialty?: string,
  ): Promise<HealthDBResponse<any[]>> {
    if (!condition?.trim() && !specialty?.trim()) {
      return this.success<any[]>([])
    }

    const response = await this.makeRequest<unknown>('/providers/recommendations', {
      method: 'POST',
      body: JSON.stringify({ condition, location, specialty }),
    })

    if (!response.success) {
      return this.failure<any[]>([], response.error || 'Provider recommendation lookup failed')
    }

    return this.success<any[]>(this.normalizeArray<any>(response.data))
  }

  async analyzeClinicalTrialEligibility(patientProfile: any, trials: any[]): Promise<HealthDBResponse<any[]>> {
    const safeTrials = Array.isArray(trials) ? trials : []
    if (safeTrials.length === 0) {
      return this.success<any[]>([])
    }

    const response = await this.makeRequest<unknown>('/clinical-trials/eligibility', {
      method: 'POST',
      body: JSON.stringify({ patientProfile, trials: safeTrials }),
    })

    if (!response.success) {
      return this.failure<any[]>([], response.error || 'Clinical trial eligibility analysis failed')
    }

    return this.success<any[]>(this.normalizeArray<any>(response.data))
  }

  async analyzeSymptoms(
    symptoms: string[],
    patientInfo?: {
      age?: number
      gender?: string
      medicalHistory?: string[]
    },
  ): Promise<HealthDBResponse<any>> {
    const safeSymptoms = (symptoms || []).map((s) => s.trim()).filter(Boolean)
    if (safeSymptoms.length === 0) {
      return this.success<any>({})
    }

    const response = await this.makeRequest<any>('/symptoms/analyze', {
      method: 'POST',
      body: JSON.stringify({ symptoms: safeSymptoms, patientInfo }),
    })

    if (!response.success) {
      return this.failure<any>({}, response.error || 'Symptom analysis failed')
    }

    return response
  }
}

// Export singleton instance
export const healthDBService = new HealthDBService()

// Export types for use in other files
export type {
  MedicalCondition,
  ClinicalGuideline,
  DrugInteraction,
  HealthDBResponse,
}
