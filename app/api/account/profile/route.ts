import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return { firstName: "", lastName: "" }
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") }
}

async function getAuthUserId(request: NextRequest): Promise<string | null> {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) return null

  const token = await getToken({ req: request as any, secret })
  return typeof token?.id === "string" ? token.id : null
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patient: { select: { id: true, phone: true, address: true } },
        provider: { select: { id: true, fullName: true, phone: true, location: true, type: true, email: true } },
        caregiver: { select: { id: true, firstName: true, lastName: true, phone: true, location: true, email: true } },
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const caregiverFullName = [user.caregiver?.firstName || "", user.caregiver?.lastName || ""]
      .join(" ")
      .trim()

    const fullName = (user.name || user.provider?.fullName || caregiverFullName || "").trim()
    const email = (user.email || user.provider?.email || user.caregiver?.email || "").trim()
    const phone = (user.patient?.phone || user.provider?.phone || user.caregiver?.phone || "").trim()
    const location = (user.patient?.address || user.provider?.location || user.caregiver?.location || "").trim()

    return NextResponse.json({
      success: true,
      profile: {
        fullName,
        email,
        phone,
        location,
        role: user.role,
        walletAddress: user.walletAddress || null,
      },
    })
  } catch (error) {
    logger.error("Failed to load account profile", error)
    return NextResponse.json({ success: false, error: "Failed to load profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const fullName = String(body?.fullName || "").trim()
    const requestedEmail = String(body?.email || "").trim().toLowerCase()
    const phone = String(body?.phone || "").trim()
    const location = String(body?.location || "").trim()

    if (!fullName) {
      return NextResponse.json({ success: false, error: "Full name is required" }, { status: 400 })
    }

    const current = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patient: { select: { id: true } },
        provider: { select: { id: true, type: true } },
        caregiver: { select: { id: true } },
      },
    })

    if (!current) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const { firstName, lastName } = splitName(fullName)
    const email = requestedEmail || (current.email || "").trim().toLowerCase()
    const emailForDb = email || null

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          name: fullName,
          email: emailForDb,
        },
      })

      if (current.role === "PATIENT") {
        await tx.patient.upsert({
          where: { userId },
          update: {
            phone: phone || null,
            address: location || null,
          },
          create: {
            userId,
            phone: phone || null,
            address: location || null,
            allergies: [],
            conditions: [],
            medications: [],
          },
        })
      }

      if (current.role === "PROVIDER" && current.provider?.id) {
        await tx.provider.update({
          where: { id: current.provider.id },
          data: {
            ...(email ? { email } : {}),
            phone: phone || null,
            location: location || null,
            ...(current.provider.type === "PHYSICIAN" ? { fullName } : {}),
          },
        })
      }

      if (current.role === "CAREGIVER" && current.caregiver?.id) {
        await tx.caregiver.update({
          where: { id: current.caregiver.id },
          data: {
            ...(email ? { email } : {}),
            firstName,
            lastName,
            phone: phone || null,
            location: location || null,
          },
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: "Profile saved",
      profile: { fullName, email: emailForDb, phone, location, role: current.role },
    })
  } catch (error: any) {
    logger.error("Failed to save account profile", error)
    if (error?.code === "P2002") {
      return NextResponse.json({ success: false, error: "Email is already in use" }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: "Failed to save profile" }, { status: 500 })
  }
}
