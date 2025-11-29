"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { StandardizedButton, PrimaryActionButton } from "@/components/ui/standardized-button"
import { Badge } from "@/components/ui/badge"
import { StandardizedInput, FormSection } from "@/components/ui/standardized-form"
import { LoadingSpinner, PageLoading } from "@/components/ui/loading"
import { FormError, useErrorHandler } from "@/components/ui/error-boundary"
import { components } from "@/lib/design-system"
import { 
  Activity, 
  Calendar, 
  FileText, 
  Heart, 
  Search, 
  FlaskConical, 
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Pill,
  Lock,
  User,
  Shield
} from "lucide-react"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import Link from "next/link"

export default function PatientPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { error, setError, clearError } = useErrorHandler()

  // Check authentication status on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('patient_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (loginForm.email && loginForm.password) {
      localStorage.setItem('patient_authenticated', 'true')
      setIsAuthenticated(true)
    } else {
      setError('Please enter valid credentials')
    }
    setIsLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('patient_authenticated')
    setIsAuthenticated(false)
    setLoginForm({ email: '', password: '' })
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50">
        <MinimalNavigation />
        
        <main className="max-w-md mx-auto px-4 sm:px-6 py-8 pt-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-800 text-white text-sm font-semibold mb-6 shadow-md">
              <Lock className="h-4 w-4" />
              Secure Access
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4 tracking-tight">
              Patient Portal Sign In
            </h1>
            <p className="text-lg text-stone-600 leading-relaxed">
              Access your health dashboard, medical records, and medication management securely.
            </p>
          </div>

          <Card className="p-8 border-2 border-stone-200 shadow-lg bg-white">
            <div className="mb-6 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-900">Your health information is protected by HIPAA and industry-standard encryption</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <StandardizedInput
                  id="email"
                  type="email"
                  label="Email Address"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <StandardizedInput
                  id="password"
                  type="password"
                  label="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                />
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block">
                  Forgot password?
                </Link>
              </div>

              {error && (
                <FormError error={error} onDismiss={clearError} />
              )}

              <PrimaryActionButton 
                type="submit" 
                disabled={isLoading}
                loading={isLoading}
                loadingText="Signing in..."
                className="w-full"
              >
                <User className="h-4 w-4" />
                Sign In to Patient Portal
              </PrimaryActionButton>
              
              <div className="mt-4">
                <StandardizedButton asChild variant="secondary" className="w-full border-2 border-stone-300 hover:border-stone-400 hover:bg-stone-50 text-stone-900">
                  <Link href="/register">
                    Create Patient Account
                  </Link>
                </StandardizedButton>
              </div>
            </form>
          </Card>
        </main>
      </div>
    )
  }

  // Show authenticated patient portal
  return <AuthenticatedPatientPortal onLogout={handleLogout} />
}

function AuthenticatedPatientPortal({ onLogout }: { onLogout: () => void }) {
  const [recentActivity] = useState([
    {
      id: 1,
      type: "screening",
      title: "Health Assessment Completed",
      description: "Your personalized screening recommendations are ready",
      date: "2 hours ago",
      status: "completed"
    },
    {
      id: 2,
      type: "appointment",
      title: "Upcoming Appointment",
      description: "Dr. Sarah Johnson - Cardiology consultation",
      date: "Tomorrow at 2:00 PM",
      status: "upcoming"
    },
    {
      id: 3,
      type: "trial",
      title: "Clinical Trial Match",
      description: "3 new trials match your health profile",
      date: "1 day ago",
      status: "new"
    }
  ])

  const [healthMetrics] = useState({
    lastScreening: "2 weeks ago",
    nextScreening: "Due in 2 weeks",
    activeTrials: 3,
    upcomingAppointments: 1
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />

      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                <Activity className="h-4 w-4" />
                Patient Dashboard
              </div>
              <StandardizedButton 
                onClick={onLogout}
                variant="secondary"
                size="sm"
              >
                <User className="h-4 w-4 mr-2" />
                Sign Out
              </StandardizedButton>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Welcome back, John
            </h1>
            <p className="text-gray-600">
              Here's your personalized health overview and next steps
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/screening">
              <Card className="p-6 border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Health Screening</h3>
                    <p className="text-sm text-gray-600">Update your assessment</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/providers/search">
              <Card className="p-6 border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Search className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Find Providers</h3>
                    <p className="text-sm text-gray-600">Book appointments</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/clinical-trials">
              <Card className="p-6 border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FlaskConical className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Clinical Trials</h3>
                    <p className="text-sm text-gray-600">Explore research studies</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/medication">
              <Card className="p-6 border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Pill className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Medication Management</h3>
                    <p className="text-sm text-gray-600">Track medications & refills</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* Health Overview */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Health Metrics */}
            <div className="lg:col-span-2">
              <Card className="p-6 border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Health Overview</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Screening</span>
                      <span className="text-sm font-medium text-gray-900">{healthMetrics.lastScreening}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Next Screening</span>
                      <span className="text-sm font-medium text-gray-900">{healthMetrics.nextScreening}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Trials</span>
                      <span className="text-sm font-medium text-gray-900">{healthMetrics.activeTrials}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Upcoming Appointments</span>
                      <span className="text-sm font-medium text-gray-900">{healthMetrics.upcomingAppointments}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-blue-900">Health Score</p>
                      <p className="text-2xl font-bold text-blue-600">85/100</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-900">Care Team</p>
                      <p className="text-2xl font-bold text-green-600">3</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card className="p-6 border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.status === 'completed' ? 'bg-green-100' :
                        activity.status === 'upcoming' ? 'bg-blue-100' :
                        'bg-purple-100'
                      }`}>
                        {activity.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : activity.status === 'upcoming' ? (
                          <Clock className="h-4 w-4 text-blue-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <StandardizedButton variant="secondary" className="w-full mt-4">
                  View all activity
                </StandardizedButton>
              </Card>
            </div>
          </div>

          {/* Recommended Actions */}
          <Card className="p-6 border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommended Actions</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Update Health Profile</h3>
                <p className="text-sm text-gray-600 mb-4">Keep your information current for better recommendations</p>
                <PrimaryActionButton size="sm">
                  Update Profile
                </PrimaryActionButton>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Schedule Checkup</h3>
                <p className="text-sm text-gray-600 mb-4">Book your annual physical examination</p>
                <PrimaryActionButton size="sm">
                  Book Appointment
                </PrimaryActionButton>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FlaskConical className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Explore Trials</h3>
                <p className="text-sm text-gray-600 mb-4">Find clinical trials that match your health profile</p>
                <PrimaryActionButton size="sm">
                  Browse Trials
                </PrimaryActionButton>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}