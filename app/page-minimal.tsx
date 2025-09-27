"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity, Search, Heart, FlaskConical, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"

export default function MinimalHomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-semibold text-gray-900">
              BaseHealth
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/screening" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Screening
              </Link>
              <Link href="/providers/search" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Find Care
              </Link>
              <Link href="/clinical-trials" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Research
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                <Link href="/register">Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

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
                <Button asChild size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8">
                  <Link href="/screening" className="flex items-center gap-2">
                    Start health assessment
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-gray-200 hover:bg-gray-50">
                  <Link href="/providers/search">
                    Find providers
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid - Ultra Minimal */}
        <section className="px-4 sm:px-6 py-20 border-t border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              <Link href="/screening" className="group">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Activity className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI Health Screening</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Personalized recommendations based on USPSTF guidelines
                </p>
              </Link>

              <Link href="/clinical-trials" className="group">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <FlaskConical className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Clinical Trials</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Match with research studies based on your health profile
                </p>
              </Link>

              <Link href="/providers/search" className="group">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Search className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Find Providers</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Connect with verified healthcare professionals
                </p>
              </Link>

              <Link href="/providers/search?bounty=true" className="group">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Heart className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Caregiver Matching</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Find specialized care through our bounty system
                </p>
              </Link>
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
            <Button asChild size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-10">
              <Link href="/register">
                Get started free
              </Link>
            </Button>
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
