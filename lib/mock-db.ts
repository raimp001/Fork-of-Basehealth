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

/**
 * In-memory database for development.
 * Production uses Prisma with PostgreSQL.
 * This starts empty - data comes from real user registrations.
 */
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
}

// Create a singleton instance - starts empty, no seed data
const db = new MockDatabase()

export default db
