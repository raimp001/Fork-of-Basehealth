"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { components } from "@/lib/design-system"
import { LoadingSpinner } from "@/components/ui/loading"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: components.button.primary,
        secondary: components.button.secondary,
        success: components.button.success,
        warning: components.button.warning,
        error: components.button.error,
        ghost: components.button.ghost,
        link: components.button.link,
        outline: "border-2 border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 hover:text-gray-900",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const StandardizedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const isDisabled = disabled || loading

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            {loadingText || "Loading..."}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </Comp>
    )
  }
)
StandardizedButton.displayName = "StandardizedButton"

// Healthcare-specific button variants
export interface HealthcareButtonProps extends ButtonProps {
  healthcareVariant?: "medical" | "wellness" | "emergency" | "mental" | "specialty"
}

const healthcareButtonVariants = cva(
  buttonVariants(),
  {
    variants: {
      healthcareVariant: {
        medical: "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700",
        wellness: "bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700", 
        emergency: "bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700",
        mental: "bg-purple-600 hover:bg-purple-700 text-white border-purple-600 hover:border-purple-700",
        specialty: "bg-amber-600 hover:bg-amber-700 text-white border-amber-600 hover:border-amber-700",
      },
    },
  }
)

const HealthcareButton = React.forwardRef<HTMLButtonElement, HealthcareButtonProps>(
  ({ healthcareVariant, className, ...props }, ref) => {
    return (
      <StandardizedButton
        ref={ref}
        className={cn(
          healthcareVariant && healthcareButtonVariants({ healthcareVariant }),
          className
        )}
        {...props}
      />
    )
  }
)
HealthcareButton.displayName = "HealthcareButton"

// Action-specific button components for common use cases
export const PrimaryActionButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <StandardizedButton ref={ref} variant="primary" size="lg" {...props}>
      {children}
    </StandardizedButton>
  )
)
PrimaryActionButton.displayName = "PrimaryActionButton"

export const SecondaryActionButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <StandardizedButton ref={ref} variant="secondary" {...props}>
      {children}
    </StandardizedButton>
  )
)
SecondaryActionButton.displayName = "SecondaryActionButton"

export const DangerButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <StandardizedButton ref={ref} variant="error" {...props}>
      {children}
    </StandardizedButton>
  )
)
DangerButton.displayName = "DangerButton"

export const SuccessButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <StandardizedButton ref={ref} variant="success" {...props}>
      {children}
    </StandardizedButton>
  )
)
SuccessButton.displayName = "SuccessButton"

// Quick appointment booking button
export const BookAppointmentButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children = "Book Appointment", ...props }, ref) => (
    <HealthcareButton ref={ref} healthcareVariant="medical" size="lg" {...props}>
      {children}
    </HealthcareButton>
  )
)
BookAppointmentButton.displayName = "BookAppointmentButton"

// Emergency action button
export const EmergencyButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children = "Emergency", ...props }, ref) => (
    <HealthcareButton ref={ref} healthcareVariant="emergency" {...props}>
      {children}
    </HealthcareButton>
  )
)
EmergencyButton.displayName = "EmergencyButton"

export { 
  StandardizedButton, 
  HealthcareButton, 
  buttonVariants, 
  healthcareButtonVariants 
}
