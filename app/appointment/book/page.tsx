"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  Star,
  Video,
  Building
} from "lucide-react"

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
  const providerRating = searchParams.get('rating') || '4.5'
  const acceptingPatients = searchParams.get('accepting') === 'true'

  // Available time slots
  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
  ]

  // Generate next 14 days for appointment scheduling
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i + 1)
    return date
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime || !reason) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert(`Appointment booked successfully!\n\nProvider: ${providerName}\nDate: ${selectedDate}\nTime: ${selectedTime}`)
      
      // Reset form
      setSelectedDate("")
      setSelectedTime("")
      setReason("")
    } catch (error) {
      alert("Failed to book appointment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!acceptingPatients) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="mb-8">
            <Link href="/providers/search" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to search</span>
            </Link>
          </div>

          <Card className="p-8 border-red-200 bg-red-50 text-center">
            <h2 className="text-xl font-semibold text-red-700 mb-4">
              Provider Not Accepting New Patients
            </h2>
            <p className="text-red-600 mb-6">
              Unfortunately, {providerName} is not currently accepting new patients.
            </p>
            <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white">
              <Link href="/providers/search">Find Other Providers</Link>
            </Button>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <Link href="/providers/search" className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to search</span>
          </Link>
          <div className="mb-10">
            <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-stone-800 text-white text-sm font-semibold shadow-md mb-6">
              Book Appointment
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4 tracking-tight">
              Schedule Your Appointment
            </h1>
            <p className="text-lg md:text-xl text-stone-600 max-w-2xl">
              Book your healthcare appointment quickly and securely
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Provider Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-gray-100 sticky top-24">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{providerName}</h3>
                  <p className="text-gray-600">{providerSpecialty}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{providerRating}</span>
                  <span className="text-gray-500">rating</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">{providerAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{providerPhone}</span>
                  </div>
                </div>

                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Accepting new patients
                </Badge>
              </div>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Appointment Type */}
                <div>
                  <Label className="text-gray-700 mb-3 block">Appointment Type</Label>
                  <RadioGroup value={appointmentType} onValueChange={setAppointmentType}>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        appointmentType === "in-person" 
                          ? "border-gray-400 bg-gray-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}>
                        <RadioGroupItem value="in-person" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-gray-900">In-Person</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Visit the office</p>
                        </div>
                      </label>
                      
                      <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        appointmentType === "telehealth" 
                          ? "border-gray-400 bg-gray-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}>
                        <RadioGroupItem value="telehealth" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-gray-900">Telehealth</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Video consultation</p>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Date Selection */}
                <div>
                  <Label htmlFor="date" className="text-gray-700 mb-2 block">
                    Select Date
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableDates.slice(0, 6).map((date) => {
                      const dateStr = date.toISOString().split('T')[0]
                      const isSelected = selectedDate === dateStr
                      
                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => setSelectedDate(dateStr)}
                          className={`p-3 border rounded-lg text-sm transition-colors ${
                            isSelected
                              ? "border-gray-400 bg-gray-100 text-gray-900"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          <div className="font-medium">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div>
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <Label className="text-gray-700 mb-2 block">
                      Select Time
                    </Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 border rounded-lg text-sm transition-colors ${
                            selectedTime === time
                              ? "border-gray-400 bg-gray-100 text-gray-900"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reason for Visit */}
                <div>
                  <Label htmlFor="reason" className="text-gray-700 mb-2 block">
                    Reason for Visit
                  </Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please describe the reason for your visit..."
                    className="min-h-[100px] border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedDate || !selectedTime || !reason}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="border-gray-200"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading booking form...</p>
        </div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  )
}
