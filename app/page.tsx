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
    <div className="min-h-screen gradient-calm">
      <MinimalNavigation />

      {/* Hero Section - Calming design */}
      <section className="relative overflow-hidden">
        {/* Subtle grid background - warm grey */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#a8a29e10_1px,transparent_1px),linear-gradient(to_bottom,#a8a29e10_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <div className="relative px-6 pt-32 pb-24 md:pt-40 md:pb-32">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl">
              {/* Badge - Warm grey */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 bg-stone-700 text-stone-50 rounded-full text-sm font-medium mb-8 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
                <Sparkles className="h-4 w-4" />
                <span>Enterprise Healthcare Platform</span>
              </div>

              {/* Hero Headline - Warm grey with rose accent */}
              <h1 className={`text-5xl md:text-7xl font-bold text-stone-800 tracking-tight mb-8 ${mounted ? 'animate-fade-in-up animation-delay-100' : 'opacity-0'}`}>
                Healthcare,{" "}
                <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-stone-600 bg-clip-text text-transparent">
                  simplified
                </span>
              </h1>

              {/* Subtitle - Muted warm grey */}
              <p className={`text-xl md:text-2xl text-stone-600 leading-relaxed mb-12 ${mounted ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
                Evidence-based health screenings, clinical trial matching, and expert care—all in one seamless, HIPAA-compliant platform.
              </p>

              {/* CTAs - Warm grey tones */}
              <div className={`flex flex-col sm:flex-row gap-4 ${mounted ? 'animate-fade-in-up animation-delay-300' : 'opacity-0'}`}>
                <Link
                  href="/screening"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-stone-800 text-stone-50 rounded-xl font-semibold hover:bg-stone-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Start Health Assessment
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/providers/search"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-stone-800 border-2 border-stone-200 rounded-xl font-semibold hover:border-stone-400 transition-all duration-300"
                >
                  Find Providers
                </Link>
              </div>

              {/* Trust indicators - Calming colors */}
              <div className={`mt-16 flex flex-wrap items-center gap-8 text-sm text-stone-500 ${mounted ? 'animate-fade-in animation-delay-400' : 'opacity-0'}`}>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-700" />
                  <span className="font-medium">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-stone-600" />
                  <span className="font-medium">End-to-End Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-rose-600" />
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

          {/* Primary Features - Calming warm grey & rose tones */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* AI Health Screening */}
            <Link href="/screening" className="group">
              <Card className="p-8 h-full border-stone-200 hover:border-stone-300 hover:shadow-premium-lg transition-all duration-500 bg-gradient-to-br from-white to-stone-50/50">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-stone-600 to-stone-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-semibold text-stone-800">AI Health Screening</h3>
                  <Badge className="bg-rose-600 text-white text-xs">New</Badge>
                </div>
                <p className="text-stone-600 leading-relaxed mb-6">
                  Personalized recommendations based on USPSTF evidence-based guidelines
                </p>
                <div className="flex items-center text-stone-700 font-medium group-hover:gap-2 transition-all">
                  Learn more
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Clinical Trials */}
            <Link href="/clinical-trials" className="group">
              <Card className="p-8 h-full border-stone-200 hover:border-stone-300 hover:shadow-premium-lg transition-all duration-500 bg-gradient-to-br from-white to-rose-50/20">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FlaskConical className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-stone-800 mb-3">Clinical Trials</h3>
                <p className="text-stone-600 leading-relaxed mb-6">
                  Match with cutting-edge research studies based on your health profile
                </p>
                <div className="flex items-center text-rose-600 font-medium group-hover:gap-2 transition-all">
                  Explore trials
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Find Providers */}
            <Link href="/providers/search" className="group">
              <Card className="p-8 h-full border-stone-200 hover:border-stone-300 hover:shadow-premium-lg transition-all duration-500">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-stone-500 to-stone-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-stone-800 mb-3">Find Providers</h3>
                <p className="text-stone-600 leading-relaxed mb-6">
                  Connect with verified healthcare professionals in your area
                </p>
                <div className="flex items-center text-stone-700 font-medium group-hover:gap-2 transition-all">
                  Search providers
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Caregiver Matching */}
            <Link href="/providers/search?bounty=true" className="group">
              <Card className="p-8 h-full border-rose-200 hover:border-rose-300 hover:shadow-premium-lg transition-all duration-500 bg-gradient-to-br from-white via-rose-50/30 to-stone-50/30">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-semibold text-stone-800">Caregiver Matching</h3>
                  <Badge className="bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs">Hot</Badge>
                </div>
                <p className="text-stone-600 leading-relaxed mb-6">
                  Find specialized care through our verified caregiver network
                </p>
                <div className="flex items-center text-rose-600 font-medium group-hover:gap-2 transition-all">
                  Find caregivers
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          </div>

          {/* Secondary Features - Calming grey tones */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/second-opinion" className="group">
              <Card className="p-6 border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-stone-50/30">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center">
                    <Brain className="h-6 w-6 text-stone-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-800">Medical Bounty</h3>
                </div>
                <p className="text-sm text-stone-600 mb-3">
                  Get expert second opinions from specialist physicians
                </p>
                <div className="flex items-center text-stone-700 text-sm font-medium">
                  Raise bounty <ChevronRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>

            <Link href="/patient-portal" className="group">
              <Card className="p-6 border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center">
                    <User className="h-6 w-6 text-stone-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-800">Patient Portal</h3>
                </div>
                <p className="text-sm text-stone-600 mb-3">
                  Access your health dashboard and medical records securely
                </p>
                <div className="flex items-center text-stone-700 text-sm font-medium">
                  Access portal <ChevronRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>

            <Link href="/payment/base" className="group">
              <Card className="p-6 border-rose-200 hover:border-rose-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-rose-50/20 to-stone-50/20">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-stone-800">Base Payments</h3>
                    <Badge className="bg-rose-600 text-white text-xs mt-1">New</Badge>
                  </div>
                </div>
                <p className="text-sm text-stone-600 mb-3">
                  Pay with USDC/ETH on Base blockchain - Fast & low fees
                </p>
                <div className="flex items-center text-rose-600 text-sm font-medium">
                  Try payments <ChevronRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>

            <Link href="/settings" className="group">
              <Card className="p-6 border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-stone-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-800">Settings</h3>
                </div>
                <p className="text-sm text-stone-600 mb-3">
                  Customize your health profile and privacy preferences
                </p>
                <div className="flex items-center text-stone-600 text-sm font-medium">
                  Manage settings <ChevronRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section - Warm dark grey */}
      <section className="px-6 py-24 md:py-32 bg-gradient-to-br from-stone-800 via-stone-700 to-stone-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              <span>Trusted & Secure</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your Health Data is Protected
            </h2>
            <p className="text-xl text-stone-200 max-w-3xl mx-auto">
              Built with enterprise-grade security and full HIPAA compliance to keep your health information safe
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">HIPAA Compliant</h3>
              <p className="text-stone-300 leading-relaxed">
                Full compliance with healthcare privacy regulations and data protection standards
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Lock className="h-10 w-10 text-stone-300" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">End-to-End Encryption</h3>
              <p className="text-stone-300 leading-relaxed">
                All data is encrypted in transit and at rest using industry-standard encryption
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="h-10 w-10 text-rose-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Privacy Controls</h3>
              <p className="text-stone-300 leading-relaxed">
                You control who has access to your data and can revoke permissions anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Warm grey accent */}
      <section className="px-6 py-24 md:py-32 bg-gradient-to-br from-stone-50 to-rose-50/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-stone-800 mb-6">
            Ready to take control of your health?
          </h2>
          <p className="text-xl text-stone-600 mb-12">
            Join thousands who are already benefiting from personalized health insights.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-5 bg-stone-800 text-white rounded-xl text-lg font-semibold hover:bg-stone-700 transition-all duration-300 shadow-premium hover:shadow-premium-lg transform hover:-translate-y-0.5"
          >
            Get started free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer - Minimal warm grey */}
      <footer className="border-t border-stone-200 px-6 py-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-stone-500">
              © 2024 BaseHealth. All rights reserved.
            </div>
            <div className="flex items-center gap-8">
              <Link href="/privacy" className="text-sm text-stone-600 hover:text-stone-800 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-stone-600 hover:text-stone-800 transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-sm text-stone-600 hover:text-stone-800 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
