import type {
  User,
  Patient,
  Provider,
  Admin,
  Appointment,
  Prescription,
  Referral,
  Review,
  LabOrder,
  ImagingOrder,
  ScreeningRecommendation,
  Pharmacy,
  LabFacility,
  ImagingFacility,
} from "@/types/user"
import { v4 as uuidv4 } from "uuid"

// Mock database
class MockDatabase {
  private users: Map<string, User> = new Map()
  private patients: Map<string, Patient> = new Map()
  private providers: Map<string, Provider> = new Map()
  private admins: Map<string, Admin> = new Map()
  private appointments: Map<string, Appointment> = new Map()
  private prescriptions: Map<string, Prescription> = new Map()
  private labOrders: Map<string, LabOrder> = new Map()
  private imagingOrders: Map<string, ImagingOrder> = new Map()
  private referrals: Map<string, Referral> = new Map()
  private reviews: Map<string, Review> = new Map()
  private screeningRecommendations: Map<string, ScreeningRecommendation> = new Map()
  private pharmacies: Map<string, Pharmacy> = new Map()
  private labFacilities: Map<string, LabFacility> = new Map()
  private imagingFacilities: Map<string, ImagingFacility> = new Map()

  // User methods
  async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const now = new Date().toISOString()
    const user: User = {
      id: uuidv4(),
      ...userData,
      createdAt: now,
      updatedAt: now,
    }
    this.users.set(user.id, user)
    return user
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user
      }
    }
    return null
  }

  // Patient methods
  async createPatient(patientData: Omit<Patient, "id" | "createdAt" | "updatedAt">): Promise<Patient> {
    const now = new Date().toISOString()
    const patient: Patient = {
      id: uuidv4(),
      ...patientData,
      role: "patient",
      createdAt: now,
      updatedAt: now,
    }
    this.patients.set(patient.id, patient)
    this.users.set(patient.id, patient)
    return patient
  }

  async getPatientById(id: string): Promise<Patient | null> {
    return this.patients.get(id) || null
  }

  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values())
  }

  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient | null> {
    const patient = this.patients.get(id)
    if (!patient) return null

    const updatedPatient = { ...patient, ...data, updatedAt: new Date().toISOString() }
    this.patients.set(id, updatedPatient)
    this.users.set(id, updatedPatient)
    return updatedPatient
  }

  async deletePatient(id: string): Promise<boolean> {
    const patient = this.patients.get(id)
    if (!patient) return false

    this.patients.delete(id)
    this.users.delete(id)
    return true
  }

  // Provider methods
  async createProvider(providerData: Omit<Provider, "id" | "createdAt" | "updatedAt">): Promise<Provider> {
    const now = new Date().toISOString()
    const provider: Provider = {
      id: uuidv4(),
      ...providerData,
      role: "provider",
      createdAt: now,
      updatedAt: now,
    }
    this.providers.set(provider.id, provider)
    this.users.set(provider.id, provider)
    return provider
  }

  async getProviderById(id: string): Promise<Provider | null> {
    return this.providers.get(id) || null
  }

  async getAllProviders(): Promise<Provider[]> {
    return Array.from(this.providers.values())
  }

  async searchProviders(options: {
    specialty?: string
    zipCode?: string
    state?: string
    service?: string
    verificationStatus?: "pending" | "approved" | "rejected"
  }): Promise<Provider[]> {
    let results = Array.from(this.providers.values())

    if (options.specialty) {
      results = results.filter((provider) =>
        provider.specialty.toLowerCase().includes(options.specialty!.toLowerCase()),
      )
    }

    if (options.zipCode) {
      results = results.filter((provider) => provider.address.zipCode.startsWith(options.zipCode!.substring(0, 1)))
    }

    if (options.state) {
      results = results.filter((provider) => provider.address.state.toLowerCase() === options.state!.toLowerCase())
    }

    if (options.service) {
      results = results.filter((provider) =>
        provider.services.some((service) => service.toLowerCase().includes(options.service!.toLowerCase())),
      )
    }

    if (options.verificationStatus) {
      results = results.filter((provider) => provider.verificationStatus === options.verificationStatus)
    }

    return results
  }

  // Generate providers for a specific ZIP code
  generateProvidersForZipCode(zipCode: string, count = 3): Provider[] {
    const providers: Provider[] = []
    const now = new Date().toISOString()

    // Get city and state information based on ZIP code
    // This is a simplified approach - in a real app, you would use a ZIP code database
    let city = "Seattle"
    let state = "WA"

    // Basic mapping of ZIP code prefixes to cities/states
    if (zipCode.startsWith("98")) {
      city = "Seattle"
      state = "WA"
    } else if (zipCode.startsWith("94")) {
      city = "San Francisco"
      state = "CA"
    } else if (zipCode.startsWith("90")) {
      city = "Los Angeles"
      state = "CA"
    } else if (zipCode.startsWith("10")) {
      city = "New York"
      state = "NY"
    } else if (zipCode.startsWith("60")) {
      city = "Chicago"
      state = "IL"
    } else if (zipCode.startsWith("77")) {
      city = "Houston"
      state = "TX"
    }

    // Common specialties
    const specialties = [
      "Family Medicine",
      "Internal Medicine",
      "Pediatrics",
      "Cardiology",
      "Dermatology",
      "Neurology",
      "Psychiatry",
      "Orthopedics",
      "Obstetrics & Gynecology",
    ]

    // Generate providers
    for (let i = 0; i < count; i++) {
      const specialty = specialties[Math.floor(Math.random() * specialties.length)]
      const firstName = ["Sarah", "Michael", "Emily", "David", "Jennifer", "Robert", "Lisa", "James"][
        Math.floor(Math.random() * 8)
      ]
      const lastName = ["Johnson", "Chen", "Rodriguez", "Smith", "Wilson", "Brown", "Davis", "Martinez"][
        Math.floor(Math.random() * 8)
      ]

      providers.push({
        id: `${zipCode}-${i}`,
        name: `Dr. ${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        role: "provider",
        specialty,
        credentials: ["MD", "Board Certified"],
        licenseNumber: `${state}${Math.floor(10000 + Math.random() * 90000)}`,
        licenseState: state,
        licenseExpiration: this.generateFutureDateString(2),
        education: ["Medical University"],
        yearsOfExperience: 5 + Math.floor(Math.random() * 20),
        bio: `Dr. ${lastName} is a board-certified ${specialty.toLowerCase()} specialist serving the ${city} area.`,
        address: {
          street: `${Math.floor(100 + Math.random() * 900)} Medical Center Dr`,
          city,
          state,
          zipCode,
          country: "USA",
        },
        availability: {
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          hours: {
            start: "09:00",
            end: "17:00",
          },
        },
        consultationFee: 75 + Math.floor(Math.random() * 100),
        rating: 4 + Math.random(),
        reviewCount: 10 + Math.floor(Math.random() * 90),
        isVerified: true,
        verificationStatus: "approved",
        acceptedInsurance: ["Blue Cross", "Aetna", "UnitedHealthcare"],
        acceptedCryptocurrencies: Math.random() > 0.3 ? ["BTC", "ETH", "USDC"] : [],
        services: [specialty, "General Consultation", "Telehealth"],
        createdAt: now,
        updatedAt: now,
      })
    }

    return providers
  }

  // Add this helper method to the MockDatabase class
  private generateFutureDateString(yearsAhead: number): string {
    const date = new Date()
    date.setFullYear(date.getFullYear() + yearsAhead)
    return date.toISOString().split("T")[0]
  }

  // Admin methods
  async createAdmin(adminData: Omit<Admin, "id" | "createdAt" | "updatedAt">): Promise<Admin> {
    const now = new Date().toISOString()
    const admin: Admin = {
      id: uuidv4(),
      ...adminData,
      role: "admin",
      createdAt: now,
      updatedAt: now,
    }
    this.admins.set(admin.id, admin)
    this.users.set(admin.id, admin)
    return admin
  }

  async getAdminById(id: string): Promise<Admin | null> {
    return this.admins.get(id) || null
  }

  // Appointment methods
  async createAppointment(appointmentData: Omit<Appointment, "id">): Promise<Appointment> {
    const appointment: Appointment = {
      id: uuidv4(),
      ...appointmentData,
    }
    this.appointments.set(appointment.id, appointment)
    return appointment
  }

  async getAppointmentById(id: string): Promise<Appointment | null> {
    return this.appointments.get(id) || null
  }

  async getAppointmentsByPatientId(patientId: string): Promise<Appointment[]> {
    const results: Appointment[] = []
    for (const appointment of this.appointments.values()) {
      if (appointment.patientId === patientId) {
        results.push(appointment)
      }
    }
    return results
  }

  async getAppointmentsByProviderId(providerId: string): Promise<Appointment[]> {
    const results: Appointment[] = []
    for (const appointment of this.appointments.values()) {
      if (appointment.providerId === providerId) {
        results.push(appointment)
      }
    }
    return results
  }

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment | null> {
    const appointment = this.appointments.get(id)
    if (!appointment) return null

    const updatedAppointment = { ...appointment, ...data }
    this.appointments.set(id, updatedAppointment)
    return updatedAppointment
  }

  async getAllUsers(): Promise<User[]> {
    return [
      ...Array.from(this.patients.values()),
      ...Array.from(this.providers.values()),
      ...Array.from(this.admins.values()),
    ]
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
  }

  // Prescription methods
  async createPrescription(prescriptionData: Omit<Prescription, "id">): Promise<Prescription> {
    const prescription: Prescription = {
      id: uuidv4(),
      ...prescriptionData,
    }
    this.prescriptions.set(prescription.id, prescription)
    return prescription
  }

  async getPrescriptionById(id: string): Promise<Prescription | null> {
    return this.prescriptions.get(id) || null
  }

  async getPrescriptionsByPatientId(patientId: string): Promise<Prescription[]> {
    const results: Prescription[] = []
    for (const prescription of this.prescriptions.values()) {
      if (prescription.patientId === patientId) {
        results.push(prescription)
      }
    }
    return results
  }

  // Lab Order methods
  async createLabOrder(labOrderData: Omit<LabOrder, "id">): Promise<LabOrder> {
    const labOrder: LabOrder = {
      id: uuidv4(),
      ...labOrderData,
    }
    this.labOrders.set(labOrder.id, labOrder)
    return labOrder
  }

  async getLabOrderById(id: string): Promise<LabOrder | null> {
    return this.labOrders.get(id) || null
  }

  async getLabOrdersByPatientId(patientId: string): Promise<LabOrder[]> {
    const results: LabOrder[] = []
    for (const labOrder of this.labOrders.values()) {
      if (labOrder.patientId === patientId) {
        results.push(labOrder)
      }
    }
    return results
  }

  // Imaging Order methods
  async createImagingOrder(imagingOrderData: Omit<ImagingOrder, "id">): Promise<ImagingOrder> {
    const imagingOrder: ImagingOrder = {
      id: uuidv4(),
      ...imagingOrderData,
    }
    this.imagingOrders.set(imagingOrder.id, imagingOrder)
    return imagingOrder
  }

  async getImagingOrderById(id: string): Promise<ImagingOrder | null> {
    return this.imagingOrders.get(id) || null
  }

  async getImagingOrdersByPatientId(patientId: string): Promise<ImagingOrder[]> {
    const results: ImagingOrder[] = []
    for (const imagingOrder of this.imagingOrders.values()) {
      if (imagingOrder.patientId === patientId) {
        results.push(imagingOrder)
      }
    }
    return results
  }

  // Referral methods
  async createReferral(referralData: Omit<Referral, "id" | "createdAt" | "updatedAt">): Promise<Referral> {
    const now = new Date().toISOString()
    const referral: Referral = {
      id: uuidv4(),
      ...referralData,
      createdAt: now,
      updatedAt: now,
    }
    this.referrals.set(referral.id, referral)
    return referral
  }

  async getReferralById(id: string): Promise<Referral | null> {
    return this.referrals.get(id) || null
  }

  async getReferralsByPatientId(patientId: string): Promise<Referral[]> {
    const results: Referral[] = []
    for (const referral of this.referrals.values()) {
      if (referral.patientId === patientId) {
        results.push(referral)
      }
    }
    return results
  }

  // Review methods
  async createReview(reviewData: Omit<Review, "id" | "createdAt">): Promise<Review> {
    const now = new Date().toISOString()
    const review: Review = {
      id: uuidv4(),
      ...reviewData,
      createdAt: now,
    }
    this.reviews.set(review.id, review)

    // Update provider rating
    const provider = await this.getProviderById(review.providerId)
    if (provider) {
      const providerReviews = await this.getReviewsByProviderId(provider.id)
      const totalRating = providerReviews.reduce((sum, r) => sum + r.rating, 0)
      const newRating = totalRating / providerReviews.length

      provider.rating = Number.parseFloat(newRating.toFixed(1))
      provider.reviewCount = providerReviews.length
      this.providers.set(provider.id, provider)
    }

    return review
  }

  async getReviewsByProviderId(providerId: string): Promise<Review[]> {
    const results: Review[] = []
    for (const review of this.reviews.values()) {
      if (review.providerId === providerId) {
        results.push(review)
      }
    }
    return results
  }

  // Screening Recommendation methods
  async createScreeningRecommendation(data: Omit<ScreeningRecommendation, "id">): Promise<ScreeningRecommendation> {
    const recommendation: ScreeningRecommendation = {
      id: uuidv4(),
      ...data,
    }
    this.screeningRecommendations.set(recommendation.id, recommendation)
    return recommendation
  }

  async getScreeningRecommendationById(id: string): Promise<ScreeningRecommendation | null> {
    return this.screeningRecommendations.get(id) || null
  }

  async getAllScreeningRecommendations(): Promise<ScreeningRecommendation[]> {
    return Array.from(this.screeningRecommendations.values())
  }

  async getScreeningRecommendationsByDemographics(age: number, gender: string): Promise<ScreeningRecommendation[]> {
    const results: ScreeningRecommendation[] = []
    for (const recommendation of this.screeningRecommendations.values()) {
      if (
        age >= recommendation.ageRange.min &&
        age <= recommendation.ageRange.max &&
        (recommendation.gender === gender || recommendation.gender === "all")
      ) {
        results.push(recommendation)
      }
    }
    return results
  }

  // Pharmacy methods
  async createPharmacy(data: Omit<Pharmacy, "id">): Promise<Pharmacy> {
    const pharmacy: Pharmacy = {
      id: uuidv4(),
      ...data,
    }
    this.pharmacies.set(pharmacy.id, pharmacy)
    return pharmacy
  }

  async getPharmacyById(id: string): Promise<Pharmacy | null> {
    return this.pharmacies.get(id) || null
  }

  async searchPharmaciesByZipCode(zipCode: string): Promise<Pharmacy[]> {
    const results: Pharmacy[] = []
    for (const pharmacy of this.pharmacies.values()) {
      if (pharmacy.address.zipCode === zipCode) {
        results.push(pharmacy)
      }
    }
    return results
  }

  // Lab Facility methods
  async createLabFacility(data: Omit<LabFacility, "id">): Promise<LabFacility> {
    const facility: LabFacility = {
      id: uuidv4(),
      ...data,
    }
    this.labFacilities.set(facility.id, facility)
    return facility
  }

  async getLabFacilityById(id: string): Promise<LabFacility | null> {
    return this.labFacilities.get(id) || null
  }

  async searchLabFacilitiesByZipCode(zipCode: string): Promise<LabFacility[]> {
    const results: LabFacility[] = []
    for (const facility of this.labFacilities.values()) {
      if (facility.address.zipCode === zipCode) {
        results.push(facility)
      }
    }
    return results
  }

  // Imaging Facility methods
  async createImagingFacility(data: Omit<ImagingFacility, "id">): Promise<ImagingFacility> {
    const facility: ImagingFacility = {
      id: uuidv4(),
      ...data,
    }
    this.imagingFacilities.set(facility.id, facility)
    return facility
  }

  async getImagingFacilityById(id: string): Promise<ImagingFacility | null> {
    return this.imagingFacilities.get(id) || null
  }

  async searchImagingFacilitiesByZipCode(zipCode: string): Promise<ImagingFacility[]> {
    const results: ImagingFacility[] = []
    for (const facility of this.imagingFacilities.values()) {
      if (facility.address.zipCode === zipCode) {
        results.push(facility)
      }
    }
    return results
  }

  // Provider verification methods
  async updateProviderVerificationStatus(
    providerId: string,
    status: "pending" | "approved" | "rejected",
  ): Promise<Provider | null> {
    const provider = await this.getProviderById(providerId)
    if (!provider) return null

    provider.verificationStatus = status
    if (status === "approved") {
      provider.isVerified = true
    } else {
      provider.isVerified = false
    }

    provider.updatedAt = new Date().toISOString()
    this.providers.set(providerId, provider)
    return provider
  }

  async getPendingProviderVerifications(): Promise<Provider[]> {
    const results: Provider[] = []
    for (const provider of this.providers.values()) {
      if (provider.verificationStatus === "pending") {
        results.push(provider)
      }
    }
    return results
  }

  // Seed data for testing
  async seedData() {
    // Create sample admin
    await this.createAdmin({
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      permissions: ["manage_providers", "manage_patients", "manage_appointments"],
    })

    // Create sample providers
    const providers = [
      {
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@example.com",
        role: "provider" as const,
        specialty: "Family Medicine",
        credentials: ["MD", "Board Certified"],
        licenseNumber: "MD12345",
        licenseState: "CA",
        licenseExpiration: "2025-12-31",
        education: ["Harvard Medical School"],
        yearsOfExperience: 12,
        bio: "Dr. Johnson is a board-certified family physician with over 12 years of experience.",
        address: {
          street: "123 Medical Center Dr",
          city: "San Francisco",
          state: "CA",
          zipCode: "94143",
          country: "USA",
        },
        availability: {
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          hours: {
            start: "09:00",
            end: "17:00",
          },
        },
        consultationFee: 75,
        rating: 4.8,
        reviewCount: 120,
        isVerified: true,
        verificationStatus: "approved",
        acceptedInsurance: ["Blue Cross", "Aetna", "UnitedHealthcare"],
        acceptedCryptocurrencies: ["BTC", "ETH", "USDC"],
        services: ["Annual Physical", "Preventive Care", "Chronic Disease Management", "Vaccinations"],
      },
      {
        name: "Dr. Michael Chen",
        email: "michael.chen@example.com",
        role: "provider" as const,
        specialty: "Cardiology",
        credentials: ["MD", "FACC"],
        licenseNumber: "MD67890",
        licenseState: "NY",
        licenseExpiration: "2024-10-15",
        education: ["Johns Hopkins University"],
        yearsOfExperience: 15,
        bio: "Dr. Chen is a cardiologist specializing in preventive cardiology and heart health.",
        address: {
          street: "456 Cardiology Ave",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
        },
        availability: {
          days: ["Monday", "Wednesday", "Friday"],
          hours: {
            start: "08:00",
            end: "16:00",
          },
        },
        consultationFee: 150,
        rating: 4.9,
        reviewCount: 85,
        isVerified: true,
        verificationStatus: "approved",
        acceptedInsurance: ["Blue Cross", "Cigna", "Medicare"],
        acceptedCryptocurrencies: ["BTC", "ETH", "USDC", "DAI"],
        services: ["Cardiac Consultation", "ECG", "Heart Disease Screening", "Cholesterol Management"],
      },
      {
        name: "Dr. Emily Rodriguez",
        email: "emily.rodriguez@example.com",
        role: "provider" as const,
        specialty: "Pediatrics",
        credentials: ["MD", "FAAP"],
        licenseNumber: "MD54321",
        licenseState: "TX",
        licenseExpiration: "2026-05-20",
        education: ["Stanford University School of Medicine"],
        yearsOfExperience: 8,
        bio: "Dr. Rodriguez is a pediatrician who is passionate about child health and development.",
        address: {
          street: "789 Children's Way",
          city: "Austin",
          state: "TX",
          zipCode: "78701",
          country: "USA",
        },
        availability: {
          days: ["Tuesday", "Thursday", "Saturday"],
          hours: {
            start: "09:00",
            end: "17:00",
          },
        },
        consultationFee: 90,
        rating: 4.7,
        reviewCount: 65,
        isVerified: true,
        verificationStatus: "approved",
        acceptedInsurance: ["Aetna", "UnitedHealthcare", "Humana"],
        acceptedCryptocurrencies: ["BTC", "ETH", "USDC"],
        services: ["Well-Child Visits", "Vaccinations", "Developmental Screening", "School Physicals"],
      },
      {
        name: "Dr. James Wilson",
        email: "james.wilson@example.com",
        role: "provider" as const,
        specialty: "Dermatology",
        credentials: ["MD", "FAAD"],
        licenseNumber: "MD98765",
        licenseState: "FL",
        licenseExpiration: "2025-08-10",
        education: ["University of Miami School of Medicine"],
        yearsOfExperience: 10,
        bio: "Dr. Wilson specializes in medical and cosmetic dermatology with a focus on skin cancer prevention.",
        address: {
          street: "321 Dermatology Blvd",
          city: "Miami",
          state: "FL",
          zipCode: "33101",
          country: "USA",
        },
        availability: {
          days: ["Monday", "Tuesday", "Thursday", "Friday"],
          hours: {
            start: "08:30",
            end: "16:30",
          },
        },
        consultationFee: 120,
        rating: 4.6,
        reviewCount: 92,
        isVerified: false,
        verificationStatus: "pending",
        acceptedInsurance: ["Blue Cross", "Cigna", "Aetna"],
        acceptedCryptocurrencies: ["BTC", "ETH"],
        services: ["Skin Cancer Screening", "Acne Treatment", "Eczema Management", "Cosmetic Procedures"],
      },
      // Add more providers with different zip codes
      {
        name: "Dr. Robert Thompson",
        email: "robert.thompson@example.com",
        role: "provider" as const,
        specialty: "Family Medicine",
        credentials: ["MD"],
        licenseNumber: "MD45678",
        licenseState: "CA",
        licenseExpiration: "2026-03-15",
        education: ["UCLA School of Medicine"],
        yearsOfExperience: 7,
        bio: "Dr. Thompson provides comprehensive primary care for patients of all ages.",
        address: {
          street: "555 Health Blvd",
          city: "Los Angeles",
          state: "CA",
          zipCode: "90001",
          country: "USA",
        },
        availability: {
          days: ["Monday", "Tuesday", "Wednesday", "Friday"],
          hours: {
            start: "08:00",
            end: "17:00",
          },
        },
        consultationFee: 85,
        rating: 4.5,
        reviewCount: 48,
        isVerified: true,
        verificationStatus: "approved",
        acceptedInsurance: ["Blue Cross", "Medicare", "Kaiser"],
        acceptedCryptocurrencies: ["BTC", "ETH", "USDC"],
        services: ["Preventive Care", "Chronic Disease Management", "Minor Procedures", "Telehealth"],
      },
      {
        name: "Dr. Lisa Martinez",
        email: "lisa.martinez@example.com",
        role: "provider" as const,
        specialty: "Internal Medicine",
        credentials: ["MD", "FACP"],
        licenseNumber: "MD34567",
        licenseState: "NY",
        licenseExpiration: "2025-11-30",
        education: ["Columbia University College of Physicians and Surgeons"],
        yearsOfExperience: 14,
        bio: "Dr. Martinez specializes in adult medicine with a focus on preventive care and chronic disease management.",
        address: {
          street: "789 Medical Plaza",
          city: "Brooklyn",
          state: "NY",
          zipCode: "11201",
          country: "USA",
        },
        availability: {
          days: ["Monday", "Wednesday", "Thursday", "Friday"],
          hours: {
            start: "09:00",
            end: "18:00",
          },
        },
        consultationFee: 110,
        rating: 4.7,
        reviewCount: 92,
        isVerified: true,
        verificationStatus: "approved",
        acceptedInsurance: ["Blue Cross", "Cigna", "UnitedHealthcare", "Medicare"],
        acceptedCryptocurrencies: ["BTC", "ETH", "USDC", "DAI"],
        services: ["Preventive Care", "Chronic Disease Management", "Health Screenings", "Telehealth"],
      },
      {
        name: "Dr. David Kim",
        email: "david.kim@example.com",
        role: "provider" as const,
        specialty: "Orthopedics",
        credentials: ["MD", "FAAOS"],
        licenseNumber: "MD87654",
        licenseState: "IL",
        licenseExpiration: "2024-09-15",
        education: ["Northwestern University Feinberg School of Medicine"],
        yearsOfExperience: 11,
        bio: "Dr. Kim specializes in sports medicine and joint replacement surgery.",
        address: {
          street: "456 Orthopedic Way",
          city: "Chicago",
          state: "IL",
          zipCode: "60601",
          country: "USA",
        },
        availability: {
          days: ["Monday", "Tuesday", "Thursday", "Friday"],
          hours: {
            start: "08:30",
            end: "16:30",
          },
        },
        consultationFee: 140,
        rating: 4.8,
        reviewCount: 76,
        isVerified: true,
        verificationStatus: "approved",
        acceptedInsurance: ["Blue Cross", "Aetna", "UnitedHealthcare"],
        acceptedCryptocurrencies: ["BTC", "ETH"],
        services: ["Joint Replacement", "Sports Medicine", "Fracture Care", "Arthroscopy"],
      },
      {
        name: "Dr. Jennifer Patel",
        email: "jennifer.patel@example.com",
        role: "provider" as const,
        specialty: "Obstetrics & Gynecology",
        credentials: ["MD", "FACOG"],
        licenseNumber: "MD23456",
        licenseState: "TX",
        licenseExpiration: "2026-07-31",
        education: ["Baylor College of Medicine"],
        yearsOfExperience: 9,
        bio: "Dr. Patel provides comprehensive women's health services with a focus on personalized care.",
        address: {
          street: "123 Women's Health Center",
          city: "Houston",
          state: "TX",
          zipCode: "77001",
          country: "USA",
        },
        availability: {
          days: ["Monday", "Wednesday", "Thursday", "Friday"],
          hours: {
            start: "09:00",
            end: "17:00",
          },
        },
        consultationFee: 95,
        rating: 4.9,
        reviewCount: 112,
        isVerified: true,
        verificationStatus: "approved",
        acceptedInsurance: ["Blue Cross", "Aetna", "Cigna", "UnitedHealthcare"],
        acceptedCryptocurrencies: ["BTC", "ETH", "USDC"],
        services: ["Prenatal Care", "Well-Woman Exams", "Family Planning", "Minimally Invasive Surgery"],
      },
    ]

    for (const providerData of providers) {
      await this.createProvider(providerData)
    }

    // Create sample patients
    const patients = [
      {
        name: "John Smith",
        email: "john.smith@example.com",
        role: "patient" as const,
        dateOfBirth: "1985-06-15",
        medicalHistory: ["Hypertension", "Type 2 Diabetes"],
        allergies: ["Penicillin"],
        medications: ["Lisinopril", "Metformin"],
        address: {
          street: "123 Main St",
          city: "San Francisco",
          state: "CA",
          zipCode: "94143",
          country: "USA",
        },
        preferredPharmacy: {
          name: "CVS Pharmacy",
          address: "456 Market St, San Francisco, CA 94143",
          phone: "415-555-1234",
        },
      },
      {
        name: "Maria Garcia",
        email: "maria.garcia@example.com",
        role: "patient" as const,
        dateOfBirth: "1990-03-22",
        medicalHistory: ["Asthma"],
        allergies: ["Pollen", "Dust mites"],
        medications: ["Albuterol"],
        address: {
          street: "456 Oak Ave",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
        },
        preferredPharmacy: {
          name: "Walgreens",
          address: "789 Broadway, New York, NY 10001",
          phone: "212-555-6789",
        },
      },
    ]

    for (const patientData of patients) {
      await this.createPatient(patientData)
    }

    // Create sample screening recommendations
    const screeningRecommendations = [
      {
        name: "Mammogram",
        description: "X-ray picture of the breast to check for breast cancer",
        ageRange: {
          min: 40,
          max: 75,
        },
        gender: "female" as const,
        frequency: "Every 1-2 years",
        riskFactors: ["Family history of breast cancer", "Previous abnormal mammogram"],
        specialtyNeeded: "Radiology",
        importance: "essential" as const,
      },
      {
        name: "Colonoscopy",
        description: "Examination of the large intestine to check for colorectal cancer",
        ageRange: {
          min: 45,
          max: 75,
        },
        gender: "all" as const,
        frequency: "Every 10 years",
        riskFactors: ["Family history of colorectal cancer", "Inflammatory bowel disease"],
        specialtyNeeded: "Gastroenterology",
        importance: "essential" as const,
      },
      {
        name: "Prostate Cancer Screening (PSA)",
        description: "Blood test to measure prostate-specific antigen levels",
        ageRange: {
          min: 50,
          max: 70,
        },
        gender: "male" as const,
        frequency: "Discuss with your doctor",
        riskFactors: ["Family history of prostate cancer", "African American heritage"],
        specialtyNeeded: "Urology",
        importance: "recommended" as const,
      },
      {
        name: "Pap Smear",
        description: "Test for cervical cancer in women",
        ageRange: {
          min: 21,
          max: 65,
        },
        gender: "female" as const,
        frequency: "Every 3 years",
        riskFactors: ["HPV infection", "Multiple sexual partners"],
        specialtyNeeded: "Gynecology",
        importance: "essential" as const,
      },
      {
        name: "Bone Density Test",
        description: "Test to measure bone strength and risk for fractures",
        ageRange: {
          min: 65,
          max: 120,
        },
        gender: "all" as const,
        frequency: "Every 2 years",
        riskFactors: ["Family history of osteoporosis", "Low body weight", "Smoking"],
        specialtyNeeded: "Endocrinology",
        importance: "recommended" as const,
      },
      {
        name: "Cholesterol Screening",
        description: "Blood test to measure cholesterol levels",
        ageRange: {
          min: 20,
          max: 120,
        },
        gender: "all" as const,
        frequency: "Every 4-6 years",
        riskFactors: ["Family history of heart disease", "High blood pressure", "Diabetes"],
        specialtyNeeded: "Family Medicine",
        importance: "routine" as const,
        gender: "all" as const,
        frequency: "Every 4-6 years",
        riskFactors: ["Family history of heart disease", "High blood pressure", "Diabetes"],
        specialtyNeeded: "Family Medicine",
        importance: "routine" as const,
      },
      {
        name: "Blood Pressure Screening",
        description: "Measurement of blood pressure",
        ageRange: {
          min: 18,
          max: 120,
        },
        gender: "all" as const,
        frequency: "At least once a year",
        riskFactors: ["Family history of high blood pressure", "Overweight", "Unhealthy diet"],
        specialtyNeeded: "Family Medicine",
        importance: "routine" as const,
      },
      {
        name: "Diabetes Screening",
        description: "Blood test to measure blood sugar levels",
        ageRange: {
          min: 45,
          max: 120,
        },
        gender: "all" as const,
        frequency: "Every 3 years",
        riskFactors: ["Family history of diabetes", "Overweight", "High blood pressure"],
        specialtyNeeded: "Endocrinology",
        importance: "recommended" as const,
      },
      {
        name: "Skin Cancer Screening",
        description: "Visual examination of the skin to check for skin cancer",
        ageRange: {
          min: 20,
          max: 120,
        },
        gender: "all" as const,
        frequency: "Yearly",
        riskFactors: ["Fair skin", "History of sunburns", "Family history of skin cancer"],
        specialtyNeeded: "Dermatology",
        importance: "recommended" as const,
      },
      {
        name: "Lung Cancer Screening",
        description: "Low-dose CT scan to check for lung cancer",
        ageRange: {
          min: 50,
          max: 80,
        },
        gender: "all" as const,
        frequency: "Yearly",
        riskFactors: ["Smoking history", "Family history of lung cancer"],
        specialtyNeeded: "Pulmonology",
        importance: "recommended" as const,
      },
    ]

    for (const recommendation of screeningRecommendations) {
      await this.createScreeningRecommendation(recommendation)
    }

    // Create sample pharmacies
    const pharmacies = [
      {
        name: "CVS Pharmacy",
        address: {
          street: "123 Market St",
          city: "San Francisco",
          state: "CA",
          zipCode: "94143",
          country: "USA",
        },
        phone: "415-555-1234",
        email: "sf.cvs@example.com",
        hours: {
          Monday: { open: "08:00", close: "22:00" },
          Tuesday: { open: "08:00", close: "22:00" },
          Wednesday: { open: "08:00", close: "22:00" },
          Thursday: { open: "08:00", close: "22:00" },
          Friday: { open: "08:00", close: "22:00" },
          Saturday: { open: "09:00", close: "20:00" },
          Sunday: { open: "10:00", close: "18:00" },
        },
      },
      {
        name: "Walgreens",
        address: {
          street: "456 Broadway",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
        },
        phone: "212-555-6789",
        email: "ny.walgreens@example.com",
        hours: {
          Monday: { open: "07:00", close: "23:00" },
          Tuesday: { open: "07:00", close: "23:00" },
          Wednesday: { open: "07:00", close: "23:00" },
          Thursday: { open: "07:00", close: "23:00" },
          Friday: { open: "07:00", close: "23:00" },
          Saturday: { open: "08:00", close: "22:00" },
          Sunday: { open: "09:00", close: "21:00" },
        },
      },
    ]

    for (const pharmacy of pharmacies) {
      await this.createPharmacy(pharmacy)
    }

    // Create sample lab facilities
    const labFacilities = [
      {
        name: "Quest Diagnostics",
        address: {
          street: "789 Lab Ave",
          city: "San Francisco",
          state: "CA",
          zipCode: "94143",
          country: "USA",
        },
        phone: "415-555-9876",
        email: "sf.quest@example.com",
        services: ["Blood Tests", "Urine Tests", "Genetic Testing", "COVID-19 Testing"],
        hours: {
          Monday: { open: "07:00", close: "19:00" },
          Tuesday: { open: "07:00", close: "19:00" },
          Wednesday: { open: "07:00", close: "19:00" },
          Thursday: { open: "07:00", close: "19:00" },
          Friday: { open: "07:00", close: "19:00" },
          Saturday: { open: "08:00", close: "16:00" },
          Sunday: { open: "Closed", close: "Closed" },
        },
      },
      {
        name: "LabCorp",
        address: {
          street: "321 Testing Blvd",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
        },
        phone: "212-555-4321",
        email: "ny.labcorp@example.com",
        services: ["Blood Tests", "Urine Tests", "Pathology", "Cytology"],
        hours: {
          Monday: { open: "06:30", close: "18:30" },
          Tuesday: { open: "06:30", close: "18:30" },
          Wednesday: { open: "06:30", close: "18:30" },
          Thursday: { open: "06:30", close: "18:30" },
          Friday: { open: "06:30", close: "18:30" },
          Saturday: { open: "07:30", close: "15:30" },
          Sunday: { open: "Closed", close: "Closed" },
        },
      },
    ]

    for (const facility of labFacilities) {
      await this.createLabFacility(facility)
    }

    // Create sample imaging facilities
    const imagingFacilities = [
      {
        name: "RadNet Imaging Center",
        address: {
          street: "555 Imaging Way",
          city: "San Francisco",
          state: "CA",
          zipCode: "94143",
          country: "USA",
        },
        phone: "415-555-7890",
        email: "sf.radnet@example.com",
        services: ["X-Ray", "MRI", "CT Scan", "Ultrasound", "Mammography"],
        hours: {
          Monday: { open: "08:00", close: "18:00" },
          Tuesday: { open: "08:00", close: "18:00" },
          Wednesday: { open: "08:00", close: "18:00" },
          Thursday: { open: "08:00", close: "18:00" },
          Friday: { open: "08:00", close: "18:00" },
          Saturday: { open: "09:00", close: "15:00" },
          Sunday: { open: "Closed", close: "Closed" },
        },
      },
      {
        name: "Advanced Imaging",
        address: {
          street: "777 Scan St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
        },
        phone: "212-555-3456",
        email: "ny.advancedimaging@example.com",
        services: ["X-Ray", "MRI", "CT Scan", "PET Scan", "Ultrasound"],
        hours: {
          Monday: { open: "07:30", close: "19:00" },
          Tuesday: { open: "07:30", close: "19:00" },
          Wednesday: { open: "07:30", close: "19:00" },
          Thursday: { open: "07:30", close: "19:00" },
          Friday: { open: "07:30", close: "19:00" },
          Saturday: { open: "08:30", close: "16:00" },
          Sunday: { open: "Closed", close: "Closed" },
        },
      },
    ]

    for (const facility of imagingFacilities) {
      await this.createImagingFacility(facility)
    }
  }
}

// Add a function to generate mock providers when the Google Maps API key is missing
async function generateMockProviders(zipCode: string, specialty?: string) {
  const db = new MockDatabase()
  const providers = db.generateProvidersForZipCode(zipCode, 5)

  if (specialty && specialty !== "all") {
    return providers.map((provider) => ({
      ...provider,
      specialty: specialty,
    }))
  }

  return providers
}

// Create a singleton instance
const db = new MockDatabase()

// Seed the database with initial data
db.seedData()

export default db
