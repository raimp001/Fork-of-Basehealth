"use client"

/**
 * BaseHealth Homepage - Palantir-Grade Enterprise UI
 * Seamless, premium user experience
 */

import Link from "next/link"
import { useState, useEffect } from "react"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Search,
  Heart,
  FlaskConical,
  ArrowRight,
  Brain,
  User,
  FileText,
  Shield,
  Lock,
  Zap,
  CheckCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <MinimalNavigation />

      {/* Hero Section - Palantir-inspired */}
      <section className="relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
        
        <div className="relative px-6 pt-32 pb-24 md:pt-40 md:pb-32">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl">
              {/* Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium mb-8 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
                <Sparkles className="h-4 w-4" />
                <span>Enterprise Healthcare Platform</span>
              </div>

              {/* Hero Headline */}
              <h1 className={`text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8 ${mounted ? 'animate-fade-in-up animation-delay-100' : 'opacity-0'}`}>
                Healthcare,{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  simplified
                </span>
              </h1>

              {/* Subtitle */}
              <p className={`text-xl md:text-2xl text-slate-600 leading-relaxed mb-12 ${mounted ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
                Evidence-based health screenings, clinical trial matching, and expert care—all in one seamless, HIPAA-compliant platform.
              </p>

              {/* CTAs */}
              <div className={`flex flex-col sm:flex-row gap-4 ${mounted ? 'animate-fade-in-up animation-delay-300' : 'opacity-0'}`}>
                <Link
                  href="/screening"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Start Health Assessment
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/providers/search"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-xl font-semibold hover:border-slate-900 transition-all duration-300"
                >
                  Find Providers
                </Link>
              </div>

              {/* Trust indicators */}
              <div className={`mt-16 flex flex-wrap items-center gap-8 text-sm text-slate-500 ${mounted ? 'animate-fade-in animation-delay-400' : 'opacity-0'}`}>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="font-medium">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">End-to-End Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Base Blockchain</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Premium Grid */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Comprehensive Healthcare Platform
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to manage your health in one secure, enterprise-grade platform
            </p>
          </div>

          {/* Primary Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* AI Health Screening */}
            <Link href="/screening" className="group">
              <Card className="p-8 h-full border-slate-200 hover:border-slate-300 hover:shadow-premium-lg transition-all duration-500">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-semibold text-slate-900">AI Health Screening</h3>
                  <Badge className="bg-blue-600 text-white text-xs">New</Badge>
                </div>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Personalized recommendations based on USPSTF evidence-based guidelines
                </p>
                <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                  Learn more
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Clinical Trials */}
            <Link href="/clinical-trials" className="group">
              <Card className="p-8 h-full border-slate-200 hover:border-slate-300 hover:shadow-premium-lg transition-all duration-500">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FlaskConical className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Clinical Trials</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Match with cutting-edge research studies based on your health profile
                </p>
                <div className="flex items-center text-purple-600 font-medium group-hover:gap-2 transition-all">
                  Explore trials
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Find Providers */}
            <Link href="/providers/search" className="group">
              <Card className="p-8 h-full border-slate-200 hover:border-slate-300 hover:shadow-premium-lg transition-all duration-500">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Find Providers</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Connect with verified healthcare professionals in your area
                </p>
                <div className="flex items-center text-emerald-600 font-medium group-hover:gap-2 transition-all">
                  Search providers
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Caregiver Matching */}
            <Link href="/providers/search?bounty=true" className="group">
              <Card className="p-8 h-full border-slate-200 hover:border-slate-300 hover:shadow-premium-lg transition-all duration-500 bg-gradient-to-br from-white to-rose-50/30">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-semibold text-slate-900">Caregiver Matching</h3>
                  <Badge className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs">Hot</Badge>
                </div>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Find specialized care through our verified caregiver network
                </p>
                <div className="flex items-center text-rose-600 font-medium group-hover:gap-2 transition-all">
                  Find caregivers
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          </div>

          {/* Secondary Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/second-opinion" className="group">
              <Card className="p-6 border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Brain className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Medical Bounty</h3>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Get expert second opinions from specialist physicians
                </p>
                <div className="flex items-center text-amber-600 text-sm font-medium">
                  Raise bounty <ChevronRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>

            <Link href="/patient-portal" className="group">
              <Card className="p-6 border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Patient Portal</h3>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Access your health dashboard and medical records securely
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  Access portal <ChevronRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>

            <Link href="/payment/base" className="group">
              <Card className="p-6 border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Base Payments</h3>
                    <Badge className="bg-blue-600 text-white text-xs mt-1">New</Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Pay with USDC/ETH on Base blockchain - Fast & low fees
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  Try payments <ChevronRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>

            <Link href="/settings" className="group">
              <Card className="p-6 border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Settings</h3>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Customize your health profile and privacy preferences
                </p>
                <div className="flex items-center text-slate-600 text-sm font-medium">
                  Manage settings <ChevronRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section - Premium */}
      <section className="px-6 py-24 md:py-32 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              <span>Trusted & Secure</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your Health Data is Protected
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Built with enterprise-grade security and full HIPAA compliance to keep your health information safe
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">HIPAA Compliant</h3>
              <p className="text-slate-300 leading-relaxed">
                Full compliance with healthcare privacy regulations and data protection standards
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Lock className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">End-to-End Encryption</h3>
              <p className="text-slate-300 leading-relaxed">
                All data is encrypted in transit and at rest using industry-standard encryption
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="h-10 w-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Privacy Controls</h3>
              <p className="text-slate-300 leading-relaxed">
                You control who has access to your data and can revoke permissions anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal & Bold */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Ready to take control of your health?
          </h2>
          <p className="text-xl text-slate-600 mb-12">
            Join thousands who are already benefiting from personalized health insights.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-5 bg-slate-900 text-white rounded-xl text-lg font-semibold hover:bg-slate-800 transition-all duration-300 shadow-premium hover:shadow-premium-lg transform hover:-translate-y-0.5"
          >
            Get started free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="border-t border-slate-200 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-slate-500">
              © 2024 BaseHealth. All rights reserved.
            </div>
            <div className="flex items-center gap-8">
              <Link href="/privacy" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
