import { NextRequest, NextResponse } from 'next/server'
import { requirePatientAuth, logAccess } from '@/lib/auth'

// Mock medical records database (in production, use encrypted database)
const medicalRecords = {
  'patient_001': [
    {
      id: 1,
      patientId: 'patient_001',
      type: "Lab Results",
      title: "Complete Blood Count (CBC)",
      date: "2024-01-15",
      provider: "Dr. Smith - Internal Medicine",
      status: "Normal",
      category: "lab",
      confidential: true
    },
    {
      id: 2,
      patientId: 'patient_001',
      type: "Imaging",
      title: "Chest X-Ray",
      date: "2024-01-10",
      provider: "City Medical Center",
      status: "Normal",
      category: "imaging",
      confidential: true
    },
    {
      id: 3,
      patientId: 'patient_001',
      type: "Lab Results",
      title: "Lipid Panel",
      date: "2024-01-08",
      provider: "Dr. Johnson - Cardiology",
      status: "Elevated",
      category: "lab",
      confidential: true
    },
    {
      id: 4,
      patientId: 'patient_001',
      type: "Visit Summary",
      title: "Annual Physical Exam",
      date: "2024-01-05",
      provider: "Dr. Smith - Internal Medicine",
      status: "Complete",
      category: "visit",
      confidential: true
    },
    {
      id: 5,
      patientId: 'patient_001',
      type: "Lab Results",
      title: "Hemoglobin A1C",
      date: "2023-12-20",
      provider: "Dr. Wilson - Endocrinology",
      status: "Normal",
      category: "lab",
      confidential: true
    },
    {
      id: 6,
      patientId: 'patient_001',
      type: "Prescription",
      title: "Lisinopril 10mg",
      date: "2023-12-15",
      provider: "Dr. Smith - Internal Medicine",
      status: "Active",
      category: "prescription",
      confidential: true
    }
  ],
  'patient_002': [
    {
      id: 7,
      patientId: 'patient_002',
      type: "Lab Results",
      title: "Thyroid Function Test",
      date: "2024-01-12",
      provider: "Dr. Wilson - Endocrinology",
      status: "Normal",
      category: "lab",
      confidential: true
    },
    {
      id: 8,
      patientId: 'patient_002',
      type: "Visit Summary",
      title: "Routine Checkup",
      date: "2024-01-08",
      provider: "Dr. Brown - Family Medicine",
      status: "Complete",
      category: "visit",
      confidential: true
    }
  ]
}

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
    
    // Get records for the authenticated patient only
    const patientRecords = medicalRecords[user.patientId as keyof typeof medicalRecords] || []
    
    // Additional security: Verify each record belongs to the patient
    const secureRecords = patientRecords.filter(record => record.patientId === user.patientId)
    
    return NextResponse.json({
      success: true,
      records: secureRecords,
      patient: {
        id: user.patientId,
        name: `${user.firstName} ${user.lastName}`
      }
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
    
    // Get all patient records
    const patientRecords = medicalRecords[user.patientId as keyof typeof medicalRecords] || []
    
    // Find the specific record and verify ownership
    const record = patientRecords.find(r => r.id === recordId && r.patientId === user.patientId)
    
    if (!record) {
      // Log unauthorized access attempt
      logAccess({
        userId: user.id,
        action: 'UNAUTHORIZED_RECORD_ACCESS',
        resource: `medical-record-${recordId}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })
      
      return NextResponse.json(
        { error: 'Record not found or access denied' },
        { status: 404 }
      )
    }
    
    // Log successful record access
    logAccess({
      userId: user.id,
      action: 'VIEW_SPECIFIC_RECORD',
      resource: `medical-record-${recordId}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })
    
    return NextResponse.json({
      success: true,
      record: record
    })
    
  } catch (error) {
    console.error('Specific record access error:', error)
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    )
  }
} 