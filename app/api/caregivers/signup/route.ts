import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// In-memory storage for demo (replace with database in production)
export const applications: any[] = []

// Export function to get all applications (used by admin)
export function getAllApplications() {
  return applications
}

// Export function to get application by ID
export function getApplicationById(id: string) {
  return applications.find(app => app.id === id)
}

// Export function to update application status
export function updateApplicationStatus(id: string, status: string, reviewNotes?: string, reviewedBy?: string) {
  const index = applications.findIndex(app => app.id === id)
  if (index !== -1) {
    applications[index] = {
      ...applications[index],
      status,
      reviewNotes,
      reviewedBy,
      reviewedAt: new Date().toISOString()
    }
    return applications[index]
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form fields
    const applicationData: any = {
      // Personal Information
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      
      // Professional Information
      licenseNumber: formData.get('licenseNumber'),
      licenseType: formData.get('licenseType'),
      primarySpecialty: formData.get('primarySpecialty'),
      yearsExperience: formData.get('yearsExperience'),
      education: formData.get('education'),
      additionalCertifications: formData.get('additionalCertifications'),
      
      // Service Information
      serviceAreas: formData.get('serviceAreas'),
      languagesSpoken: formData.get('languagesSpoken')?.toString().split(',') || [],
      acceptInsurance: formData.get('acceptInsurance') === 'true',
      willingToTravel: formData.get('willingToTravel') === 'true',
      availableForUrgent: formData.get('availableForUrgent') === 'true',
      
      // Additional Information
      carePhilosophy: formData.get('carePhilosophy'),
      digitalWalletAddress: formData.get('digitalWalletAddress'),
      
      // Application metadata
      status: 'pending',
      submittedAt: new Date().toISOString(),
      id: `CG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    // Handle file uploads
    const uploadedFiles: any = {}
    const fileFields = ['governmentId', 'professionalLicense', 'additionalCertifications', 'backgroundCheck']
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'caregiver-applications')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    
    for (const field of fileFields) {
      const file = formData.get(field) as File | null
      
      if (file && file.size > 0) {
        try {
          // Create safe filename
          const timestamp = Date.now()
          const safeFileName = `${applicationData.id}-${field}-${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          const filePath = join(uploadsDir, safeFileName)
          
          // Convert file to buffer and save
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          await writeFile(filePath, buffer)
          
          uploadedFiles[field] = {
            filename: safeFileName,
            originalName: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          }
        } catch (fileError) {
          console.error(`Error uploading file ${field}:`, fileError)
          // Continue with other files even if one fails
        }
      }
    }
    
    // Add uploaded files info to application
    applicationData.documents = uploadedFiles
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'primarySpecialty']
    const missingFields = requiredFields.filter(field => !applicationData[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 })
    }
    
    // Validate required documents
    if (!uploadedFiles.governmentId) {
      return NextResponse.json({
        success: false,
        error: 'Government ID is required for verification'
      }, { status: 400 })
    }
    
    if (!uploadedFiles.professionalLicense && applicationData.licenseNumber) {
      return NextResponse.json({
        success: false,
        error: 'Professional license document is required if you have a license number'
      }, { status: 400 })
    }
    
    // Store application (in production, save to database)
    applications.push(applicationData)
    
    console.log('New caregiver application submitted:', {
      id: applicationData.id,
      name: `${applicationData.firstName} ${applicationData.lastName}`,
      email: applicationData.email,
      documentsUploaded: Object.keys(uploadedFiles)
    })
    
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: applicationData.id,
      status: 'pending',
      estimatedReviewTime: '2-3 business days'
    })
    
  } catch (error) {
    console.error('Caregiver signup error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to submit application. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to retrieve application status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('id')
    const email = searchParams.get('email')
    
    if (applicationId) {
      const application = applications.find(app => app.id === applicationId)
      
      if (!application) {
        return NextResponse.json({
          success: false,
          error: 'Application not found'
        }, { status: 404 })
      }
      
      // Return full application for admin/internal use
      return NextResponse.json({
        success: true,
        application: application
      })
    }
    
    if (email) {
      const userApplications = applications.filter(app => app.email === email)
      
      return NextResponse.json({
        success: true,
        applications: userApplications.map(app => ({
          ...app,
          documentsCount: Object.keys(app.documents || {}).length
        }))
      })
    }
    
    // Admin endpoint - return all applications (add authentication in production)
    return NextResponse.json({
      success: true,
      applications: applications,
      total: applications.length
    })
    
  } catch (error) {
    console.error('Error retrieving applications:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve applications'
    }, { status: 500 })
  }
}

