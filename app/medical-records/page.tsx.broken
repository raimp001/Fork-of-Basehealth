"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Download, Eye, Calendar, Activity, Heart, Beaker, Lock, Shield, User, Edit, Save } from "lucide-react"
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

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  height?: string
  weight?: string
  bloodType?: string
  allergies?: string
  medications?: string
  conditions?: string
}

export default function MyMedicalProfilePage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', patientId: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'records'>('profile')

  // Profile state for editing
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    height: "",
    weight: "",
    bloodType: "",
    allergies: "",
    medications: "",
    conditions: ""
  })

  // Check authentication and load data
  useEffect(() => {
    loadMedicalData()
  }, [])

  // Update profile state when user data loads
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        height: user.height || "",
        weight: user.weight || "",
        bloodType: user.bloodType || "",
        allergies: user.allergies || "",
        medications: user.medications || "",
        conditions: user.conditions || ""
      })
    }
  }, [user])

  const loadMedicalData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/medical-records')
      
      if (response.status === 401) {
        setIsAuthenticated(false)
        setError('Please log in to access your medical profile.')
        return
      }
      
      if (response.status === 403) {
        setError('Access denied. Only patients can view medical records.')
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to load medical data')
      }
      
      const data = await response.json()
      setRecords(data.records)
      setUser(data.patient)
      setIsAuthenticated(true)
      setError(null)
      
    } catch (err) {
      console.error('Error loading medical data:', err)
      setError('Unable to load medical data. Please try again.')
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
        await loadMedicalData()
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
      setIsEditing(false)
      setActiveTab('profile')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const handleSaveProfile = () => {
    setIsEditing(false)
    alert("Profile updated successfully!")
    // In a real app, this would save to the backend
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
                  <p className="text-gray-600">Please log in to view your medical profile</p>
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
                <span>{user.firstName} {user.lastName}</span>
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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/patient-portal" className="text-gray-500 hover:text-indigo-600 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-4xl font-bold text-gray-900">My Medical Profile</h1>
            </div>
            {activeTab === 'profile' && (
              <Button 
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                className={isEditing ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"}
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-green-800 font-medium">Secure Access Verified</p>
                <p className="text-green-700 text-sm">
                  Your medical profile is protected and only accessible by you. All access is logged for security.
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="h-4 w-4 inline mr-2" />
              Health Profile
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'records'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Medical Records
            </button>
          </div>

          {/* Health Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white border rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <User className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-semibold">Personal Information</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={profile.firstName}
                            onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={profile.lastName}
                            onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      {isEditing ? (
                        <input 
                          type="email" 
                          value={profile.email}
                          onChange={(e) => setProfile({...profile, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      {isEditing ? (
                        <input 
                          type="tel" 
                          value={profile.phone}
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-6">Medical Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      {isEditing ? (
                        <input 
                          type="date" 
                          value={profile.dateOfBirth}
                          onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      {isEditing ? (
                        <select 
                          value={profile.gender}
                          onChange={(e) => setProfile({...profile, gender: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <p className="text-gray-900">{profile.gender || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={profile.height}
                            onChange={(e) => setProfile({...profile, height: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., 5'10\""
                          />
                        ) : (
                          <p className="text-gray-900">{profile.height || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={profile.weight}
                            onChange={(e) => setProfile({...profile, weight: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., 175 lbs"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.weight || 'Not provided'}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                      {isEditing ? (
                        <select 
                          value={profile.bloodType}
                          onChange={(e) => setProfile({...profile, bloodType: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select Blood Type</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      ) : (
                        <p className="text-gray-900">{profile.bloodType || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-xl p-6 md:col-span-2">
                  <h2 className="text-xl font-semibold mb-6">Health Information</h2>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                      {isEditing ? (
                        <textarea 
                          value={profile.allergies}
                          onChange={(e) => setProfile({...profile, allergies: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          rows={3}
                          placeholder="List any allergies..."
                        />
                      ) : (
                        <p className="text-gray-900">{profile.allergies || 'None reported'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
                      {isEditing ? (
                        <textarea 
                          value={profile.medications}
                          onChange={(e) => setProfile({...profile, medications: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          rows={3}
                          placeholder="List current medications..."
                        />
                      ) : (
                        <p className="text-gray-900">{profile.medications || 'None reported'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
                      {isEditing ? (
                        <textarea 
                          value={profile.conditions}
                          onChange={(e) => setProfile({...profile, conditions: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          rows={3}
                          placeholder="List medical conditions..."
                        />
                      ) : (
                        <p className="text-gray-900">{profile.conditions || 'None reported'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-4">
                  <Button 
                    onClick={handleSaveProfile}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="border-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Medical Records Tab */}
          {activeTab === 'records' && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-4 gap-6">
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

              {/* Import from External EMRs */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Import Records from Other Hospitals</h2>
                <p className="text-gray-600 mb-6">
                  Connect to your previous healthcare providers to automatically import your medical records from various EMR systems.
                </p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Epic MyChart */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Epic MyChart</h3>
                        <p className="text-sm text-gray-600">Most major hospitals</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                      Connect Epic
                    </Button>
                  </div>

                  {/* Cerner */}
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Cerner PowerChart</h3>
                        <p className="text-sm text-gray-600">Oracle Health</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                      Connect Cerner
                    </Button>
                  </div>

                  {/* Allscripts */}
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Allscripts</h3>
                        <p className="text-sm text-gray-600">FollowMyHealth</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50">
                      Connect Allscripts
                    </Button>
                  </div>

                  {/* athenahealth */}
                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                        <Beaker className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">athenahealth</h3>
                        <p className="text-sm text-gray-600">athenaCollector</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full border-orange-600 text-orange-600 hover:bg-orange-50">
                      Connect athena
                    </Button>
                  </div>

                  {/* eClinicalWorks */}
                  <div className="bg-white rounded-lg p-4 border border-teal-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">eClinicalWorks</h3>
                        <p className="text-sm text-gray-600">healow</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full border-teal-600 text-teal-600 hover:bg-teal-50">
                      Connect eCW
                    </Button>
                  </div>

                  {/* Other EMRs */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Other EMRs</h3>
                        <p className="text-sm text-gray-600">FHIR-compatible</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full border-gray-600 text-gray-600 hover:bg-gray-50">
                      Connect Other
                    </Button>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <h3 className="font-semibold text-gray-900 mb-2">🔒 Secure FHIR Integration</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    We use industry-standard FHIR (Fast Healthcare Interoperability Resources) protocols to securely connect with EMR systems. Your data is encrypted and you maintain full control.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">HIPAA Compliant</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">FHIR R4</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">OAuth 2.0</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">End-to-End Encryption</span>
                  </div>
                </div>
              </div>

              {/* Upload Section */}
              <div className="bg-gray-50 rounded-xl p-8">
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
            </div>
          )}

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