/**
 * Create Caregiver Booking API
 * 
 * POST /api/bookings/create
 * 
 * Creates a caregiver booking with payment.
 * Calculates price based on hours and caregiver's hourly rate.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PAYMENT_CONFIG } from '@/lib/network-config'

// Default pricing if caregiver hasn't set rates
const DEFAULT_RATES = {
  hourly: 35,
  daily: 280,  // 8 hours
  weekly: 1680, // 48 hours
}

interface CreateBookingRequest {
  caregiverId: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  startDate: string // ISO date string
  endDate: string // ISO date string
  totalHours: number
  bookingType: 'hourly' | 'daily' | 'weekly'
  serviceType: string // e.g., 'elder-care', 'post-surgery', 'companion'
  notes?: string
  walletAddress?: string
  location?: {
    address: string
    city: string
    state: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingRequest = await request.json()
    
    const {
      caregiverId,
      clientName,
      clientEmail,
      clientPhone,
      startDate,
      endDate,
      totalHours,
      bookingType,
      serviceType,
      notes,
      walletAddress,
      location,
    } = body

    // Validate required fields
    if (!caregiverId || !clientName || !clientEmail || !startDate || !totalHours) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 })
    }

    // Get caregiver details
    const caregiver = await prisma.caregiver.findUnique({
      where: { id: caregiverId },
    })

    if (!caregiver) {
      return NextResponse.json({
        success: false,
        error: 'Caregiver not found',
      }, { status: 404 })
    }

    // Calculate price based on caregiver's rate or defaults
    const hourlyRate = caregiver.hourlyRate || DEFAULT_RATES.hourly
    let totalAmount: number

    switch (bookingType) {
      case 'daily':
        totalAmount = (totalHours / 8) * (hourlyRate * 8 * 0.9) // 10% discount for daily
        break
      case 'weekly':
        totalAmount = (totalHours / 48) * (hourlyRate * 48 * 0.8) // 20% discount for weekly
        break
      default:
        totalAmount = totalHours * hourlyRate
    }

    const platformFee = totalAmount * (PAYMENT_CONFIG.platformFeePercent / 100)
    const caregiverEarnings = totalAmount - platformFee

    // Create booking record
    const booking = await prisma.booking.create({
      data: {
        status: 'PENDING_PAYMENT',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        totalHours,
        totalAmount,
        paymentStatus: 'PENDING',
        notes: JSON.stringify({
          bookingType,
          serviceType,
          clientName,
          clientEmail,
          clientPhone,
          walletAddress,
          location,
          additionalNotes: notes,
        }),
        caregiverId,
      },
    })

    // Return payment details
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        caregiverId,
        caregiverName: caregiver.name,
        serviceType,
        bookingType,
        startDate,
        endDate: endDate || startDate,
        totalHours,
        status: 'PENDING_PAYMENT',
      },
      payment: {
        amount: totalAmount,
        amountUsdc: totalAmount.toFixed(2),
        hourlyRate: hourlyRate.toFixed(2),
        platformFee: platformFee.toFixed(2),
        caregiverEarnings: caregiverEarnings.toFixed(2),
        recipientAddress: caregiver.walletAddress || PAYMENT_CONFIG.recipientAddress,
        currency: 'USDC',
        network: 'Base',
      },
      message: 'Booking created. Complete payment to confirm.',
    })

  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create booking',
    }, { status: 500 })
  }
}

/**
 * GET - Get caregiver booking pricing info
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const caregiverId = searchParams.get('caregiverId')

  if (caregiverId) {
    const caregiver = await prisma.caregiver.findUnique({
      where: { id: caregiverId },
      select: {
        id: true,
        name: true,
        hourlyRate: true,
        specialties: true,
      },
    })

    if (caregiver) {
      const hourlyRate = caregiver.hourlyRate || DEFAULT_RATES.hourly
      return NextResponse.json({
        success: true,
        caregiver: {
          id: caregiver.id,
          name: caregiver.name,
          specialties: caregiver.specialties,
        },
        pricing: {
          hourly: hourlyRate,
          daily: hourlyRate * 8 * 0.9, // 10% discount
          weekly: hourlyRate * 48 * 0.8, // 20% discount
        },
        platformFee: `${PAYMENT_CONFIG.platformFeePercent}%`,
      })
    }
  }

  return NextResponse.json({
    success: true,
    defaultPricing: DEFAULT_RATES,
    platformFee: `${PAYMENT_CONFIG.platformFeePercent}%`,
    currency: 'USDC',
    network: 'Base Mainnet',
  })
}
