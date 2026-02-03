/**
 * Create Appointment API
 * 
 * POST /api/appointments/create
 * 
 * Creates an appointment with a provider and initiates payment.
 * Payment is required before appointment is confirmed.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PAYMENT_CONFIG } from '@/lib/network-config'

// Appointment pricing in USD
const APPOINTMENT_PRICING = {
  virtual: 75,
  'in-person': 150,
  specialist: 250,
  urgent: 200,
  followup: 50,
}

interface CreateAppointmentRequest {
  providerId: string
  patientName: string
  patientEmail: string
  patientPhone?: string
  appointmentType: 'virtual' | 'in-person' | 'specialist' | 'urgent' | 'followup'
  appointmentDate: string // ISO date string
  appointmentTime: string // HH:mm format
  reason: string
  notes?: string
  walletAddress?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAppointmentRequest = await request.json()
    
    const {
      providerId,
      patientName,
      patientEmail,
      patientPhone,
      appointmentType,
      appointmentDate,
      appointmentTime,
      reason,
      notes,
      walletAddress,
    } = body

    // Validate required fields
    if (!providerId || !patientName || !patientEmail || !appointmentType || !appointmentDate || !appointmentTime) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 })
    }

    // Get provider details
    const provider = await prisma.caregiver.findUnique({
      where: { id: providerId },
    })

    if (!provider) {
      return NextResponse.json({
        success: false,
        error: 'Provider not found',
      }, { status: 404 })
    }

    // Calculate price
    const price = APPOINTMENT_PRICING[appointmentType] || APPOINTMENT_PRICING.virtual
    const platformFee = price * (PAYMENT_CONFIG.platformFeePercent / 100)
    const providerEarnings = price - platformFee

    // Create booking record
    const booking = await prisma.booking.create({
      data: {
        status: 'PENDING_PAYMENT',
        startDate: new Date(`${appointmentDate}T${appointmentTime}`),
        endDate: new Date(`${appointmentDate}T${appointmentTime}`), // Will be updated based on duration
        totalHours: 1,
        totalAmount: price,
        paymentStatus: 'PENDING',
        notes: JSON.stringify({
          appointmentType,
          reason,
          additionalNotes: notes,
          patientName,
          patientEmail,
          patientPhone,
          walletAddress,
        }),
        caregiverId: providerId,
      },
    })

    // Return payment details
    return NextResponse.json({
      success: true,
      appointment: {
        id: booking.id,
        providerId,
        providerName: provider.name,
        providerSpecialty: provider.specialties?.[0] || 'General',
        appointmentType,
        date: appointmentDate,
        time: appointmentTime,
        status: 'PENDING_PAYMENT',
      },
      payment: {
        amount: price,
        amountUsdc: price.toFixed(2),
        platformFee: platformFee.toFixed(2),
        providerEarnings: providerEarnings.toFixed(2),
        recipientAddress: provider.walletAddress || PAYMENT_CONFIG.recipientAddress,
        currency: 'USDC',
        network: 'Base',
      },
      message: 'Appointment created. Complete payment to confirm.',
    })

  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create appointment',
    }, { status: 500 })
  }
}

/**
 * GET - Get appointment pricing
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    pricing: APPOINTMENT_PRICING,
    platformFee: `${PAYMENT_CONFIG.platformFeePercent}%`,
    currency: 'USDC',
    network: 'Base Mainnet',
  })
}
