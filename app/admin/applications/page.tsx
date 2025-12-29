"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageLoading } from "@/components/ui/loading"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"

/**
 * This page redirects to the new admin pages.
 * Provider applications: /admin/provider-applications
 * Caregiver applications: /admin/caregiver-applications
 */
export default function AdminApplicationsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to provider applications by default
    router.replace("/admin/provider-applications")
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />
      <main className="pt-16">
        <PageLoading 
          title="Redirecting..."
          description="Taking you to the applications page..."
        />
      </main>
    </div>
  )
}
