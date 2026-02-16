import type { Provider, Review } from "@/types/user"
import { prisma } from "@/lib/prisma"
import { getProviderById as getDirectoryProviderById, searchProviders as searchDirectoryProviders } from "@/lib/provider-search-service"

function mapProviderRecord(record: any): Provider {
  const specialty = record.specialties?.[0] || 'General Practice'

  return {
    id: record.id,
    name: record.fullName || record.organizationName || record.user?.name || 'Provider',
    email: record.email || record.user?.email || '',
    role: 'provider',
    specialty,
    credentials: record.professionType ? [record.professionType] : [],
    licenseNumber: record.licenseNumber || '',
    licenseState: record.licenseState || '',
    licenseExpiration: record.licenseExpiry ? new Date(record.licenseExpiry).toISOString().slice(0, 10) : '',
    education: [],
    yearsOfExperience: 0,
    bio: record.bio || '',
    address: {
      street: record.location || '',
      city: '',
      state: record.licenseState || '',
      zipCode: '',
      country: record.country || 'US',
    },
    availability: {
      days: [],
      hours: { start: '', end: '' },
    },
    consultationFee: 0,
    rating: record.rating !== null && record.rating !== undefined ? Number(record.rating) : 0,
    reviewCount: typeof record.reviewCount === 'number' ? record.reviewCount : 0,
    isVerified: Boolean(record.isVerified),
    verificationStatus:
      record.status === 'APPROVED' ? 'approved' : record.status === 'REJECTED' ? 'rejected' : 'pending',
    acceptedInsurance: [],
    acceptedCryptocurrencies: [],
    services: Array.isArray(record.specialties) ? record.specialties : [],
    npiNumber: record.npiNumber || undefined,
    phone: record.phone || '',
    createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString() : new Date().toISOString(),
  }
}

export async function searchProviders(options: {
  specialty?: string
  zipCode?: string
  state?: string
  service?: string
  verificationStatus?: "pending" | "approved" | "rejected"
}): Promise<Provider[]> {
  try {
    const statusFilter =
      options.verificationStatus === 'approved'
        ? 'APPROVED'
        : options.verificationStatus === 'rejected'
          ? 'REJECTED'
          : options.verificationStatus === 'pending'
            ? 'PENDING'
            : undefined

    const providers = await prisma.provider.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(options.specialty ? { specialties: { has: options.specialty } } : {}),
        ...(options.state ? { licenseState: { equals: options.state, mode: 'insensitive' } } : {}),
      },
      include: { user: true },
      take: 50,
      orderBy: [{ isVerified: 'desc' }, { updatedAt: 'desc' }],
    })

    if (providers.length > 0) {
      return providers.map(mapProviderRecord)
    }
  } catch {
    // Fall through to directory search below.
  }

  // Fallback to live provider directory lookups (Prisma + NPI), never mock data.
  return searchDirectoryProviders({
    specialty: options.specialty,
    zipCode: options.zipCode,
  })
}

export async function getProviderById(providerId: string): Promise<Provider | null> {
  return getDirectoryProviderById(providerId)
}

export async function getProviderReviews(_providerId: string): Promise<Review[]> {
  // Reviews are not persisted in the current schema.
  return []
}

export async function createReview(_reviewData: Omit<Review, "id" | "createdAt">): Promise<Review | null> {
  // Reviews are not persisted in the current schema.
  return null
}

export async function updateProviderVerificationStatus(
  providerId: string,
  status: "pending" | "approved" | "rejected",
): Promise<Provider | null> {
  const dbStatus = status === 'approved' ? 'APPROVED' : status === 'rejected' ? 'REJECTED' : 'PENDING'

  const updated = await prisma.provider.update({
    where: { id: providerId },
    data: {
      status: dbStatus,
      isVerified: status === 'approved',
    },
    include: { user: true },
  }).catch(async () => {
    const byNpi = await prisma.provider.findFirst({ where: { npiNumber: providerId } })
    if (!byNpi) return null
    return prisma.provider.update({
      where: { id: byNpi.id },
      data: {
        status: dbStatus,
        isVerified: status === 'approved',
      },
      include: { user: true },
    })
  })

  if (!updated) return null
  return mapProviderRecord(updated)
}

export async function getPendingProviderVerifications(): Promise<Provider[]> {
  const providers = await prisma.provider.findMany({
    where: { status: 'PENDING' },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return providers.map(mapProviderRecord)
}

export async function updateProviderProfile(
  providerId: string,
  profileData: Partial<Provider>,
): Promise<Provider | null> {
  const updateData: any = {
    fullName: profileData.name,
    phone: profileData.phone,
    bio: profileData.bio,
    location: profileData.address?.street,
    walletAddress: profileData.walletAddress,
    acceptingPatients:
      typeof profileData.acceptingPatients === 'boolean' ? profileData.acceptingPatients : undefined,
  }

  if (Array.isArray(profileData.services)) {
    updateData.specialties = { set: profileData.services }
  }

  const updated = await prisma.provider.update({
    where: { id: providerId },
    data: updateData,
    include: { user: true },
  }).catch(() => null)

  if (!updated) return null
  return mapProviderRecord(updated)
}
