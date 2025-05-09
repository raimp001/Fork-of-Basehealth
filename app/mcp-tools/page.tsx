import { Suspense } from "react"
import McpToolsClient from "./client"
import { Skeleton } from "@/components/ui/skeleton"

export default function McpToolsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Model Context Protocol Tools</h1>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-[500px] w-full rounded-lg" />
          </div>
        }
      >
        <McpToolsClient />
      </Suspense>
    </div>
  )
}
