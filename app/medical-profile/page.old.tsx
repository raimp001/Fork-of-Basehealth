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

export default function MedicalProfilePage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
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

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/medical-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      setIsEditing(false)
      alert("Profile updated successfully!")
    } catch (err) {
      console.error('Error updating profile:', err)
      alert("Failed to update profile. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your medical profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <header className="flex items-center justify-between px-8 py-6 border-b">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              basehealth.xyz
            </Link>
          </div>
        </header>
        <main className="px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <p className="text-red-800">{error}</p>
            </div>
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

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
            <div className="space-y-6">
              {records.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Medical Records Found</h3>
                  <p className="text-gray-600">Your medical records will appear here once they are available.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {records.map((record) => (
                    <div key={record.id} className="bg-white border rounded-xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${getRecordColor(record.category)}`}>
                            {getRecordIcon(record.category)({ className: "h-6 w-6" })}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{record.title}</h3>
                            <p className="text-sm text-gray-600">{record.provider}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {new Date(record.date).toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                {record.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Helper functions below
function getRecordIcon(category: string) {
  switch (category) {
    case 'lab': return Beaker
    case 'imaging': return Activity
    case 'visit': return FileText
    case 'prescription': return Heart
    default: return FileText
  }
}

function getRecordColor(category: string) {
  switch (category) {
    case 'lab': return 'bg-blue-100 text-blue-600'
    case 'imaging': return 'bg-green-100 text-green-600'
    case 'visit': return 'bg-indigo-100 text-indigo-600'
    case 'prescription': return 'bg-purple-100 text-purple-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

function getStatusColor(status: string) {
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