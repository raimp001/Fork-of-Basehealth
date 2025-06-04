"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Activity, FileText, Calendar, MessageSquare, Wallet, Shield, Heart, Stethoscope, Pill, ChevronRight, Zap, UserCheck, Database, Settings } from "lucide-react"

export default function PatientPortalPage() {
  return (
    <div className="min-h-screen bg-healthcare-hero">
      {/* Enhanced Header Navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-cyan-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent hover:from-sky-700 hover:to-cyan-700 transition-all duration-200">
                  BaseHealth
                </Link>
                <span className="text-sm text-gray-500 font-medium">Patient Portal</span>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <Button 
                asChild 
                variant="ghost" 
                className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 font-medium px-4 py-2 rounded-lg transition-all duration-200"
              >
                <a href="https://healthdb.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  HealthDB.ai
                </a>
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-700">Patient Portal</span>
              </div>
              <Button
                asChild
                variant="ghost"
                className="text-slate-700 hover:text-violet-600 hover:bg-violet-50 px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </Button>
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
                <Link href="/" className="text-sky-500 hover:text-sky-600 transition-colors group">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                </Link>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-700 text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  HIPAA Compliant & Secure
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Your Health Dashboard
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Access your complete health profile, connect with providers, and manage your wellness journey—all in one secure place.
              </p>
            </div>

            {/* Main Service Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {/* My Account - Enhanced */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-sky-50 to-cyan-100 rounded-3xl p-8 border border-sky-200 hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-cyan-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">My Health Profile</h3>
                      <p className="text-sm text-sky-600 font-medium">Secure & Private</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Access your complete medical history, lab results, prescriptions, and provider communications in one secure location.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      HIPAA Compliant
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      End-to-End Encrypted
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Real-time Updates
                    </div>
                  </div>
                  <Button asChild className="w-full bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 group-hover:scale-105">
                    <Link href="/medical-profile" className="flex items-center justify-center gap-2">
                      Access Profile
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* AI Screening - Enhanced */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 rounded-3xl p-8 border border-emerald-200 hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">AI Health Screening</h3>
                      <p className="text-sm text-emerald-600 font-medium">Powered by AI</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Get personalized health recommendations and preventive care suggestions based on your unique health profile and risk factors.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Evidence-based Guidelines
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Personalized Recommendations
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Risk Assessment
                    </div>
                  </div>
                  <Button asChild className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 group-hover:scale-105">
                    <Link href="/screening" className="flex items-center justify-center gap-2">
                      Start Screening
                      <Activity className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Health Wallet - Enhanced */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-violet-50 to-purple-100 rounded-3xl p-8 border border-violet-200 hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Wallet className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Health Wallet</h3>
                      <p className="text-sm text-violet-600 font-medium">Smart Payments</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Manage insurance, payments, and financial health tools. Save with crypto payments and track your healthcare spending.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                      Insurance Management
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                      Crypto Payments (2.5% off)
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                      Spending Analytics
                    </div>
                  </div>
                  <Button asChild className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 group-hover:scale-105">
                    <Link href="/wallet" className="flex items-center justify-center gap-2">
                      Open Wallet
                      <Wallet className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    </Link>
                  </Button>
                </div>
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