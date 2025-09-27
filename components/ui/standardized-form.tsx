"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { components } from "@/lib/design-system"
import { Eye, EyeOff, AlertCircle, CheckCircle, Info } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Standardized Input Component
export interface StandardizedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  success?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
}

const StandardizedInput = React.forwardRef<HTMLInputElement, StandardizedInputProps>(
  ({ 
    className, 
    type, 
    label, 
    error, 
    hint, 
    success,
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [inputType, setInputType] = React.useState(type)
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    React.useEffect(() => {
      if (showPasswordToggle && type === "password") {
        setInputType(showPassword ? "text" : "password")
      }
    }, [showPassword, showPasswordToggle, type])

    const hasError = !!error
    const hasSuccess = !!success && !hasError
    
    const inputClasses = cn(
      hasError ? components.input.error : components.input.base,
      leftIcon && "pl-10",
      (rightIcon || showPasswordToggle) && "pr-10",
      className
    )

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </Label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <Input
            type={inputType}
            id={inputId}
            className={inputClasses}
            ref={ref}
            {...props}
          />
          
          {showPasswordToggle && type === "password" && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          
          {rightIcon && !showPasswordToggle && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {hint && !error && !success && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{hint}</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-start gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="flex items-start gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </div>
    )
  }
)
StandardizedInput.displayName = "StandardizedInput"

// Standardized Textarea Component
export interface StandardizedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  success?: string
}

const StandardizedTextarea = React.forwardRef<HTMLTextAreaElement, StandardizedTextareaProps>(
  ({ className, label, error, hint, success, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!error
    
    const textareaClasses = cn(
      hasError ? components.input.error : components.input.base,
      "min-h-[120px] resize-y",
      className
    )

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={textareaId} className="text-sm font-medium text-gray-700">
            {label}
          </Label>
        )}
        
        <Textarea
          id={textareaId}
          className={textareaClasses}
          ref={ref}
          {...props}
        />
        
        {hint && !error && !success && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{hint}</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-start gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="flex items-start gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </div>
    )
  }
)
StandardizedTextarea.displayName = "StandardizedTextarea"

// Form Section Component
export interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

// Form Grid for responsive layouts
export interface FormGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function FormGrid({ children, columns = 2, className }: FormGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  }

  return (
    <div className={cn("grid gap-4", gridClasses[columns], className)}>
      {children}
    </div>
  )
}

// Healthcare-specific form components
export interface HealthInformationInputProps extends StandardizedInputProps {
  required?: boolean
  sensitive?: boolean
}

export const HealthInformationInput = React.forwardRef<HTMLInputElement, HealthInformationInputProps>(
  ({ sensitive = false, required = false, label, className, ...props }, ref) => {
    const enhancedLabel = required ? `${label} *` : label
    const enhancedHint = sensitive 
      ? "This information is encrypted and HIPAA compliant"
      : props.hint

    return (
      <StandardizedInput
        ref={ref}
        label={enhancedLabel}
        hint={enhancedHint}
        className={cn(
          sensitive && "bg-blue-50 border-blue-200 focus:border-blue-500",
          className
        )}
        {...props}
      />
    )
  }
)
HealthInformationInput.displayName = "HealthInformationInput"

export interface MedicalTextareaProps extends StandardizedTextareaProps {
  required?: boolean
  sensitive?: boolean
}

export const MedicalTextarea = React.forwardRef<HTMLTextAreaElement, MedicalTextareaProps>(
  ({ sensitive = false, required = false, label, className, ...props }, ref) => {
    const enhancedLabel = required ? `${label} *` : label
    const enhancedHint = sensitive 
      ? "This medical information is encrypted and HIPAA compliant"
      : props.hint

    return (
      <StandardizedTextarea
        ref={ref}
        label={enhancedLabel}
        hint={enhancedHint}
        className={cn(
          sensitive && "bg-blue-50 border-blue-200 focus:border-blue-500",
          className
        )}
        {...props}
      />
    )
  }
)
MedicalTextarea.displayName = "MedicalTextarea"

// Form validation helpers
export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return "Email is required"
  if (!emailRegex.test(email)) return "Please enter a valid email address"
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required"
  if (password.length < 8) return "Password must be at least 8 characters"
  if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter"
  if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter"
  if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number"
  return null
}

export function validatePhone(phone: string): string | null {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/
  if (!phone) return "Phone number is required"
  if (!phoneRegex.test(phone)) return "Please enter a valid phone number"
  return null
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`
  }
  return null
}

export { StandardizedInput, StandardizedTextarea }
