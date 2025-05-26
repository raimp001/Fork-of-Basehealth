// Authentication and authorization utilities for BaseHealth
import { cookies } from 'next/headers'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'patient' | 'provider' | 'admin'
  patientId?: string
  providerId?: string
}

export interface Session {
  user: User
  expiresAt: Date
  sessionId: string
}

// Mock session storage (in production, use a secure database)
const sessions = new Map<string, Session>()

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('session-token')?.value
    
    if (!sessionToken) {
      return null
    }
    
    const session = sessions.get(sessionToken)
    
    if (!session || session.expiresAt < new Date()) {
      // Session expired, clean up
      sessions.delete(sessionToken)
      return null
    }
    
    return session.user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export async function requirePatientAuth(): Promise<User> {
  const user = await requireAuth()
  
  if (user.role !== 'patient') {
    throw new Error('Patient access required')
  }
  
  return user
}

export function createMockSession(user: User): string {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  
  sessions.set(sessionId, {
    user,
    expiresAt,
    sessionId
  })
  
  return sessionId
}

// Mock patient data for demonstration
export const mockPatients = {
  'patient_001': {
    id: 'patient_001',
    email: 'john.doe@email.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'patient' as const,
    patientId: 'patient_001'
  },
  'patient_002': {
    id: 'patient_002',
    email: 'jane.smith@email.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'patient' as const,
    patientId: 'patient_002'
  }
}

export function getMockPatient(patientId: string): User | null {
  return mockPatients[patientId as keyof typeof mockPatients] || null
}

// Access logging for security audit
export interface AccessLog {
  timestamp: Date
  userId: string
  action: string
  resource: string
  ipAddress?: string
  userAgent?: string
}

const accessLogs: AccessLog[] = []

export function logAccess(log: Omit<AccessLog, 'timestamp'>) {
  accessLogs.push({
    ...log,
    timestamp: new Date()
  })
  
  // In production, store in secure database
  console.log('Access logged:', log)
}

export function getAccessLogs(userId: string): AccessLog[] {
  return accessLogs.filter(log => log.userId === userId)
} 