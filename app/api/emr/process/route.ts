import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// Types for EMR processing
interface ProcessingRequest {
  files?: File[]
  emrProvider?: string
  patientId?: string
  dataTypes?: string[]
}

interface OCRResult {
  text: string
  confidence: number
  language: string
  pages: number
}

interface NLPExtraction {
  entities: {
    medications: Array<{
      name: string
      dosage?: string
      frequency?: string
      startDate?: string
      prescriber?: string
      confidence: number
    }>
    conditions: Array<{
      name: string
      code?: string
      severity?: string
      date?: string
      provider?: string
      confidence: number
    }>
    procedures: Array<{
      name: string
      date?: string
      provider?: string
      cptCode?: string
      confidence: number
    }>
    vitals: Array<{
      type: string
      value: string
      unit?: string
      date: string
      confidence: number
    }>
    labResults: Array<{
      test: string
      value: string
      unit?: string
      date: string
      referenceRange?: string
      status?: 'normal' | 'abnormal' | 'critical'
      confidence: number
    }>
  }
  summary: string
  riskFactors: string[]
  recommendations: string[]
}

// Mock OCR service
async function performOCR(file: File): Promise<OCRResult> {
  // Simulate OCR processing time
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock OCR result based on file type
  const mockText = `
    PATIENT: John Doe
    DOB: 03/15/1985
    MRN: MRN123456
    
    CHIEF COMPLAINT: Chest pain
    
    MEDICATIONS:
    - Lisinopril 10mg once daily (started 12/01/2023) - Dr. Smith
    - Metformin 500mg twice daily (started 10/15/2023) - Dr. Johnson
    
    LAB RESULTS (01/10/2024):
    - Total Cholesterol: 195 mg/dL (Normal, <200)
    - HbA1c: 6.8% (Elevated, target <7.0%)
    - Blood Pressure: 120/80 mmHg
    
    DIAGNOSES:
    - I10: Essential hypertension (12/01/2023) - Dr. Smith
    - E11.9: Type 2 diabetes mellitus (10/15/2023) - Dr. Johnson
    
    ASSESSMENT: Patient presents with well-controlled hypertension and diabetes.
    Continue current medications. Follow up in 3 months.
  `
  
  return {
    text: mockText,
    confidence: 0.95,
    language: 'en',
    pages: 1
  }
}

// Mock NLP processing service
async function performNLP(text: string): Promise<NLPExtraction> {
  // Simulate NLP processing time
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Mock NLP extraction
  return {
    entities: {
      medications: [
        {
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "once daily",
          startDate: "2023-12-01",
          prescriber: "Dr. Smith",
          confidence: 0.92
        },
        {
          name: "Metformin",
          dosage: "500mg",
          frequency: "twice daily",
          startDate: "2023-10-15",
          prescriber: "Dr. Johnson",
          confidence: 0.89
        }
      ],
      conditions: [
        {
          name: "Essential hypertension",
          code: "I10",
          date: "2023-12-01",
          provider: "Dr. Smith",
          confidence: 0.94
        },
        {
          name: "Type 2 diabetes mellitus",
          code: "E11.9",
          date: "2023-10-15",
          provider: "Dr. Johnson",
          confidence: 0.91
        }
      ],
      procedures: [],
      vitals: [
        {
          type: "Blood Pressure",
          value: "120/80",
          unit: "mmHg",
          date: "2024-01-10",
          confidence: 0.96
        }
      ],
      labResults: [
        {
          test: "Total Cholesterol",
          value: "195",
          unit: "mg/dL",
          date: "2024-01-10",
          referenceRange: "<200",
          status: "normal",
          confidence: 0.98
        },
        {
          test: "HbA1c",
          value: "6.8",
          unit: "%",
          date: "2024-01-10",
          referenceRange: "<7.0",
          status: "abnormal",
          confidence: 0.97
        }
      ]
    },
    summary: "Patient with well-controlled hypertension and type 2 diabetes on appropriate medications. Recent labs show good cholesterol levels but slightly elevated HbA1c.",
    riskFactors: ["Diabetes", "Hypertension", "Cardiovascular disease risk"],
    recommendations: [
      "Continue current medication regimen",
      "Monitor HbA1c levels",
      "Follow up in 3 months",
      "Consider dietary counseling for diabetes management"
    ]
  }
}

// Mock EMR data fetching
async function fetchEMRData(provider: string, patientId: string): Promise<any> {
  // Simulate EMR API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock EMR data based on provider
  const mockData = {
    epic: {
      patient: {
        name: "John Doe",
        dateOfBirth: "1985-03-15",
        gender: "Male",
        mrn: "EPIC123456"
      },
      medications: [
        {
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Daily",
          prescriber: "Dr. Smith",
          startDate: "2023-12-01"
        }
      ],
      labResults: [
        {
          test: "Lipid Panel",
          date: "2024-01-10",
          results: [
            { name: "Total Cholesterol", value: "195", unit: "mg/dL", status: "normal" },
            { name: "HDL", value: "45", unit: "mg/dL", status: "normal" },
            { name: "LDL", value: "120", unit: "mg/dL", status: "normal" }
          ]
        }
      ],
      conditions: [
        {
          name: "Essential Hypertension",
          code: "I10",
          date: "2023-12-01",
          provider: "Dr. Smith"
        }
      ]
    },
    cerner: {
      patient: {
        name: "Jane Smith",
        dateOfBirth: "1990-07-22",
        gender: "Female",
        mrn: "CERNER789012"
      },
      // Similar structure for other providers
    }
  }
  
  return mockData[provider as keyof typeof mockData] || mockData.epic
}

// Data validation and structuring
function validateAndStructureData(nlpResult: NLPExtraction, emrData?: any): any {
  // Combine and validate data from multiple sources
  const structuredData = {
    patientInfo: emrData?.patient || {
      name: "Patient Name",
      dateOfBirth: "1985-03-15",
      gender: "Unknown",
      mrn: "UNKNOWN"
    },
    medications: nlpResult.entities.medications.map(med => ({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      startDate: med.startDate,
      prescriber: med.prescriber,
      source: 'document',
      confidence: med.confidence
    })),
    conditions: nlpResult.entities.conditions.map(condition => ({
      name: condition.name,
      code: condition.code,
      date: condition.date,
      provider: condition.provider,
      source: 'document',
      confidence: condition.confidence
    })),
    labResults: nlpResult.entities.labResults.map(lab => ({
      test: lab.test,
      value: lab.value,
      unit: lab.unit,
      date: lab.date,
      referenceRange: lab.referenceRange,
      status: lab.status,
      source: 'document',
      confidence: lab.confidence
    })),
    vitals: nlpResult.entities.vitals.map(vital => ({
      type: vital.type,
      value: vital.value,
      unit: vital.unit,
      date: vital.date,
      source: 'document',
      confidence: vital.confidence
    })),
    summary: nlpResult.summary,
    riskFactors: nlpResult.riskFactors,
    recommendations: nlpResult.recommendations,
    processingMetadata: {
      processedAt: new Date().toISOString(),
      sources: ['document_ocr', emrData ? 'emr_integration' : null].filter(Boolean),
      confidenceScore: calculateOverallConfidence(nlpResult)
    }
  }
  
  // Merge with EMR data if available
  if (emrData) {
    // Add EMR medications
    if (emrData.medications) {
      emrData.medications.forEach((med: any) => {
        structuredData.medications.push({
          ...med,
          source: 'emr',
          confidence: 1.0
        })
      })
    }
    
    // Add EMR lab results
    if (emrData.labResults) {
      emrData.labResults.forEach((labPanel: any) => {
        labPanel.results.forEach((result: any) => {
          structuredData.labResults.push({
            test: result.name,
            value: result.value,
            unit: result.unit,
            date: labPanel.date,
            status: result.status,
            source: 'emr',
            confidence: 1.0
          })
        })
      })
    }
  }
  
  return structuredData
}

function calculateOverallConfidence(nlpResult: NLPExtraction): number {
  const allConfidences = [
    ...nlpResult.entities.medications.map(m => m.confidence),
    ...nlpResult.entities.conditions.map(c => c.confidence),
    ...nlpResult.entities.labResults.map(l => l.confidence),
    ...nlpResult.entities.vitals.map(v => v.confidence)
  ]
  
  return allConfidences.length > 0 
    ? allConfidences.reduce((sum, conf) => sum + conf, 0) / allConfidences.length 
    : 0
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const emrProvider = formData.get('emrProvider') as string
    const patientId = formData.get('patientId') as string
    
    // Step 1: OCR Processing
    const ocrResults = []
    for (const file of files) {
      if (file.size > 0) {
        const ocrResult = await performOCR(file)
        ocrResults.push(ocrResult)
      }
    }
    
    // Combine all OCR text
    const combinedText = ocrResults.map(result => result.text).join('\n\n')
    
    // Step 2: NLP Processing
    const nlpResult = await performNLP(combinedText)
    
    // Step 3: EMR Data Fetching (if provider specified)
    let emrData = null
    if (emrProvider && patientId) {
      emrData = await fetchEMRData(emrProvider, patientId)
    }
    
    // Step 4: Data Validation and Structuring
    const structuredData = validateAndStructureData(nlpResult, emrData)
    
    return NextResponse.json({
      success: true,
      data: structuredData,
      processing: {
        ocrResults: ocrResults.length,
        nlpConfidence: calculateOverallConfidence(nlpResult),
        emrIntegration: !!emrData,
        totalProcessingTime: '8.5s' // Mock timing
      }
    })
    
  } catch (error) {
    logger.error('EMR processing error', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process medical data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const provider = searchParams.get('provider')
  
  if (provider) {
    // Return EMR provider capabilities
    const capabilities = {
      epic: {
        name: 'Epic MyChart',
        dataTypes: ['Patient Summary', 'Lab Results', 'Medications', 'Allergies', 'Immunizations'],
        authMethod: 'OAuth 2.0',
        supported: true
      },
      cerner: {
        name: 'Cerner PowerChart',
        dataTypes: ['Clinical Data', 'Lab Results', 'Radiology', 'Prescriptions'],
        authMethod: 'OAuth 2.0',
        supported: true
      }
      // Add more providers as needed
    }
    
    return NextResponse.json({
      success: true,
      provider: capabilities[provider as keyof typeof capabilities] || null
    })
  }
  
  return NextResponse.json({
    success: true,
    message: 'EMR Processing API',
    endpoints: {
      process: 'POST /api/emr/process - Process files and EMR data',
      capabilities: 'GET /api/emr/process?provider=<name> - Get provider capabilities'
    }
  })
} 