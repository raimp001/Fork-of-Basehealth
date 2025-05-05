import { type NextRequest, NextResponse } from "next/server"
import {
  searchNpiRegistry,
  getSpecialtyFromTaxonomies,
  formatProviderName,
  getPrimaryAddress,
  getPhoneNumber,
} from "@/lib/npi-service"
import { logger } from "@/lib/logger"

// Define provider type
interface Provider {
  id: string
  name: string
  specialties: string[]
  address: string
  distance?: number
  phone?: string
  rating?: number
  availableSlots?: number
  acceptingNewPatients?: boolean
  insuranceAccepted?: string[]
  education?: string
  languages?: string[]
  services?: string[]
}

// Generate mock providers based on search criteria
function generateMockProviders(zip: string, specialty?: string): Provider[] {
  const specialties = [
    "Family Medicine",
    "Internal Medicine",
    "Pediatrics",
    "Cardiology",
    "Dermatology",
    "Orthopedics",
    "Neurology",
    "Psychiatry",
    "Obstetrics & Gynecology",
    "Ophthalmology",
  ]

  const insuranceOptions = ["Medicare", "Medicaid", "Blue Cross", "Aetna", "UnitedHealthcare", "Cigna", "Humana"]

  const languages = ["English", "Spanish", "Mandarin", "French", "Arabic", "Russian"]

  const services = {
    "Family Medicine": ["Annual physicals", "Vaccinations", "Preventive care", "Minor procedures"],
    "Internal Medicine": ["Chronic disease management", "Preventive care", "Health assessments"],
    Pediatrics: ["Well-child visits", "Developmental screening", "Vaccinations", "Acute care"],
    Cardiology: ["EKG", "Stress tests", "Echocardiograms", "Cardiac consultations"],
    Dermatology: ["Skin exams", "Biopsies", "Acne treatment", "Skin cancer screening"],
    Orthopedics: ["Joint injections", "Fracture care", "Sports medicine", "Arthritis management"],
    Neurology: ["Neurological exams", "Headache treatment", "Seizure management"],
    Psychiatry: ["Medication management", "Therapy", "Mental health evaluations"],
    "Obstetrics & Gynecology": ["Prenatal care", "Well-woman exams", "Family planning"],
    Ophthalmology: ["Eye exams", "Glaucoma screening", "Cataract evaluation"],
  }

  // Use the last 5 digits of the ZIP code to seed the random number generator
  const zipSeed = Number.parseInt(zip.slice(-5)) || 10001

  // Simple random function seeded by ZIP
  const random = (max: number) => {
    const x = Math.sin(zipSeed + max) * 10000
    return Math.floor((x - Math.floor(x)) * max)
  }

  // Generate between 5-15 providers
  const count = specialty ? 5 + random(5) : 8 + random(7)
  const providers: Provider[] = []

  // Filter specialties if a specialty was provided
  const availableSpecialties = specialty
    ? specialties.filter((s) => s.toLowerCase().includes(specialty.toLowerCase()))
    : specialties

  // If no specialties match the filter, use all specialties
  const specialtiesToUse = availableSpecialties.length > 0 ? availableSpecialties : specialties

  for (let i = 0; i < count; i++) {
    // Select a specialty for this provider
    const providerSpecialty =
      specialtiesToUse.length === 1 ? specialtiesToUse[0] : specialtiesToUse[random(specialtiesToUse.length)]

    // Generate a unique ID based on ZIP and index
    const id = `p-${zip}-${i}-${Date.now().toString().slice(-4)}`

    // Generate a realistic name
    const firstNames = [
      "James",
      "Mary",
      "John",
      "Patricia",
      "Robert",
      "Jennifer",
      "Michael",
      "Linda",
      "William",
      "Elizabeth",
      "David",
      "Susan",
      "Sarah",
      "Mohammed",
      "Elena",
      "Carlos",
      "Aisha",
      "Wei",
      "Priya",
      "Hiroshi",
    ]
    const lastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
      "Miller",
      "Davis",
      "Rodriguez",
      "Martinez",
      "Hernandez",
      "Lopez",
      "Gonzalez",
      "Wilson",
      "Anderson",
      "Thomas",
      "Taylor",
      "Moore",
      "Jackson",
      "Martin",
    ]
    const name = `Dr. ${firstNames[random(firstNames.length)]} ${lastNames[random(lastNames.length)]}`

    // Generate a realistic address
    const streets = [
      "Main St",
      "Oak Ave",
      "Maple Rd",
      "Washington Blvd",
      "Park Ave",
      "Cedar Ln",
      "Pine St",
      "Elm St",
      "River Rd",
      "Lake Dr",
    ]
    const streetNumber = 100 + random(900)
    const address = `${streetNumber} ${streets[random(streets.length)]}, ${zip}`

    // Generate a realistic phone number
    const areaCode = 200 + random(799)
    const phonePrefix = 200 + random(799)
    const phoneSuffix = 1000 + random(9000)
    const phone = `(${areaCode}) ${phonePrefix}-${phoneSuffix}`

    // Generate random insurance accepted (2-5 options)
    const insuranceCount = 2 + random(4)
    const insuranceAccepted = []
    for (let j = 0; j < insuranceCount; j++) {
      const insurance = insuranceOptions[random(insuranceOptions.length)]
      if (!insuranceAccepted.includes(insurance)) {
        insuranceAccepted.push(insurance)
      }
    }

    // Generate random languages (1-3 options)
    const languageCount = 1 + random(2)
    const providerLanguages = ["English"] // Always include English
    for (let j = 0; j < languageCount; j++) {
      const language = languages[random(languages.length)]
      if (!providerLanguages.includes(language)) {
        providerLanguages.push(language)
      }
    }

    // Get services for this specialty
    const specialtyServices = services[providerSpecialty as keyof typeof services] || services["Family Medicine"]

    // Add the provider
    providers.push({
      id,
      name,
      specialties: [providerSpecialty],
      address,
      distance: 0.1 + random(50) / 10, // 0.1 to 5.0 miles
      phone,
      rating: 3 + random(20) / 10, // 3.0 to 5.0 rating
      availableSlots: random(10), // 0 to 9 slots
      acceptingNewPatients: random(10) > 2, // 80% chance of accepting new patients
      insuranceAccepted,
      education: `${["University of", "State University of", "Medical College of"][random(3)]} ${["California", "New York", "Texas", "Florida", "Illinois", "Pennsylvania"][random(6)]}`,
      languages: providerLanguages,
      services: specialtyServices,
    })
  }

  return providers
}

export async function GET(request: NextRequest) {
  try {
    // Get search parameters
    const searchParams = request.nextUrl.searchParams
    const zip = searchParams.get("zip") || ""
    const specialty = searchParams.get("specialty") || ""
    const emergency = searchParams.get("emergency") === "true"

    logger.info(`Provider search request: ZIP=${zip}, specialty=${specialty}, emergency=${emergency}`)

    // Try to get providers from NPI registry first
    let providers: Provider[] = []
    let usedMockData = false

    if (zip) {
      try {
        const npiProviders = await searchNpiRegistry({
          zip,
          specialty,
          limit: 20,
        })

        if (npiProviders.length > 0) {
          logger.info(`Found ${npiProviders.length} providers in NPI registry`)

          // Map NPI providers to our provider format
          providers = npiProviders.map((npiProvider) => {
            return {
              id: npiProvider.number,
              name: formatProviderName(npiProvider),
              specialties: getSpecialtyFromTaxonomies(npiProvider.taxonomies),
              address: getPrimaryAddress(npiProvider),
              phone: getPhoneNumber(npiProvider),
              distance: 0.1 + Math.random() * 4.9, // Mock distance
              rating: 3 + Math.random() * 2, // Mock rating between 3-5
              acceptingNewPatients: Math.random() > 0.2, // 80% chance of accepting new patients
              availableSlots: Math.floor(Math.random() * 10),
            }
          })
        } else {
          // Fall back to mock data if no NPI providers found
          logger.info("No providers found in NPI registry, using mock data")
          providers = generateMockProviders(zip, specialty)
          usedMockData = true
        }
      } catch (error) {
        logger.error("Error searching NPI registry:", error)
        providers = generateMockProviders(zip, specialty)
        usedMockData = true
      }
    } else {
      // No ZIP provided, use mock data
      providers = generateMockProviders("10001", specialty)
      usedMockData = true
    }

    // If emergency is true, filter for emergency providers or mark them as such
    if (emergency) {
      // In a real app, we would filter for emergency providers
      // For now, just add an emergency flag to the first few providers
      providers = providers.slice(0, 5).map((provider) => ({
        ...provider,
        specialties: [...provider.specialties, "Emergency Medicine"],
        services: [...(provider.services || []), "Emergency Care", "Urgent Care"],
      }))
    }

    return NextResponse.json({
      success: true,
      providers,
      usedMockData,
      message: usedMockData ? "Using demo provider data" : undefined,
    })
  } catch (error) {
    logger.error("Error in provider search:", error)

    // Return mock data as fallback
    const mockProviders = generateMockProviders("10001")

    return NextResponse.json({
      success: true,
      providers: mockProviders,
      usedMockData: true,
      message: "Error occurred. Using demo provider data.",
    })
  }
}
