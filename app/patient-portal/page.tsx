"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Activity, FileText, Calendar, MessageSquare, Wallet, Shield, Heart, Stethoscope, Pill, ChevronRight, Zap, UserCheck, Database, Settings } from "lucide-react"

export default function PatientPortalPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Clean Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-slate-700" />
              </div>
              <div className="flex items-center gap-2">
                <Link href="/" className="text-2xl font-bold text-slate-900 hover:text-slate-700 transition-all duration-200">
                  BaseHealth
                </Link>
                <span className="text-sm text-slate-500 font-medium">Patient Portal</span>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <Button 
                asChild 
                variant="ghost" 
                className="text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium px-4 py-2 rounded-lg transition-all duration-200"
              >
                <a href="https://healthdb.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  HealthDB.ai
                </a>
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Patient Portal</span>
              </div>
              <Button
                asChild
                variant="ghost"
                className="text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-all duration-200"
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
      <div className="relative">
        
        <main className="relative px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Link href="/" className="text-slate-500 hover:text-slate-700 transition-colors group">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                </Link>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  HIPAA Compliant & Secure
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                Your Health Dashboard
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Access your complete health profile, connect with providers, and manage your wellness journey—all in one secure place.
              </p>
            </div>

            {/* Main Service Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {/* My Account - Enhanced */}
              <div className="group bg-white rounded-xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Shield className="h-8 w-8 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">My Health Profile</h3>
                    <p className="text-sm text-slate-600 font-medium">Secure & Private</p>
                  </div>
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">
                  Access your complete medical history, lab results, prescriptions, and provider communications in one secure location.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    HIPAA Compliant
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    End-to-End Encrypted
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    Real-time Updates
                  </div>
                </div>
                <Button asChild className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-semibold transition-all duration-300">
                  <Link href="/medical-profile" className="flex items-center justify-center gap-2">
                    Access Profile
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* AI Screening - Enhanced */}
              <div className="group bg-white rounded-xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Zap className="h-8 w-8 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">AI Health Screening</h3>
                    <p className="text-sm text-slate-600 font-medium">Powered by AI</p>
                  </div>
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">
                  Get personalized health recommendations and preventive care suggestions based on your unique health profile and risk factors.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    Evidence-based Guidelines
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    Personalized Recommendations
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    Risk Assessment
                  </div>
                </div>
                <Button asChild className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-semibold transition-all duration-300">
                  <Link href="/screening" className="flex items-center justify-center gap-2">
                    Start Screening
                    <Activity className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Health Wallet - Enhanced */}
              <div className="group bg-white rounded-xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Wallet className="h-8 w-8 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Health Wallet</h3>
                    <p className="text-sm text-slate-600 font-medium">Smart Payments</p>
                  </div>
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">
                  Manage insurance, payments, and financial health tools. Save with crypto payments and track your healthcare spending.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    Insurance Management
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    Crypto Payments (2.5% off)
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    Spending Analytics
                  </div>
                </div>
                <Button asChild className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-semibold transition-all duration-300">
                  <Link href="/wallet" className="flex items-center justify-center gap-2">
                    Open Wallet
                    <Wallet className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>


      </div>
    </div>
  )
} 