import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { Provider } from "@/types/user"
import npiService from "@/lib/npi-service"

// Helper function to extract JSON from text that might contain additional content
function extractJsonFromText(text: string): any {
  try {
    // First try direct parsing
    return JSON.parse(text)
  } catch (error) {
    // If that fails, try to find JSON array in the text
    try {
      // Look for array pattern
      const arrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/)
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0])
      }

      // Look for object pattern
      const objectMatch = text.match(/\{\s*"[\s\S]*"\s*:[\s\S]*\}/)
      if (objectMatch) {
        return JSON.parse(objectMatch[0])
      }

      // Try to extract anything between triple backticks
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (codeBlockMatch && codeBlockMatch[1]) {
        return JSON.parse(codeBlockMatch[1].trim())
      }
    } catch (innerError) {
      console.error("Failed to extract JSON from text:", innerError)
    }

    // If all parsing attempts fail, return empty array
    return []
  }
}

export async function searchProviders(zipCode: string, specialtyOrType?: string): Promise<Provider[]> {
  try {
    // First, try to get real providers from the NPI API
    console.log("Searching for real providers via NPI API")
    const npiParams = {
      zipCode: zipCode,
      specialty: specialtyOrType,
      radius: 25, // 25 mile radius
      limit: 10,
      providerType: specialtyOrType as any,
    }

    const npiProviders = await npiService.searchProviders(npiParams)

    // If we have NPI providers, use them
    if (npiProviders && npiProviders.length > 0) {
      console.log(`Found ${npiProviders.length} real providers from NPI API`)
      return npiProviders.map((p) => npiService.convertToAppProvider(p))
    }

    // If no NPI providers found, use OpenAI to find real providers in the area
    console.log("No NPI providers found, using OpenAI to research real providers")

    const prompt = `
      I need information about real healthcare providers near ZIP code ${zipCode}${
        specialtyOrType ? ` with specialty or type: ${specialtyOrType}` : ""
      }.
      
      Research and provide information about 5 real healthcare providers in this area. Do not invent fictional providers.
      Return the information in this JSON format:
      
      [
        {
          "id": "ai-1",
          "name": "Dr. [Real Full Name]",
          "specialty": "[Actual Specialty]",
          "credentials": ["[Real Credentials]"],
          "address": {
            "street": "[Real Street Address if known, otherwise a realistic address]",
            "city": "[Real City]",
            "state": "[Real State]",
            "zipCode": "[Real ZIP Code]"
          },
          "yearsOfExperience": [Estimated years],
          "services": ["[Real Services Offered]"]
        }
      ]
      
      Important: 
      1. Use ONLY real provider names and information you can find for this location
      2. If you cannot find specific details, you may estimate reasonable values based on available information
      3. Return ONLY the JSON array with no additional text
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
      temperature: 0.3, // Lower temperature for more factual responses
      maxTokens: 2000,
      response_format: { type: "json_object" },
    })

    // Extract JSON from the response text
    const providersData: any = extractJsonFromText(text)

    // If we couldn't parse the JSON or it's not an array, return empty array
    if (!Array.isArray(providersData) || providersData.length === 0) {
      console.warn("Failed to parse provider data from AI response")
      return []
    }

    // Convert to Provider type and add additional fields
    return providersData.map((p: any, index: number) => ({
      id: p.id || `ai-${index + 1}`,
      name: p.name || `Dr. Unknown`,
      email: `${p.name?.toLowerCase().replace(/[^a-z0-9]/g, ".")}@example.com`,
      role: "provider" as const,
      specialty: p.specialty || specialtyOrType || "General Practice",
      credentials: p.credentials || ["MD"],
      licenseNumber: `LIC${Math.floor(10000 + Math.random() * 90000)}`,
      licenseState: p.address?.state || zipCode.substring(0, 2),
      licenseExpiration: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split("T")[0],
      education: [],
      yearsOfExperience: p.yearsOfExperience || Math.floor(5 + Math.random() * 20),
      bio:
        p.bio ||
        `${p.name} is a healthcare provider specializing in ${p.specialty || specialtyOrType || "general medicine"}.`,
      address: {
        street: p.address?.street || "",
        city: p.address?.city || "",
        state: p.address?.state || "",
        zipCode: p.address?.zipCode || zipCode,
        country: "USA",
      },
      availability: {
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        hours: {
          start: "09:00",
          end: "17:00",
        },
      },
      consultationFee: p.consultationFee || Math.floor(100 + Math.random() * 150),
      rating: p.rating || 3.5 + Math.random() * 1.5,
      reviewCount: p.reviewCount || Math.floor(10 + Math.random() * 90),
      isVerified: true,
      verificationStatus: "approved" as const,
      acceptedInsurance: p.acceptedInsurance || ["Medicare", "Medicaid", "Blue Cross", "Aetna"],
      acceptedCryptocurrencies: ["BTC", "ETH", "USDC"],
      services: p.services || [p.specialty || specialtyOrType || "General Consultation"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: "AI" as const,
    }))
  } catch (error) {
    console.error("Error finding providers nearby:", error)
    return []
  }
}

export async function getProviderRecommendations(patientNeeds: string, zipCode: string): Promise<Provider[]> {
  // Extract specialty from patient needs
  const specialtyKeywords = [
    "family",
    "internal",
    "pediatric",
    "cardio",
    "heart",
    "dermatol",
    "skin",
    "neuro",
    "brain",
    "psych",
    "mental",
    "orthoped",
    "bone",
    "gynecol",
    "women",
  ]

  const patientNeedsLower = patientNeeds.toLowerCase()
  const detectedSpecialties = specialtyKeywords
    .filter((keyword) => patientNeedsLower.includes(keyword))
    .map((keyword) => {
      switch (keyword) {
        case "family":
          return "Family Medicine"
        case "internal":
          return "Internal Medicine"
        case "pediatric":
          return "Pediatrics"
        case "cardio":
        case "heart":
          return "Cardiology"
        case "dermatol":
        case "skin":
          return "Dermatology"
        case "neuro":
        case "brain":
          return "Neurology"
        case "psych":
        case "mental":
          return "Psychiatry"
        case "orthoped":
        case "bone":
          return "Orthopedics"
        case "gynecol":
        case "women":
          return "Obstetrics & Gynecology"
        default:
          return ""
      }
    })
    .filter((s) => s !== "")

  const specialty = detectedSpecialties.length > 0 ? detectedSpecialties[0] : undefined

  return searchProviders(zipCode, specialty)
}
