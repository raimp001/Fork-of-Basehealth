/**
 * Prisma Client Singleton
 * Prevents multiple instances in development (hot reload)
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Helper functions for common queries

/**
 * Get available caregivers (real, verified, active only)
 */
export async function getAvailableCaregivers(filters?: {
  specialty?: string
  location?: string
  maxDistance?: number
  sortBy?: 'rating' | 'experience' | 'rate'
  limit?: number
  offset?: number
}) {
  const {
    specialty,
    location,
    sortBy = 'rating',
    limit = 20,
    offset = 0
  } = filters || {}

  return prisma.caregiver.findMany({
    where: {
      isMock: false,
      verified: true,
      status: {
        in: ['AVAILABLE']
      },
      ...(specialty && {
        specialties: {
          has: specialty
        }
      }),
      ...(location && {
        location: {
          contains: location,
          mode: 'insensitive'
        }
      })
    },
    orderBy: sortBy === 'rating' 
      ? { rating: 'desc' }
      : sortBy === 'rate'
      ? { hourlyRate: 'asc' }
      : { yearsExperience: 'desc' },
    take: limit,
    skip: offset
  })
}

/**
 * Create a booking
 */
export async function createBooking(data: {
  patientId: string
  caregiverId: string
  userId: string
  startDate: Date
  endDate?: Date
  duration?: string
  frequency?: string
  careType?: string
  urgency?: string
  amount: number
  currency?: string
  requirements?: any
  notes?: string
}) {
  return prisma.booking.create({
    data: {
      ...data,
      status: 'PENDING',
      paymentStatus: 'PENDING'
    },
    include: {
      caregiver: true,
      patient: true
    }
  })
}

/**
 * Update booking payment status
 */
export async function updateBookingPaymentStatus(
  bookingId: string,
  paymentStatus: 'PAID' | 'FAILED' | 'REFUNDED',
  paymentData?: {
    paymentProviderId?: string
    paymentMetadata?: any
  }
) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus,
      ...(paymentStatus === 'PAID' && {
        status: 'CONFIRMED',
        paidAt: new Date(),
        confirmedAt: new Date()
      }),
      ...paymentData
    }
  })
}

/**
 * Record webhook event
 */
export async function recordWebhookEvent(data: {
  provider: string
  eventType: string
  eventId?: string
  payload: any
  signature?: string
  bookingId?: string
}) {
  return prisma.webhookEvent.create({
    data
  })
}

/**
 * Mark webhook as processed
 */
export async function markWebhookProcessed(
  eventId: string,
  error?: string
) {
  return prisma.webhookEvent.update({
    where: { id: eventId },
    data: {
      processed: true,
      processedAt: new Date(),
      ...(error && { error })
    }
  })
}

