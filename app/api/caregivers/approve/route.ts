import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getApplicationById, updateApplicationStatus } from '@/lib/caregiver-applications'
import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { isAdminEmail } from '@/lib/admin-access'

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
    const tokenEmail = typeof token?.email === 'string' ? token.email : ''
    if (!isAdminEmail(tokenEmail)) {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      }, { status: 403 })
    }

    const { applicationId } = await request.json()
    
    if (!applicationId) {
      return NextResponse.json({
        success: false,
        error: 'Application ID is required'
      }, { status: 400 })
    }
    
    // Get the application from shared storage
    const application = getApplicationById(applicationId)
    
    if (!application) {
      return NextResponse.json({
        success: false,
        error: 'Application not found'
      }, { status: 404 })
    }
    
    // Update application status to approved
    updateApplicationStatus(applicationId, 'approved', 'Application approved by admin', 'Admin')
    
    const specialties = toStringArray((application as any).primarySpecialty).slice(0, 1)
    const serviceAreas = toStringArray((application as any).serviceAreas)
    const languagesSpoken = toStringArray((application as any).languagesSpoken)
    const certifications = toStringArray((application as any).additionalCertifications)

    const caregiver = await prisma.caregiver.upsert({
      where: { email: application.email },
      update: {
        firstName: application.firstName || '',
        lastName: application.lastName || '',
        phone: application.phone || null,
        licenseNumber: application.licenseNumber || null,
        licenseType: application.licenseType || null,
        specialties,
        yearsExperience: application.yearsExperience || null,
        education: application.education || null,
        certifications,
        location: serviceAreas[0] || null,
        serviceAreas,
        languagesSpoken: languagesSpoken.length > 0 ? languagesSpoken : ['English'],
        acceptInsurance: Boolean(application.acceptInsurance),
        willingToTravel: Boolean(application.willingToTravel),
        availableForUrgent: Boolean(application.availableForUrgent),
        status: 'AVAILABLE',
        verified: true,
        isMock: false,
        isLicensed: Boolean(application.licenseNumber),
        isCPRCertified: certifications.some((c) => c.toLowerCase().includes('cpr')),
        isBackgroundChecked: Boolean((application as any)?.documents?.backgroundCheck),
        bio: application.carePhilosophy || null,
        carePhilosophy: application.carePhilosophy || null,
        digitalWalletAddress: application.digitalWalletAddress || null,
        applicationStatus: 'approved',
        submittedAt: application.submittedAt ? new Date(application.submittedAt) : new Date(),
        reviewedAt: new Date(),
        reviewedBy: 'Admin',
      },
      create: {
        firstName: application.firstName || '',
        lastName: application.lastName || '',
        email: application.email,
        phone: application.phone || null,
        licenseNumber: application.licenseNumber || null,
        licenseType: application.licenseType || null,
        specialties,
        yearsExperience: application.yearsExperience || null,
        education: application.education || null,
        certifications,
        location: serviceAreas[0] || null,
        serviceAreas,
        languagesSpoken: languagesSpoken.length > 0 ? languagesSpoken : ['English'],
        acceptInsurance: Boolean(application.acceptInsurance),
        willingToTravel: Boolean(application.willingToTravel),
        availableForUrgent: Boolean(application.availableForUrgent),
        status: 'AVAILABLE',
        verified: true,
        isMock: false,
        isLicensed: Boolean(application.licenseNumber),
        isCPRCertified: certifications.some((c) => c.toLowerCase().includes('cpr')),
        isBackgroundChecked: Boolean((application as any)?.documents?.backgroundCheck),
        bio: application.carePhilosophy || null,
        carePhilosophy: application.carePhilosophy || null,
        digitalWalletAddress: application.digitalWalletAddress || null,
        applicationStatus: 'approved',
        submittedAt: application.submittedAt ? new Date(application.submittedAt) : new Date(),
        reviewedAt: new Date(),
        reviewedBy: 'Admin',
      },
    })
    
    logger.info('Approved caregiver', {
      caregiverId: caregiver.id,
      name: `${caregiver.firstName} ${caregiver.lastName}`.trim(),
    })
    
    return NextResponse.json({
      success: true,
      message: 'Caregiver application approved successfully',
      caregiver: {
        id: caregiver.id,
        name: `${caregiver.firstName} ${caregiver.lastName}`.trim(),
        specialty: caregiver.specialties?.[0] || 'General Care',
      }
    })
    
  } catch (error) {
    logger.error('Error approving caregiver', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to approve caregiver application',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
