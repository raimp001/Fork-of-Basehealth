"use client"

/**
 * BaseHealth Homepage - Palantir-Inspired Design
 * Clean, minimal, impactful
 */

import Link from "next/link"
import { useState, useEffect } from "react"
import { ArrowRight, ArrowDown, Activity, ChevronRight } from "lucide-react"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Activity className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-medium tracking-tight">BaseHealth</span>
            </Link>

            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-8">
                {['Products', 'Solutions', 'Resources'].map((item) => (
                  <button key={item} className="text-sm text-neutral-400 hover:text-white transition-colors">
                    {item}
                  </button>
                ))}
              </div>
              
              <Link
                href="/register"
                className="px-5 py-2.5 text-sm font-medium bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/50 via-black to-black" />
        
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-grid opacity-30" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <div className={`space-y-8 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight">
              Healthcare Intelligence
              <br />
              <span className="text-neutral-500">for Every Decision</span>
            </h1>

            <p className={`text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto leading-relaxed ${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
              Evidence-based screenings, verified providers, and clinical trial matching. 
              Enterprise-grade infrastructure for modern healthcare.
            </p>

            <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 ${mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
              <Link
                href="/screening"
                className="group px-8 py-4 text-lg font-medium bg-white text-black rounded-lg hover:bg-neutral-200 transition-all flex items-center gap-2"
              >
                Start Assessment
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/providers/search"
                className="px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/5 hover:border-white/30 transition-all"
              >
                Find Providers
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={`absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 ${mounted ? 'animate-fade-in delay-500' : 'opacity-0'}`}>
          <span className="text-sm text-neutral-500">Scroll to Explore</span>
          <ArrowDown className="h-5 w-5 text-neutral-500 animate-float" />
        </div>
      </section>

      {/* Products Section */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-20">
            <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">
              Products
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-6">
              Integrated Healthcare Platform
            </h2>
            <p className="text-xl text-neutral-400">
              A unified platform connecting patients to personalized care through AI-powered recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Health Screening',
                description: 'Personalized screening recommendations based on USPSTF Grade A & B guidelines. Risk stratification and early detection.',
                href: '/screening',
                stat: '50+ Screenings',
              },
              {
                title: 'Provider Network',
                description: 'NPI-verified healthcare providers across all specialties. Real-time availability and telehealth options.',
                href: '/providers/search',
                stat: '1M+ Providers',
              },
              {
                title: 'Clinical Trials',
                description: 'AI-powered trial matching from ClinicalTrials.gov. Eligibility scoring and enrollment assistance.',
                href: '/clinical-trials',
                stat: '400K+ Trials',
              },
              {
                title: 'Care Coordination',
                description: 'Connect patients with verified caregivers. Background-checked, certified, and reviewed.',
                href: '/providers/search?bounty=true',
                stat: 'Network Active',
              },
            ].map((product, index) => (
              <Link
                key={product.title}
                href={product.href}
                className={`group p-8 bg-neutral-950 border border-white/5 rounded-2xl hover:border-white/10 hover:bg-neutral-900/50 transition-all duration-300 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-2xl font-medium text-white group-hover:text-neutral-200 transition-colors">
                    {product.title}
                  </h3>
                  <ChevronRight className="h-6 w-6 text-neutral-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-neutral-400 mb-6 leading-relaxed">
                  {product.description}
                </p>
                <span className="text-sm font-medium text-neutral-500">
                  {product.stat}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 border-t border-white/5 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 md:gap-8">
            {[
              { value: '99.9%', label: 'Uptime SLA' },
              { value: 'HIPAA', label: 'Compliant' },
              { value: 'SOC 2', label: 'Type II Certified' },
              { value: 'E2E', label: 'Encrypted' },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl md:text-6xl font-medium text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-neutral-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
            Join thousands of patients and providers using BaseHealth for better health outcomes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group px-8 py-4 text-lg font-medium bg-white text-black rounded-lg hover:bg-neutral-200 transition-all flex items-center gap-2"
            >
              Create Account
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-lg hover:bg-white/5 hover:border-white/30 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-black" />
                </div>
                <span className="text-xl font-medium">BaseHealth</span>
              </Link>
              <p className="text-neutral-500 max-w-xs">
                Enterprise-grade healthcare infrastructure for the modern era.
              </p>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-sm font-medium text-white mb-4">Products</h4>
              <ul className="space-y-3">
                {['Health Screening', 'Provider Search', 'Clinical Trials', 'Care Coordination'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-neutral-500 hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Providers */}
            <div>
              <h4 className="text-sm font-medium text-white mb-4">For Providers</h4>
              <ul className="space-y-3">
                <li><Link href="/provider/signup" className="text-sm text-neutral-500 hover:text-white transition-colors">Provider Signup</Link></li>
                <li><Link href="/providers/caregiver-signup" className="text-sm text-neutral-500 hover:text-white transition-colors">Caregiver Signup</Link></li>
                <li><Link href="/provider/dashboard" className="text-sm text-neutral-500 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/admin" className="text-sm text-neutral-500 hover:text-white transition-colors">Admin Portal</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-medium text-white mb-4">Company</h4>
              <ul className="space-y-3">
                {['Privacy', 'Terms', 'Security', 'Status'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase()}`} className="text-sm text-neutral-500 hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-sm text-neutral-500">
              © 2026 BaseHealth. All rights reserved.
            </span>
            <div className="flex items-center gap-6 text-sm text-neutral-600">
              <span>HIPAA Compliant</span>
              <span>•</span>
              <span>SOC 2 Type II</span>
              <span>•</span>
              <span>256-bit Encryption</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
