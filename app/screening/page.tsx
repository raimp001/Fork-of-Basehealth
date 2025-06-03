"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Zap, Activity, CheckCircle2, Users, TrendingUp, Clock, Brain, Target, Heart } from "lucide-react"
import { ScreeningForm } from "@/components/workflow/screening-form"

export default function ScreeningPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Enhanced Header Navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent hover:from-emerald-700 hover:to-green-700 transition-all duration-200">
                  BaseHealth
                </Link>
                <span className="text-sm text-gray-500 font-medium">AI Screening</span>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">USPSTF Guidelines</span>
              </div>
              <Link 
                href="/patient-portal" 
                className="text-gray-700 hover:text-emerald-600 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Back to Portal
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <main className="relative px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Link href="/patient-portal" className="text-emerald-500 hover:text-emerald-600 transition-colors group">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                </Link>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                  <Brain className="h-4 w-4" />
                  AI-Powered Health Assessment
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                Personalized Health Screening
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Get evidence-based health recommendations tailored to your age, gender, and risk factors using the latest USPSTF guidelines and AI analysis.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Personalized Assessment</h3>
                <p className="text-sm text-gray-600">Tailored recommendations based on your unique health profile and risk factors</p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Evidence-Based</h3>
                <p className="text-sm text-gray-600">Following current USPSTF clinical guidelines and best practices</p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quick & Easy</h3>
                <p className="text-sm text-gray-600">Complete your assessment in just a few minutes</p>
              </div>
            </div>

            {/* Main Screening Form */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/30 shadow-xl relative z-10">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Health Screening Assessment</h2>
                  </div>
                  <p className="text-gray-600">
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
            <div className="mt-16 grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-3xl p-8 border border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                  <h3 className="text-xl font-bold text-gray-900">Preventive Care Benefits</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Early detection of health conditions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Reduced healthcare costs over time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Better long-term health outcomes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Peace of mind and health confidence</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Trusted by Millions</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>USPSTF Grade A & B recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Clinically validated guidelines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Regular updates with new research</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Privacy-first approach</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>

        {/* Background Pattern */}
        <style jsx>{`
          .bg-grid-pattern {
            background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
            background-size: 50px 50px;
          }
        `}</style>
      </div>
    </div>
  )
}
