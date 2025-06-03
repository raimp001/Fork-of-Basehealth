"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Activity, FileText, Calendar, MessageSquare, Wallet, Shield, Heart, Stethoscope, Pills, ChevronRight, Clock, Star, Zap, UserCheck } from "lucide-react"

export default function PatientPortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Enhanced Header Navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
                  BaseHealth
                </Link>
                <span className="text-sm text-gray-500 font-medium">Patient Portal</span>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Secure Session</span>
              </div>
              <Link 
                href="/settings" 
                className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Settings
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
                <Link href="/" className="text-indigo-500 hover:text-indigo-600 transition-colors group">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                </Link>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  HIPAA Compliant & Secure
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Your Health Dashboard
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Access your complete health profile, connect with providers, and manage your wellness journey—all in one secure place.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Next Appointment</p>
                <p className="font-semibold text-gray-900">In 3 days</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Star className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Health Score</p>
                <p className="font-semibold text-gray-900">85/100</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Pills className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Active Medications</p>
                <p className="font-semibold text-gray-900">2 items</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <UserCheck className="h-5 w-5 text-indigo-600" />
                </div>
                <p className="text-sm text-gray-600">Providers</p>
                <p className="font-semibold text-gray-900">3 connected</p>
              </div>
            </div>

            {/* Main Service Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {/* My Account - Enhanced */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-100 rounded-3xl p-8 border border-indigo-200 hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">My Health Profile</h3>
                      <p className="text-sm text-indigo-600 font-medium">Secure & Private</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Access your complete medical history, lab results, prescriptions, and provider communications in one secure location.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      HIPAA Compliant
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      End-to-End Encrypted
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Real-time Updates
                    </div>
                  </div>
                  <Button asChild className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 group-hover:scale-105">
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
              <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 rounded-3xl p-8 border border-purple-200 hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Wallet className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Health Wallet</h3>
                      <p className="text-sm text-purple-600 font-medium">Smart Payments</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Manage insurance, payments, and financial health tools. Save with crypto payments and track your healthcare spending.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Insurance Management
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Crypto Payments (2.5% off)
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Spending Analytics
                    </div>
                  </div>
                  <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 group-hover:scale-105">
                    <Link href="/wallet" className="flex items-center justify-center gap-2">
                      Open Wallet
                      <Wallet className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Additional Services Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Appointments</h3>
                <p className="text-sm text-gray-600 mb-4">Schedule and manage your appointments</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/appointment/book">Book Now</Link>
                </Button>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Messages</h3>
                <p className="text-sm text-gray-600 mb-4">Secure communication with providers</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/chat">View Messages</Link>
                </Button>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Stethoscope className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Find Providers</h3>
                <p className="text-sm text-gray-600 mb-4">Connect with healthcare professionals</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/providers/search">Search</Link>
                </Button>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Medical Records</h3>
                <p className="text-sm text-gray-600 mb-4">Access your complete health history</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/medical-records">View Records</Link>
                </Button>
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