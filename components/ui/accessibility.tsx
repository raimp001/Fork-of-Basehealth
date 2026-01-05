"use client"

/**
 * Accessibility Components and Utilities
 * Improves keyboard navigation, screen reader support, and focus management
 */

import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

/**
 * Skip to Content Link
 * Allows keyboard users to skip navigation and go directly to main content
 */
export function SkipToContent({ contentId = "main-content" }: { contentId?: string }) {
  return (
    <a
      href={`#${contentId}`}
      className="skip-to-content"
    >
      Skip to main content
    </a>
  )
}

/**
 * Focus Trap
 * Traps focus within a container (useful for modals, dialogs)
 */
export function FocusTrap({
  children,
  active = true,
}: {
  children: React.ReactNode
  active?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    // Focus first element on mount
    firstElement?.focus()

    container.addEventListener("keydown", handleKeyDown)
    return () => container.removeEventListener("keydown", handleKeyDown)
  }, [active])

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {children}
    </div>
  )
}

/**
 * Announce to Screen Reader
 * Announces messages to screen readers using aria-live regions
 */
export function Announcer() {
  const [message, setMessage] = useState("")

  useEffect(() => {
    const handleAnnounce = (e: CustomEvent<string>) => {
      setMessage(e.detail)
      // Clear after announcement
      setTimeout(() => setMessage(""), 1000)
    }

    window.addEventListener("announce", handleAnnounce as EventListener)
    return () => window.removeEventListener("announce", handleAnnounce as EventListener)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

// Helper function to announce messages
export function announce(message: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("announce", { detail: message }))
  }
}

/**
 * Keyboard Shortcut Handler
 * Provides keyboard shortcuts for power users
 */
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Build key string
      const keyString = [
        e.ctrlKey && "ctrl",
        e.metaKey && "cmd",
        e.altKey && "alt",
        e.shiftKey && "shift",
        e.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join("+")

      if (shortcuts[keyString]) {
        e.preventDefault()
        shortcuts[keyString]()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts])
}

/**
 * Focus Visible Wrapper
 * Adds focus-visible styling to children
 */
export function FocusVisible({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("focus-visible-ring", className)}>
      {children}
    </div>
  )
}

/**
 * Reduced Motion Wrapper
 * Respects user's reduced motion preferences
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return prefersReducedMotion
}

/**
 * Accessible Icon Button
 * Icon button with proper accessibility attributes
 */
export function IconButton({
  children,
  label,
  onClick,
  className,
  disabled = false,
}: {
  children: React.ReactNode
  label: string
  onClick?: () => void
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-lg p-2 transition-colors",
        "hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-stone-900 focus-visible:ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-label={label}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

/**
 * Accessible Link Component
 * Link with proper focus and hover states
 */
export function AccessibleLink({
  href,
  children,
  external = false,
  className,
}: {
  href: string
  children: React.ReactNode
  external?: boolean
  className?: string
}) {
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {}

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 underline underline-offset-2",
        "hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-stone-900 focus-visible:ring-offset-2 rounded",
        className
      )}
      {...externalProps}
    >
      {children}
      {external && (
        <span className="sr-only">(opens in new tab)</span>
      )}
    </Link>
  )
}

/**
 * Progress Indicator with Accessibility
 */
export function AccessibleProgress({
  value,
  max = 100,
  label,
  className,
}: {
  value: number
  max?: number
  label: string
  className?: string
}) {
  const percentage = Math.round((value / max) * 100)

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-stone-700">{label}</span>
        <span className="text-sm text-stone-500">{percentage}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="h-2 bg-stone-200 rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-stone-900 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Loading State with Accessibility
 */
export function AccessibleLoading({
  message = "Loading...",
}: {
  message?: string
}) {
  return (
    <div role="status" aria-busy="true" className="flex items-center gap-2">
      <div className="animate-spin h-5 w-5 border-2 border-stone-300 border-t-stone-900 rounded-full" />
      <span className="text-sm text-stone-600">{message}</span>
      <span className="sr-only">Please wait</span>
    </div>
  )
}

/**
 * Error Message with Accessibility
 */
export function AccessibleError({
  message,
  id,
}: {
  message: string
  id?: string
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      id={id}
      className="text-sm text-red-600 flex items-center gap-2 mt-1"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </div>
  )
}

/**
 * Visually Hidden
 * Hides content visually but keeps it accessible to screen readers
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}

