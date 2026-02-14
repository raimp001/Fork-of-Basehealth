"use client"

/**
 * Onboarding Success Page - Palantir-Inspired Design
 */

import Link from "next/link"
import { CheckCircle, Mail, Clock, ArrowRight, Shield } from "lucide-react"

export default function OnboardingSuccessPage() {
  return (
    <div className="min-h-screen bg-[#101010] text-white">
      <main className="py-8 px-6">
        <div className="max-w-lg mx-auto text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-8 h-8 text-white/80" />
          </div>

          <h1 className="text-4xl font-light tracking-tight mb-4">
            Application Submitted
          </h1>
          <p className="text-white/50 text-lg mb-12">
            Thank you for applying. We'll review your application and get back to you soon.
          </p>

          {/* Timeline */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 text-left mb-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-white/60" />
                </div>
                <div>
                  <p className="font-medium">Check Your Email</p>
                  <p className="text-sm text-white/40 mt-0.5">
                    Confirmation sent with your application details
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-white/60" />
                </div>
                <div>
                  <p className="font-medium">Review Time</p>
                  <p className="text-sm text-white/40 mt-0.5">
                    1-2 business days for credential verification
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-white/60" />
                </div>
                <div>
                  <p className="font-medium">Approval</p>
                  <p className="text-sm text-white/40 mt-0.5">
                    Email notification when your account is ready
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 border border-white/20 rounded text-sm hover:bg-white/5 transition-colors"
            >
              Return Home
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 bg-white text-black rounded text-sm hover:bg-white/90 transition-colors flex items-center gap-2"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Admin Link */}
          <div className="mt-12 pt-6 border-t border-white/[0.08]">
            <Link 
              href="/admin" 
              className="text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              Admin Portal →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
