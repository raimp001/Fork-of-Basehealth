"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, MapPin, Phone, User, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

function BookingContent() {
  const searchParams = useSearchParams()
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [appointmentType, setAppointmentType] = useState("in-person")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get provider details from URL parameters
  const providerName = searchParams.get('name') || 'Healthcare Provider'
  const providerSpecialty = searchParams.get('specialty') || 'General Practice'
  const providerAddress = searchParams.get('address') || 'Address not provided'
  const providerPhone = searchParams.get('phone') || 'Phone not provided'
  const providerNPI = searchParams.get('npi') || ''
  const providerRating = searchParams.get('rating') || '4.5'
  const acceptingPatients = searchParams.get('accepting') === 'true'

  // Available time slots (in a real app, this would come from the provider's calendar)
  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"
  ]

  // Generate next 14 days for appointment scheduling
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i + 1) // Start from tomorrow
    return date.toISOString().split('T')[0]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime || !reason) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert(`Appointment request submitted successfully!\n\nProvider: ${providerName}\nDate: ${selectedDate}\nTime: ${selectedTime}\nType: ${appointmentType}\n\nYou will receive a confirmation email shortly.`)
      
      // Reset form
      setSelectedDate("")
      setSelectedTime("")
      setReason("")
    } catch (error) {
      alert("Failed to submit appointment request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!acceptingPatients) {
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
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Link href="/providers/search" className="text-gray-500 hover:text-indigo-600 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-4xl font-bold text-gray-900">Book Appointment</h1>
            </div>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-700 mb-4">Provider Not Accepting New Patients</h2>
                <p className="text-red-600 mb-6">
                  Unfortunately, <strong>{providerName}</strong> is not currently accepting new patients.
                </p>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                  <Link href="/providers/search">Find Other Providers</Link>
                </Button>
              </CardContent>
            </Card>
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
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/providers/search" className="text-gray-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Book Appointment</h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Provider Information */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Provider Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{providerName}</h3>
                    <p className="text-indigo-600 font-medium">{providerSpecialty}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{providerRating}</span>
                    <span className="text-gray-500">rating</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                      <span className="text-sm text-gray-600">{providerAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{providerPhone}</span>
                    </div>
                  </div>

                  {providerNPI && (
                    <div className="text-xs text-gray-500">
                      NPI: {providerNPI}
                    </div>
                  )}

                  <Badge className="bg-green-100 text-green-700">
                    Accepting New Patients
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Appointment Booking Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule Your Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Appointment Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Type
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setAppointmentType("in-person")}
                          className={`p-4 border rounded-lg text-left transition-colors ${
                            appointmentType === "in-person"
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <div className="font-medium">In-Person Visit</div>
                          <div className="text-sm text-gray-600">Visit the provider's office</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAppointmentType("telehealth")}
                          className={`p-4 border rounded-lg text-left transition-colors ${
                            appointmentType === "telehealth"
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <div className="font-medium">Telehealth</div>
                          <div className="text-sm text-gray-600">Video consultation</div>
                        </button>
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Date *
                      </label>
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        aria-label="Select appointment date"
                        required
                      >
                        <option value="">Choose a date</option>
                        {availableDates.map(date => (
                          <option key={date} value={date}>
                            {new Date(date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Time Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Time *
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`p-2 border rounded text-sm transition-colors ${
                              selectedTime === time
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reason for Visit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Visit *
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please describe the reason for your visit..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        rows={4}
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      >
                        {isSubmitting ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Calendar className="h-4 w-4 mr-2" />
                            Request Appointment
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingContent />
    </Suspense>
  )
} 