"use client"

import React, { useState, useEffect } from "react"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { PageLoading } from "@/components/ui/loading"
import { FormError, useErrorHandler } from "@/components/ui/error-boundary"
import { SuccessMessage } from "@/components/ui/error-boundary"
import { mockApplications, mockApplicationStats } from "@/lib/mock-admin-data"
import { notificationService } from "@/lib/admin-notifications"
import type { Application, ReviewAction } from "@/types/admin"

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState(mockApplicationStats)
  const [isLoading, setIsLoading] = useState(true)
  const { error, handleError, clearError } = useErrorHandler()

  // Simulate loading applications
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setIsLoading(true)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        setApplications(mockApplications)
        setStats(mockApplicationStats)
      } catch (err) {
        handleError("Failed to load applications. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadApplications()
  }, [handleError])

  const handleApplicationReview = async (applicationId: string, action: ReviewAction) => {
    try {
      // Find the application being reviewed
      const application = applications.find(app => app.id === applicationId)
      if (!application) {
        throw new Error("Application not found")
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Send notifications
      console.log(`📧 Sending ${action.type} notifications for ${application.personalInfo.firstName} ${application.personalInfo.lastName}`)
      const notificationResults = await notificationService.sendReviewNotifications(
        application,
        action,
        'Current Admin' // In real app, get from auth context
      )
      
      console.log('Notification results:', notificationResults)
      
      // Update application status
      setApplications(prev => prev.map(app => {
        if (app.id === applicationId) {
          const newStatus = action.type === 'approve' ? 'approved' : 
                           action.type === 'reject' ? 'rejected' :
                           action.type === 'request_info' ? 'requires_info' : 'under_review'
          
          return {
            ...app,
            status: newStatus,
            notes: action.notes,
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'Current Admin' // In real app, get from auth context
          }
        }
        return app
      }))

      // Update stats
      setStats(prev => {
        const newStats = { ...prev }
        
        if (action.type === 'approve') {
          newStats.approved += 1
          newStats.pending -= 1
        } else if (action.type === 'reject') {
          newStats.rejected += 1
          newStats.pending -= 1
        } else if (action.type === 'request_info') {
          newStats.requiresInfo += 1
          newStats.pending -= 1
        } else {
          newStats.underReview += 1
          newStats.pending -= 1
        }
        
        // Recalculate approval rate
        const totalProcessed = newStats.approved + newStats.rejected
        newStats.approvalRate = totalProcessed > 0 ? Math.round((newStats.approved / totalProcessed) * 100) : 0
        
        return newStats
      })

      clearError()
    } catch (err) {
      handleError("Failed to submit review. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MinimalNavigation />
        <main className="pt-16">
          <PageLoading 
            title="Loading Applications"
            description="Fetching caregiver and provider applications..."
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Application Review Center</h1>
                <p className="text-gray-600 mt-2">
                  Review and manage caregiver and healthcare provider applications
                </p>
              </div>
              
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Admin Portal</span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6">
              <FormError 
                message={error}
                onRetry={() => window.location.reload()}
              />
            </div>
          )}

          {/* Admin Dashboard */}
          <AdminDashboard
            applications={applications}
            stats={stats}
            onReview={handleApplicationReview}
          />
        </div>
      </main>
    </div>
  )
}
