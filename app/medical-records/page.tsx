"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Download, Eye, Calendar, Activity, Heart, Beaker, Lock, Shield, User } from "lucide-react"
import { useState, useEffect } from "react"

interface MedicalRecord {
  id: number
  patientId: string
  type: string
  title: string
  date: string
  provider: string
  status: string
  category: string
  confidential: boolean
}

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', patientId: '' })

  // Check authentication and load records
  useEffect(() => {
    loadMedicalRecords()
  }, [])

  const loadMedicalRecords = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/medical-records')
      
      if (response.status === 401) {
        setIsAuthenticated(false)
        setError('Please log in to access your medical records.')
        return
      }
      
      if (response.status === 403) {
        setError('Access denied. Only patients can view medical records.')
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to load medical records')
      }
      
      const data = await response.json()
      setRecords(data.records)
      setUser(data.patient)
      setIsAuthenticated(true)
      setError(null)
      
    } catch (err) {
      console.error('Error loading medical records:', err)
      setError('Unable to load medical records. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      })
      
      if (!response.ok) {
        throw new Error('Login failed')
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Reload medical records after successful login
        await loadMedicalRecords()
      }
      
    } catch (err) {
      console.error('Login error:', err)
      setError('Login failed. Please check your credentials.')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/login', { method: 'DELETE' })
      setIsAuthenticated(false)
      setUser(null)
      setRecords([])
      setError(null)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const getRecordIcon = (category: string) => {
    switch (category) {
      case 'lab': return Beaker
      case 'imaging': return Activity
      case 'visit': return FileText
      case 'prescription': return Heart
      default: return FileText
    }
  }

  const getRecordColor = (category: string) => {
    switch (category) {
      case 'lab': return 'bg-blue-100 text-blue-600'
      case 'imaging': return 'bg-green-100 text-green-600'
      case 'visit': return 'bg-indigo-100 text-indigo-600'
      case 'prescription': return 'bg-purple-100 text-purple-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
      case 'complete':
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'elevated':
      case 'abnormal':
        return 'bg-red-100 text-red-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Show login form if not authenticated
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="flex items-center justify-between px-8 py-6 border-b">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              basehealth.xyz
            </Link>
          </div>
          <nav className="flex items-center gap-8">
            <Link href="/patient-portal" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Patient Portal
            </Link>
          </nav>
        </header>

        <main className="px-8 py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-white border rounded-xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Lock className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Secure Access Required</h1>
                  <p className="text-gray-600">Please log in to view your medical records</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient ID (Demo)
                  </label>
                  <select
                    value={loginForm.patientId}
                    onChange={(e) => setLoginForm({...loginForm, patientId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    aria-label="Select patient for demo login"
                  >
                    <option value="">Select Patient</option>
                    <option value="patient_001">John Doe (patient_001)</option>
                    <option value="patient_002">Jane Smith (patient_002)</option>
                  </select>
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Shield className="h-4 w-4 mr-2" />
                  Secure Login
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">🔒 Security Features</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Patient-only access control</li>
                  <li>• Secure session management</li>
                  <li>• Access logging and monitoring</li>
                  <li>• HIPAA-compliant data protection</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

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
          <Link href="/patient-portal" className="text-gray-700 hover:text-indigo-600 transition-colors">
            Patient Portal
          </Link>
          <Link href="/settings" className="text-gray-700 hover:text-indigo-600 transition-colors">
            Settings
          </Link>
          {isAuthenticated && user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/patient-portal" className="text-gray-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Medical Records</h1>
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-green-800 font-medium">Secure Access Verified</p>
                <p className="text-green-700 text-sm">
                  Your medical records are protected and only accessible by you. All access is logged for security.
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Beaker className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lab Results</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {records.filter(r => r.category === 'lab').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Imaging</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {records.filter(r => r.category === 'imaging').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Visit Notes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {records.filter(r => r.category === 'visit').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Prescriptions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {records.filter(r => r.category === 'prescription').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Records List */}
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">Recent Records</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {records.map((record) => {
                const IconComponent = getRecordIcon(record.category)
                const iconColor = getRecordColor(record.category)
                return (
                  <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${iconColor}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                            {record.confidential && (
                              <Lock className="h-4 w-4 text-red-500" title="Confidential Record" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{record.type} • {record.provider}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-300">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upload Section */}
          <div className="mt-8 bg-gray-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Medical Records</h2>
            <p className="text-gray-600 mb-6">
              Upload your medical records, lab results, or other health documents to keep everything in one place.
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to upload</p>
              <p className="text-sm text-gray-500 mb-4">Supports PDF, JPG, PNG files up to 10MB</p>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Choose Files
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link href="/appointment/request">Request Medical Records</Link>
            </Button>
            <Button asChild variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
              <Link href="/providers/search">Find a Provider</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
} 