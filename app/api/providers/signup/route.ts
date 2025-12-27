import { NextRequest, NextResponse } from 'next/server'
import { notifyProviderApplicationReceived, notifyAdminNewApplication } from '@/lib/email-service'
import { logger } from '@/lib/logger'

interface ProviderSignupData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  
  // Professional Information
  npiNumber: string
  specialty: string
  subSpecialty?: string
  credentials: string
  yearsOfExperience: string
  
  // License Information
  licenseNumber: string
  licenseState: string
  licenseExpiration: string
  deaNumber?: string
  
  // Practice Information
  practiceType: string
  practiceName: string
  practiceAddress: string
  practiceCity: string
  practiceState: string
  practiceZip: string
  
  // Services & Availability
  servicesOffered: string[]
  consultationFee: string
  acceptedInsurance: string[]
  availableDays: string[]
  timeSlots: { start: string, end: string }
  
  // Education & Training
  medicalSchool?: string
  residency?: string
  fellowship?: string
  boardCertifications: string[]
  
  // Additional Information
  bio?: string
  languages: string[]
  telemedicineExperience: boolean
  cryptoPayments: boolean
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract text fields
    const providerData: ProviderSignupData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      npiNumber: formData.get('npiNumber') as string,
      specialty: formData.get('specialty') as string,
      subSpecialty: formData.get('subSpecialty') as string || undefined,
      credentials: formData.get('credentials') as string,
      yearsOfExperience: formData.get('yearsOfExperience') as string,
      licenseNumber: formData.get('licenseNumber') as string,
      licenseState: formData.get('licenseState') as string,
      licenseExpiration: formData.get('licenseExpiration') as string,
      deaNumber: formData.get('deaNumber') as string || undefined,
      practiceType: formData.get('practiceType') as string,
      practiceName: formData.get('practiceName') as string,
      practiceAddress: formData.get('practiceAddress') as string,
      practiceCity: formData.get('practiceCity') as string,
      practiceState: formData.get('practiceState') as string,
      practiceZip: formData.get('practiceZip') as string,
      servicesOffered: JSON.parse(formData.get('servicesOffered') as string || '[]'),
      consultationFee: formData.get('consultationFee') as string,
      acceptedInsurance: JSON.parse(formData.get('acceptedInsurance') as string || '[]'),
      availableDays: JSON.parse(formData.get('availableDays') as string || '[]'),
      timeSlots: JSON.parse(formData.get('timeSlots') as string || '{"start":"09:00","end":"17:00"}'),
      medicalSchool: formData.get('medicalSchool') as string || undefined,
      residency: formData.get('residency') as string || undefined,
      fellowship: formData.get('fellowship') as string || undefined,
      boardCertifications: JSON.parse(formData.get('boardCertifications') as string || '[]'),
      bio: formData.get('bio') as string || undefined,
      languages: JSON.parse(formData.get('languages') as string || '[]'),
      telemedicineExperience: formData.get('telemedicineExperience') === 'true',
      cryptoPayments: formData.get('cryptoPayments') === 'true',
    }

    // Extract file uploads
    const profilePhoto = formData.get('profilePhoto') as File | null
    const medicalLicense = formData.get('medicalLicense') as File | null
    const malpracticeInsurance = formData.get('malpracticeInsurance') as File | null
    const cv = formData.get('cv') as File | null

    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'npiNumber', 
      'specialty', 'credentials', 'licenseNumber', 'licenseState', 
      'licenseExpiration', 'practiceType', 'practiceName', 
      'practiceAddress', 'practiceCity', 'practiceState', 'practiceZip',
      'consultationFee'
    ]

    for (const field of requiredFields) {
      if (!providerData[field as keyof ProviderSignupData]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(providerData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate NPI number (10 digits)
    if (!/^\d{10}$/.test(providerData.npiNumber)) {
      return NextResponse.json(
        { error: 'NPI number must be exactly 10 digits' },
        { status: 400 }
      )
    }

    // Validate license expiration date (must be in the future)
    const expirationDate = new Date(providerData.licenseExpiration)
    if (expirationDate <= new Date()) {
      return NextResponse.json(
        { error: 'License expiration date must be in the future' },
        { status: 400 }
      )
    }

    // Check if email already exists
    // In a real app, check against database
    // For demo, we'll just simulate this

    // Validate required documents
    if (!profilePhoto || !medicalLicense || !malpracticeInsurance) {
      return NextResponse.json(
        { error: 'Missing required documents: Profile photo, medical license, and malpractice insurance are required' },
        { status: 400 }
      )
    }

    // Validate file types
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const allowedDocTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']

    if (profilePhoto && !allowedImageTypes.includes(profilePhoto.type)) {
      return NextResponse.json(
        { error: 'Profile photo must be an image file (JPEG, PNG, WebP)' },
        { status: 400 }
      )
    }

    if (medicalLicense && !allowedDocTypes.includes(medicalLicense.type)) {
      return NextResponse.json(
        { error: 'Medical license must be a PDF or image file' },
        { status: 400 }
      )
    }

    if (malpracticeInsurance && !allowedDocTypes.includes(malpracticeInsurance.type)) {
      return NextResponse.json(
        { error: 'Malpractice insurance document must be a PDF or image file' },
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Save files to cloud storage (AWS S3, Google Cloud Storage, etc.)
    // 2. Save provider data to database
    // 3. Send confirmation email
    // 4. Notify admin of new application
    
    // For demo purposes, we'll just return success
    const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const submittedDate = new Date().toISOString()

    // Log the application
    logger.info('New Provider Application', {
      applicationId,
      name: `${providerData.firstName} ${providerData.lastName}`,
      email: providerData.email,
      specialty: providerData.specialty,
      submittedAt: submittedDate
    })

    // Send email notifications
    try {
      // Notify the provider that their application was received
      await notifyProviderApplicationReceived({
        applicationId,
        firstName: providerData.firstName,
        lastName: providerData.lastName,
        email: providerData.email,
        specialty: providerData.specialty,
        submittedDate
      })

      // Notify admin of new application
      await notifyAdminNewApplication({
        applicationId,
        providerName: `${providerData.firstName} ${providerData.lastName}`,
        specialty: providerData.specialty,
        submittedDate
      })

      logger.info('Email notifications sent successfully')
    } catch (emailError) {
      logger.error('Failed to send email notifications', emailError)
      // Don't fail the application submission if emails fail
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      applicationId,
      message: 'Application submitted successfully',
      data: {
        applicationId,
        status: 'pending',
        submittedAt: submittedDate,
        estimatedReviewTime: '2-3 business days'
      }
    })

  } catch (error) {
    logger.error('Provider signup error', error)
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // This endpoint could be used to get the signup form requirements
    // or check application status
    
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')
    
    if (applicationId) {
      // Return application status
      return NextResponse.json({
        applicationId,
        status: 'pending',
        submittedAt: '2024-01-15T10:30:00Z',
        estimatedReviewTime: '2-3 business days',
        currentStep: 'document_verification'
      })
    }

    // Return form requirements and options
    return NextResponse.json({
      requiredFields: [
        'firstName', 'lastName', 'email', 'phone', 'npiNumber',
        'specialty', 'credentials', 'licenseNumber', 'licenseState',
        'licenseExpiration', 'practiceType', 'practiceName',
        'practiceAddress', 'practiceCity', 'practiceState', 'practiceZip',
        'consultationFee'
      ],
      requiredDocuments: [
        'profilePhoto', 'medicalLicense', 'malpracticeInsurance'
      ],
      specialtyOptions: [
        "Family Medicine", "Internal Medicine", "Pediatrics", "Cardiology", "Dermatology",
        "Neurology", "Orthopedics", "Psychiatry", "Radiology", "Emergency Medicine",
        "Anesthesiology", "Surgery", "Oncology", "Ophthalmology", "Urology",
        "Gynecology", "Endocrinology", "Gastroenterology", "Pulmonology", "Rheumatology"
      ],
      practiceTypes: [
        "Solo Practice", "Group Practice", "Hospital Employed", "Clinic", "Telehealth Only"
      ],
      acceptedFileTypes: {
        images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        documents: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      },
      maxFileSizes: {
        profilePhoto: '5MB',
        documents: '10MB'
      }
    })

  } catch (error) {
    logger.error('Provider signup GET error', error)
    return NextResponse.json(
      { error: 'Failed to fetch signup requirements' },
      { status: 500 }
    )
  }
} 