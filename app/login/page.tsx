"use client"

/**
 * Login Page - Claude.ai Design
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react"

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
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r" style={{ borderColor: 'var(--border-subtle)' }}>
        <Link href="/" className="text-lg font-medium tracking-tight hover:opacity-80 transition-opacity">
          BaseHealth
        </Link>

        <div className={`max-w-lg ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h1 className="text-4xl font-normal tracking-tight mb-4" style={{ lineHeight: '1.2' }}>
            Healthcare Intelligence
            <br />
            <span style={{ color: 'var(--text-secondary)' }}>at Your Fingertips</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Access personalized health screenings, verified providers, 
            and clinical trial matching—all in one secure platform.
          </p>
        </div>

        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          © 2026 BaseHealth. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className={`w-full max-w-md ${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10">
            <Link href="/" className="text-lg font-medium tracking-tight hover:opacity-80 transition-opacity">
              BaseHealth
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-medium tracking-tight mb-2">Welcome back</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Sign in to your account to continue.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg text-sm" style={{ backgroundColor: 'rgba(220, 100, 100, 0.1)', color: '#dc6464', border: '1px solid rgba(220, 100, 100, 0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg focus:outline-none transition-colors"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <Link href="/forgot-password" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none transition-colors pr-12"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
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

          <p className="mt-6 text-center" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link href="/register" className="font-medium hover:underline" style={{ color: 'var(--text-primary)' }}>
              Create one
            </Link>
          </p>

          <p className="mt-4 text-center">
            <Link href="/provider/login" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
              Healthcare provider? Sign in here →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
