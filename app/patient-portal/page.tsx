"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Activity, FileText, Calendar, MessageSquare, Wallet } from "lucide-react"

export default function PatientPortalPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="flex items-center justify-between px-8 py-6 border-b">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            basehealth.xyz
          </Link>
        </div>
        <nav className="flex items-center gap-8">
          <Link href="/settings" className="text-gray-700 hover:text-indigo-600 transition-colors">
            Settings
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="text-gray-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Patient Portal</h1>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* My Medical Profile */}
            <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold">My Medical Profile</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Manage your health profile and access your complete medical records.
              </p>
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Link href="/medical-profile">View Profile</Link>
              </Button>
            </div>

            {/* AI Screening */}
            <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">AI Health Screening</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Get personalized health recommendations based on your profile.
              </p>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/screening">Start Screening</Link>
              </Button>
            </div>

            {/* Medical Records */}
            <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Medical Records</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                View and download your medical records and test results.
              </p>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/medical-profile?tab=records">View Records</Link>
              </Button>
            </div>

            {/* Appointments */}
            <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">Appointments</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Schedule and manage your upcoming appointments.
              </p>
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                <Link href="/appointment">View Appointments</Link>
              </Button>
            </div>

            {/* Messages */}
            <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold">Messages</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Communicate securely with your healthcare providers.
              </p>
              <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-700">
                <Link href="/chat">View Messages</Link>
              </Button>
            </div>

            {/* Health Wallet */}
            <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Wallet className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold">Health Wallet</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Manage your health insurance and payment information.
              </p>
              <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                <Link href="/wallet">View Wallet</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 