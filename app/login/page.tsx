import { Suspense } from "react"
import LoginClient from "./client"

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Suspense fallback={<LoginSkeleton />}>
        <LoginClient />
      </Suspense>
    </div>
  )
}

function LoginSkeleton() {
  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
      <div className="space-y-4">
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/3 ml-auto"></div>
        <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mt-4"></div>
      </div>
    </div>
  )
}
