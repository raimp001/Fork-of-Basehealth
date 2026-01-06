"use client"

/**
 * BaseHealth Homepage - Palantir-Grade Enterprise UI
 * Dark, sophisticated, data-driven design
 */

import Link from "next/link"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Search,
  Heart,
  FlaskConical,
  ArrowRight,
  Shield,
  Lock,
  CheckCircle,
  ChevronRight,
  Database,
  Globe,
} from "lucide-react"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#07070c] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#07070c]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-black" />
                </div>
                <span className="text-lg font-semibold tracking-tight">BaseHealth</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-1">
                {[
                  { href: '/screening', label: 'Screening' },
                  { href: '/providers/search', label: 'Providers' },
                  { href: '/clinical-trials', label: 'Trials' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg transition-all hover:shadow-lg hover:shadow-cyan-500/20"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-4xl">
            {/* Status badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-medium mb-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              Platform Status: Operational
            </div>

            {/* Main headline */}
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] mb-6 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
              Healthcare Intelligence
              <br />
              <span className="text-zinc-500">at Scale</span>
            </h1>

            {/* Subtitle */}
            <p className={`text-lg md:text-xl text-zinc-400 leading-relaxed mb-10 max-w-2xl ${mounted ? 'animate-fade-in-up animation-delay-100' : 'opacity-0'}`}>
              Evidence-based screenings, clinical trial matching, and verified provider networks. 
              Enterprise-grade healthcare infrastructure for the modern era.
            </p>

            {/* CTAs */}
            <div className={`flex flex-col sm:flex-row gap-4 mb-16 ${mounted ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
              <Link
                href="/screening"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black font-medium rounded-lg hover:bg-zinc-100 transition-all shadow-lg shadow-white/5"
              >
                Start Assessment
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/providers/search"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 text-white font-medium rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                Find Providers
              </Link>
            </div>

            {/* Trust metrics */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${mounted ? 'animate-fade-in animation-delay-300' : 'opacity-0'}`}>
              {[
                { value: '99.9%', label: 'Uptime SLA', icon: Activity },
                { value: 'HIPAA', label: 'Compliant', icon: Shield },
                { value: 'E2E', label: 'Encrypted', icon: Lock },
                { value: 'SOC 2', label: 'Type II', icon: CheckCircle },
              ].map((metric) => (
                <div key={metric.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                    <metric.icon className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <div className="text-white font-mono font-medium">{metric.value}</div>
                    <div className="text-xs text-zinc-500">{metric.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                Core Capabilities
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Integrated Healthcare Platform
              </h2>
            </div>
            <Link 
              href="/features" 
              className="hidden md:flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              View all features
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Activity,
                title: 'Health Screening',
                description: 'USPSTF-based personalized screening recommendations with risk stratification.',
                href: '/screening',
                color: 'cyan',
                stats: '50+ screenings'
              },
              {
                icon: Search,
                title: 'Provider Network',
                description: 'NPI-verified healthcare providers with real-time availability data.',
                href: '/providers/search',
                color: 'emerald',
                stats: '1M+ providers'
              },
              {
                icon: FlaskConical,
                title: 'Clinical Trials',
                description: 'AI-powered trial matching from ClinicalTrials.gov with eligibility scoring.',
                href: '/clinical-trials',
                color: 'purple',
                stats: '400K+ trials'
              },
              {
                icon: Heart,
                title: 'Care Coordination',
                description: 'Verified caregiver network with background checks and certifications.',
                href: '/providers/search?bounty=true',
                color: 'rose',
                stats: 'Network active'
              },
            ].map((feature) => (
              <Link key={feature.title} href={feature.href} className="group">
                <Card className="h-full p-6 bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 cursor-pointer">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                    feature.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400' :
                    feature.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                    feature.color === 'purple' ? 'bg-purple-500/10 text-purple-400' :
                    'bg-rose-500/10 text-rose-400'
                  }`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  
                  <h3 className="text-lg font-medium text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-600">{feature.stats}</span>
                    <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-t border-white/5 bg-gradient-to-b from-transparent to-cyan-500/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                Platform Analytics
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
                Real-time Health Intelligence
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-8">
                Our platform processes millions of health data points daily, providing actionable insights 
                for patients, providers, and researchers.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: '2.4M+', label: 'Screenings Processed', trend: '+12%' },
                  { value: '850K', label: 'Provider Searches', trend: '+8%' },
                  { value: '125K', label: 'Trial Matches', trend: '+24%' },
                  { value: '99.97%', label: 'Data Accuracy', trend: 'Maintained' },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 bg-white/[0.02] rounded-lg border border-white/5">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-mono font-semibold text-white">{stat.value}</span>
                      <span className="text-xs text-emerald-400 font-mono">{stat.trend}</span>
                    </div>
                    <div className="text-xs text-zinc-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data visualization placeholder */}
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent border border-white/5 p-8">
                <div className="h-full flex flex-col justify-between">
                  {/* Mock chart */}
                  <div className="flex items-end justify-between h-48 gap-2">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-cyan-500/30 to-cyan-500/10 rounded-sm"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Jan</span>
                      <span>Mar</span>
                      <span>Jun</span>
                      <span>Sep</span>
                      <span>Dec</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-mono">
                Live Data
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
              Security & Compliance
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Enterprise-Grade Security
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: 'HIPAA Compliant',
                description: 'Full compliance with healthcare privacy regulations and BAA available.'
              },
              {
                icon: Lock,
                title: 'End-to-End Encryption',
                description: 'AES-256 encryption for data at rest and TLS 1.3 for data in transit.'
              },
              {
                icon: Database,
                title: 'US Data Residency',
                description: 'All data stored in SOC 2 certified US data centers.'
              },
              {
                icon: Globe,
                title: 'Zero Trust Architecture',
                description: 'Every request authenticated and authorized, no implicit trust.'
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                  <item.icon className="h-6 w-6 text-zinc-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            Ready to get started?
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of patients and providers using BaseHealth for better health outcomes.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-medium rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all text-lg"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded flex items-center justify-center">
                <Activity className="h-3 w-3 text-black" />
              </div>
              <span className="text-sm text-zinc-400">© 2026 BaseHealth. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              {['Privacy', 'Terms', 'Security', 'Status'].map((link) => (
                <Link key={link} href={`/${link.toLowerCase()}`} className="text-sm text-zinc-500 hover:text-white transition-colors">
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
