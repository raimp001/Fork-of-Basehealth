"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, MessageSquare, Calendar, Shield } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

export default function MedicalProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error
      
      if (session) {
        setIsAuthenticated(true)
        setUser(session.user)
      } else {
        // Redirect to login if not authenticated
        window.location.href = `/login?redirect=${encodeURIComponent('/medical-profile')}`
      }
    } catch (error) {
      console.error('Auth error:', error)
      window.location.href = `/login?redirect=${encodeURIComponent('/medical-profile')}`
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your secure account...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="flex items-center justify-between px-8 py-6 border-b">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            BaseHealth
          </Link>
        </div>
        <nav className="flex items-center gap-8">
          <Link href="/settings" className="text-gray-700 hover:text-indigo-600 transition-colors">
            Settings
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/patient-portal" className="text-gray-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">My Account</h1>
          </div>

          <div className="bg-white border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold">Secure Account Access</h2>
            </div>

            <Tabs defaultValue="records" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="records" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Medical Records
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="appointments" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Appointments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="records" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Medical Records</h3>
                  <p className="text-gray-600">
                    View and download your complete medical history, test results, and treatment records.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    View Records
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="messages" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Secure Messages</h3>
                  <p className="text-gray-600">
                    Communicate securely with your healthcare providers and access your message history.
                  </p>
                  <Button className="bg-yellow-600 hover:bg-yellow-700">
                    View Messages
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="appointments" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Appointments</h3>
                  <p className="text-gray-600">
                    Schedule, manage, and view your upcoming and past appointments.
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    View Appointments
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
} 
