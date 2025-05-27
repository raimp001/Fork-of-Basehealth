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

  useEffect(() => {
    loadMedicalData()
  }, [])

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
      {/* ...rest of your JSX code remains unchanged... */}
    </div>
  )
}

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