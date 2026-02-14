"use client"

/**
 * Patient Portal Dashboard - Claude.ai Design
 */

import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { 
  ArrowRight, Calendar, FileText, 
  ClipboardList, FlaskConical, Users, Bell, Settings,
  TrendingUp, Shield, Watch, Link2, Pill, TestTube2, ScanLine, Receipt, Newspaper
} from "lucide-react"

type SupportedDevice = {
  id: string
  name: string
  category: "activity" | "heart" | "sleep"
}

type Insight = {
  id: string
  title: string
  recommendation: string
  severity: "info" | "attention"
}

type CareSnapshot = {
  partners: Array<{ id: string; name: string; type: "pharmacy" | "lab" | "imaging"; address: string; phone: string }>
  priorAuth: Array<{ id: string; medicationOrService: string; status: "draft" | "submitted" | "approved" }>
  receipts: Array<{ id: string; amountUsd: number; status: "paid" | "pending"; description: string }>
  updates: Array<{ id: string; title: string; summary: string; audience: "patient" | "provider" }>
  openCloud: { enabled: boolean; version: string; capabilities: string[] }
}

export default function PatientPortalPage() {
  const [mounted, setMounted] = useState(false)
  const { data: session } = useSession()
  const [supportedDevices, setSupportedDevices] = useState<SupportedDevice[]>([])
  const [connectedDevices, setConnectedDevices] = useState<string[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [careSnapshot, setCareSnapshot] = useState<CareSnapshot | null>(null)
  const [careActionMessage, setCareActionMessage] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadDevices = async () => {
      const response = await fetch('/api/devices/recommendations')
      if (!response.ok) return
      const data = await response.json()
      setSupportedDevices(data.devices || [])
    }

    loadDevices()
  }, [])

  useEffect(() => {
    const loadCareSnapshot = async () => {
      const patientId = session?.user?.email || "demo-patient"
      const response = await fetch(`/api/care-orchestration?patientId=${encodeURIComponent(patientId)}`)
      if (!response.ok) return
      const data = await response.json()
      setCareSnapshot(data)
    }

    loadCareSnapshot()
  }, [session?.user?.email])

  const deviceMetrics = useMemo(() => {
    if (connectedDevices.length === 0) return {}

    return {
      steps: 4200 + connectedDevices.length * 1400,
      restingHeartRate: 88 - connectedDevices.length,
      sleepHours: 5.8 + connectedDevices.length * 0.6,
    }
  }, [connectedDevices])

  useEffect(() => {
    const refreshInsights = async () => {
      setIsLoadingInsights(true)
      const response = await fetch('/api/devices/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: deviceMetrics }),
      })

      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights || [])
      }

      setIsLoadingInsights(false)
    }

    refreshInsights()
  }, [deviceMetrics])

  const toggleDeviceConnection = (deviceId: string) => {
    setConnectedDevices((current) =>
      current.includes(deviceId)
        ? current.filter((item) => item !== deviceId)
        : [...current, deviceId]
    )
  }

  const requestPrimaryCareFollowUp = async () => {
    const attentionInsights = insights.filter((insight) => insight.severity === "attention")

    const response = await fetch('/api/care-orchestration/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'primary-care-follow-up',
        payload: {
          patientId: session?.user?.email || 'demo-patient',
          reason: attentionInsights.map((item) => item.title).join(', ') || 'Patient requested follow-up',
        },
      }),
    })

    if (response.ok) {
      setCareActionMessage('Primary care follow-up requested. Your care team will review your device trends.')
    }
  }

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
    { title: 'Connect Devices', description: 'Sync wearable data for recommendations', icon: Watch, href: '/patient-portal#device-connect' },
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

  const easyActionPlan = [
    insights.find((item) => item.severity === 'attention')
      ? 'Review your top health alert and request PCP follow-up.'
      : 'No urgent alerts today. Keep your current routine.',
    connectedDevices.length === 0
      ? 'Connect at least one device to get more personalized recommendations.'
      : `You have ${connectedDevices.length} connected device${connectedDevices.length > 1 ? 's' : ''}. Keep syncing daily.`,
    careSnapshot?.priorAuth?.some((item) => item.status !== 'approved')
      ? 'You have pending prior authorizations. We are tracking them for you.'
      : 'No pending prior auth tasks right now.',
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

          {/* Easy Today Plan */}
          <section className={`mb-8 ${mounted ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
            <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <h2 className="text-lg font-medium mb-2">Your simple plan for today</h2>
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>We turned everything into 3 easy steps.</p>
              <ol className="space-y-2 list-decimal pl-5">
                {easyActionPlan.map((item, index) => (
                  <li key={index} className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</li>
                ))}
              </ol>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={requestPrimaryCareFollowUp}
                  className="text-sm px-3 py-2 rounded-lg border"
                  style={{ backgroundColor: 'rgba(212, 165, 116, 0.10)', borderColor: 'var(--border-subtle)' }}
                >
                  One-tap: Request PCP follow-up
                </button>
              </div>
            </div>
          </section>

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

              {/* Device Connect */}
              <section id="device-connect" className={`${mounted ? 'animate-fade-in-up delay-400' : 'opacity-0'}`}>
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Watch className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                      <h2 className="font-medium text-sm">Device Connect</h2>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {connectedDevices.length} connected
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    {supportedDevices.map((device) => {
                      const isConnected = connectedDevices.includes(device.id)
                      return (
                        <button
                          key={device.id}
                          type="button"
                          onClick={() => toggleDeviceConnection(device.id)}
                          className="w-full p-2 rounded-lg border text-left flex items-center justify-between"
                          style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)' }}
                        >
                          <span className="text-xs font-medium">{device.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: isConnected ? 'rgba(107, 155, 107, 0.2)' : 'rgba(255,255,255,0.06)' }}>
                            {isConnected ? 'Connected' : 'Connect'}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Link2 className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                      <p className="text-xs font-medium">Personalized recommendations</p>
                    </div>
                    {isLoadingInsights ? (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Refreshing insights...</p>
                    ) : (
                      insights.slice(0, 2).map((insight) => (
                        <div
                          key={insight.id}
                          className="text-xs p-2 rounded-lg"
                          style={{
                            backgroundColor: insight.severity === 'attention' ? 'rgba(212, 165, 116, 0.12)' : 'var(--bg-tertiary)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          <p className="font-medium mb-1">{insight.title}</p>
                          <p>{insight.recommendation}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>

              {/* Care Coordination */}
              <section className={`${mounted ? 'animate-fade-in-up delay-400' : 'opacity-0'}`}>
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                  <h2 className="font-medium text-sm mb-3">Care Coordination</h2>

                  <div className="grid grid-cols-1 gap-2 mb-3">
                    {(careSnapshot?.partners || []).map((partner) => (
                      <div key={partner.id} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <p className="text-xs font-medium flex items-center gap-2">
                          {partner.type === 'pharmacy' ? <Pill className="h-3 w-3" /> : partner.type === 'lab' ? <TestTube2 className="h-3 w-3" /> : <ScanLine className="h-3 w-3" />}
                          {partner.name}
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{partner.address} • {partner.phone}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={requestPrimaryCareFollowUp}
                    className="w-full text-xs p-2 rounded-lg border"
                    style={{ backgroundColor: 'rgba(212, 165, 116, 0.10)', borderColor: 'var(--border-subtle)' }}
                  >
                    Request primary care follow-up
                  </button>
                  {careActionMessage && <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>{careActionMessage}</p>}
                </div>
              </section>

              {/* Billing & Prior Auth */}
              <section className={`${mounted ? 'animate-fade-in-up delay-400' : 'opacity-0'}`}>
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                  <h2 className="font-medium text-sm mb-3">Billing, Receipts & Prior Auth</h2>
                  <div className="space-y-2 mb-2">
                    {(careSnapshot?.receipts || []).slice(0, 2).map((receipt) => (
                      <div key={receipt.id} className="text-xs p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <p className="font-medium flex items-center gap-1"><Receipt className="h-3 w-3" /> ${receipt.amountUsd} • {receipt.status}</p>
                        <p style={{ color: 'var(--text-muted)' }}>{receipt.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {(careSnapshot?.priorAuth || []).slice(0, 2).map((item) => (
                      <p key={item.id} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Prior auth: {item.medicationOrService} ({item.status})
                      </p>
                    ))}
                  </div>
                </div>
              </section>

              {/* Updates */}
              <section className={`${mounted ? 'animate-fade-in-up delay-400' : 'opacity-0'}`}>
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                  <h2 className="font-medium text-sm mb-3">Articles & Updates</h2>
                  {(careSnapshot?.updates || []).map((update) => (
                    <div key={update.id} className="text-xs p-2 rounded-lg mb-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <p className="font-medium flex items-center gap-1"><Newspaper className="h-3 w-3" /> {update.title}</p>
                      <p style={{ color: 'var(--text-muted)' }}>{update.summary}</p>
                    </div>
                  ))}
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    OpenCloud agent: {careSnapshot?.openCloud?.enabled ? `enabled (${careSnapshot.openCloud.version})` : 'disabled'}
                  </p>
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
