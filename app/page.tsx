"use client"

import Link from "next/link"
import { StandardizedButton, PrimaryActionButton } from "@/components/ui/standardized-button"
import { Activity, Search, Heart, FlaskConical, ArrowRight, Brain, User, Settings, Shield, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { components, colors, healthcare } from "@/lib/design-system"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <MinimalNavigation />

      {/* Hero Section - Minimal */}
      <main className="pt-16">
        <section className="px-4 sm:px-6 py-20 sm:py-32">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl">
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 leading-tight ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
                Healthcare,{' '}
                <span className="text-gray-400">simplified.</span>
              </h1>
              
              <p className={`mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl ${mounted ? 'animate-fade-in-up animation-delay-100' : 'opacity-0'}`}>
                Evidence-based health screenings, clinical trial matching, and expert care—all in one seamless platform.
              </p>

              <div className={`mt-10 flex flex-col sm:flex-row gap-4 ${mounted ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
                <PrimaryActionButton asChild className="px-8">
                  <Link href="/screening" className="flex items-center gap-2">
                    Start health assessment
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </PrimaryActionButton>
                <StandardizedButton asChild variant="secondary" size="lg">
                  <Link href="/providers/search">
                    Find providers
                  </Link>
                </StandardizedButton>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid - Enhanced */}
        <section className="px-4 sm:px-6 py-20 border-t border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Comprehensive Healthcare Platform
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to manage your health in one secure, HIPAA-compliant platform
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              <Card className={`p-6 ${components.card.elevated} group hover:shadow-xl transition-all duration-300`}>
                <Link href="/screening" className="block">
                  <div className="mb-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Activity className="h-7 w-7 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">AI Health Screening</h3>
                    <Badge className={components.badge.primary}>New</Badge>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Personalized recommendations based on USPSTF guidelines
                  </p>
                  <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                    Learn more <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </Card>

              <Card className={`p-6 ${components.card.elevated} group hover:shadow-xl transition-all duration-300`}>
                <Link href="/clinical-trials" className="block">
                  <div className="mb-4">
                    <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <FlaskConical className="h-7 w-7 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Clinical Trials</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Match with research studies based on your health profile
                  </p>
                  <div className="flex items-center text-purple-600 text-sm font-medium group-hover:text-purple-700">
                    Explore trials <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </Card>

              <Card className={`p-6 ${components.card.elevated} group hover:shadow-xl transition-all duration-300`}>
                <Link href="/providers/search" className="block">
                  <div className="mb-4">
                    <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Search className="h-7 w-7 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Providers</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Connect with verified healthcare professionals
                  </p>
                  <div className="flex items-center text-green-600 text-sm font-medium group-hover:text-green-700">
                    Search providers <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </Card>

              <Card className={`p-6 ${components.card.elevated} group hover:shadow-xl transition-all duration-300`}>
                <Link href="/providers/search?bounty=true" className="block">
                  <div className="mb-4">
                    <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <Heart className="h-7 w-7 text-red-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Caregiver Matching</h3>
                    <Badge className={components.badge.warning}>Hot</Badge>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Find specialized care through our bounty system
                  </p>
                  <div className="flex items-center text-red-600 text-sm font-medium group-hover:text-red-700">
                    Find caregivers <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </Card>
            </div>

            {/* Additional features row */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mt-12 pt-12 border-t border-gray-100">
              <Card className={`p-6 ${components.card.base} group hover:shadow-md transition-all duration-300`}>
                <Link href="/second-opinion" className="block">
                  <div className="mb-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                      <Brain className="h-7 w-7 text-amber-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Medical Bounty</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Get expert second opinions from specialist physicians
                  </p>
                  <div className="flex items-center text-amber-600 text-sm font-medium group-hover:text-amber-700">
                    Raise bounty <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </Card>

              <Card className={`p-6 ${components.card.base} group hover:shadow-md transition-all duration-300`}>
                <Link href="/patient-portal" className="block">
                  <div className="mb-4">
                    <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <User className="h-7 w-7 text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient Portal</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Access your health dashboard and medical records
                  </p>
                  <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:text-indigo-700">
                    Access portal <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </Card>

              <Card className={`p-6 ${components.card.base} group hover:shadow-md transition-all duration-300`}>
                <a href="https://healthdb.ai" target="_blank" rel="noopener noreferrer" className="block">
                  <div className="mb-4">
                    <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                      <Activity className="h-7 w-7 text-teal-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">HealthDB.ai</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Contribute data for personalized recommendations
                  </p>
                  <div className="flex items-center text-teal-600 text-sm font-medium group-hover:text-teal-700">
                    Visit HealthDB <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              </Card>

              <Card className={`p-6 ${components.card.base} group hover:shadow-md transition-all duration-300`}>
                <Link href="/settings" className="block">
                  <div className="mb-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <Settings className="h-7 w-7 text-gray-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Customize your health profile and preferences
                  </p>
                  <div className="flex items-center text-gray-600 text-sm font-medium group-hover:text-gray-700">
                    Manage settings <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* Trust & Security Section */}
        <section className="px-4 sm:px-6 py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
                <Shield className="h-4 w-4" />
                Trusted & Secure
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Your Health Data is Protected
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Built with enterprise-grade security and full HIPAA compliance to keep your health information safe
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className={`p-6 ${components.card.base} text-center`}>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">HIPAA Compliant</h3>
                <p className="text-sm text-gray-600">
                  Full compliance with healthcare privacy regulations and data protection standards
                </p>
              </Card>
              
              <Card className={`p-6 ${components.card.base} text-center`}>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">End-to-End Encryption</h3>
                <p className="text-sm text-gray-600">
                  All data is encrypted in transit and at rest using industry-standard encryption
                </p>
              </Card>
              
              <Card className={`p-6 ${components.card.base} text-center`}>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy Controls</h3>
                <p className="text-sm text-gray-600">
                  You control who has access to your data and can revoke permissions anytime
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section - Minimal */}
        <section className="px-4 sm:px-6 py-20 border-t border-gray-100">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
              Ready to take control of your health?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands who are already benefiting from personalized health insights.
            </p>
            <PrimaryActionButton asChild className="px-10">
              <Link href="/register">
                Get started free
              </Link>
            </PrimaryActionButton>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-gray-100 px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              © 2024 BaseHealth. All rights reserved.
            </div>
            <nav className="flex gap-6">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
          opacity: 0;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}