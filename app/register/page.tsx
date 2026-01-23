"use client"

/**
 * Register Page - Claude.ai Design
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, Eye, EyeOff, Check } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const passwordChecks = [
    { label: '8+ characters', valid: formData.password.length >= 8 },
    { label: 'Contains number', valid: /\d/.test(formData.password) },
    { label: 'Contains letter', valid: /[a-zA-Z]/.test(formData.password) },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all fields.')
      return
    }

    if (!passwordChecks.every(c => c.valid)) {
      setError('Please meet all password requirements.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      router.push('/patient-portal')
    } catch (err) {
      setError('Registration failed. Please try again.')
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
            Start Your Health
            <br />
            <span style={{ color: 'var(--text-secondary)' }}>Journey Today</span>
          </h1>
          <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
            Access personalized health screenings, verified providers, 
            and clinical trial matching—all in one platform.
          </p>
          
          <ul className="space-y-3">
            {[
              'USPSTF-based screening recommendations',
              '1M+ NPI-verified healthcare providers',
              'HIPAA-compliant data protection',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
                <Check className="h-5 w-5" style={{ color: '#6b9b6b' }} />
                {item}
              </li>
            ))}
          </ul>
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
            <h2 className="text-2xl font-medium tracking-tight mb-2">Create Account</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Get started with personalized healthcare.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg text-sm" style={{ backgroundColor: 'rgba(220, 100, 100, 0.1)', color: '#dc6464', border: '1px solid rgba(220, 100, 100, 0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none transition-colors"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Smith"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none transition-colors"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
            </div>

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
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
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
              {formData.password && (
                <div className="flex gap-4 mt-2">
                  {passwordChecks.map((check, i) => (
                    <span key={i} className="text-xs" style={{ color: check.valid ? '#6b9b6b' : 'var(--text-muted)' }}>
                      {check.valid && <Check className="h-3 w-3 inline mr-1" />}
                      {check.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>Terms</Link>{' '}
              and{' '}
              <Link href="/privacy" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</Link>.
            </p>
          </form>

          <p className="mt-6 text-center" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--text-primary)' }}>
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center">
            <Link href="/provider/signup" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
              Healthcare provider? Register here →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
