import { NextRequest, NextResponse } from 'next/server'

const EMR_PROVIDERS = {
  epic: {
    name: 'Epic MyChart',
    authMethod: 'OAuth 2.0 / SMART on FHIR',
    dataTypes: ['Patient Summary', 'Lab Results', 'Medications', 'Allergies', 'Immunizations'],
  },
  cerner: {
    name: 'Cerner PowerChart',
    authMethod: 'OAuth 2.0 / SMART on FHIR',
    dataTypes: ['Clinical Data', 'Lab Results', 'Radiology', 'Prescriptions'],
  },
  allscripts: {
    name: 'Allscripts',
    authMethod: 'OAuth 2.0 / FHIR',
    dataTypes: ['Medical History', 'Prescriptions', 'Care Plans'],
  },
  athenahealth: {
    name: 'athenahealth',
    authMethod: 'OAuth 2.0 / FHIR',
    dataTypes: ['Patient Data', 'Clinical Notes', 'Lab Results', 'Billing'],
  },
} as const

const EMR_UNAVAILABLE_MESSAGE =
  'EMR live connection is not enabled in this deployment. Configure your EMR integration service before enabling this endpoint.'

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: EMR_UNAVAILABLE_MESSAGE,
      code: 'EMR_NOT_CONFIGURED',
    },
    { status: 501 },
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const provider = (searchParams.get('provider') || '').trim().toLowerCase()
  const connectionId = (searchParams.get('connectionId') || '').trim()

  if (connectionId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Connection lookup is unavailable until EMR integration is configured.',
        code: 'EMR_NOT_CONFIGURED',
      },
      { status: 501 },
    )
  }

  if (provider) {
    const config = EMR_PROVIDERS[provider as keyof typeof EMR_PROVIDERS]
    if (!config) {
      return NextResponse.json({ success: false, error: 'Unsupported EMR provider' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      provider: {
        id: provider,
        name: config.name,
        authMethod: config.authMethod,
        dataTypes: config.dataTypes,
        supported: true,
      },
      liveConnectionEnabled: false,
    })
  }

  return NextResponse.json({
    success: true,
    providers: Object.entries(EMR_PROVIDERS).map(([id, config]) => ({
      id,
      name: config.name,
      authMethod: config.authMethod,
      dataTypes: config.dataTypes,
      supported: true,
    })),
    liveConnectionEnabled: false,
  })
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: EMR_UNAVAILABLE_MESSAGE,
      code: 'EMR_NOT_CONFIGURED',
    },
    { status: 501 },
  )
}
