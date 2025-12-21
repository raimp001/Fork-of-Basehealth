"use client"

import React, { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StandardizedButton, PrimaryActionButton } from "@/components/ui/standardized-button"
import { StandardizedInput } from "@/components/ui/standardized-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { components } from "@/lib/design-system"
import { ApplicationReviewCard } from "./application-review-card"
import type { Application, ApplicationFilters, ApplicationStats, ReviewAction } from "@/types/admin"
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Filter,
  Search,
  Download,
  Plus,
  Heart,
  Stethoscope,
  BarChart3,
  Calendar,
  FileText
} from "lucide-react"

interface AdminDashboardProps {
  applications: Application[]
  stats: ApplicationStats
  onReview: (applicationId: string, action: ReviewAction) => void
  className?: string
}

function AdminDashboardComponent({ applications, stats, onReview, className }: AdminDashboardProps) {
  const [filters, setFilters] = useState<ApplicationFilters>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'type'>('date')

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    let filtered = applications

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.personalInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(app => filters.status!.includes(app.status))
    }

    // Apply type filter
    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter(app => filters.type!.includes(app.type))
    }

    // Apply priority filter
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(app => filters.priority!.includes(app.priority))
    }

    // Sort applications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        case 'type':
          return a.type.localeCompare(b.type)
        default:
          return 0
      }
    })

    return filtered
  }, [applications, searchTerm, filters, sortBy])

  const getStatCardColor = (type: string) => {
    switch (type) {
      case 'pending': return 'border-amber-200 bg-amber-50'
      case 'underReview': return 'border-blue-200 bg-blue-50'
      case 'approved': return 'border-green-200 bg-green-50'
      case 'rejected': return 'border-red-200 bg-red-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm("")
    setSortBy('date')
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={`p-6 ${getStatCardColor('pending')}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">Pending Review</p>
              <p className="text-2xl font-bold text-amber-900">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-amber-600">Requires immediate attention</p>
          </div>
        </Card>

        <Card className={`p-6 ${getStatCardColor('underReview')}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Under Review</p>
              <p className="text-2xl font-bold text-blue-900">{stats.underReview}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-blue-600">Currently being processed</p>
          </div>
        </Card>

        <Card className={`p-6 ${getStatCardColor('approved')}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Approved</p>
              <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <p className="text-xs text-green-600">{stats.approvalRate}% approval rate</p>
            </div>
          </div>
        </Card>

        <Card className={`p-6 ${components.card.base}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Avg Review Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageReviewTime}h</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-600">Target: 48h or less</p>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className={`p-6 ${components.card.base}`}>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="flex-1">
            <StandardizedInput
              label="Search Applications"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={filters.status?.[0] || ""} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, status: value ? [value as Application['status']] : undefined }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="requires_info">Requires Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
              <Select value={filters.type?.[0] || ""} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, type: value ? [value as Application['type']] : undefined }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="caregiver">Caregivers</SelectItem>
                  <SelectItem value="provider">Providers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
              <Select value={filters.priority?.[0] || ""} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, priority: value ? [value as Application['priority']] : undefined }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <StandardizedButton
              variant="ghost"
              onClick={clearFilters}
              leftIcon={<XCircle className="h-4 w-4" />}
            >
              Clear
            </StandardizedButton>
            <StandardizedButton
              variant="secondary"
              leftIcon={<Download className="h-4 w-4" />}
            >
              Export
            </StandardizedButton>
          </div>
        </div>

        {/* Active Filters */}
        {(filters.status || filters.type || filters.priority || searchTerm) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <Badge className={components.badge.primary}>
                  Search: {searchTerm}
                </Badge>
              )}
              {filters.status && (
                <Badge className={components.badge.primary}>
                  Status: {filters.status[0]}
                </Badge>
              )}
              {filters.type && (
                <Badge className={components.badge.primary}>
                  Type: {filters.type[0]}
                </Badge>
              )}
              {filters.priority && (
                <Badge className={components.badge.primary}>
                  Priority: {filters.priority[0]}
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Applications ({filteredApplications.length})
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-pink-600" />
              <span className="text-sm text-gray-600">
                {filteredApplications.filter(app => app.type === 'caregiver').length} Caregivers
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">
                {filteredApplications.filter(app => app.type === 'provider').length} Providers
              </span>
            </div>
          </div>
        </div>

        <PrimaryActionButton
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Bulk Actions
        </PrimaryActionButton>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((application) => (
            <ApplicationReviewCard
              key={application.id}
              application={application}
              onReview={onReview}
            />
          ))
        ) : (
          <Card className={`p-12 text-center ${components.card.base}`}>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.keys(filters).length > 0
                ? "Try adjusting your filters or search terms"
                : "No applications have been submitted yet"
              }
            </p>
            {(searchTerm || Object.keys(filters).length > 0) && (
              <StandardizedButton onClick={clearFilters}>
                Clear all filters
              </StandardizedButton>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

export const AdminDashboard = React.memo(AdminDashboardComponent)
AdminDashboard.displayName = "AdminDashboard"