"use client"

/**
 * Patient Portal Dashboard - Claude.ai Design
 */

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { 
  ArrowRight, Calendar, FileText, 
  ClipboardList, FlaskConical, Users, Bell, Settings,
  TrendingUp, Shield
} from "lucide-react"

export default function PatientPortalPage() {
  const [mounted, setMounted] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  const userName = session?.user?.name 
    ? session.user.name.split(' ')[0] 
    : "there"

  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : "?"

  const quickActions = [
    { title: 'Health Screening', description: 'Get personalized recommendations', icon: ClipboardList, href: '/screening' },
    { title: 'Find Providers', description: 'Search doctors & specialists', icon: Users, href: '/providers/search' },
    { title: 'Clinical Trials', description: 'Browse active studies', icon: FlaskConical, href: '/clinical-trials' },
    { title: 'Messages', description: 'Secure provider communication', icon: FileText, href: '/messages' },
  ]

  const upcomingAppointments = [
    { provider: 'Dr. Sarah Chen', specialty: 'Primary Care', date: 'Jan 15, 2026', time: '10:00 AM', type: 'Virtual' },
    { provider: 'Dr. Michael Torres', specialty: 'Cardiology', date: 'Jan 22, 2026', time: '2:30 PM', type: 'In-Person' },
  ]

  const healthMetrics = [
    { label: 'Screenings Due', value: '3', trend: 'Schedule now' },
    { label: 'Active Providers', value: '4', trend: '+1 this month' },
    { label: 'Health Score', value: '85', trend: '+5 from last' },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b" style={{ backgroundColor: 'rgba(26, 25, 21, 0.9)', borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-lg font-medium tracking-tight hover:opacity-80 transition-opacity">
              BaseHealth
            </Link>
            <div className="flex items-center gap-4">
              <button className="p-2 transition-colors" style={{ color: 'var(--text-muted)' }}>
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 transition-colors" style={{ color: 'var(--text-muted)' }}>
                <Settings className="h-5 w-5" />
              </button>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                {userInitials}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-24">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className={`mb-10 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h1 className="text-3xl md:text-4xl font-normal tracking-tight mb-2">
              Welcome back, <span style={{ color: 'var(--text-secondary)' }}>{userName}</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Your health dashboard at a glance.
            </p>
          </div>

          {/* Health Metrics */}
          <div className={`grid md:grid-cols-3 gap-4 mb-10 ${mounted ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
            {healthMetrics.map((metric) => (
              <div 
                key={metric.label} 
                className="p-5 rounded-xl border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
              >
                <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{metric.label}</p>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-normal">{metric.value}</span>
                  <span className="text-sm flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <TrendingUp className="h-4 w-4" style={{ color: '#6b9b6b' }} />
                    {metric.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <section className={`${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
                <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="group p-5 rounded-xl border transition-all"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                          <action.icon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                        </div>
                        <ArrowRight className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <h3 className="font-medium mb-1">{action.title}</h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{action.description}</p>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Recent Activity */}
              <section className={`${mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
                <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
                <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(107, 155, 107, 0.1)' }}>
                        <ClipboardList className="h-4 w-4" style={{ color: '#6b9b6b' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Health screening completed</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>3 new recommendations</p>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>2h ago</span>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(212, 165, 116, 0.1)' }}>
                        <Calendar className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Appointment scheduled</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Dr. Sarah Chen - Jan 15</p>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Yesterday</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Upcoming Appointments */}
              <section className={`${mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-medium">Upcoming</h2>
                  <Link href="/appointments" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
                    View all
                  </Link>
                </div>
                <div className="space-y-3">
                  {upcomingAppointments.map((apt, i) => (
                    <div 
                      key={i}
                      className="p-4 rounded-xl border"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm">{apt.provider}</h3>
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                          {apt.type}
                        </span>
                      </div>
                      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{apt.specialty}</p>
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Calendar className="h-3 w-3" />
                        {apt.date} at {apt.time}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Security Status */}
              <section className={`${mounted ? 'animate-fade-in-up delay-400' : 'opacity-0'}`}>
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-5 w-5" style={{ color: '#6b9b6b' }} />
                    <span className="font-medium text-sm">HIPAA Secured</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Your health data is encrypted and protected.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
