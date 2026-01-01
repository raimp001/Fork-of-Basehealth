"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { LoadingSpinner } from "@/components/ui/loading"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  History,
  ExternalLink,
} from "lucide-react"

interface Application {
  id: string
  role: string
  country: string
  regions: string[]
  email: string
  fullName?: string
  firstName?: string
  lastName?: string
  professionType?: string
  specialty?: string
  npiNumber?: string
  npiVerified: boolean
  licenseNumber?: string
  licenseState?: string
  licenseExpiry?: string
  status: string
  submittedAt?: string
  createdAt: string
  verifications: Verification[]
  documents: Document[]
}

interface Verification {
  id: string
  type: string
  status: string
  passed: boolean | null
  checkedAt: string
  rawResponse?: any
}

interface Document {
  id: string
  type: string
  fileName: string
  verified: boolean
}

export default function ApplicationReviewPage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.id as string

  const [application, setApplication] = useState<Application | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchApplication()
  }, [applicationId])

  const fetchApplication = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/applications/${applicationId}`)
      const data = await res.json()
      
      if (data.success) {
        setApplication(data.application)
      } else {
        setError(data.error || "Failed to load application")
      }
    } catch (e) {
      setError("Failed to fetch application")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (action: "approve" | "reject" | "request_info") => {
    if (!application) return

    setIsProcessing(true)
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          notes: reviewNotes,
        }),
      })

      const data = await res.json()
      
      if (data.success) {
        router.push("/admin/applications?message=" + encodeURIComponent(`Application ${action}d successfully`))
      } else {
        setError(data.error)
      }
    } catch (e) {
      setError("Failed to process action")
    } finally {
      setIsProcessing(false)
    }
  }

  const runVerification = async (type: string) => {
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })
      const data = await res.json()
      if (data.success) {
        fetchApplication()
      }
    } catch (e) {
      console.error("Verification failed", e)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      SUBMITTED: "bg-amber-100 text-amber-800",
      UNDER_REVIEW: "bg-blue-100 text-blue-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      PENDING_INFO: "bg-purple-100 text-purple-800",
    }
    return <Badge className={styles[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  const getVerificationIcon = (v: Verification) => {
    if (v.status === "PASSED" || v.passed) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (v.status === "FAILED" || v.passed === false) return <XCircle className="w-5 h-5 text-red-600" />
    if (v.status === "PENDING") return <Clock className="w-5 h-5 text-amber-600" />
    return <AlertTriangle className="w-5 h-5 text-gray-400" />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MinimalNavigation />
        <main className="pt-20 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Application</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button asChild>
                <Link href="/admin/applications">Back to Applications</Link>
              </Button>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const name = application.fullName || `${application.firstName} ${application.lastName}`
  const hasExclusionFailure = application.verifications.some(
    v => (v.type === "OIG_LEIE" || v.type === "SAM_EXCLUSION") && v.passed === false
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />

      <main className="pt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/admin/applications"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Applications
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                <p className="text-gray-600">
                  {application.role} Application • {application.email}
                </p>
              </div>
              {getStatusBadge(application.status)}
            </div>
          </div>

          {/* Exclusion Warning */}
          {hasExclusionFailure && (
            <Card className="mb-6 border-red-300 bg-red-50">
              <CardContent className="p-4 flex items-start gap-4">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900">Exclusion List Match</h3>
                  <p className="text-sm text-red-800">
                    This applicant appears on OIG LEIE or SAM.gov exclusion lists.
                    <strong> Do not approve without further investigation.</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Application Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Role</Label>
                      <p className="font-medium">{application.role}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Country</Label>
                      <p className="font-medium">{application.country}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Email</Label>
                      <p className="font-medium">{application.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Regions</Label>
                      <p className="font-medium">{application.regions?.join(", ") || "N/A"}</p>
                    </div>
                  </div>

                  {application.role === "PROVIDER" && (
                    <>
                      <hr />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-500">Profession</Label>
                          <p className="font-medium">{application.professionType || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Specialty</Label>
                          <p className="font-medium">{application.specialty || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500">NPI Number</Label>
                          <p className="font-medium flex items-center gap-2">
                            {application.npiNumber || "Not provided"}
                            {application.npiVerified && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </p>
                        </div>
                        <div>
                          <Label className="text-gray-500">License</Label>
                          <p className="font-medium">
                            {application.licenseNumber} ({application.licenseState})
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <hr />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-500">Submitted</Label>
                      <p>{application.submittedAt 
                        ? new Date(application.submittedAt).toLocaleString() 
                        : "Not submitted"}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Created</Label>
                      <p>{new Date(application.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Panel */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Verification Results</CardTitle>
                  <Button variant="outline" size="sm" onClick={fetchApplication}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  {application.verifications.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No verifications run yet</p>
                  ) : (
                    <div className="space-y-3">
                      {application.verifications.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getVerificationIcon(v)}
                            <div>
                              <p className="font-medium">{v.type.replace(/_/g, " ")}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(v.checkedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={
                              v.passed
                                ? "bg-green-100 text-green-800"
                                : v.passed === false
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {v.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Run Verification Buttons */}
                  {application.role === "PROVIDER" && application.country === "US" && (
                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runVerification("NPI_LOOKUP")}
                      >
                        Run NPI Lookup
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runVerification("OIG_LEIE")}
                      >
                        Run OIG Check
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runVerification("SAM_EXCLUSION")}
                      >
                        Run SAM Check
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Documents */}
              {application.documents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {application.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{doc.type}</p>
                              <p className="text-sm text-gray-500">{doc.fileName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.verified ? (
                              <Badge className="bg-green-100 text-green-800">Verified</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                            )}
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              {/* Admin Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes about your decision..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleAction("approve")}
                      disabled={isProcessing || hasExclusionFailure}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Approve
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleAction("request_info")}
                      disabled={isProcessing}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Request Info
                    </Button>

                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleAction("reject")}
                      disabled={isProcessing}
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>

                  {hasExclusionFailure && (
                    <p className="text-xs text-red-600 text-center">
                      Approval blocked: Exclusion list match
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">External Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {application.npiNumber && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      asChild
                    >
                      <a
                        href={`https://npiregistry.cms.hhs.gov/provider-view/${application.npiNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View in NPPES Registry
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    asChild
                  >
                    <a
                      href="https://exclusions.oig.hhs.gov/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      OIG LEIE Search
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    asChild
                  >
                    <a
                      href="https://sam.gov/content/exclusions"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      SAM.gov Exclusions
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
