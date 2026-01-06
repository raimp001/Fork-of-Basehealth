"use client"

/**
 * Register Page - Palantir-Grade Enterprise UI
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Activity, 
  Mail, 
  Lock, 
  User,
  ArrowRight, 
  AlertCircle,
  Loader2,
  Shield,
  Eye,
  EyeOff,
  Check,
  CheckCircle,
} from "lucide-react"

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
    agreeTerms: false,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'One number', met: /[0-9]/.test(formData.password) },
  ]

  const allRequirementsMet = passwordRequirements.every(req => req.met)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all fields.')
      return
    }

    if (!allRequirementsMet) {
      setError('Please meet all password requirements.')
      return
    }

    if (!formData.agreeTerms) {
      setError('Please agree to the terms and privacy policy.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      router.push('/onboarding/flow')
    } catch (err) {
      setError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07070c] text-white flex">
      {/* Background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col justify-between p-12 relative">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
              <Activity className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-semibold">BaseHealth</span>
          </Link>
        </div>

        <div className={`space-y-8 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            Start Your Health
            <br />
            <span className="text-zinc-500">Journey Today</span>
          </h1>

          <div className="space-y-4">
            {[
              { title: 'Personalized Screenings', desc: 'USPSTF-based recommendations' },
              { title: 'Verified Providers', desc: 'NPI-verified healthcare network' },
              { title: 'Clinical Trial Access', desc: 'AI-powered eligibility matching' },
              { title: 'Secure & Private', desc: 'HIPAA compliant platform' },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center mt-0.5">
                  <CheckCircle className="h-3 w-3 text-cyan-400" />
                </div>
                <div>
                  <div className="text-white font-medium">{feature.title}</div>
                  <div className="text-sm text-zinc-500">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm text-zinc-600">
          © 2026 BaseHealth. All rights reserved.
        </div>
      </div>

      {/* Right panel - register form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className={`w-full max-w-md ${mounted ? 'animate-fade-in-up animation-delay-100' : 'opacity-0'}`}>
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
                <Activity className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-semibold">BaseHealth</span>
            </Link>
          </div>

          <Card className="p-8 bg-white/[0.02] border-white/5 backdrop-blur-xl">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight mb-2">
                Create your account
              </h2>
              <p className="text-zinc-500">
                Get started with personalized healthcare.
              </p>
            </div>

            {/* Error */}
            {error && (
              <Alert className="mb-6 bg-red-500/10 border-red-500/20 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-zinc-400 mb-2 block">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-cyan-500/50"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-zinc-400 mb-2 block">Last Name</Label>
                  <Input
                    type="text"
                    placeholder="Smith"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-cyan-500/50"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-zinc-400 mb-2 block">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-cyan-500/50"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-zinc-400 mb-2 block">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-cyan-500/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password requirements */}
                {formData.password && (
                  <div className="mt-3 space-y-1">
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className={`flex items-center gap-2 text-xs ${req.met ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        <Check className={`h-3 w-3 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                        {req.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeTerms: !!checked }))}
                  className="mt-0.5 border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                />
                <Label htmlFor="terms" className="text-sm text-zinc-400 cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !formData.agreeTerms}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-medium disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-sm text-zinc-500">
                Already have an account?{' '}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Provider signup */}
            <div className="mt-6 text-center">
              <Link 
                href="/provider/signup" 
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Healthcare provider? Apply here →
              </Link>
            </div>
          </Card>

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-600">
            <Shield className="h-3.5 w-3.5" />
            Your data is encrypted and HIPAA compliant
          </div>
        </div>
      </div>
    </div>
  )
}
