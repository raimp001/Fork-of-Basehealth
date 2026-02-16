import { NextRequest, NextResponse } from 'next/server'

const PROVIDER_CAPABILITIES = {
  epic: {
    name: 'Epic MyChart',
    dataTypes: ['Patient Summary', 'Lab Results', 'Medications', 'Allergies', 'Immunizations'],
    authMethod: 'OAuth 2.0 / SMART on FHIR',
    supported: true,
  },
  cerner: {
    name: 'Cerner PowerChart',
    dataTypes: ['Clinical Data', 'Lab Results', 'Radiology', 'Prescriptions'],
    authMethod: 'OAuth 2.0 / SMART on FHIR',
    supported: true,
  },
} as const

const PROCESSING_UNAVAILABLE_MESSAGE =
  'EMR processing is not enabled in this deployment. Configure OCR/NLP + EMR integration before enabling this endpoint.'

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: PROCESSING_UNAVAILABLE_MESSAGE,
      code: 'EMR_PROCESSING_NOT_CONFIGURED',
    },
    { status: 501 },
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const provider = (searchParams.get('provider') || '').trim().toLowerCase()

  if (provider) {
    return NextResponse.json({
      success: true,
      provider: PROVIDER_CAPABILITIES[provider as keyof typeof PROVIDER_CAPABILITIES] || null,
      processingEnabled: false,
    })
  }

  return NextResponse.json({
    success: true,
    message: 'EMR Processing API',
    processingEnabled: false,
    endpoints: {
      process: 'POST /api/emr/process (currently disabled until live EMR pipeline is configured)',
      capabilities: 'GET /api/emr/process?provider=<name>',
    },
  })
}
