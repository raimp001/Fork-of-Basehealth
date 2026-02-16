import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "patient" | "provider" | "caregiver" | "admin"
  patientId?: string
  providerId?: string
  caregiverId?: string
  walletAddress?: string
}

export interface Session {
  user: User
  expiresAt: Date
  sessionId: string
}

function normalizeRole(role?: string | null): User["role"] {
  const value = (role || "").toUpperCase()
  if (value === "ADMIN") return "admin"
  if (value === "PROVIDER") return "provider"
  if (value === "CAREGIVER") return "caregiver"
  return "patient"
}

function splitName(name?: string | null): { firstName: string; lastName: string } {
  const parts = (name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return { firstName: "", lastName: "" }
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  }
}

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) return null

    const token = await getToken({ req: request as any, secret })
    const userId = typeof token?.id === "string" ? token.id : ""
    if (!userId) return null

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patient: { select: { id: true } },
        provider: { select: { id: true } },
        caregiver: { select: { id: true } },
      },
    })

    if (!dbUser) return null

    const { firstName, lastName } = splitName(dbUser.name)

    return {
      id: dbUser.id,
      email: dbUser.email || "",
      firstName,
      lastName,
      role: normalizeRole(dbUser.role),
      patientId: dbUser.patient?.id,
      providerId: dbUser.provider?.id,
      caregiverId: dbUser.caregiver?.id,
      walletAddress: dbUser.walletAddress || undefined,
    }
  } catch (error) {
    logger.error("Error getting current user", error)
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await getCurrentUser(request)

  if (!user) {
    throw new Error("Authentication required")
  }

  return user
}

export async function requirePatientAuth(request: NextRequest): Promise<User> {
  const user = await requireAuth(request)

  if (user.role !== "patient") {
    throw new Error("Patient access required")
  }

  return user
}

// Legacy helper retained for compatibility with old imports.
// Session issuance is handled by NextAuth.
export function createSession(_user: User): string {
  return ""
}

// Backward-compatible alias; remove after all callers migrate.
export const createMockSession = createSession

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

export function logAccess(log: Omit<AccessLog, "timestamp">) {
  const entry: AccessLog = {
    ...log,
    timestamp: new Date(),
  }

  accessLogs.push(entry)
  logger.info("Access logged", entry)
}

export function getAccessLogs(userId: string): AccessLog[] {
  return accessLogs.filter((log) => log.userId === userId)
}

