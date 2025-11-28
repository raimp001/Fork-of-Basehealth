"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, ArrowRight, Shield, Users, Activity, CheckCircle } from "lucide-react"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    agreeToPrivacy: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Validate terms agreement
    if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
      setError("Please agree to the terms and privacy policy")
      setIsLoading(false)
      return
    }

    try {
      // Simulate registration API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // For demo purposes, redirect to screening
      window.location.href = "/screening"
    } catch (err) {
      setError("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50">
      <MinimalNavigation />

      <main className="pt-20 md:pt-24">
        <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-800 text-white text-sm font-semibold mb-6 shadow-md">
              <CheckCircle className="h-4 w-4" />
              Join BaseHealth
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4 tracking-tight">
              Create your account
            </h1>
            <p className="text-lg text-stone-600 leading-relaxed">
              Start your personalized health journey today
            </p>
          </div>

          {/* Registration Form */}
          <Card className="p-8 border-2 border-stone-200 shadow-lg bg-white">
            <div className="mb-6 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-900">Your health data is HIPAA-compliant and never sold.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-semibold text-stone-900 mb-2 block">
                    First name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                    className="border-2 border-stone-300 bg-white text-stone-900 placeholder:text-stone-600 placeholder:font-normal hover:border-stone-400 focus:border-stone-500 focus:ring-2 focus:ring-stone-400/20 rounded-lg h-11 transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-semibold text-stone-900 mb-2 block">
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                    className="border-2 border-stone-300 bg-white text-stone-900 placeholder:text-stone-600 placeholder:font-normal hover:border-stone-400 focus:border-stone-500 focus:ring-2 focus:ring-stone-400/20 rounded-lg h-11 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  className="border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create a strong password"
                    className="border-gray-200 focus:border-gray-400 focus:ring-gray-100 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-stone-500 mt-1">At least 8 characters, one number, one special character</p>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                  Confirm password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your password"
                    className="border-gray-200 focus:border-gray-400 focus:ring-gray-100 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3">
                  <Checkbox
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToTerms: !!checked }))}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{" "}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                      Terms of Service
                    </Link>
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <Checkbox
                    checked={formData.agreeToPrivacy}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToPrivacy: !!checked }))}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 h-12 rounded-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </Card>

          {/* Features */}
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600">HIPAA Compliant</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-600">Secure Access</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-xs text-gray-600">24/7 Available</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}