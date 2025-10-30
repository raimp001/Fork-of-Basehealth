"use client"

/**
 * Minimalistic Empty State Component
 * Shows when no data is available
 */

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { StandardizedButton } from './standardized-button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
  children?: ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  children
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-12 px-4',
      className
    )}>
      {/* Icon */}
      <div className="mb-4 rounded-full bg-gray-100 dark:bg-gray-800 p-6">
        <Icon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {description}
      </p>

      {/* Action Button */}
      {action && (
        action.href ? (
          <StandardizedButton asChild>
            <a href={action.href}>{action.label}</a>
          </StandardizedButton>
        ) : (
          <StandardizedButton onClick={action.onClick}>
            {action.label}
          </StandardizedButton>
        )
      )}

      {/* Custom Children */}
      {children}
    </div>
  )
}

