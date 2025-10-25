"use client"

/**
 * Minimalistic Caregiver List Component
 * Shows verified, available caregivers only (no mock data)
 */

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StandardizedButton } from '@/components/ui/standardized-button'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading'
import {
  MapPin,
  Star,
  Clock,
  Shield,
  CheckCircle,
  Heart,
  UserCheck,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Caregiver {
  id: string
  name: string
  specialty: string
  location: string
  distance?: number
  rating: number
  reviewCount: number
  hourlyRate: number
  availability: string
  isLicensed: boolean
  isCPRCertified: boolean
  isBackgroundChecked: boolean
  experience: string
  languages: string[]
  bio?: string
  certifications?: string[]
  services?: string[]
  status?: string
  isVerified?: boolean
  isMock?: boolean
}

interface CaregiverListProps {
  caregivers: Caregiver[]
  isLoading?: boolean
  onSelect?: (caregiver: Caregiver) => void
  className?: string
}

export function CaregiverList({
  caregivers,
  isLoading = false,
  onSelect,
  className
}: CaregiverListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Finding caregivers...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (caregivers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No Caregivers Available"
        description="There are no verified caregivers in your area at the moment. Check back soon or consider applying to become a caregiver."
        action={{
          label: 'Apply to Become a Caregiver',
          href: '/providers/caregiver-signup'
        }}
      />
    )
  }

  // Caregiver list
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {caregivers.map((caregiver) => (
        <Card key={caregiver.id} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{caregiver.name}</h3>
                <p className="text-sm text-muted-foreground">{caregiver.specialty}</p>
              </div>
              {caregiver.isVerified && (
                <Badge variant="outline" className="flex items-center gap-1 text-blue-600 border-blue-600">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{caregiver.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  ({caregiver.reviewCount} reviews)
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Location */}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{caregiver.location}</span>
              {caregiver.distance !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {caregiver.distance.toFixed(1)} mi
                </Badge>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className={cn(
                caregiver.availability.toLowerCase().includes('now') || 
                caregiver.availability.toLowerCase().includes('immediately')
                  ? 'text-green-600 font-medium'
                  : ''
              )}>
                {caregiver.availability}
              </span>
            </div>

            {/* Rate */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Hourly Rate:</span>
              <span className="font-semibold text-lg">${caregiver.hourlyRate}/hr</span>
            </div>

            {/* Certifications */}
            <div className="flex flex-wrap gap-2">
              {caregiver.isLicensed && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Licensed
                </Badge>
              )}
              {caregiver.isCPRCertified && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  CPR
                </Badge>
              )}
              {caregiver.isBackgroundChecked && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <UserCheck className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Experience */}
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{caregiver.experience}</span> experience
            </div>

            {/* Languages */}
            {caregiver.languages && caregiver.languages.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Speaks: {caregiver.languages.join(', ')}
              </div>
            )}
          </CardContent>

          <CardFooter>
            <StandardizedButton
              onClick={() => onSelect?.(caregiver)}
              className="w-full"
            >
              View Profile & Book
            </StandardizedButton>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

