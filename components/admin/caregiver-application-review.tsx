"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Heart, Search, Filter, CheckCircle, XCircle, Clock, Eye, User, Mail, Phone, Award, MapPin } from 'lucide-react'
import { toast } from 'sonner'

interface CaregiverApplication {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  licenseNumber: string
  specialty: string
  yearsExperience: string
  education: string
  certifications: string
  workLocations: string
  languages: string
  about: string
  acceptsInsurance: boolean
  willingToTravel: boolean
  acceptsEmergency: boolean
  walletAddress: string
  applicationDate: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  reviewedBy?: string
  reviewedDate?: string
  reviewNotes?: string
  governmentId?: any
  professionalLicense?: any
  additionalCertifications?: any
  backgroundCheck?: any
}

export default function CaregiverApplicationReview() {
  const [applications, setApplications] = useState<CaregiverApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<CaregiverApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedApplication, setSelectedApplication] = useState<CaregiverApplication | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm, statusFilter])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/caregiver-applications')
      const data = await response.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = applications

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(app => 
        app.firstName.toLowerCase().includes(term) ||
        app.lastName.toLowerCase().includes(term) ||
        app.email.toLowerCase().includes(term) ||
        app.specialty.toLowerCase().includes(term) ||
        app.licenseNumber.toLowerCase().includes(term)
      )
    }

    setFilteredApplications(filtered)
  }

  const updateApplicationStatus = async (applicationId: string, status: string, notes: string = '') => {
    try {
      const response = await fetch(`/api/admin/caregiver-applications?id=${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          reviewNotes: notes,
          reviewedBy: 'Admin', // In real app, this would be the logged-in admin's name
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update application')
      }

      // Refresh applications
      await fetchApplications()
      toast.success(`Application ${status} successfully`)
      setReviewDialogOpen(false)
      setSelectedApplication(null)
      setReviewNotes('')

    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      under_review: { color: 'bg-blue-100 text-blue-800', label: 'Under Review' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />
      case 'under_review': return <Clock className="h-4 w-4 text-blue-600" />
      default: return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading applications...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-600" />
            Caregiver Applications
          </h2>
          <p className="text-slate-600">Review and manage caregiver application submissions</p>
        </div>
        <div className="text-sm text-slate-500">
          {filteredApplications.length} of {applications.length} applications
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, specialty, or license..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No applications found</h3>
              <p className="text-slate-500">
                {applications.length === 0 
                  ? "No caregiver applications have been submitted yet."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-rose-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {application.firstName} {application.lastName}
                        </h3>
                        <p className="text-sm text-slate-600">{application.specialty}</p>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{application.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{application.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-slate-400" />
                        <span>License: {application.licenseNumber}</span>
                      </div>
                      {application.yearsExperience && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>{application.yearsExperience} years experience</span>
                        </div>
                      )}
                      {application.workLocations && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>{application.workLocations}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>Applied: {new Date(application.applicationDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {application.about && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-700 line-clamp-2">{application.about}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Application Details - {application.firstName} {application.lastName}
                          </DialogTitle>
                          <DialogDescription>
                            Complete application information and review options
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="font-semibold">Status</Label>
                              <div className="mt-1">{getStatusBadge(application.status)}</div>
                            </div>
                            <div>
                              <Label className="font-semibold">Application Date</Label>
                              <p className="text-sm">{new Date(application.applicationDate).toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="font-semibold">Email</Label>
                              <p className="text-sm">{application.email}</p>
                            </div>
                            <div>
                              <Label className="font-semibold">Phone</Label>
                              <p className="text-sm">{application.phone}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="font-semibold">License Number</Label>
                              <p className="text-sm">{application.licenseNumber}</p>
                            </div>
                            <div>
                              <Label className="font-semibold">Years Experience</Label>
                              <p className="text-sm">{application.yearsExperience || 'Not specified'}</p>
                            </div>
                          </div>

                          {application.education && (
                            <div>
                              <Label className="font-semibold">Education</Label>
                              <p className="text-sm">{application.education}</p>
                            </div>
                          )}

                          {application.certifications && (
                            <div>
                              <Label className="font-semibold">Certifications</Label>
                              <p className="text-sm">{application.certifications}</p>
                            </div>
                          )}

                          <div>
                            <Label className="font-semibold">About</Label>
                            <p className="text-sm mt-1 p-3 bg-slate-50 rounded">{application.about}</p>
                          </div>

                          {/* Document Reviews */}
                          <div>
                            <Label className="font-semibold text-slate-800 text-base">Uploaded Documents</Label>
                            <div className="mt-3 space-y-3">
                              {/* Government ID */}
                              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">Government ID</span>
                                  {application.governmentId ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-green-600 text-xs">✓ Uploaded</span>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => {
                                          // In real implementation, this would open the document
                                          const link = document.createElement('a')
                                          link.href = application.governmentId.data
                                          link.download = application.governmentId.name
                                          link.click()
                                        }}
                                        className="text-xs h-7"
                                      >
                                        View
                                      </Button>
                                    </div>
                                  ) : (
                                    <span className="text-red-600 text-xs">✗ Not uploaded</span>
                                  )}
                                </div>
                                {application.governmentId && (
                                  <p className="text-xs text-slate-600 mt-1">
                                    File: {application.governmentId.name} ({(application.governmentId.size / 1024 / 1024).toFixed(2)}MB)
                                  </p>
                                )}
                              </div>

                              {/* Professional License */}
                              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">Professional License</span>
                                  {application.professionalLicense ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-green-600 text-xs">✓ Uploaded</span>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => {
                                          const link = document.createElement('a')
                                          link.href = application.professionalLicense.data
                                          link.download = application.professionalLicense.name
                                          link.click()
                                        }}
                                        className="text-xs h-7"
                                      >
                                        View
                                      </Button>
                                    </div>
                                  ) : (
                                    <span className="text-red-600 text-xs">✗ Not uploaded</span>
                                  )}
                                </div>
                                {application.professionalLicense && (
                                  <p className="text-xs text-slate-600 mt-1">
                                    File: {application.professionalLicense.name} ({(application.professionalLicense.size / 1024 / 1024).toFixed(2)}MB)
                                  </p>
                                )}
                              </div>

                              {/* Additional Certifications */}
                              {application.additionalCertifications && (
                                <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">Additional Certifications</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-green-600 text-xs">✓ Uploaded</span>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => {
                                          const link = document.createElement('a')
                                          link.href = application.additionalCertifications.data
                                          link.download = application.additionalCertifications.name
                                          link.click()
                                        }}
                                        className="text-xs h-7"
                                      >
                                        View
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-600 mt-1">
                                    File: {application.additionalCertifications.name} ({(application.additionalCertifications.size / 1024 / 1024).toFixed(2)}MB)
                                  </p>
                                </div>
                              )}

                              {/* Background Check */}
                              {application.backgroundCheck && (
                                <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">Background Check</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-green-600 text-xs">✓ Uploaded</span>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => {
                                          const link = document.createElement('a')
                                          link.href = application.backgroundCheck.data
                                          link.download = application.backgroundCheck.name
                                          link.click()
                                        }}
                                        className="text-xs h-7"
                                      >
                                        View
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-600 mt-1">
                                    File: {application.backgroundCheck.name} ({(application.backgroundCheck.size / 1024 / 1024).toFixed(2)}MB)
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                             <div className="flex items-center gap-2">
                               <input 
                                 type="checkbox" 
                                 id={`insurance-${application.id}`}
                                 checked={application.acceptsInsurance} 
                                 disabled 
                                 aria-label="Accepts Insurance"
                               />
                               <label htmlFor={`insurance-${application.id}`} className="text-sm">Accepts Insurance</label>
                             </div>
                             <div className="flex items-center gap-2">
                               <input 
                                 type="checkbox" 
                                 id={`travel-${application.id}`}
                                 checked={application.willingToTravel} 
                                 disabled 
                                 aria-label="Willing to Travel"
                               />
                               <label htmlFor={`travel-${application.id}`} className="text-sm">Willing to Travel</label>
                             </div>
                             <div className="flex items-center gap-2">
                               <input 
                                 type="checkbox" 
                                 id={`emergency-${application.id}`}
                                 checked={application.acceptsEmergency} 
                                 disabled 
                                 aria-label="Accepts Emergency"
                               />
                               <label htmlFor={`emergency-${application.id}`} className="text-sm">Accepts Emergency</label>
                             </div>
                           </div>

                          {application.reviewNotes && (
                            <div>
                              <Label className="font-semibold">Review Notes</Label>
                              <p className="text-sm mt-1 p-3 bg-yellow-50 rounded">{application.reviewNotes}</p>
                              {application.reviewedBy && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Reviewed by {application.reviewedBy} on {new Date(application.reviewedDate!).toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {application.status === 'pending' || application.status === 'under_review' ? (
                      <Button
                        onClick={() => {
                          setSelectedApplication(application)
                          setReviewDialogOpen(true)
                        }}
                        className="bg-rose-600 hover:bg-rose-700"
                        size="sm"
                      >
                        {getStatusIcon(application.status)}
                        <span className="ml-2">Review</span>
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        {getStatusIcon(application.status)}
                        <span className="capitalize">{application.status}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Review and take action on {selectedApplication?.firstName} {selectedApplication?.lastName}'s application
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
              <Textarea
                id="reviewNotes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any notes about your decision..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setReviewDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => updateApplicationStatus(selectedApplication?.id!, 'under_review', reviewNotes)}
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Clock className="h-4 w-4 mr-2" />
                Mark Under Review
              </Button>
              <Button
                variant="outline"
                onClick={() => updateApplicationStatus(selectedApplication?.id!, 'rejected', reviewNotes)}
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => updateApplicationStatus(selectedApplication?.id!, 'approved', reviewNotes)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 