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
    <div className="min-h-screen bg-white">
      <MinimalNavigation />

      {/* Hero Section - Palantir-Grade Enterprise */}
      <section className="relative overflow-hidden pt-20 md:pt-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="relative px-6 pt-32 pb-28 md:pt-44 md:pb-36 lg:pt-56 lg:pb-48">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-5xl">
              {/* Hero Headline - Large, bold, Palantir-style */}
              <h1 className={`text-6xl md:text-7xl lg:text-[72px] font-bold text-black tracking-tight mb-8 leading-[1.1] ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
                Healthcare,{" "}
                <span className="text-gray-700">
                  simplified
                </span>
              </h1>

              {/* Subtitle - Generous spacing */}
              <p className={`text-xl md:text-2xl text-gray-600 leading-relaxed mb-16 max-w-3xl font-normal ${mounted ? 'animate-fade-in-up animation-delay-100' : 'opacity-0'}`}>
                Evidence-based screenings, clinical trials, and verified care—in one place.
              </p>

              {/* CTAs - Premium black buttons */}
              <div className={`flex flex-col sm:flex-row gap-4 mb-20 ${mounted ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
                <Link
                  href="/screening"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] border-2 border-transparent hover:border-white"
                >
                  Start health assessment
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/provider/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-lg font-medium border-2 border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02]"
                >
                  Become a provider
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

              {/* Trust indicators - Monochrome, minimal */}
              <div className={`flex flex-wrap items-center gap-8 md:gap-12 ${mounted ? 'animate-fade-in animation-delay-300' : 'opacity-0'}`}>
                <div className="flex items-center gap-3 text-gray-600 hover:text-black transition-colors">
                  <Shield className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 hover:text-black transition-colors">
                  <Lock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium">End-to-End Encrypted</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 hover:text-black transition-colors">
                  <Zap className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium">Secure payments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Premium Grid */}
      <section className="px-6 py-24 md:py-32 lg:py-40">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20 md:mb-24">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 mb-6 tracking-tight">
              Comprehensive Healthcare Platform
            </h2>
            <p className="text-lg md:text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to manage your health in one secure platform
            </p>
          </div>

          {/* Primary Features - Calming warm grey & rose tones */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* AI Health Screening */}
            <Link href="/screening" className="group">
              <Card className="p-8 h-full border-2 border-stone-300 hover:border-stone-500 hover:shadow-2xl transition-all duration-300 bg-white cursor-pointer">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-stone-700 to-stone-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">Find the right care</h3>
                <p className="text-stone-600 leading-relaxed mb-6 text-sm">
                  Get personalized health recommendations based on your profile.
                </p>
                <div className="flex items-center text-stone-900 font-semibold group-hover:gap-2 transition-all">
                  Learn more
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Clinical Trials */}
            <Link href="/clinical-trials" className="group">
              <Card className="p-8 h-full border-2 border-stone-300 hover:border-stone-500 hover:shadow-2xl transition-all duration-300 bg-white cursor-pointer">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                    <FlaskConical className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">Join research studies</h3>
                <p className="text-stone-600 leading-relaxed mb-6 text-sm">
                  Match with clinical trials that fit your health needs.
                </p>
                <div className="flex items-center text-rose-700 font-semibold group-hover:gap-2 transition-all">
                  Explore trials
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Find Providers */}
            <Link href="/providers/search" className="group">
              <Card className="p-8 h-full border-2 border-stone-300 hover:border-stone-500 hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-stone-600 to-stone-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">Find providers</h3>
                <p className="text-stone-600 leading-relaxed mb-6 text-sm">
                  Connect with verified healthcare professionals near you.
                </p>
                <div className="flex items-center text-stone-900 font-semibold group-hover:gap-2 transition-all">
                  Search providers
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Caregiver Matching */}
            <Link href="/providers/search?bounty=true" className="group">
              <Card className="p-8 h-full border-2 border-stone-300 hover:border-stone-500 hover:shadow-2xl transition-all duration-300 bg-white cursor-pointer">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">Find caregivers</h3>
                <p className="text-stone-600 leading-relaxed mb-6 text-sm">
                  Connect with specialized caregivers in our verified network.
                </p>
                <div className="flex items-center text-rose-700 font-semibold group-hover:gap-2 transition-all">
                  Find caregivers
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          </div>

          {/* Provider Signup Section */}
          <div className="mt-12 md:mt-16">
            <Card className="p-8 md:p-12 border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-semibold mb-6">
                  <User className="h-4 w-4" />
                  <span>For Healthcare Providers</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
                  Join BaseHealth as a Provider
                </h2>
                <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                  Physicians and health apps can now register to provide care on our platform. 
                  Simple signup process, comprehensive dashboard, and integration with labs, pharmacies, and EMRs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/provider/signup"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Sign Up as Provider
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/provider/dashboard"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 border-2 border-blue-300 rounded-xl font-semibold hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                  >
                    Provider Dashboard
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* Secondary Features - Calming grey tones */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/second-opinion" className="group">
              <Card className="p-6 border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-stone-50/30">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center">
                    <Brain className="h-6 w-6 text-stone-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-800">Specialist opinions</h3>
                </div>
                <p className="text-sm text-stone-600 mb-3">
                  Get specialist second opinions from expert physicians.
                </p>
                <div className="flex items-center text-stone-700 text-sm font-medium">
                  Get review <ChevronRight className="h-4 w-4" />
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
                  <h3 className="text-lg font-semibold text-stone-800">Digital payments</h3>
                </div>
                <p className="text-sm text-stone-600 mb-3">
                  Low fees, instant settlement. Powered by Base blockchain.
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
      <section className="px-6 py-24 md:py-32 lg:py-40 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-8 border border-white/20">
              <Shield className="h-4 w-4" />
              <span>Trusted & Secure</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Your Health Data is Protected
            </h2>
            <p className="text-lg md:text-xl text-stone-200 max-w-3xl mx-auto leading-relaxed mb-8">
              Your health information is private, secure, and never sold.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">HIPAA Compliant</h3>
              <p className="text-stone-300 leading-relaxed">
                Full compliance with healthcare privacy regulations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Lock className="h-10 w-10 text-stone-300" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">End-to-End Encryption</h3>
              <p className="text-stone-300 leading-relaxed">
                All data encrypted in transit and at rest.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="h-10 w-10 text-rose-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Privacy Controls</h3>
              <p className="text-stone-300 leading-relaxed">
                Your identifiable health data is never sold.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">U.S. Data Residency</h3>
              <p className="text-stone-300 leading-relaxed">
                Your data is stored in HIPAA-compliant U.S. data centers and never transferred internationally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Warm grey accent */}
      <section className="px-6 py-24 md:py-32 lg:py-40 bg-gradient-to-br from-stone-50 via-white to-rose-50/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 mb-6 tracking-tight">
            Ready to take control of your health?
          </h2>
          <p className="text-lg md:text-xl text-stone-600 mb-12 leading-relaxed">
            Join thousands who are already benefiting from personalized health insights.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-5 bg-stone-900 text-white rounded-xl text-lg font-semibold hover:bg-stone-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
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
