import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import npiService from "@/lib/npi-service"
import { logger } from "@/lib/logger"

function isNpiNumber(value: string): boolean {
  return /^\d{10}$/.test((value || "").trim())
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const providerId = (params.id || "").trim()

    if (!providerId) {
      return NextResponse.json({ error: "Provider ID is required" }, { status: 400 })
    }

    // 1) BaseHealth provider (database)
    const dbProvider = await prisma.provider.findFirst({
      where: {
        OR: [{ id: providerId }, { npiNumber: providerId }],
      },
      include: { user: true },
    })

    if (dbProvider) {
      const name = dbProvider.fullName || dbProvider.user?.name || "Provider"
      const specialty = dbProvider.specialties?.[0] || "General Practice"

      return NextResponse.json({
        provider: {
          id: dbProvider.id,
          name,
          specialty,
          credentials: dbProvider.professionType ? [dbProvider.professionType] : [],
          rating: dbProvider.rating !== null && dbProvider.rating !== undefined ? Number(dbProvider.rating) : null,
          reviewCount: typeof dbProvider.reviewCount === "number" ? dbProvider.reviewCount : null,
          address: dbProvider.location || "",
          phone: dbProvider.phone || "",
          email: dbProvider.email || dbProvider.user?.email || "",
          website: "",
          bio: dbProvider.bio || "",
          education: [],
          specialties: dbProvider.specialties || [],
          languages: [],
          insurance: [],
          availability: "",
          acceptingPatients: typeof dbProvider.acceptingPatients === "boolean" ? dbProvider.acceptingPatients : null,
          yearsOfExperience: null,
          npi: dbProvider.npiNumber || providerId,
          isVerified: dbProvider.isVerified || false,
          source: "basehealth",
        },
        reviews: [],
      })
    }

    // 2) NPI registry lookup (10-digit NPI)
    if (isNpiNumber(providerId)) {
      const npiProvider = await npiService.getProviderByNPI(providerId)
      if (!npiProvider) {
        return NextResponse.json({ error: "Provider not found" }, { status: 404 })
      }

      const converted = npiService.convertToAppProvider(npiProvider)

      return NextResponse.json({
        provider: {
          id: converted.id,
          name: converted.name,
          specialty: converted.specialty,
          credentials: converted.credentials || [],
          rating: null,
          reviewCount: null,
          address: converted.address
            ? {
                street: converted.address.street,
                city: converted.address.city,
                state: converted.address.state,
                zipCode: converted.address.zipCode,
              }
            : "",
          phone: converted.phone || "",
          email: "",
          website: "",
          bio: "",
          education: [],
          specialties: converted.services || [],
          languages: converted.languages || [],
          insurance: [],
          availability: "",
          acceptingPatients: null,
          yearsOfExperience: null,
          npi: providerId,
          isVerified: false,
          source: "npi_registry",
        },
        reviews: [],
      })
    }

    return NextResponse.json({ error: "Provider not found" }, { status: 404 })
  } catch (error) {
    logger.error("Error fetching provider", error)
    return NextResponse.json({ error: "An error occurred while fetching provider details" }, { status: 500 })
  }
}

export async function PATCH() {
  return NextResponse.json({ error: "Provider updates are not available." }, { status: 405 })
}

