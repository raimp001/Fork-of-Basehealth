/**
 * Application Store (In-Memory Fallback)
 * 
 * Provides in-memory storage for applications when database is unavailable.
 * For production, configure DATABASE_URL for PostgreSQL.
 */

export interface StoredApplication {
  id: string
  role: 'PROVIDER' | 'CAREGIVER'
  country: string
  email: string
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'PENDING_INFO' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  currentStep: number
  stepsCompleted: Record<string, boolean>
  
  // Optional fields
  regions?: string[]
  firstName?: string
  lastName?: string
  fullName?: string
  organizationName?: string
  phone?: string
  providerType?: string
  professionType?: string
  specialty?: string
  taxonomyCode?: string
  npiNumber?: string
  npiVerified?: boolean
  npiData?: any
  licenseNumber?: string
  licenseState?: string
  licenseExpiry?: Date | null
  licenseVerified?: boolean
  deaNumber?: string
  deaExpiry?: Date | null
  malpracticeCarrier?: string
  malpracticePolicyNumber?: string
  malpracticeExpiry?: Date | null
  servicesOffered?: string[]
  experienceYears?: number
  bio?: string
  availability?: any
  hasTransport?: boolean
  certifications?: string[]
  languages?: string[]
  dateOfBirth?: Date | null
  attestedAccuracy?: boolean
  attestedLicenseScope?: boolean
  consentToVerification?: boolean
  consentToBackgroundCheck?: boolean
  attestedAt?: Date | null
  submittedAt?: Date | null
  reviewedAt?: Date | null
  reviewedBy?: string
  reviewNotes?: string
  
  createdAt: Date
  updatedAt: Date
}

// In-memory store
const applications: StoredApplication[] = []

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `app_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Find application by ID
 */
export function findApplicationById(id: string): StoredApplication | undefined {
  return applications.find(a => a.id === id)
}

/**
 * Find application by email (non-rejected)
 */
export function findApplicationByEmail(email: string): StoredApplication | undefined {
  return applications.find(a => 
    a.email.toLowerCase() === email.toLowerCase() && 
    a.status !== 'REJECTED'
  )
}

/**
 * Create a new application
 */
export function createApplication(data: {
  role: 'PROVIDER' | 'CAREGIVER'
  country: string
  email: string
}): StoredApplication {
  const now = new Date()
  const application: StoredApplication = {
    id: generateId(),
    role: data.role,
    country: data.country,
    email: data.email,
    status: 'DRAFT',
    currentStep: 0,
    stepsCompleted: {},
    createdAt: now,
    updatedAt: now,
  }
  applications.push(application)
  return application
}

/**
 * Update an application
 */
export function updateApplication(
  id: string, 
  data: Partial<Omit<StoredApplication, 'id' | 'createdAt'>>
): StoredApplication | null {
  const index = applications.findIndex(a => a.id === id)
  if (index === -1) return null
  
  applications[index] = {
    ...applications[index],
    ...data,
    updatedAt: new Date(),
  }
  return applications[index]
}

/**
 * Get all applications (for admin)
 */
export function getAllApplications(): StoredApplication[] {
  return [...applications]
}

/**
 * Check if database is available
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return false
    }
    
    // Try to import and use Prisma
    const { prisma } = await import('@/lib/prisma')
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

