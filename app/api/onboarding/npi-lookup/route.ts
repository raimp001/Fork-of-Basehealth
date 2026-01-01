/**
 * NPI Lookup API
 * 
 * Provides NPI search and autofill for provider onboarding.
 */

import { NextRequest, NextResponse } from "next/server"
import { lookupNPI, searchNPIByName } from "@/lib/onboarding/verification-service"
import { logger } from "@/lib/logger"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const npi = searchParams.get("npi")
    const firstName = searchParams.get("firstName")
    const lastName = searchParams.get("lastName")
    const state = searchParams.get("state")

    // Look up by NPI number
    if (npi) {
      // Validate NPI format
      if (!/^\d{10}$/.test(npi)) {
        return NextResponse.json(
          { error: "NPI must be exactly 10 digits" },
          { status: 400 }
        )
      }

      const result = await lookupNPI(npi)

      if (!result.found) {
        return NextResponse.json({
          success: false,
          found: false,
          message: "NPI not found in NPPES registry",
        })
      }

      // Return autofill data
      return NextResponse.json({
        success: true,
        found: true,
        data: {
          npiNumber: result.npiNumber,
          firstName: result.firstName,
          lastName: result.lastName,
          fullName: result.fullName,
          credential: result.credential,
          specialty: result.taxonomies?.find(t => t.primary)?.desc,
          taxonomyCode: result.taxonomies?.find(t => t.primary)?.code,
          licenseState: result.taxonomies?.find(t => t.primary)?.state,
          licenseNumber: result.taxonomies?.find(t => t.primary)?.license,
          practiceAddress: result.addresses?.find(a => a.type === "LOCATION"),
          mailingAddress: result.addresses?.find(a => a.type === "MAILING"),
        },
        rawData: result.rawData,
      })
    }

    // Search by name
    if (firstName && lastName) {
      const results = await searchNPIByName(firstName, lastName, state || undefined)

      return NextResponse.json({
        success: true,
        count: results.length,
        results: results.map(r => ({
          npiNumber: r.npiNumber,
          fullName: r.fullName,
          credential: r.credential,
          specialty: r.taxonomies?.find(t => t.primary)?.desc,
        })),
      })
    }

    return NextResponse.json(
      { error: "Provide either 'npi' or 'firstName' and 'lastName'" },
      { status: 400 }
    )
  } catch (error) {
    logger.error("NPI lookup failed", error)
    return NextResponse.json(
      { error: "NPI lookup failed" },
      { status: 500 }
    )
  }
}
