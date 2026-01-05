"use client"

import React from "react"
import { cn } from "@/lib/utils"

// Base Skeleton with shimmer animation
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-stone-200",
        "before:absolute before:inset-0",
        "before:translate-x-[-100%]",
        "before:animate-shimmer",
        "before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

// Provider Card Skeleton - for search results
export function ProviderCardSkeleton() {
  return (
    <div className="p-6 bg-white border-2 border-stone-200 rounded-xl">
      <div className="flex gap-4">
        <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="mt-4 flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  )
}

// Clinical Trial Card Skeleton
export function TrialCardSkeleton() {
  return (
    <div className="p-6 bg-white border border-stone-200 rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-6 w-4/5" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  )
}

// Screening Recommendation Skeleton
export function ScreeningCardSkeleton() {
  return (
    <div className="p-6 bg-white border border-stone-200 rounded-xl">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  )
}

// Dashboard Stats Skeleton
export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 bg-white border border-stone-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

// Health Profile Form Skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-12 w-full rounded-lg mt-4" />
    </div>
  )
}

// Appointment Card Skeleton
export function AppointmentCardSkeleton() {
  return (
    <div className="p-4 bg-white border border-stone-200 rounded-xl flex items-center gap-4">
      <Skeleton className="h-14 w-14 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  )
}

// Chat Message Skeleton
export function ChatMessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className={cn("space-y-2 max-w-[80%]", isUser && "items-end")}>
        <Skeleton className={cn("h-4 w-16", isUser && "ml-auto")} />
        <Skeleton className={cn("h-20 w-64 rounded-xl", isUser ? "rounded-tr-sm" : "rounded-tl-sm")} />
      </div>
    </div>
  )
}

// Notification Item Skeleton
export function NotificationSkeleton() {
  return (
    <div className="p-4 flex items-start gap-3 border-b border-stone-100">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

// Activity Timeline Skeleton
export function TimelineSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <Skeleton className="h-8 w-8 rounded-full" />
            {i < items - 1 && <Skeleton className="w-0.5 h-12 mt-2" />}
          </div>
          <div className="flex-1 pb-4">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Search Results Skeleton
export function SearchResultsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProviderCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Full Page Loading with branding
export function FullPageSkeleton({ title }: { title?: string }) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav skeleton */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between z-50">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="pt-24 pb-8 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <Skeleton className="h-6 w-32 mx-auto mb-4 rounded-full" />
          <Skeleton className="h-10 w-64 mx-auto mb-2" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>
        
        <Skeleton className="h-16 w-full max-w-2xl mx-auto rounded-xl mb-8" />
        
        <SearchResultsSkeleton />
      </div>
    </div>
  )
}

