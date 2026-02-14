"use client"

/**
 * BaseHealth Homepage - Claude.ai Inspired Design
 * Clean, warm, elegant aesthetic
 */

import Link from "next/link"
import { ArrowRight, Shield, Check, Heart, Bot, Stethoscope, Users, CreditCard } from "lucide-react"
import { SignInWithBase } from "@/components/auth/sign-in-with-base"

const features = [
  {
    title: "Health Screenings",
    description: "USPSTF Grade A & B evidence-based recommendations personalized to your risk profile.",
    href: "/screening",
  },
  {
    title: "Provider Network",
    description: "Access 1M+ NPI-verified healthcare providers with real-time availability.",
    href: "/providers/search",
  },
  {
    title: "Find Caregivers",
    description: "Connect with verified caregivers for elder care, post-surgery support, and more.",
    href: "/caregivers/search",
  },
  {
    title: "Clinical Trials",
    description: "AI-powered matching from ClinicalTrials.gov with eligibility scoring.",
    href: "/clinical-trials",
  },
]

const benefits = [
  "HIPAA Compliant",
  "Evidence-based recommendations",
  "Real provider data from NPI",
  "Secure USDC payments on Base",
]

const openClawAgents = [
  {
    title: "General Health Agent",
    description: "Fast, practical answers for common symptoms and wellness questions.",
    icon: Bot,
  },
  {
    title: "Screening Specialist",
    description: "USPSTF-aligned preventive screening guidance based on your profile.",
    icon: Stethoscope,
  },
  {
    title: "Care Navigator",
    description: "Provider and caregiver matching support with next-step planning.",
    icon: Users,
  },
  {
    title: "Billing Guide",
    description: "Clear payment and Base blockchain transaction explanations.",
    icon: CreditCard,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Navigation */}
      <nav className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--bg-primary)' }}>B</span>
              </div>
              <span className="text-lg font-medium">BaseHealth</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/screening" className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                Screenings
              </Link>
              <Link href="/providers/search" className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                Find Providers
              </Link>
              <Link href="/caregivers/search" className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                Find Caregivers
              </Link>
              <Link href="/clinical-trials" className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                Trials
              </Link>
              <Link href="/chat" className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                Agents
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <SignInWithBase />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-normal tracking-tight mb-6" style={{ lineHeight: '1.1' }}>
              Your Health,
              <br />
              <span style={{ color: 'var(--text-secondary)' }}>Intelligently Managed.</span>
            </h1>

            <p className="text-xl mb-10 max-w-xl" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Evidence-based screenings, verified providers, and clinical trial matching—all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16 flex-wrap">
              <Link
                href="/screening"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg transition-all"
                style={{ 
                  backgroundColor: 'var(--text-primary)', 
                  color: 'var(--bg-primary)' 
                }}
              >
                Start Health Assessment
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/providers/search"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg border transition-all"
                style={{ 
                  borderColor: 'var(--border-medium)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'transparent'
                }}
              >
                Find a Provider
              </Link>
              <Link
                href="/caregivers/search"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg border transition-all"
                style={{ 
                  borderColor: 'var(--border-medium)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'transparent'
                }}
              >
                <Heart className="h-4 w-4" />
                Find a Caregiver
              </Link>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap gap-6">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <Check className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-normal mb-12">What we offer</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group p-6 rounded-xl border transition-all hover:border-opacity-20"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-subtle)'
                }}
              >
                <h3 className="text-lg font-medium mb-3">{feature.title}</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
                <span 
                  className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all"
                  style={{ color: 'var(--accent)' }}
                >
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* OpenClaw Agents */}
      <section className="py-20 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-normal mb-3">OpenClaw Agents</h2>
              <p className="text-sm max-w-2xl" style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>
                Route each question to the right specialist agent for better answers across screening, care, and billing workflows.
              </p>
            </div>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              Open Agent Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {openClawAgents.map((agent) => {
              const Icon = agent.icon
              return (
                <div
                  key={agent.title}
                  className="p-6 rounded-xl border"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg mb-4 flex items-center justify-center"
                    style={{ backgroundColor: "var(--bg-tertiary)" }}
                  >
                    <Icon className="h-5 w-5" style={{ color: "var(--accent)" }} />
                  </div>
                  <h3 className="text-base font-medium mb-2">{agent.title}</h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    {agent.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-normal mb-12">How it works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Complete your profile", desc: "Answer a few questions about your health history and risk factors." },
              { step: "2", title: "Get recommendations", desc: "Receive USPSTF-based screening recommendations tailored to you." },
              { step: "3", title: "Find providers", desc: "Connect with verified healthcare providers in your area." },
            ].map((item) => (
              <div key={item.step}>
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-4"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {item.step}
                </div>
                <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-normal mb-4">
              Take control of your health today
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of users making informed healthcare decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg transition-all"
                style={{ 
                  backgroundColor: 'var(--text-primary)', 
                  color: 'var(--bg-primary)' 
                }}
              >
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/onboarding?role=provider"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg border transition-all"
                style={{ 
                  borderColor: 'var(--border-medium)',
                  color: 'var(--text-primary)'
                }}
              >
                Join as Provider
              </Link>
              <Link
                href="/onboarding?role=caregiver"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg border transition-all"
                style={{ 
                  borderColor: 'var(--border-medium)',
                  color: 'var(--text-primary)'
                }}
              >
                <Heart className="h-4 w-4" />
                Join as Caregiver
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--bg-primary)' }}>B</span>
                </div>
                <span className="text-lg font-medium">BaseHealth</span>
              </Link>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Healthcare intelligence for everyone.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-sm">For Patients</h4>
              <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li><Link href="/screening" className="hover:underline">Health Screenings</Link></li>
                <li><Link href="/providers/search" className="hover:underline">Find Providers</Link></li>
                <li><Link href="/clinical-trials" className="hover:underline">Clinical Trials</Link></li>
                <li><Link href="/patient-portal" className="hover:underline">Patient Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-sm">For Providers</h4>
              <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li><Link href="/onboarding?role=provider" className="hover:underline">Provider Signup</Link></li>
                <li><Link href="/onboarding?role=caregiver" className="hover:underline">Caregiver Signup</Link></li>
                <li><Link href="/provider/dashboard" className="hover:underline">Dashboard</Link></li>
                <li><Link href="/admin" className="hover:underline">Admin Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-sm">Company</h4>
              <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:underline">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>© 2026 BaseHealth. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
