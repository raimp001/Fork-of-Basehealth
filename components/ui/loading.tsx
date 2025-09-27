"use client"

import React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <Loader2 
      className={cn("animate-spin text-gray-400", sizeClasses[size], className)} 
    />
  )
}

interface LoadingDotsProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingDots({ size = "md", className }: LoadingDotsProps) {
  const dotSizes = {
    sm: "h-1 w-1",
    md: "h-2 w-2",
    lg: "h-3 w-3"
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-gray-400 rounded-full animate-pulse",
            dotSizes[size],
            i === 1 && "animation-delay-100",
            i === 2 && "animation-delay-200"
          )}
        />
      ))}
    </div>
  )
}

interface PageLoadingProps {
  title?: string
  description?: string
}

export function PageLoading({ title = "Loading...", description }: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

interface CardSkeletonProps {
  rows?: number
  showImage?: boolean
  className?: string
}

export function CardSkeleton({ rows = 3, showImage = false, className }: CardSkeletonProps) {
  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg p-6", className)}>
      <div className="space-y-4">
        {showImage && (
          <Skeleton className="h-48 w-full rounded-lg" />
        )}
        
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full" />
          ))}
          <Skeleton className="h-3 w-1/2" />
        </div>
        
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  )
}

interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className={cn(
          "grid gap-4",
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-3", 
          columns === 4 && "grid-cols-4",
          columns === 5 && "grid-cols-5",
          columns === 6 && "grid-cols-6"
        )}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className={cn(
              "grid gap-4",
              columns === 2 && "grid-cols-2",
              columns === 3 && "grid-cols-3", 
              columns === 4 && "grid-cols-4",
              columns === 5 && "grid-cols-5",
              columns === 6 && "grid-cols-6"
            )}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ProviderCardSkeletonProps {
  className?: string
}

export function ProviderCardSkeleton({ className }: ProviderCardSkeletonProps) {
  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg p-6", className)}>
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface DashboardSkeletonProps {
  className?: string
}

export function DashboardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CardSkeleton rows={4} />
          <CardSkeleton rows={2} showImage />
        </div>
        <div className="space-y-6">
          <CardSkeleton rows={2} />
          <CardSkeleton rows={3} />
        </div>
      </div>
    </div>
  )
}

// Button Loading State
interface ButtonLoadingProps {
  children: React.ReactNode
  isLoading?: boolean
  loadingText?: string
  className?: string
}

export function ButtonLoading({ 
  children, 
  isLoading = false, 
  loadingText,
  className 
}: ButtonLoadingProps) {
  if (!isLoading) return <>{children}</>
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LoadingSpinner size="sm" />
      {loadingText || "Loading..."}
    </div>
  )
}

// Form Loading Overlay
interface FormLoadingProps {
  isLoading: boolean
  message?: string
  children: React.ReactNode
}

export function FormLoading({ isLoading, message = "Processing...", children }: FormLoadingProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="text-center space-y-2">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
