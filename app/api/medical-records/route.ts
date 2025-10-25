import { NextRequest, NextResponse } from 'next/server'
import { requirePatientAuth, logAccess } from '@/lib/auth'
// NO MOCK DATA - Use real database or return empty state

export async function GET(request: NextRequest) {
  try {
    // Require patient authentication
    const user = await requirePatientAuth()
    
    // Get client IP and user agent for logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Log access attempt
    logAccess({
      userId: user.id,
      action: 'VIEW_MEDICAL_RECORDS',
      resource: 'medical-records',
      ipAddress: clientIP,
      userAgent: userAgent
    })
    
    // TODO: Replace with real database query
    // const patientRecords = await prisma.medicalRecord.findMany({
    //   where: { patientId: user.patientId }
    // })
    
    // NO MOCK DATA - Return empty state
    return NextResponse.json({
      success: true,
      records: [],
      patient: {
        id: user.patientId,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Patient'
      },
      message: 'No medical records available. Connect your EMR or upload records to get started.',
      isEmpty: true
    })
    
  } catch (error) {
    console.error('Medical records access error:', error)
    
    // Log failed access attempt
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    logAccess({
      userId: 'unknown',
      action: 'FAILED_ACCESS_MEDICAL_RECORDS',
      resource: 'medical-records',
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent') || 'unknown'
    })
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to access your medical records.' },
        { status: 401 }
      )
    }
    
    if (error instanceof Error && error.message === 'Patient access required') {
      return NextResponse.json(
        { error: 'Patient access required. Only patients can access medical records.' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Access denied. Unable to retrieve medical records.' },
      { status: 403 }
    )
  }
}

// Secure endpoint to get a specific medical record
export async function POST(request: NextRequest) {
  try {
    const user = await requirePatientAuth()
    const { recordId } = await request.json()
    
    if (!recordId) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      )
    }
    
    // TODO: Replace with real database query
    // const record = await prisma.medicalRecord.findFirst({
    //   where: { 
    //     id: recordId,
    //     patientId: user.patientId 
    //   }
    // })
    
    // NO MOCK DATA - Return not found
    logAccess({
      userId: user.id,
      action: 'VIEW_SPECIFIC_RECORD_NOT_FOUND',
      resource: `medical-record-${recordId}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })
    
    return NextResponse.json({
      success: false,
      error: 'Record not found',
      message: 'No medical records available. Connect your EMR or upload records to get started.'
    }, { status: 404 })
    
  } catch (error) {
    console.error('Specific record access error:', error)
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    )
  }
} 