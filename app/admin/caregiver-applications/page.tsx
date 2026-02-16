"use client"

/**
 * Admin Caregiver Applications Review Page
 * 
 * Review, approve, reject, or request more info from caregiver applicants.
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Calendar,
  Loader2,
  AlertTriangle,
  MessageSquare,
  ArrowLeft,
  Heart,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

interface CaregiverApplication {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  status: string
  submittedAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  reviewNotes: string
  specialty: string
  servicesOffered: string[]
  experienceYears: string
  certifications: string[]
  languages: string[]
  regions: string[]
  attestedAccuracy: boolean
  consentToBackgroundCheck: boolean
}

export default function AdminCaregiverApplicationsPage() {
  const [applications, setApplications] = useState<CaregiverApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<CaregiverApplication | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [statusFilter, setStatusFilter] = useState("submitted")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchApplications()
  }, [statusFilter])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/caregiver-applications?status=${statusFilter}`)
      const data = await response.json()
      if (data.success) {
        setApplications(data.applications)
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (applicationId: string, action: string) => {
    setActionLoading(applicationId)
    try {
      const response = await fetch("/api/admin/caregiver-applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          action,
          reviewNotes,
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Refresh the list
        await fetchApplications()
        setSelectedApplication(null)
        setReviewNotes("")
        alert(`Application ${action}ed successfully! ${data.emailSent ? "Email notification sent." : ""}`)
      } else {
        alert(`Failed: ${data.error}`)
      }
    } catch (error) {
      console.error("Action failed:", error)
      alert("Action failed. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const filteredApplications = applications.filter((app) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      app.fullName.toLowerCase().includes(query) ||
      app.email.toLowerCase().includes(query) ||
      app.specialty.toLowerCase().includes(query)
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-800">Pending Review</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case "pending_info":
        return <Badge className="bg-yellow-100 text-yellow-800">Needs Info</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Heart className="h-6 w-6 text-pink-500" />
                  Caregiver Applications
                </h1>
                <p className="text-gray-600">Review and manage caregiver applications</p>
              </div>
            </div>
            <Button onClick={fetchApplications} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Pending Review</SelectItem>
                  <SelectItem value="pending_info">Needs Info</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="all">All Applications</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{applications.filter(a => a.status === "submitted").length}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{applications.filter(a => a.status === "pending_info").length}</p>
              <p className="text-sm text-gray-600">Needs Info</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{applications.filter(a => a.status === "approved").length}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">{applications.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No Applications Found</h3>
              <p className="text-gray-600">
                {statusFilter === "submitted" 
                  ? "No caregiver applications pending review."
                  : "No applications match your filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-pink-500" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{application.fullName || "No Name"}</h3>
                          <p className="text-gray-600">{application.specialty}</p>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>

                      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {application.email}
                        </div>
                        {application.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {application.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {application.experienceYears} experience
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Applied: {new Date(application.submittedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Certifications & Languages */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {application.certifications?.slice(0, 3).map((cert) => (
                          <Badge key={cert} variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            {cert}
                          </Badge>
                        ))}
                        {application.languages?.map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                        {application.consentToBackgroundCheck && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Background Check Consented
                          </Badge>
                        )}
                      </div>

                      {/* Review Notes */}
                      {application.reviewNotes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-yellow-800">
                            <strong>Review Notes:</strong> {application.reviewNotes}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      {application.status === "submitted" || application.status === "pending_info" ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAction(application.id, "approve")}
                            disabled={actionLoading === application.id}
                          >
                            {actionLoading === application.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedApplication(application)
                              setReviewNotes("")
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Request Info
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(application.id, "reject")}
                            disabled={actionLoading === application.id}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          {application.reviewedAt && (
                            <>Reviewed on {new Date(application.reviewedAt).toLocaleDateString()}</>
                          )}
                          {application.reviewedBy && <> by {application.reviewedBy}</>}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Review Application
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">{selectedApplication.fullName}</p>
                  <p className="text-sm text-gray-600">{selectedApplication.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Notes / Request for Information
                  </label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Enter any notes or specify what additional information you need..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAction(selectedApplication.id, "approve")}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={actionLoading === selectedApplication.id}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAction(selectedApplication.id, "request_info")}
                    disabled={actionLoading === selectedApplication.id || !reviewNotes.trim()}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Request Info
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleAction(selectedApplication.id, "reject")}
                    disabled={actionLoading === selectedApplication.id}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setSelectedApplication(null)
                    setReviewNotes("")
                  }}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
