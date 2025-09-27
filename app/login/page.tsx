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
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        handleError("Invalid email or password. Please check your credentials and try again.")
      } else if (result?.ok) {
        // Successful login - redirect based on user role
        router.push('/health/dashboard')
      }
    } catch (err) {
      handleError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />

      <main className="pt-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 py-8 md:py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Secure Login
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
              Welcome back
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Sign in to access your personalized health dashboard
            </p>
          </div>

          {/* Login Form */}
          <Card className={`p-6 md:p-8 ${components.card.base}`}>
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
                  className="w-full"
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
                <div className="flex gap-3 justify-center">
                  <Link href="/register?provider=provider" className="text-xs text-blue-600 hover:text-blue-800">
                    Provider Signup
                  </Link>
                  <span className="text-gray-300">•</span>
                  <Link href="/login?emergency=true" className="text-xs text-red-600 hover:text-red-800">
                    Emergency Access
                  </Link>
                </div>
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