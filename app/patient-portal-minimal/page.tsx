"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Clock,
  FileText,
  Heart,
  Pill,
  Video,
  ChevronRight,
  Bell,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react"

// Mock data
const upcomingAppointments = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    specialty: "Family Medicine",
    date: "Tomorrow",
    time: "10:00 AM",
    type: "virtual",
    status: "confirmed"
  }
]

const healthMetrics = [
  {
    label: "Blood Pressure",
    value: "120/80",
    status: "normal",
    lastChecked: "2 days ago"
  },
  {
    label: "Weight",
    value: "165 lbs",
    trend: "-2 lbs",
    lastChecked: "1 week ago"
  },
  {
    label: "Sleep",
    value: "7.5 hrs",
    status: "good",
    lastChecked: "Today"
  }
]

const screeningReminders = [
  {
    id: 1,
    title: "Annual Physical",
    dueIn: "1 month",
    priority: "medium"
  },
  {
    id: 2,
    title: "Dental Cleaning",
    dueIn: "2 weeks",
    priority: "low"
  }
]

export default function PatientPortalMinimal() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Good morning, John</h1>
              <p className="text-sm text-gray-600 mt-1">Here's your health overview</p>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-600">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Button asChild variant="outline" className="h-auto flex-col py-4 border-gray-200 hover:bg-gray-50">
            <Link href="/appointment/book">
              <Calendar className="h-5 w-5 mb-2 text-gray-600" />
              <span className="text-sm">Book Appointment</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col py-4 border-gray-200 hover:bg-gray-50">
            <Link href="/medical-records">
              <FileText className="h-5 w-5 mb-2 text-gray-600" />
              <span className="text-sm">Records</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col py-4 border-gray-200 hover:bg-gray-50">
            <Link href="/medication">
              <Pill className="h-5 w-5 mb-2 text-gray-600" />
              <span className="text-sm">Medications</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col py-4 border-gray-200 hover:bg-gray-50">
            <Link href="/chat">
              <Heart className="h-5 w-5 mb-2 text-gray-600" />
              <span className="text-sm">Health Chat</span>
            </Link>
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Primary Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointments */}
            <Card className="p-6 border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                <Link href="/appointments" className="text-sm text-gray-600 hover:text-gray-900">
                  View all
                </Link>
              </div>
              
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{appointment.doctor}</h3>
                        <p className="text-sm text-gray-600">{appointment.specialty}</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {appointment.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {appointment.time}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                        Join video call
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-200">
                        Reschedule
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {upcomingAppointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No upcoming appointments</p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link href="/appointment/book">Book appointment</Link>
                  </Button>
                </div>
              )}
            </Card>

            {/* Health Metrics */}
            <Card className="p-6 border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Health Metrics</h2>
                <Link href="/health/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                  View details
                </Link>
              </div>
              
              <div className="grid sm:grid-cols-3 gap-4">
                {healthMetrics.map((metric, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm text-gray-600">{metric.label}</span>
                      {metric.status && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            metric.status === 'normal' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {metric.status}
                        </Badge>
                      )}
                    </div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {metric.value}
                    </div>
                    {metric.trend && (
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-sm text-green-600">{metric.trend}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {metric.lastChecked}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Secondary Info */}
          <div className="space-y-6">
            {/* Health Score */}
            <Card className="p-6 border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Score</h3>
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#10b981"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.85)}`}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">85</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Your health score is <span className="font-semibold text-green-600">excellent</span>
                </p>
                <Button asChild variant="link" className="mt-2 text-sm">
                  <Link href="/health/dashboard">
                    How is this calculated?
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Screening Reminders */}
            <Card className="p-6 border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Screening Reminders</h3>
                <Badge variant="secondary" className="text-xs">
                  {screeningReminders.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {screeningReminders.map((reminder) => (
                  <Link
                    key={reminder.id}
                    href="/screening"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        reminder.priority === 'high' ? 'bg-red-500' :
                        reminder.priority === 'medium' ? 'bg-amber-500' :
                        'bg-gray-400'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {reminder.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          Due in {reminder.dueIn}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  </Link>
                ))}
              </div>
              
              <Button asChild variant="outline" className="w-full mt-4 border-gray-200">
                <Link href="/screening">
                  View all recommendations
                </Link>
              </Button>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Appointments</span>
                  <span className="text-sm font-medium text-gray-900">3 completed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Medications</span>
                  <span className="text-sm font-medium text-gray-900">All on schedule</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tests</span>
                  <span className="text-sm font-medium text-gray-900">2 results ready</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
