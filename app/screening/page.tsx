"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Zap, Activity, CheckCircle2, Users, TrendingUp, Clock, Brain, Target, Heart } from "lucide-react"
import { ScreeningForm } from "@/components/workflow/screening-form"

export default function ScreeningPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Clean Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-slate-700" />
              </div>
              <div className="flex items-center gap-2">
                <Link href="/" className="text-2xl font-bold text-slate-900 hover:text-slate-700 transition-all duration-200">
                  BaseHealth
                </Link>
                <span className="text-sm text-slate-500 font-medium">AI Screening</span>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">USPSTF Guidelines</span>
              </div>
              <Link 
                href="/patient-portal" 
                className="text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Back to Portal
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        
        <main className="relative px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Link href="/patient-portal" className="text-slate-500 hover:text-slate-700 transition-colors group">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                </Link>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">
                  <Brain className="h-4 w-4" />
                  AI-Powered Health Assessment
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                Personalized Health Screening
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Get evidence-based health recommendations tailored to your age, gender, and risk factors using the latest USPSTF guidelines and AI analysis.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="bg-white border border-slate-100 rounded-lg p-6 text-center hover:border-slate-200 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Personalized Assessment</h3>
                <p className="text-sm text-slate-600">Tailored recommendations based on your unique health profile and risk factors</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-lg p-6 text-center hover:border-slate-200 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Evidence-Based</h3>
                <p className="text-sm text-slate-600">Following current USPSTF clinical guidelines and best practices</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-lg p-6 text-center hover:border-slate-200 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Quick & Easy</h3>
                <p className="text-sm text-slate-600">Complete your assessment in just a few minutes</p>
              </div>
            </div>

            {/* Main Screening Form */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-lg">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Zap className="h-4 w-4 text-slate-700" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Health Screening Assessment</h2>
                  </div>
                  <p className="text-slate-600">
                    Help us understand your health profile to provide personalized screening recommendations.
                  </p>
                </div>
                
                <ScreeningForm
                  patientData={{}}
                  updatePatientData={() => {}}
                  onComplete={() => {}}
                />
              </div>
            </div>

            {/* Benefits Section */}
            <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-6 w-6 text-slate-700" />
                  <h3 className="text-xl font-bold text-slate-900">Preventive Care Benefits</h3>
                </div>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-600 mt-0.5 flex-shrink-0" />
                    <span>Early detection of health conditions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-600 mt-0.5 flex-shrink-0" />
                    <span>Reduced healthcare costs over time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-600 mt-0.5 flex-shrink-0" />
                    <span>Better long-term health outcomes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-600 mt-0.5 flex-shrink-0" />
                    <span>Peace of mind and health confidence</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-6 w-6 text-slate-700" />
                  <h3 className="text-xl font-bold text-slate-900">Trusted by Millions</h3>
                </div>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-600 mt-0.5 flex-shrink-0" />
                    <span>USPSTF Grade A & B recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-600 mt-0.5 flex-shrink-0" />
                    <span>Clinically validated guidelines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-600 mt-0.5 flex-shrink-0" />
                    <span>Regular updates with new research</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-600 mt-0.5 flex-shrink-0" />
                    <span>Privacy-first approach</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
