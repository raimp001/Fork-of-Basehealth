"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProviderVerification } from "@/components/admin/provider-verification"
import { UserManagement } from "@/components/admin/user-management"
import { SystemSettings } from "@/components/admin/system-settings"
import { Users, ShieldCheck, Activity } from "lucide-react"
import type { Admin } from "@/types/user"

interface AdminDashboardProps {
  admin: Admin
}

export function AdminDashboard({ admin }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    pendingVerifications: 0,
    activeAppointments: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setIsLoading(true)

        // Fetch admin stats
        const statsResponse = await fetch("/api/admin/stats")
        if (!statsResponse.ok) throw new Error("Failed to fetch admin statistics")
        const statsData = await statsResponse.json()

        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalProviders: statsData.totalProviders || 0,
          pendingVerifications: statsData.pendingVerifications || 0,
          activeAppointments: statsData.activeAppointments || 0,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Providers</p>
                <h3 className="text-2xl font-bold">{stats.totalProviders}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Verifications</p>
                <h3 className="text-2xl font-bold">{stats.pendingVerifications}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Appointments</p>
                <h3 className="text-2xl font-bold">{stats.activeAppointments}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="provider-verification">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="provider-verification">Provider Verification</TabsTrigger>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
          <TabsTrigger value="system-settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="provider-verification" className="space-y-4">
          <ProviderVerification />
        </TabsContent>

        <TabsContent value="user-management" className="space-y-4">
          <UserManagement />
        </TabsContent>

        <TabsContent value="system-settings" className="space-y-4">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
