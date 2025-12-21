"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { StandardizedInput, FormSection, validateEmail, validateRequired } from "@/components/ui/standardized-form"
import { PrimaryActionButton } from "@/components/ui/standardized-button"
import { FormError, useErrorHandler } from "@/components/ui/error-boundary"
import { LoadingSpinner } from "@/components/ui/loading"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, Shield, Users, Activity, CheckCircle, Smartphone, Lock } from "lucide-react"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { components } from "@/lib/design-system"
import Link from "next/link"
import { toastSuccess, toastError } from "@/lib/toast-helper"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const { error, handleError, clearError } = useErrorHandler()

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    const emailError = validateEmail(formData.email)
    if (emailError) errors.email = emailError
    
    const passwordError = validateRequired(formData.password, "Password")
    if (passwordError) errors.password = passwordError
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)

    try {
      // First try NextAuth login (for patients)
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.ok) {
        toastSuccess({
          title: "Welcome back!",
          description: "Redirecting to your dashboard...",
        })
        // Successful patient login - redirect to health dashboard
        router.push('/health/dashboard')
        return
      }

      // If NextAuth fails, try provider login
      try {
        const providerResponse = await fetch('/api/provider/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        })

        const providerData = await providerResponse.json()

        if (providerResponse.ok && providerData.success) {
          // Store provider token
          if (providerData.token) {
            localStorage.setItem('providerToken', providerData.token)
          }
          
          toastSuccess({
            title: "Welcome back!",
            description: "Redirecting to your provider dashboard...",
          })
          
          // Redirect to provider dashboard
          router.push('/provider/dashboard')
          return
        }
      } catch (providerErr) {
        // Provider login failed, continue to show error
        // Error will be handled below
      }

      // Both login attempts failed
      const errorMessage = "Invalid email or password. Please check your credentials and try again."
      handleError(errorMessage)
      toastError({
        title: "Login Failed",
        description: errorMessage,
      })
    } catch (err) {
      handleError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50">
      <MinimalNavigation />

      <main className="pt-20 md:pt-24">
        <div className="max-w-md mx-auto px-4 sm:px-6 py-8 md:py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-800 text-white text-sm font-semibold mb-6 shadow-md">
              <Shield className="h-4 w-4" />
              Secure Login
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4 tracking-tight">
              Welcome back
            </h1>
            <p className="text-lg text-stone-600 leading-relaxed">
              Sign in to access your personalized health dashboard
            </p>
          </div>

          {/* Login Form */}
          <Card className="p-8 border-2 border-stone-200 shadow-lg bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <FormError 
                  message={error}
                  onRetry={() => clearError()}
                />
              )}

              <FormSection>
                <StandardizedInput
                  label="Email address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email address"
                  error={validationErrors.email}
                  hint="We'll never share your email with anyone else"
                  required
                />

                <StandardizedInput
                  label="Password" 
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  error={validationErrors.password}
                  showPasswordToggle
                  required
                />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: !!checked }))}
                    />
                    <span className="text-sm text-gray-700">Remember me for 30 days</span>
                  </label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Forgot password?
                  </Link>
                </div>

                <PrimaryActionButton
                  type="submit"
                  loading={isLoading}
                  loadingText="Signing in..."
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 h-12"
                  rightIcon={!isLoading ? <ArrowRight className="h-4 w-4" /> : undefined}
                >
                  Sign in to your account
                </PrimaryActionButton>
              </FormSection>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                  Create free account
                </Link>
              </p>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 mb-2">Or continue with</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link href="/provider/signup" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    Provider Signup
                  </Link>
                  <span className="text-gray-300">•</span>
                  <Link href="/login?emergency=true" className="text-xs text-red-600 hover:text-red-800">
                    Emergency Access
                  </Link>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Healthcare providers can sign in with their email and password
                </p>
              </div>
            </div>
          </Card>

          {/* Trust Indicators - Mobile Optimized */}
          <div className="mt-8 md:mt-12">
            <p className="text-center text-xs text-gray-500 mb-4 md:mb-6">
              Trusted by thousands of patients and healthcare providers
            </p>
            
            <div className="grid grid-cols-3 gap-4 md:gap-6 text-center">
              <div className="group">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
                  <Shield className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-900">HIPAA Compliant</p>
                <p className="text-xs text-gray-500 mt-1">Enterprise security</p>
              </div>
              
              <div className="group">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-green-200 transition-colors">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-900">Verified Providers</p>
                <p className="text-xs text-gray-500 mt-1">Licensed professionals</p>
              </div>
              
              <div className="group">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-200 transition-colors">
                  <Smartphone className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-900">24/7 Access</p>
                <p className="text-xs text-gray-500 mt-1">Always available</p>
              </div>
            </div>
          </div>

          {/* Demo Credentials */}
          {process.env.NODE_ENV === "development" && (
            <Card className="mt-8 p-4 bg-amber-50 border-amber-200">
              <div className="text-center">
                <p className="text-sm font-medium text-amber-800 mb-2">Demo Credentials</p>
                <div className="space-y-1 text-xs text-amber-700">
                  <p><strong>Email:</strong> demo@example.com</p>
                  <p><strong>Password:</strong> Any password except "wrong"</p>
                  <p className="mt-2 text-amber-600">Try "wrong" as password to see error handling</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}