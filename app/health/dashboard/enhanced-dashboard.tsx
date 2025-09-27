"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StandardizedButton, PrimaryActionButton } from "@/components/ui/standardized-button"
import { LoadingSpinner, DashboardSkeleton } from "@/components/ui/loading"
import { 
  Activity, 
  Calendar, 
  Heart, 
  Pill, 
  FileText, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  MessageSquare,
  Video,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"

interface HealthMetric {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  changePercent?: number
  status: 'good' | 'warning' | 'critical'
  icon: React.ElementType
}

interface Appointment {
  id: string
  provider: string
  specialty: string
  date: Date
  time: string
  type: 'in-person' | 'virtual'
  status: 'upcoming' | 'completed' | 'cancelled'
}

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  nextDose: Date
  refillDate: Date
  adherence: number
}

export function EnhancedHealthDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [medications, setMedications] = useState<Medication[]>([])

  useEffect(() => {
    if (!user) return

    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock health metrics
      setHealthMetrics([
        {
          label: "Heart Rate",
          value: 72,
          unit: "bpm",
          trend: 'stable',
          status: 'good',
          icon: Heart
        },
        {
          label: "Blood Pressure",
          value: "120/80",
          unit: "mmHg",
          trend: 'down',
          changePercent: -5,
          status: 'good',
          icon: Activity
        },
        {
          label: "Steps Today",
          value: "7,842",
          unit: "steps",
          trend: 'up',
          changePercent: 12,
          status: 'good',
          icon: TrendingUp
        },
        {
          label: "Sleep Quality",
          value: 85,
          unit: "%",
          trend: 'up',
          changePercent: 8,
          status: 'good',
          icon: Clock
        }
      ])

      // Mock appointments
      setAppointments([
        {
          id: "1",
          provider: "Dr. Sarah Johnson",
          specialty: "Primary Care",
          date: new Date(Date.now() + 86400000 * 3),
          time: "10:00 AM",
          type: 'in-person',
          status: 'upcoming'
        },
        {
          id: "2",
          provider: "Dr. Michael Chen",
          specialty: "Cardiology",
          date: new Date(Date.now() + 86400000 * 10),
          time: "2:30 PM",
          type: 'virtual',
          status: 'upcoming'
        }
      ])

      // Mock medications
      setMedications([
        {
          id: "1",
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          nextDose: new Date(Date.now() + 3600000 * 8),
          refillDate: new Date(Date.now() + 86400000 * 15),
          adherence: 95
        },
        {
          id: "2",
          name: "Metformin",
          dosage: "500mg",
          frequency: "Twice daily",
          nextDose: new Date(Date.now() + 3600000 * 2),
          refillDate: new Date(Date.now() + 86400000 * 20),
          adherence: 88
        }
      ])

      setIsLoading(false)
    }

    loadDashboardData()
  }, [user])

  if (authLoading || isLoading) {
    return <DashboardSkeleton />
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Please log in to view your health dashboard</p>
        <PrimaryActionButton asChild>
          <Link href="/login">Sign In</Link>
        </PrimaryActionButton>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case 'down': return <ArrowDownRight className="h-4 w-4 text-red-600" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's your health overview for {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{metric.label}</p>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-2xl font-semibold text-gray-900">
                        {metric.value}
                      </span>
                      {metric.unit && (
                        <span className="text-sm text-gray-500">{metric.unit}</span>
                      )}
                    </div>
                    {metric.trend && metric.changePercent !== undefined && (
                      <div className="flex items-center gap-1 mt-2">
                        {getTrendIcon(metric.trend)}
                        <span className={`text-sm ${
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${getStatusColor(metric.status)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>
              Your scheduled visits and consultations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{appointment.provider}</p>
                    <p className="text-sm text-gray-600">{appointment.specialty}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(appointment.date, 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {appointment.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={
                      appointment.type === 'virtual' ? 'border-blue-200 text-blue-700' : 'border-gray-200'
                    }>
                      {appointment.type === 'virtual' ? <Video className="h-3 w-3 mr-1" /> : null}
                      {appointment.type}
                    </Badge>
                    {appointment.type === 'virtual' && (
                      <PrimaryActionButton size="sm">
                        Join Call
                      </PrimaryActionButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <StandardizedButton asChild className="w-full">
                <Link href="/appointment/book">Schedule New Appointment</Link>
              </StandardizedButton>
            </div>
          </CardContent>
        </Card>

        {/* Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Medications
            </CardTitle>
            <CardDescription>
              Your active prescriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medications.map((medication) => (
                <div key={medication.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{medication.name}</p>
                      <p className="text-sm text-gray-600">
                        {medication.dosage} - {medication.frequency}
                      </p>
                    </div>
                    <Badge variant="outline" className={
                      medication.adherence >= 90 ? 'border-green-200 text-green-700' : 
                      medication.adherence >= 80 ? 'border-yellow-200 text-yellow-700' : 
                      'border-red-200 text-red-700'
                    }>
                      {medication.adherence}% adherence
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Next dose: {format(medication.nextDose, 'h:mm a')}</p>
                    <p>Refill by: {format(medication.refillDate, 'MMM d')}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <StandardizedButton asChild variant="secondary" className="w-full">
                <Link href="/medication">Manage Medications</Link>
              </StandardizedButton>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StandardizedButton asChild variant="secondary" className="flex-col h-24 gap-2">
              <Link href="/chat">
                <MessageSquare className="h-5 w-5" />
                <span>Health Chat</span>
              </Link>
            </StandardizedButton>
            <StandardizedButton asChild variant="secondary" className="flex-col h-24 gap-2">
              <Link href="/providers/search">
                <Users className="h-5 w-5" />
                <span>Find Provider</span>
              </Link>
            </StandardizedButton>
            <StandardizedButton asChild variant="secondary" className="flex-col h-24 gap-2">
              <Link href="/medical-records">
                <FileText className="h-5 w-5" />
                <span>Medical Records</span>
              </Link>
            </StandardizedButton>
            <StandardizedButton asChild variant="secondary" className="flex-col h-24 gap-2">
              <Link href="/billing">
                <DollarSign className="h-5 w-5" />
                <span>Billing</span>
              </Link>
            </StandardizedButton>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
