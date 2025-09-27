"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PrimaryActionButton, StandardizedButton } from "@/components/ui/standardized-button"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { components } from "@/lib/design-system"
import { mockApplicationStats } from "@/lib/mock-admin-data"
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  TrendingUp,
  Activity,
  Bell,
  Settings,
  BarChart3,
  Calendar,
  Eye,
  ArrowRight
} from "lucide-react"

export default function AdminPortalPage() {
  const [stats, setStats] = useState(mockApplicationStats)
  const [recentActivity] = useState([
    {
      id: 1,
      type: "application_submitted",
      user: "Maria Rodriguez",
      role: "Caregiver",
      time: "2 hours ago",
      status: "pending"
    },
    {
      id: 2,
      type: "application_approved",
      user: "Dr. Sarah Kim",
      role: "Provider",
      time: "4 hours ago",
      status: "approved"
    },
    {
      id: 3,
      type: "verification_completed",
      user: "James Wilson",
      role: "Caregiver",
      time: "6 hours ago",
      status: "verified"
    },
    {
      id: 4,
      type: "application_rejected",
      user: "John Smith",
      role: "Provider",
      time: "1 day ago",
      status: "rejected"
    }
  ])

  const urgentTasks = [
    {
      id: 1,
      title: "Review pending caregiver applications",
      count: stats.pending,
      priority: "high",
      href: "/admin/applications?status=pending&type=caregiver"
    },
    {
      id: 2,
      title: "Complete provider verifications",
      count: 3,
      priority: "medium",
      href: "/admin/applications?verification=pending"
    },
    {
      id: 3,
      title: "Process interview requests",
      count: 2,
      priority: "medium",
      href: "/admin/applications?action=interview"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
                <p className="text-gray-600 mt-2">
                  Manage applications, providers, and platform operations
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm font-medium">System Healthy</span>
                </div>
                
                <StandardizedButton
                  variant="secondary"
                  leftIcon={<Settings className="h-4 w-4" />}
                >
                  Settings
                </StandardizedButton>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 border-amber-200 bg-amber-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">Pending Reviews</p>
                  <p className="text-2xl font-bold text-amber-900">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-2">
                <Link href="/admin/applications?status=pending" className="text-xs text-amber-600 hover:text-amber-800">
                  Review now →
                </Link>
              </div>
            </Card>

            <Card className="p-6 border-blue-200 bg-blue-50">
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
                <p className="text-xs text-blue-600">In progress</p>
              </div>
            </Card>

            <Card className="p-6 border-green-200 bg-green-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Approved This Month</p>
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
                <p className="text-xs text-gray-600">Target: 48h</p>
              </div>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card className={`p-6 ${components.card.base}`}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <PrimaryActionButton asChild className="justify-start">
                    <Link href="/admin/applications" className="flex items-center gap-3">
                      <Users className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Review Applications</div>
                        <div className="text-sm opacity-90">{stats.pending + stats.underReview} pending</div>
                      </div>
                    </Link>
                  </PrimaryActionButton>

                  <StandardizedButton asChild variant="secondary" className="justify-start">
                    <Link href="/admin/providers" className="flex items-center gap-3">
                      <Activity className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Manage Providers</div>
                        <div className="text-sm opacity-70">View active providers</div>
                      </div>
                    </Link>
                  </StandardizedButton>

                  <StandardizedButton asChild variant="secondary" className="justify-start">
                    <Link href="/admin/analytics" className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">View Analytics</div>
                        <div className="text-sm opacity-70">Platform insights</div>
                      </div>
                    </Link>
                  </StandardizedButton>

                  <StandardizedButton asChild variant="secondary" className="justify-start">
                    <Link href="/admin/settings" className="flex items-center gap-3">
                      <Settings className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">System Settings</div>
                        <div className="text-sm opacity-70">Configure platform</div>
                      </div>
                    </Link>
                  </StandardizedButton>
                </div>
              </Card>

              {/* Urgent Tasks */}
              <Card className={`p-6 ${components.card.base}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Urgent Tasks</h2>
                  <Badge className={components.badge.warning}>
                    {urgentTasks.reduce((sum, task) => sum + task.count, 0)} items
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {urgentTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' : 
                          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-600">{task.count} items</p>
                        </div>
                      </div>
                      <StandardizedButton asChild variant="ghost" size="sm">
                        <Link href={task.href}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </StandardizedButton>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column - Activity & Notifications */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <Card className={`p-6 ${components.card.base}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <StandardizedButton variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                    View All
                  </StandardizedButton>
                </div>
                
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        activity.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                        activity.status === 'verified' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {activity.user.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                        <p className="text-xs text-gray-600 capitalize">
                          {activity.type.replace('_', ' ')} • {activity.role}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                      <Badge className={
                        activity.status === 'pending' ? components.badge.warning :
                        activity.status === 'approved' ? components.badge.success :
                        activity.status === 'verified' ? components.badge.primary :
                        components.badge.error
                      }>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* System Status */}
              <Card className={`p-6 ${components.card.base}`}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Operational</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Healthy</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email Service</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Background Jobs</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-yellow-600">2 queued</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}