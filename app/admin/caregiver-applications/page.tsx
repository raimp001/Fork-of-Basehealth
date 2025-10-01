"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  FileText,
  Calendar
} from "lucide-react"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"

interface CaregiverApplication {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  licenseNumber: string
  primarySpecialty: string
  yearsExperience: string
  serviceAreas: string
  languagesSpoken: string[]
  acceptInsurance: boolean
  willingToTravel: boolean
  availableForUrgent: boolean
  carePhilosophy: string
  digitalWalletAddress: string
  status: 'pending' | 'approved' | 'rejected'
  applicationDate: string
  documents: {
    governmentId: boolean
    professionalLicense: boolean
    additionalCertifications: boolean
    backgroundCheck: boolean
  }
}

// Mock data - replace with actual API call
const mockApplications: CaregiverApplication[] = [
  {
    id: "1",
    firstName: "Maria",
    lastName: "Rodriguez",
    email: "maria.rodriguez@email.com",
    phone: "(555) 123-4567",
    licenseNumber: "RN123456",
    primarySpecialty: "Elder Care",
    yearsExperience: "8 years",
    serviceAreas: "San Francisco, CA; Oakland, CA",
    languagesSpoken: ["English", "Spanish"],
    acceptInsurance: true,
    willingToTravel: true,
    availableForUrgent: true,
    carePhilosophy: "Compassionate care with focus on dignity and independence",
    digitalWalletAddress: "0x1234...5678",
    status: "pending",
    applicationDate: "2024-01-15",
    documents: {
      governmentId: true,
      professionalLicense: true,
      additionalCertifications: true,
      backgroundCheck: false
    }
  },
  {
    id: "2",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@email.com",
    phone: "(555) 234-5678",
    licenseNumber: "LPN789012",
    primarySpecialty: "Post-Surgery Care",
    yearsExperience: "12 years",
    serviceAreas: "San Francisco, CA; San Jose, CA",
    languagesSpoken: ["English"],
    acceptInsurance: true,
    willingToTravel: false,
    availableForUrgent: true,
    carePhilosophy: "Professional medical care with emphasis on recovery",
    digitalWalletAddress: "",
    status: "approved",
    applicationDate: "2024-01-10",
    documents: {
      governmentId: true,
      professionalLicense: true,
      additionalCertifications: true,
      backgroundCheck: true
    }
  },
  {
    id: "3",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah.chen@email.com",
    phone: "(555) 345-6789",
    licenseNumber: "CNA345678",
    primarySpecialty: "Pediatric Care",
    yearsExperience: "6 years",
    serviceAreas: "San Francisco, CA",
    languagesSpoken: ["English", "Mandarin"],
    acceptInsurance: false,
    willingToTravel: true,
    availableForUrgent: false,
    carePhilosophy: "Gentle, patient-centered care for children",
    digitalWalletAddress: "0xabcd...efgh",
    status: "rejected",
    applicationDate: "2024-01-08",
    documents: {
      governmentId: true,
      professionalLicense: false,
      additionalCertifications: false,
      backgroundCheck: false
    }
  }
]

export default function CaregiverApplicationsPage() {
  const [applications, setApplications] = useState<CaregiverApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<CaregiverApplication[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<CaregiverApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch applications from API
  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await fetch('/api/caregivers/signup')
        const data = await response.json()
        
        if (data.success) {
          // If no real applications, use mock data for demo
          const apps = data.applications.length > 0 ? data.applications.map((app: any) => ({
            id: app.id || '',
            firstName: app.firstName || app.name?.split(' ')[0] || '',
            lastName: app.lastName || app.name?.split(' ')[1] || '',
            email: app.email || '',
            phone: app.phone || '',
            licenseNumber: app.licenseNumber || '',
            primarySpecialty: app.primarySpecialty || app.specialty || '',
            yearsExperience: app.yearsExperience || '',
            serviceAreas: app.serviceAreas || '',
            languagesSpoken: app.languagesSpoken || [],
            acceptInsurance: app.acceptInsurance || false,
            willingToTravel: app.willingToTravel || false,
            availableForUrgent: app.availableForUrgent || false,
            carePhilosophy: app.carePhilosophy || '',
            digitalWalletAddress: app.digitalWalletAddress || '',
            status: app.status || 'pending',
            applicationDate: app.submittedAt || new Date().toISOString().split('T')[0],
            documents: {
              governmentId: app.hasAllDocuments || false,
              professionalLicense: app.hasAllDocuments || false,
              additionalCertifications: false,
              backgroundCheck: false
            }
          })) : mockApplications
          
          setApplications(apps)
          setFilteredApplications(apps)
        }
      } catch (error) {
        console.error('Error fetching applications:', error)
        // Fall back to mock data
        setApplications(mockApplications)
        setFilteredApplications(mockApplications)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchApplications()
  }, [])

  useEffect(() => {
    let filtered = applications

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(app => 
        app.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }, [applications, searchQuery, statusFilter])

  const handleStatusChange = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    try {
      // If approving, call the approve API to add caregiver to search
      if (newStatus === 'approved') {
        const response = await fetch('/api/caregivers/approve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ applicationId })
        })
        
        const result = await response.json()
        
        if (!result.success) {
          alert(`Failed to approve: ${result.error}`)
          return
        }
        
        alert(`Successfully approved ${result.caregiver?.name || 'caregiver'}! They will now appear in caregiver search.`)
      }
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      )
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update application status')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getDocumentStatus = (hasDocument: boolean) => {
    return hasDocument ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Caregiver Applications
          </h1>
          <p className="text-gray-600">
            Review and manage caregiver applications for the professional network.
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or license number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-gray-400 focus:ring-gray-100"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-gray-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Applications List */}
        <div className="grid gap-6">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="p-6 border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.firstName} {application.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{application.primarySpecialty}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        {application.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        {application.phone}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(application.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedApplication(application)}
                    className="border-gray-200"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">License:</span>
                  <p className="text-sm text-gray-600">{application.licenseNumber}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Experience:</span>
                  <p className="text-sm text-gray-600">{application.yearsExperience}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Service Areas:</span>
                  <p className="text-sm text-gray-600">{application.serviceAreas}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Applied: {new Date(application.applicationDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Documents: {Object.values(application.documents).filter(Boolean).length}/4
                  </div>
                </div>

                {application.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(application.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(application.id, 'rejected')}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No applications found matching your criteria</p>
          </div>
        )}

        {/* Application Details Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Application Details
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedApplication(null)}
                    className="border-gray-200"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Name:</span>
                        <p className="text-sm text-gray-600">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Email:</span>
                        <p className="text-sm text-gray-600">{selectedApplication.email}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Phone:</span>
                        <p className="text-sm text-gray-600">{selectedApplication.phone}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">License Number:</span>
                        <p className="text-sm text-gray-600">{selectedApplication.licenseNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Professional Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Specialty:</span>
                        <p className="text-sm text-gray-600">{selectedApplication.primarySpecialty}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Experience:</span>
                        <p className="text-sm text-gray-600">{selectedApplication.yearsExperience}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Service Areas:</span>
                        <p className="text-sm text-gray-600">{selectedApplication.serviceAreas}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Languages:</span>
                        <p className="text-sm text-gray-600">{selectedApplication.languagesSpoken.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Preferences</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Accepts Insurance:</span>
                        {selectedApplication.acceptInsurance ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Willing to Travel:</span>
                        {selectedApplication.willingToTravel ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Available for Urgent Care:</span>
                        {selectedApplication.availableForUrgent ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Documents</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Government ID</span>
                        {getDocumentStatus(selectedApplication.documents.governmentId)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Professional License</span>
                        {getDocumentStatus(selectedApplication.documents.professionalLicense)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Additional Certifications</span>
                        {getDocumentStatus(selectedApplication.documents.additionalCertifications)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Background Check</span>
                        {getDocumentStatus(selectedApplication.documents.backgroundCheck)}
                      </div>
                    </div>
                  </div>

                  {/* Care Philosophy */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Care Philosophy</h3>
                    <p className="text-sm text-gray-600">{selectedApplication.carePhilosophy}</p>
                  </div>

                  {/* Digital Wallet */}
                  {selectedApplication.digitalWalletAddress && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Digital Wallet</h3>
                      <p className="text-sm text-gray-600 font-mono">{selectedApplication.digitalWalletAddress}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {selectedApplication.status === 'pending' && (
                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                      <Button
                        onClick={() => {
                          handleStatusChange(selectedApplication.id, 'approved')
                          setSelectedApplication(null)
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Application
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleStatusChange(selectedApplication.id, 'rejected')
                          setSelectedApplication(null)
                        }}
                        className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Application
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
