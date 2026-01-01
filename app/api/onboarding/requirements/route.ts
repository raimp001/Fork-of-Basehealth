/**
 * Onboarding Requirements API
 * 
 * Returns requirements for a specific role/country/region.
 */

import { NextRequest, NextResponse } from "next/server"
import { 
  requirementsEngine, 
  US_STATES, 
  PROFESSION_TYPES, 
  CAREGIVER_SERVICES,
  CAREGIVER_CERTIFICATIONS,
  COUNTRIES 
} from "@/lib/onboarding/requirements-engine"
import { ApplicationRole } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role") as ApplicationRole | null
    const country = searchParams.get("country") || "US"
    const region = searchParams.get("region")

    if (!role) {
      return NextResponse.json(
        { error: "Role is required" },
        { status: 400 }
      )
    }

    const requirements = requirementsEngine.getRequirements(role, country, region || undefined)
    const verificationChecks = requirementsEngine.getVerificationChecks(role, country, region ? [region] : undefined)
    const requirementsByStep = requirementsEngine.getRequirementsByStep(role, country)

    // Convert Map to object for JSON serialization
    const stepMap: Record<number, typeof requirements> = {}
    requirementsByStep.forEach((reqs, step) => {
      stepMap[step] = reqs
    })

    return NextResponse.json({
      success: true,
      role,
      country,
      region,
      requirements,
      requirementsByStep: stepMap,
      verificationChecks,
      // Reference data
      referenceData: {
        states: country === "US" ? US_STATES : [],
        professionTypes: role === "PROVIDER" ? PROFESSION_TYPES : [],
        services: role === "CAREGIVER" ? CAREGIVER_SERVICES : [],
        certifications: role === "CAREGIVER" ? CAREGIVER_CERTIFICATIONS : [],
        countries: COUNTRIES,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get requirements" },
      { status: 500 }
    )
  }
}
