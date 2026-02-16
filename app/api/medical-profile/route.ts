import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { logAccess, requirePatientAuth } from "@/lib/auth"

function splitName(value?: string | null): { firstName: string; lastName: string } {
  const parts = (value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return { firstName: "", lastName: "" }
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") }
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
}

function clientMeta(request: NextRequest): { ipAddress: string; userAgent: string } {
  return {
    ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requirePatientAuth(request)
    const meta = clientMeta(request)

    logAccess({
      userId: user.id,
      action: "VIEW_MEDICAL_PROFILE",
      resource: "medical-profile",
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        patient: {
          select: {
            phone: true,
            address: true,
            dateOfBirth: true,
            bloodType: true,
            allergies: true,
            conditions: true,
            medications: true,
          },
        },
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { firstName, lastName } = splitName(dbUser.name)

    return NextResponse.json({
      success: true,
      profile: {
        firstName,
        lastName,
        fullName: [firstName, lastName].filter(Boolean).join(" ").trim(),
        email: dbUser.email || "",
        phone: dbUser.patient?.phone || "",
        location: dbUser.patient?.address || "",
        dateOfBirth: dbUser.patient?.dateOfBirth || null,
        bloodType: dbUser.patient?.bloodType || "",
        allergies: dbUser.patient?.allergies || [],
        conditions: dbUser.patient?.conditions || [],
        medications: dbUser.patient?.medications || [],
      },
    })
  } catch (error) {
    logger.error("Error fetching medical profile", error)
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Patient access required") {
      return NextResponse.json({ error: "Patient access required" }, { status: 403 })
    }
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requirePatientAuth(request)
    const meta = clientMeta(request)

    logAccess({
      userId: user.id,
      action: "UPDATE_MEDICAL_PROFILE",
      resource: "medical-profile",
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    const profileData = await request.json()

    const firstName = String(profileData?.firstName || "").trim()
    const lastName = String(profileData?.lastName || "").trim()
    const email = String(profileData?.email || "").trim().toLowerCase()
    const phone = String(profileData?.phone || "").trim()
    const location = String(profileData?.location || "").trim()
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim()
    const bloodType = String(profileData?.bloodType || "").trim()
    const allergies = parseStringArray(profileData?.allergies)
    const conditions = parseStringArray(profileData?.conditions)
    const medications = parseStringArray(profileData?.medications)

    let dateOfBirth: Date | null = null
    if (profileData?.dateOfBirth) {
      const parsedDate = new Date(profileData.dateOfBirth)
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: "Invalid date of birth" }, { status: 400 })
      }
      dateOfBirth = parsedDate
    }

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          name: fullName,
          email,
        },
      })

      await tx.patient.upsert({
        where: { userId: user.id },
        update: {
          phone: phone || null,
          address: location || null,
          dateOfBirth,
          bloodType: bloodType || null,
          allergies,
          conditions,
          medications,
        },
        create: {
          userId: user.id,
          phone: phone || null,
          address: location || null,
          dateOfBirth,
          bloodType: bloodType || null,
          allergies,
          conditions,
          medications,
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        firstName,
        lastName,
        fullName,
        email,
        phone,
        location,
        dateOfBirth,
        bloodType,
        allergies,
        conditions,
        medications,
      },
    })
  } catch (error: any) {
    logger.error("Error updating medical profile", error)
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Patient access required") {
      return NextResponse.json({ error: "Patient access required" }, { status: 403 })
    }
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Email is already in use by another account" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
