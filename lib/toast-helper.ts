/**
 * Toast Helper Utilities
 * 
 * Provides convenient functions for showing toast notifications
 * throughout the application
 */

import { toast as showToast } from "@/hooks/use-toast"

interface ToastOptions {
  title?: string
  description?: string
  duration?: number
}

/**
 * Show success toast
 */
export function toastSuccess(options: ToastOptions | string) {
  const opts = typeof options === 'string' 
    ? { description: options } 
    : options

  showToast({
    title: opts.title || "Success",
    description: opts.description || "",
    variant: "default",
    duration: opts.duration || 5000,
  })
}

/**
 * Show error toast
 */
export function toastError(options: ToastOptions | string) {
  const opts = typeof options === 'string' 
    ? { description: options } 
    : options

  showToast({
    title: opts.title || "Error",
    description: opts.description || "Something went wrong. Please try again.",
    variant: "destructive",
    duration: opts.duration || 7000,
  })
}

/**
 * Show warning toast
 */
export function toastWarning(options: ToastOptions | string) {
  const opts = typeof options === 'string' 
    ? { description: options } 
    : options

  showToast({
    title: opts.title || "Warning",
    description: opts.description || "",
    variant: "default",
    duration: opts.duration || 5000,
  })
}

/**
 * Show info toast
 */
export function toastInfo(options: ToastOptions | string) {
  const opts = typeof options === 'string' 
    ? { description: options } 
    : options

  showToast({
    title: opts.title || "Info",
    description: opts.description || "",
    variant: "default",
    duration: opts.duration || 4000,
  })
}

/**
 * Show loading toast (returns dismiss function)
 */
export function toastLoading(message: string) {
  const { id } = showToast({
    title: "Loading",
    description: message,
    variant: "default",
    duration: Infinity, // Don't auto-dismiss
  })

  return () => {
    showToast.dismiss(id)
  }
}
