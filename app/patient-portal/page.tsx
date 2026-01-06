"use client"

/**
 * Patient Portal Dashboard - Palantir-Grade Enterprise UI
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Activity,
  Calendar,
  Heart,
  FlaskConical,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  ChevronRight,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Shield,
  TrendingUp,
  Target,
  Pill,
  ArrowRight,
  LogOut,
  Stethoscope,
} from "lucide-react"

export default function PatientPortalPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock user data
  const user = {
    name: "Alex Thompson",
    email: "alex@example.com",
    healthScore: 82,
    lastVisit: "Dec 15, 2025",
    upcomingAppointments: 2,
    completedScreenings: 5,
    pendingScreenings: 2,
  }

  const upcomingAppointments = [
    {
      id: 1,
      provider: "Dr. Sarah Chen",
      specialty: "Primary Care",
      date: "Jan 10, 2026",
      time: "10:00 AM",
      type: "in-person",
    },
    {
      id: 2,
      provider: "Dr. Michael Ross",
      specialty: "Cardiology",
      date: "Jan 18, 2026",
      time: "2:30 PM",
      type: "video",
    },
  ]

  const recentScreenings = [
    { name: "Blood Pressure Check", status: "completed", date: "Dec 20, 2025", result: "Normal" },
    { name: "Cholesterol Panel", status: "completed", date: "Dec 15, 2025", result: "Review needed" },
    { name: "Diabetes Screening", status: "due", date: "Due Jan 2026", result: null },
    { name: "Colorectal Cancer", status: "due", date: "Due Feb 2026", result: null },
  ]

  const quickActions = [
    { icon: Calendar, label: "Book Appointment", href: "/providers/search", color: "cyan" },
    { icon: Activity, label: "Health Screening", href: "/screening", color: "emerald" },
    { icon: FlaskConical, label: "Clinical Trials", href: "/clinical-trials", color: "purple" },
    { icon: MessageSquare, label: "Message Provider", href: "/chat", color: "amber" },
  ]

  return (
    <div className="min-h-screen bg-[#07070c] text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#07070c]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-black" />
                </div>
                <span className="text-lg font-semibold">BaseHealth</span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                <Link href="/patient-portal" className="px-4 py-2 text-sm text-white bg-white/5 rounded-lg">
                  Dashboard
                </Link>
                <Link href="/screening" className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                  Screenings
                </Link>
                <Link href="/providers/search" className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                  Providers
                </Link>
                <Link href="/clinical-trials" className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                  Trials
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white hover:bg-white/5">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full" />
              </Button>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5">
                <Settings className="h-5 w-5" />
              </Button>
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-medium text-black">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Welcome Section */}
          <div className={`mb-8 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium mb-4">
              <CheckCircle className="h-3.5 w-3.5" />
              All Systems Operational
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
              Welcome back, {user.name.split(' ')[0]}
            </h1>
            <p className="text-zinc-400">
              Last sign in: {user.lastVisit}
            </p>
          </div>

          {/* Quick Actions */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 ${mounted ? 'animate-fade-in-up animation-delay-100' : 'opacity-0'}`}>
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <Card className="p-4 bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer group h-full">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                    action.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400' :
                    action.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                    action.color === 'purple' ? 'bg-purple-500/10 text-purple-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                    {action.label}
                  </span>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Health Score Card */}
            <Card className={`p-6 bg-white/[0.02] border-white/5 ${mounted ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">Health Score</div>
                  <div className="text-4xl font-mono font-semibold text-white">{user.healthScore}</div>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="rgb(34, 211, 238)"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - user.healthScore / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-cyan-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Completed Screenings</span>
                  <span className="text-white font-mono">{user.completedScreenings}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Pending Screenings</span>
                  <span className="text-amber-400 font-mono">{user.pendingScreenings}</span>
                </div>
              </div>

              <Link href="/screening">
                <Button className="w-full mt-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white">
                  View All Screenings
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </Card>

            {/* Upcoming Appointments */}
            <Card className={`p-6 bg-white/[0.02] border-white/5 ${mounted ? 'animate-fade-in-up animation-delay-300' : 'opacity-0'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Upcoming Appointments</div>
                <Badge className="bg-white/5 text-zinc-400 border-white/10 text-xs">
                  {upcomingAppointments.length}
                </Badge>
              </div>

              <div className="space-y-4">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="p-4 bg-white/[0.02] rounded-lg border border-white/5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-white">{apt.provider}</h4>
                        <p className="text-sm text-zinc-500">{apt.specialty}</p>
                      </div>
                      <Badge className={`text-xs ${
                        apt.type === 'video' 
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {apt.type === 'video' ? 'Video Call' : 'In-Person'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {apt.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {apt.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/appointment">
                <Button className="w-full mt-6 bg-cyan-500 hover:bg-cyan-400 text-black">
                  Book New Appointment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </Card>

            {/* Recent Screenings */}
            <Card className={`p-6 bg-white/[0.02] border-white/5 ${mounted ? 'animate-fade-in-up animation-delay-400' : 'opacity-0'}`}>
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-6">
                Screening Status
              </div>

              <div className="space-y-3">
                {recentScreenings.map((screening, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      {screening.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{screening.name}</p>
                        <p className="text-xs text-zinc-500">{screening.date}</p>
                      </div>
                    </div>
                    {screening.result && (
                      <Badge className={`text-xs ${
                        screening.result === 'Normal' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {screening.result}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <Link href="/screening">
                <Button className="w-full mt-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white">
                  Complete Screenings
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </div>

          {/* Additional Sections */}
          <div className={`grid md:grid-cols-2 gap-6 mt-6 ${mounted ? 'animate-fade-in-up animation-delay-500' : 'opacity-0'}`}>
            {/* Health Records */}
            <Card className="p-6 bg-white/[0.02] border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-rose-500/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Health Records</h3>
                  <p className="text-sm text-zinc-500">Access your medical history</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  { label: "Lab Results", count: 12 },
                  { label: "Medications", count: 3 },
                  { label: "Documents", count: 8 },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 bg-white/[0.02] rounded-lg border border-white/5">
                    <div className="text-2xl font-mono font-semibold text-white">{item.count}</div>
                    <div className="text-xs text-zinc-500">{item.label}</div>
                  </div>
                ))}
              </div>
              <Link href="/medical-records">
                <Button className="w-full mt-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white">
                  View Records
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </Card>

            {/* Clinical Trials */}
            <Card className="p-6 bg-white/[0.02] border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <FlaskConical className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Clinical Trials</h3>
                  <p className="text-sm text-zinc-500">Research opportunities</p>
                </div>
              </div>
              <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/10 mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">3 Trials Match Your Profile</span>
                </div>
                <p className="text-sm text-zinc-500">
                  Based on your health data, we found clinical trials you may be eligible for.
                </p>
              </div>
              <Link href="/clinical-trials">
                <Button className="w-full mt-6 bg-purple-500 hover:bg-purple-400 text-black">
                  Explore Trials
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </div>

          {/* Security Notice */}
          <div className={`mt-8 p-4 bg-white/[0.02] rounded-lg border border-white/5 flex items-center justify-between ${mounted ? 'animate-fade-in animation-delay-500' : 'opacity-0'}`}>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-cyan-400" />
              <div>
                <span className="text-sm text-white">Your data is protected with end-to-end encryption</span>
                <span className="text-sm text-zinc-500 ml-2">HIPAA compliant</span>
              </div>
            </div>
            <Link href="/settings" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
              Privacy Settings →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
