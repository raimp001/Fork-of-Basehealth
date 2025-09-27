import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { EnhancedHealthDashboard } from "./enhanced-dashboard"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"

export default function HealthDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />
      <div className="container mx-auto py-6 pt-24">
        <Suspense fallback={<DashboardSkeleton />}>
          <EnhancedHealthDashboard />
        </Suspense>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-[180px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  )
}
