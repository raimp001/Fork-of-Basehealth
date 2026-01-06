"use client"

/**
 * Login Page - Palantir-Inspired Design
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Activity, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Please enter your email and password.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      router.push('/patient-portal')
    } catch (err) {
      setError('Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-medium">BaseHealth</span>
        </Link>

        <div className={`max-w-lg ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h1 className="text-5xl font-medium tracking-tight mb-6">
            Healthcare Intelligence
            <br />
            <span className="text-neutral-500">at Your Fingertips</span>
          </h1>
          <p className="text-xl text-neutral-400 leading-relaxed">
            Access personalized health screenings, verified providers, 
            and clinical trial matching—all in one secure platform.
          </p>
        </div>

        <p className="text-sm text-neutral-600">
          © 2026 BaseHealth. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className={`w-full max-w-md ${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-medium">BaseHealth</span>
            </Link>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-medium tracking-tight mb-2">Welcome back</h2>
            <p className="text-neutral-500">Sign in to your account to continue.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-neutral-950 border border-white/10 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-neutral-400">Password</label>
                <Link href="/forgot-password" className="text-sm text-neutral-500 hover:text-white transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-neutral-950 border border-white/10 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-white text-black font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-neutral-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-white hover:underline">
              Create one
            </Link>
          </p>

          <p className="mt-6 text-center">
            <Link href="/provider/login" className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors">
              Healthcare provider? Sign in here →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
