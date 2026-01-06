"use client"

/**
 * Patient Portal Dashboard - Palantir-Inspired Design
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Activity, ArrowRight, Calendar, FileText, Heart, 
  ClipboardList, FlaskConical, Users, Bell, Settings,
  ChevronRight, TrendingUp, Shield
} from "lucide-react"

export default function PatientPortalPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const quickActions = [
    { 
      title: 'Health Screening', 
      description: 'Get personalized recommendations',
      icon: ClipboardList, 
      href: '/screening',
      color: 'text-green-400'
    },
    { 
      title: 'Find Providers', 
      description: 'Search doctors & specialists',
      icon: Users, 
      href: '/providers/search',
      color: 'text-blue-400'
    },
    { 
      title: 'Clinical Trials', 
      description: 'Browse active studies',
      icon: FlaskConical, 
      href: '/clinical-trials',
      color: 'text-purple-400'
    },
    { 
      title: 'Messages', 
      description: 'Secure provider communication',
      icon: FileText, 
      href: '/messages',
      color: 'text-orange-400'
    },
  ]

  const upcomingAppointments = [
    { 
      provider: 'Dr. Sarah Chen', 
      specialty: 'Primary Care',
      date: 'Jan 15, 2026',
      time: '10:00 AM',
      type: 'Virtual'
    },
    { 
      provider: 'Dr. Michael Torres', 
      specialty: 'Cardiology',
      date: 'Jan 22, 2026',
      time: '2:30 PM',
      type: 'In-Person'
    },
  ]

  const healthMetrics = [
    { label: 'Screenings Due', value: '3', trend: 'Schedule now' },
    { label: 'Active Providers', value: '4', trend: '+1 this month' },
    { label: 'Health Score', value: '85', trend: '+5 from last' },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-medium">BaseHealth</span>
            </Link>
            <div className="flex items-center gap-4">
              <button className="p-2 text-neutral-400 hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-neutral-400 hover:text-white transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-sm font-medium">
                JD
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className={`mb-12 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
              Welcome back, <span className="text-neutral-500">John</span>
            </h1>
            <p className="text-xl text-neutral-400">
              Your health dashboard at a glance.
            </p>
          </div>

          {/* Health Metrics */}
          <div className={`grid md:grid-cols-3 gap-6 mb-12 ${mounted ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
            {healthMetrics.map((metric) => (
              <div 
                key={metric.label} 
                className="p-6 bg-neutral-950 border border-white/5 rounded-2xl"
              >
                <p className="text-sm text-neutral-500 mb-2">{metric.label}</p>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-medium">{metric.value}</span>
                  <span className="text-sm text-neutral-500 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    {metric.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <section className={`${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
                <h2 className="text-xl font-medium mb-6">Quick Actions</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="group p-6 bg-neutral-950 border border-white/5 rounded-2xl hover:border-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 bg-neutral-900 rounded-xl ${action.color}`}>
                          <action.icon className="h-6 w-6" />
                        </div>
                        <ChevronRight className="h-5 w-5 text-neutral-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-1">{action.title}</h3>
                      <p className="text-sm text-neutral-500">{action.description}</p>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Appointments */}
              <section className={`${mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium">Upcoming Appointments</h2>
                  <Link href="/appointments" className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1">
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {upcomingAppointments.map((appt, index) => (
                    <div 
                      key={index} 
                      className="p-6 bg-neutral-950 border border-white/5 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-neutral-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">{appt.provider}</h3>
                          <p className="text-sm text-neutral-500">{appt.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{appt.date}</p>
                        <p className="text-sm text-neutral-500">{appt.time} • {appt.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className={`space-y-6 ${mounted ? 'animate-fade-in-up delay-400' : 'opacity-0'}`}>
              {/* Health Score Card */}
              <div className="p-6 bg-neutral-950 border border-white/5 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="h-5 w-5 text-red-400" />
                  <h3 className="font-medium">Health Score</h3>
                </div>
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="#262626"
                        strokeWidth="8"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${85 * 3.51} 351`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-medium">85</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-neutral-500 text-center">
                  Good health status. Complete your screenings to improve.
                </p>
              </div>

              {/* Security Status */}
              <div className="p-6 bg-neutral-950 border border-white/5 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-5 w-5 text-green-400" />
                  <h3 className="font-medium">Account Security</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">2FA Enabled</span>
                    <span className="text-green-400">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Last Login</span>
                    <span className="text-neutral-400">Today, 9:15 AM</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="p-6 bg-neutral-950 border border-white/5 rounded-2xl">
                <h3 className="font-medium mb-4">Quick Links</h3>
                <div className="space-y-2">
                  {['Medical Records', 'Billing', 'Settings', 'Help Center'].map((link) => (
                    <Link
                      key={link}
                      href={`/${link.toLowerCase().replace(' ', '-')}`}
                      className="flex items-center justify-between py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      {link}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
