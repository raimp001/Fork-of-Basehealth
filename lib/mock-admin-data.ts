import type { Application, CaregiverApplication, ProviderApplication, ApplicationStats } from "@/types/admin"

// Mock Caregiver Applications
export const mockCaregiverApplications: CaregiverApplication[] = [
  {
    id: "cg-001",
    type: "caregiver",
    submittedAt: "2024-01-15T10:30:00Z",
    status: "pending",
    priority: "high",
    personalInfo: {
      firstName: "Maria",
      lastName: "Rodriguez",
      email: "maria.rodriguez@email.com",
      phone: "(555) 123-4567",
      dateOfBirth: "1985-03-15",
      address: {
        street: "123 Oak Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94102"
      },
      emergencyContact: {
        name: "Carlos Rodriguez",
        relationship: "Spouse",
        phone: "(555) 123-4568"
      }
    },
    professionalInfo: {
      experience: "8 years",
      specialties: ["Elder Care", "Dementia Care", "Post-Surgery Care"],
      certifications: ["CNA", "CPR", "First Aid", "Dementia Care Specialist"],
      education: "Associate Degree in Nursing - City College of San Francisco",
      previousEmployment: [
        {
          employer: "Golden Gate Senior Care",
          position: "Senior Caregiver",
          duration: "2019-2024",
          reason: "Seeking independent opportunities"
        },
        {
          employer: "Bay Area Home Health",
          position: "Certified Nursing Assistant",
          duration: "2016-2019",
          reason: "Career advancement"
        }
      ],
      availableSchedule: {
        fullTime: true,
        partTime: true,
        weekends: true,
        nights: false,
        holidays: true
      },
      hourlyRate: 28,
      serviceAreas: ["San Francisco", "Daly City", "South San Francisco"]
    },
    documentation: {
      resume: "/uploads/maria-rodriguez-resume.pdf",
      licenses: ["/uploads/maria-cna-license.pdf"],
      certifications: ["/uploads/maria-cpr-cert.pdf", "/uploads/maria-dementia-cert.pdf"],
      backgroundCheck: "/uploads/maria-background-check.pdf",
      references: [
        {
          name: "Dr. Susan Chen",
          relationship: "Former Supervisor",
          phone: "(555) 987-6543",
          email: "s.chen@goldengatecare.com"
        },
        {
          name: "Margaret Thompson",
          relationship: "Client Family Member",
          phone: "(555) 456-7890",
          email: "mthompson@gmail.com"
        }
      ]
    },
    preferences: {
      clientTypes: ["Seniors", "Post-surgical patients", "Dementia patients"],
      specialNeeds: ["Mobility assistance", "Medication management", "Meal preparation"],
      languagesSpoken: ["English", "Spanish"],
      ownTransportation: true,
      willingToTravel: true,
      maxTravelDistance: 25
    }
  },
  {
    id: "cg-002",
    type: "caregiver",
    submittedAt: "2024-01-14T14:15:00Z",
    status: "under_review",
    priority: "medium",
    reviewedBy: "admin-001",
    personalInfo: {
      firstName: "James",
      lastName: "Wilson",
      email: "james.wilson@email.com",
      phone: "(555) 234-5678",
      dateOfBirth: "1990-07-22",
      address: {
        street: "456 Pine Avenue",
        city: "Oakland",
        state: "CA",
        zipCode: "94606"
      },
      emergencyContact: {
        name: "Sarah Wilson",
        relationship: "Sister",
        phone: "(555) 234-5679"
      }
    },
    professionalInfo: {
      experience: "5 years",
      specialties: ["Post-Surgery Care", "Physical Therapy Support", "Chronic Disease Management"],
      certifications: ["CNA", "CPR", "Physical Therapy Assistant"],
      education: "Bachelor's in Health Sciences - UC Berkeley",
      previousEmployment: [
        {
          employer: "Oakland Medical Center",
          position: "Patient Care Technician",
          duration: "2020-2024",
          reason: "Seeking more personalized care opportunities"
        }
      ],
      availableSchedule: {
        fullTime: true,
        partTime: false,
        weekends: true,
        nights: true,
        holidays: false
      },
      hourlyRate: 32,
      serviceAreas: ["Oakland", "Berkeley", "Alameda"]
    },
    documentation: {
      resume: "/uploads/james-wilson-resume.pdf",
      licenses: ["/uploads/james-cna-license.pdf"],
      certifications: ["/uploads/james-cpr-cert.pdf"],
      references: [
        {
          name: "Dr. Michael Johnson",
          relationship: "Former Supervisor",
          phone: "(555) 876-5432",
          email: "mjohnson@oaklandmedical.org"
        }
      ]
    },
    preferences: {
      clientTypes: ["Post-surgical patients", "Chronic disease patients"],
      specialNeeds: ["Physical therapy support", "Medication management"],
      languagesSpoken: ["English"],
      ownTransportation: true,
      willingToTravel: true,
      maxTravelDistance: 30
    }
  }
]

// Mock Provider Applications
export const mockProviderApplications: ProviderApplication[] = [
  {
    id: "pr-001",
    type: "provider",
    submittedAt: "2024-01-16T09:00:00Z",
    status: "pending",
    priority: "high",
    personalInfo: {
      firstName: "Dr. Sarah",
      lastName: "Kim",
      email: "dr.sarah.kim@medicalpractice.com",
      phone: "(555) 345-6789",
      npiNumber: "1234567890"
    },
    practiceInfo: {
      practiceName: "Bay Area Cardiology Associates",
      specialty: "Cardiology",
      subSpecialties: ["Interventional Cardiology", "Heart Failure"],
      boardCertifications: ["American Board of Internal Medicine - Cardiology"],
      medicalSchool: "UCSF School of Medicine",
      residency: "Internal Medicine - UCSF Medical Center",
      fellowship: "Cardiology - Stanford Medical Center",
      yearsOfExperience: 12
    },
    licenseInfo: {
      medicalLicense: "CA-12345",
      licenseState: "CA",
      licenseExpiration: "2025-12-31",
      deaNumber: "BK1234567",
      otherLicenses: []
    },
    practiceDetails: {
      address: {
        street: "789 Medical Plaza Drive",
        city: "San Francisco",
        state: "CA",
        zipCode: "94115"
      },
      phoneNumber: "(555) 456-7890",
      website: "www.bayareacardiology.com",
      acceptingNewPatients: true,
      insuranceAccepted: ["Blue Cross", "Aetna", "Kaiser Permanente", "Medicare"],
      telemedicineOffered: true,
      languagesSpoken: ["English", "Korean"]
    },
    documentation: {
      medicalLicense: "/uploads/dr-kim-license.pdf",
      boardCertifications: ["/uploads/dr-kim-cardiology-cert.pdf"],
      cv: "/uploads/dr-kim-cv.pdf",
      malpracticeInsurance: "/uploads/dr-kim-malpractice.pdf",
      references: [
        {
          name: "Dr. Robert Chen",
          institution: "UCSF Cardiology Department",
          phone: "(555) 567-8901",
          email: "rchen@ucsf.edu"
        },
        {
          name: "Dr. Lisa Martinez",
          institution: "Stanford Cardiology",
          phone: "(555) 678-9012",
          email: "lmartinez@stanford.edu"
        }
      ]
    },
    verificationStatus: {
      npiVerified: true,
      licenseVerified: false,
      boardCertificationVerified: false,
      malpracticeVerified: false,
      backgroundCheckCompleted: false
    }
  },
  {
    id: "pr-002", 
    type: "provider",
    submittedAt: "2024-01-12T16:30:00Z",
    status: "approved",
    priority: "medium",
    reviewedAt: "2024-01-14T11:00:00Z",
    reviewedBy: "admin-002",
    notes: "Excellent credentials and references. Approved for platform participation.",
    personalInfo: {
      firstName: "Dr. Michael",
      lastName: "Thompson",
      email: "dr.thompson@familymed.com",
      phone: "(555) 789-0123",
      npiNumber: "0987654321"
    },
    practiceInfo: {
      practiceName: "Thompson Family Medicine",
      specialty: "Family Medicine",
      subSpecialties: ["Preventive Care", "Geriatrics"],
      boardCertifications: ["American Board of Family Medicine"],
      medicalSchool: "UC Davis School of Medicine",
      residency: "Family Medicine - UC Davis Medical Center",
      yearsOfExperience: 15
    },
    licenseInfo: {
      medicalLicense: "CA-54321",
      licenseState: "CA",
      licenseExpiration: "2026-06-30",
      deaNumber: "AT9876543",
      otherLicenses: []
    },
    practiceDetails: {
      address: {
        street: "321 Health Boulevard",
        city: "Sacramento",
        state: "CA",
        zipCode: "95814"
      },
      phoneNumber: "(555) 890-1234",
      website: "www.thompsonfamilymed.com",
      acceptingNewPatients: true,
      insuranceAccepted: ["Blue Cross", "Aetna", "Health Net", "Medicare", "Medicaid"],
      telemedicineOffered: true,
      languagesSpoken: ["English", "Spanish"]
    },
    documentation: {
      medicalLicense: "/uploads/dr-thompson-license.pdf",
      boardCertifications: ["/uploads/dr-thompson-family-cert.pdf"],
      cv: "/uploads/dr-thompson-cv.pdf",
      malpracticeInsurance: "/uploads/dr-thompson-malpractice.pdf",
      references: [
        {
          name: "Dr. Patricia Anderson",
          institution: "UC Davis Family Medicine",
          phone: "(555) 901-2345",
          email: "panderson@ucdavis.edu"
        }
      ]
    },
    verificationStatus: {
      npiVerified: true,
      licenseVerified: true,
      boardCertificationVerified: true,
      malpracticeVerified: true,
      backgroundCheckCompleted: true
    }
  }
]

export const mockApplications: Application[] = [
  ...mockCaregiverApplications,
  ...mockProviderApplications
]

export const mockApplicationStats: ApplicationStats = {
  total: 45,
  pending: 12,
  underReview: 8,
  approved: 20,
  rejected: 3,
  requiresInfo: 2,
  averageReviewTime: 72, // hours
  approvalRate: 78 // percentage
}

// Mock admin users
export const mockAdminUsers = [
  { id: "admin-001", name: "Alice Johnson", role: "admin", department: "operations" },
  { id: "admin-002", name: "Bob Smith", role: "reviewer", department: "clinical" },
  { id: "admin-003", name: "Carol Davis", role: "super_admin", department: "compliance" }
]
