"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { LoadingSpinner } from "@/components/ui/loading"
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ArrowLeft,
  AlertTriangle,
  Stethoscope,
  Heart,
} from "lucide-react"

interface Application {
  id: string
  role: string
  email: string
  fullName?: string
  firstName?: string
  lastName?: string
  status: string
  submittedAt?: string
  country: string
  regions: string[]
  verifications: Array<{
    type: string
    status: string
    passed: boolean | null
  }>
  _count: {
    documents: number
  }
}

export default function AdminApplicationsNewPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    pendingInfo: 0,
  })

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.set("status", statusFilter)
      if (roleFilter) params.set("role", roleFilter)
      if (searchQuery) params.set("search", searchQuery)

      const res = await fetch(`/api/admin/applications?${params}`)
      const data = await res.json()

      if (data.success) {
        setApplications(data.applications)
        setStats(data.stats)
      }
    } catch (e) {
      console.error("Failed to fetch applications", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [statusFilter, roleFilter])

  const handleSearch = () => {
    fetchApplications()
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      SUBMITTED: { bg: "bg-amber-100", text: "text-amber-800" },
      UNDER_REVIEW: { bg: "bg-blue-100", text: "text-blue-800" },
      APPROVED: { bg: "bg-green-100", text: "text-green-800" },
      REJECTED: { bg: "bg-red-100", text: "text-red-800" },
      PENDING_INFO: { bg: "bg-purple-100", text: "text-purple-800" },
    }
    const style = styles[status] || { bg: "bg-gray-100", text: "text-gray-800" }
    return <Badge className={`${style.bg} ${style.text}`}>{status.replace("_", " ")}</Badge>
  }

  const hasVerificationIssue = (app: Application) => {
    return app.verifications.some(
      (v) => (v.type === "OIG_LEIE" || v.type === "SAM_EXCLUSION") && v.passed === false
    )
  }

  const getName = (app: Application) => {
    return app.fullName || `${app.firstName || ""} ${app.lastName || ""}`.trim() || app.email
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />

      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/admin"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Admin
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Application Review</h1>
                <p className="text-gray-600">Review provider and caregiver applications</p>
              </div>
              <Button onClick={fetchApplications} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card
              className={`p-4 cursor-pointer transition-colors ${
                statusFilter === null ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setStatusFilter(null)}
            >
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-xl font-bold">{stats.total}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </Card>
            <Card
              className={`p-4 cursor-pointer transition-colors ${
                statusFilter === "SUBMITTED" ? "ring-2 ring-amber-500" : ""
              }`}
              onClick={() => setStatusFilter("SUBMITTED")}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="text-xl font-bold">{stats.submitted}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </Card>
            <Card
              className={`p-4 cursor-pointer transition-colors ${
                statusFilter === "APPROVED" ? "ring-2 ring-green-500" : ""
              }`}
              onClick={() => setStatusFilter("APPROVED")}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-xl font-bold">{stats.approved}</p>
                  <p className="text-xs text-gray-500">Approved</p>
                </div>
              </div>
            </Card>
            <Card
              className={`p-4 cursor-pointer transition-colors ${
                statusFilter === "REJECTED" ? "ring-2 ring-red-500" : ""
              }`}
              onClick={() => setStatusFilter("REJECTED")}
            >
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="text-xl font-bold">{stats.rejected}</p>
                  <p className="text-xs text-gray-500">Rejected</p>
                </div>
              </div>
            </Card>
            <Card
              className={`p-4 cursor-pointer transition-colors ${
                statusFilter === "PENDING_INFO" ? "ring-2 ring-purple-500" : ""
              }`}
              onClick={() => setStatusFilter("PENDING_INFO")}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-xl font-bold">{stats.pendingInfo}</p>
                  <p className="text-xs text-gray-500">Info Requested</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or NPI..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={roleFilter === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter(null)}
                >
                  All Roles
                </Button>
                <Button
                  variant={roleFilter === "PROVIDER" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter("PROVIDER")}
                >
                  <Stethoscope className="w-4 h-4 mr-1" />
                  Providers
                </Button>
                <Button
                  variant={roleFilter === "CAREGIVER" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter("CAREGIVER")}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Caregivers
                </Button>
              </div>
            </div>
          </Card>

          {/* Applications List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : applications.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter || roleFilter
                  ? "Try adjusting your filters"
                  : "No applications have been submitted yet"}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <Card key={app.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          app.role === "PROVIDER" ? "bg-blue-100" : "bg-pink-100"
                        }`}
                      >
                        {app.role === "PROVIDER" ? (
                          <Stethoscope className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Heart className="w-5 h-5 text-pink-600" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{getName(app)}</h3>
                          {getStatusBadge(app.status)}
                          {hasVerificationIssue(app) && (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Exclusion
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {app.email} • {app.role} • {app.country}
                          {app.regions?.length > 0 && ` (${app.regions.join(", ")})`}
                        </p>
                        {app.submittedAt && (
                          <p className="text-xs text-gray-500">
                            Submitted {new Date(app.submittedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {app._count.documents > 0 && (
                        <Badge variant="outline">{app._count.documents} docs</Badge>
                      )}
                      <Button asChild size="sm">
                        <Link href={`/admin/review/${app.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
