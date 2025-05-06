import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import AppointmentRequestClient from "./client"

export default function OnDemandRequestPage() {
  return (
    <div className="container py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Request On-Demand Healthcare</h1>
      <Suspense
        fallback={
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-2/3" />
              </div>
            </CardContent>
          </Card>
        }
      >
        <AppointmentRequestClient />
      </Suspense>
    </div>
  )
}
