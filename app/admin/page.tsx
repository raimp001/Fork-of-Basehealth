"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { LoadingSpinner } from "@/components/ui/loading"
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Stethoscope,
  Heart,
  ArrowRight,
  RefreshCw,
  Database
} from "lucide-react"

interface Stats {
  providers: {
    total: number
    pending: number
    verified: number
  }
  caregivers: {
    total: number
    pending: number
    available: number
  }
  database: boolean
}

export default function AdminPortalPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      // Fetch real stats from both APIs in parallel
      const [providersRes, caregiversRes] = await Promise.all([
        fetch("/api/admin/providers"),
        fetch("/api/admin/caregivers")
      ])

      const providersData = await providersRes.json()
      const caregiversData = await caregiversRes.json()

      setStats({
        providers: providersData.stats || { total: 0, pending: 0, verified: 0 },
        caregivers: caregiversData.stats || { total: 0, pending: 0, available: 0 },
        database: providersData.success && caregiversData.success
      })
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      setStats({
        providers: { total: 0, pending: 0, verified: 0 },
        caregivers: { total: 0, pending: 0, available: 0 },
        database: false
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const totalPending = (stats?.providers.pending || 0) + (stats?.caregivers.pending || 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />
      
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Review and manage applications
                </p>
              </div>
              
              <Button variant="outline" size="sm" onClick={fetchStats} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {isLoading && !stats ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{totalPending}</p>
                      <p className="text-xs text-gray-500">Pending</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats?.providers.total || 0}</p>
                      <p className="text-xs text-gray-500">Providers</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Heart className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats?.caregivers.total || 0}</p>
                      <p className="text-xs text-gray-500">Caregivers</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {(stats?.providers.verified || 0) + (stats?.caregivers.available || 0)}
                      </p>
                      <p className="text-xs text-gray-500">Verified</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-gray-700 mb-3">Applications</h2>
                
                <Link href="/admin/provider-applications">
                  <Card className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Stethoscope className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Provider Applications</p>
                          <p className="text-sm text-gray-500">
                            {stats?.providers.pending || 0} pending review
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(stats?.providers.pending || 0) > 0 && (
                          <Badge className="bg-amber-100 text-amber-700">
                            {stats?.providers.pending} new
                          </Badge>
                        )}
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Card>
                </Link>

                <Link href="/admin/caregiver-applications">
                  <Card className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                          <Heart className="h-5 w-5 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Caregiver Applications</p>
                          <p className="text-sm text-gray-500">
                            {stats?.caregivers.pending || 0} pending review
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(stats?.caregivers.pending || 0) > 0 && (
                          <Badge className="bg-amber-100 text-amber-700">
                            {stats?.caregivers.pending} new
                          </Badge>
                        )}
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>

              {/* Database Status */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Database className="h-4 w-4" />
                    <span>Database</span>
                    {stats?.database ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Disconnected
                      </span>
                    )}
                  </div>
                  {lastUpdated && (
                    <span className="text-gray-400">
                      Updated {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
