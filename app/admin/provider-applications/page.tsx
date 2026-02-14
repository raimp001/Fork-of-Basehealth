"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/ui/loading"
import { toastSuccess, toastError } from "@/lib/toast-helper"
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Stethoscope,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  ArrowLeft,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"

interface Provider {
  id: string
  type: "PHYSICIAN" | "APP"
  fullName: string | null
  organizationName: string | null
  email: string
  phone: string | null
  npiNumber: string | null
  licenseNumber: string | null
  licenseState: string | null
  specialties: string[]
  bio: string | null
  isVerified: boolean
  acceptingPatients: boolean
  createdAt: string
  updatedAt: string
}

export default function ProviderApplicationsPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "verified">("all")
  const [typeFilter, setTypeFilter] = useState<"all" | "PHYSICIAN" | "APP">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [actionNotes, setActionNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0 })

  const fetchProviders = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filter !== "all") params.set("status", filter)
      if (typeFilter !== "all") params.set("type", typeFilter)

      const response = await fetch(`/api/admin/providers?${params}`)
      const data = await response.json()

      if (data.success) {
        setProviders(data.providers)
        setStats(data.stats)
      } else {
        toastError({ title: "Error", description: data.error })
      }
    } catch (error) {
      toastError({ title: "Error", description: "Failed to fetch providers" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders()
  }, [filter, typeFilter])

  const handleAction = async () => {
    if (!selectedProvider || !actionType) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: selectedProvider.id,
          action: actionType,
          notes: actionNotes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toastSuccess({
          title: "Success",
          description: data.message,
        })
        fetchProviders()
        setActionDialogOpen(false)
        setSelectedProvider(null)
        setActionNotes("")
      } else {
        toastError({ title: "Error", description: data.error })
      }
    } catch (error) {
      toastError({ title: "Error", description: "Failed to update provider" })
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredProviders = providers.filter((provider) => {
    const name = provider.fullName || provider.organizationName || ""
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const pendingProviders = filteredProviders.filter((p) => !p.isVerified)
  const verifiedProviders = filteredProviders.filter((p) => p.isVerified)

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/admin"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Admin Portal
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Provider Applications
                </h1>
                <p className="text-gray-600 mt-2">
                  Review and manage provider signup requests
                </p>
              </div>

              <Button onClick={fetchProviders} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                  <p className="text-sm text-blue-700">Total Providers</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-amber-200 bg-amber-50">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-900">{stats.pending}</p>
                  <p className="text-sm text-amber-700">Pending Review</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-green-200 bg-green-50">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">{stats.verified}</p>
                  <p className="text-sm text-green-700">Verified</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={filter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("pending")}
                >
                  Pending
                </Button>
                <Button
                  variant={filter === "verified" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("verified")}
                >
                  Verified
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={typeFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter("all")}
                >
                  All Types
                </Button>
                <Button
                  variant={typeFilter === "PHYSICIAN" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter("PHYSICIAN")}
                >
                  <Stethoscope className="h-4 w-4 mr-1" />
                  Physicians
                </Button>
                <Button
                  variant={typeFilter === "APP" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter("APP")}
                >
                  <Building2 className="h-4 w-4 mr-1" />
                  Apps/Clinics
                </Button>
              </div>
            </div>
          </Card>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : filteredProviders.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No providers found
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "No provider applications yet"}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Pending Section */}
              {pendingProviders.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending Review ({pendingProviders.length})
                  </h2>
                  <div className="grid gap-4">
                    {pendingProviders.map((provider) => (
                      <ProviderCard
                        key={provider.id}
                        provider={provider}
                        onApprove={() => {
                          setSelectedProvider(provider)
                          setActionType("approve")
                          setActionDialogOpen(true)
                        }}
                        onReject={() => {
                          setSelectedProvider(provider)
                          setActionType("reject")
                          setActionDialogOpen(true)
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Section */}
              {verifiedProviders.length > 0 && filter !== "pending" && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Verified Providers ({verifiedProviders.length})
                  </h2>
                  <div className="grid gap-4">
                    {verifiedProviders.map((provider) => (
                      <ProviderCard
                        key={provider.id}
                        provider={provider}
                        onApprove={() => {}}
                        onReject={() => {
                          setSelectedProvider(provider)
                          setActionType("reject")
                          setActionDialogOpen(true)
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Provider" : "Reject Provider"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? `Are you sure you want to approve ${selectedProvider?.fullName || selectedProvider?.organizationName}?`
                : `Are you sure you want to reject ${selectedProvider?.fullName || selectedProvider?.organizationName}?`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="Add any notes about this decision..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={isProcessing}
              className={
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isProcessing ? (
                <LoadingSpinner />
              ) : actionType === "approve" ? (
                <>
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Approve
                </>
              ) : (
                <>
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProviderCard({
  provider,
  onApprove,
  onReject,
}: {
  provider: Provider
  onApprove: () => void
  onReject: () => void
}) {
  const name = provider.fullName || provider.organizationName || "Unknown"
  const isPhysician = provider.type === "PHYSICIAN"

  return (
    <Card className={`p-4 ${!provider.isVerified ? "border-amber-200" : "border-green-200"}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isPhysician ? "bg-blue-100" : "bg-purple-100"
            }`}
          >
            {isPhysician ? (
              <Stethoscope className="h-6 w-6 text-blue-600" />
            ) : (
              <Building2 className="h-6 w-6 text-purple-600" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{name}</h3>
              <Badge variant={provider.isVerified ? "default" : "secondary"}>
                {provider.isVerified ? "Verified" : "Pending"}
              </Badge>
              <Badge variant="outline">
                {isPhysician ? "Physician" : "App/Clinic"}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {provider.email}
              </span>
              {provider.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {provider.phone}
                </span>
              )}
            </div>

            {isPhysician && (
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {provider.npiNumber && (
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    NPI: {provider.npiNumber}
                  </span>
                )}
                {provider.licenseNumber && provider.licenseState && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    License: {provider.licenseNumber} ({provider.licenseState})
                  </span>
                )}
              </div>
            )}

            {provider.specialties && provider.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {provider.specialties.map((specialty, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Applied: {new Date(provider.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {!provider.isVerified && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onReject}>
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={onApprove}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
