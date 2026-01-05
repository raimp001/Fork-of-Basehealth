"use client"

/**
 * Appointment Booking Flow
 * Multi-step booking process for scheduling appointments with providers
 */

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { Calendar } from "@/components/ui/calendar"
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Phone,
  Video,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Shield,
  Star,
  AlertCircle,
} from "lucide-react"
import { format, addDays, setHours, setMinutes } from "date-fns"

interface TimeSlot {
  time: string
  available: boolean
}

interface ProviderInfo {
  npi: string
  name: string
  specialty: string
  address: string
  phone: string
  rating: number
  reviewCount: number
  acceptsNewPatients: boolean
  insuranceAccepted: string[]
}

// Mock time slots
const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const baseHours = [9, 10, 11, 13, 14, 15, 16]
  
  baseHours.forEach(hour => {
    [0, 30].forEach(minute => {
      const isAvailable = Math.random() > 0.3 // 70% availability
      slots.push({
        time: format(setMinutes(setHours(date, hour), minute), 'h:mm a'),
        available: isAvailable
      })
    })
  })
  
  return slots
}

const STEPS = [
  { id: 1, title: "Select Date & Time", icon: CalendarIcon },
  { id: 2, title: "Visit Type", icon: Video },
  { id: 3, title: "Your Information", icon: User },
  { id: 4, title: "Confirm & Book", icon: CheckCircle },
]

export default function BookAppointmentPage() {
  const params = useParams()
  const router = useRouter()
  const providerId = params.providerId as string
  
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [visitType, setVisitType] = useState<'in-person' | 'video'>('in-person')
  const [isLoading, setIsLoading] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  
  const [patientInfo, setPatientInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    insurance: '',
    reason: '',
  })

  // Mock provider info
  const [provider] = useState<ProviderInfo>({
    npi: providerId,
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    address: '123 Medical Center Dr, San Francisco, CA 94102',
    phone: '(415) 555-0123',
    rating: 4.8,
    reviewCount: 127,
    acceptsNewPatients: true,
    insuranceAccepted: ['Aetna', 'Blue Cross', 'Cigna', 'United Healthcare'],
  })

  // Generate time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(generateTimeSlots(selectedDate))
      setSelectedTime(null)
    }
  }, [selectedDate])

  const progress = (currentStep / STEPS.length) * 100

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedDate && selectedTime
      case 2:
        return true
      case 3:
        return patientInfo.firstName && patientInfo.lastName && patientInfo.email && patientInfo.phone
      case 4:
        return true
      default:
        return false
    }
  }

  const handleBookAppointment = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsLoading(false)
    setIsBooked(true)
  }

  // Booking confirmation screen
  if (isBooked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MinimalNavigation />
        
        <main className="max-w-lg mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-stone-900 mb-4">
            Appointment Confirmed!
          </h1>
          
          <p className="text-stone-600 mb-8">
            Your appointment with {provider.name} has been scheduled.
          </p>
          
          <Card className="p-6 mb-8 text-left border-2 border-green-200 bg-green-50/50">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-stone-900">
                    {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-stone-600">{selectedTime}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {visitType === 'video' ? (
                  <Video className="h-5 w-5 text-green-600" />
                ) : (
                  <MapPin className="h-5 w-5 text-green-600" />
                )}
                <div>
                  <p className="font-medium text-stone-900">
                    {visitType === 'video' ? 'Video Visit' : 'In-Person Visit'}
                  </p>
                  {visitType !== 'video' && (
                    <p className="text-sm text-stone-600">{provider.address}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-stone-900">{provider.name}</p>
                  <p className="text-sm text-stone-600">{provider.specialty}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/patient-portal')}
              className="w-full bg-stone-900 hover:bg-stone-800"
            >
              Go to Patient Portal
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/providers/search')}
              className="w-full border-2"
            >
              Book Another Appointment
            </Button>
          </div>
          
          <p className="text-sm text-stone-500 mt-6">
            A confirmation email has been sent to {patientInfo.email}
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <MinimalNavigation />
      
      <main className="max-w-4xl mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            Book Appointment
          </h1>
          
          {/* Provider info card */}
          <Card className="p-4 flex items-center gap-4 border-stone-200">
            <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center">
              <User className="h-7 w-7 text-stone-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-stone-900">{provider.name}</h2>
              <p className="text-sm text-stone-600">{provider.specialty}</p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{provider.rating}</span>
              <span className="text-sm text-stone-500">({provider.reviewCount})</span>
            </div>
          </Card>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 ${
                  currentStep >= step.id ? 'text-stone-900' : 'text-stone-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep > step.id 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step.id 
                      ? 'bg-stone-900 text-white' 
                      : 'bg-stone-200 text-stone-500'
                }`}>
                  {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : step.id}
                </div>
                <span className="hidden md:inline text-sm font-medium">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="p-6 md:p-8 border-2 border-stone-200">
          {/* Step 1: Date & Time */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-stone-900 mb-6">
                Select Date & Time
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <Label className="text-sm font-medium text-stone-700 mb-3 block">
                    Select a date
                  </Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
                    className="rounded-lg border"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-stone-700 mb-3 block">
                    Available times {selectedDate && `for ${format(selectedDate, 'MMM d')}`}
                  </Label>
                  
                  {selectedDate ? (
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`p-3 rounded-lg text-sm font-medium transition-all ${
                            selectedTime === slot.time
                              ? 'bg-stone-900 text-white'
                              : slot.available
                                ? 'bg-stone-100 text-stone-900 hover:bg-stone-200'
                                : 'bg-stone-50 text-stone-300 cursor-not-allowed'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 bg-stone-50 rounded-lg border border-dashed border-stone-300">
                      <p className="text-stone-500">Select a date to see available times</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Visit Type */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-stone-900 mb-6">
                Choose Visit Type
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setVisitType('in-person')}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    visitType === 'in-person'
                      ? 'border-stone-900 bg-stone-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <MapPin className={`h-8 w-8 mb-4 ${
                    visitType === 'in-person' ? 'text-stone-900' : 'text-stone-400'
                  }`} />
                  <h3 className="font-semibold text-stone-900 mb-1">In-Person Visit</h3>
                  <p className="text-sm text-stone-600">
                    Visit the provider's office for your appointment
                  </p>
                  <p className="text-xs text-stone-500 mt-3">
                    {provider.address}
                  </p>
                </button>
                
                <button
                  onClick={() => setVisitType('video')}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    visitType === 'video'
                      ? 'border-stone-900 bg-stone-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <Video className={`h-8 w-8 mb-4 ${
                    visitType === 'video' ? 'text-stone-900' : 'text-stone-400'
                  }`} />
                  <h3 className="font-semibold text-stone-900 mb-1">Video Visit</h3>
                  <p className="text-sm text-stone-600">
                    Meet with your provider from the comfort of home
                  </p>
                  <Badge className="mt-3 bg-green-100 text-green-700">
                    Available for this provider
                  </Badge>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Patient Information */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-stone-900 mb-6">
                Your Information
              </h2>
              
              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-stone-700">First Name *</Label>
                    <Input
                      value={patientInfo.firstName}
                      onChange={(e) => setPatientInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter first name"
                      className="mt-1.5 h-11 border-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-stone-700">Last Name *</Label>
                    <Input
                      value={patientInfo.lastName}
                      onChange={(e) => setPatientInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter last name"
                      className="mt-1.5 h-11 border-2"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-stone-700">Email *</Label>
                    <Input
                      type="email"
                      value={patientInfo.email}
                      onChange={(e) => setPatientInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="mt-1.5 h-11 border-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-stone-700">Phone *</Label>
                    <Input
                      type="tel"
                      value={patientInfo.phone}
                      onChange={(e) => setPatientInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 555-5555"
                      className="mt-1.5 h-11 border-2"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-stone-700">Date of Birth</Label>
                  <Input
                    type="date"
                    value={patientInfo.dateOfBirth}
                    onChange={(e) => setPatientInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="mt-1.5 h-11 border-2"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-stone-700">Insurance Provider</Label>
                  <Input
                    value={patientInfo.insurance}
                    onChange={(e) => setPatientInfo(prev => ({ ...prev, insurance: e.target.value }))}
                    placeholder="e.g., Blue Cross Blue Shield"
                    className="mt-1.5 h-11 border-2"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-stone-700">Reason for Visit</Label>
                  <Textarea
                    value={patientInfo.reason}
                    onChange={(e) => setPatientInfo(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Briefly describe your symptoms or reason for the appointment"
                    className="mt-1.5 border-2 min-h-24"
                  />
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-900">
                  Your information is protected by HIPAA and only shared with your healthcare provider.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-stone-900 mb-6">
                Review & Confirm
              </h2>
              
              <div className="space-y-6">
                {/* Appointment Details */}
                <div className="p-5 bg-stone-50 rounded-xl border border-stone-200">
                  <h3 className="font-semibold text-stone-900 mb-4">Appointment Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-stone-600" />
                      <div>
                        <p className="font-medium text-stone-900">
                          {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-stone-600">{selectedTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {visitType === 'video' ? (
                        <Video className="h-5 w-5 text-stone-600" />
                      ) : (
                        <MapPin className="h-5 w-5 text-stone-600" />
                      )}
                      <div>
                        <p className="font-medium text-stone-900">
                          {visitType === 'video' ? 'Video Visit' : 'In-Person Visit'}
                        </p>
                        {visitType !== 'video' && (
                          <p className="text-sm text-stone-600">{provider.address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Provider Info */}
                <div className="p-5 bg-stone-50 rounded-xl border border-stone-200">
                  <h3 className="font-semibold text-stone-900 mb-4">Provider</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-stone-600" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">{provider.name}</p>
                      <p className="text-sm text-stone-600">{provider.specialty}</p>
                    </div>
                  </div>
                </div>
                
                {/* Patient Info */}
                <div className="p-5 bg-stone-50 rounded-xl border border-stone-200">
                  <h3 className="font-semibold text-stone-900 mb-4">Your Information</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <p><span className="text-stone-500">Name:</span> {patientInfo.firstName} {patientInfo.lastName}</p>
                    <p><span className="text-stone-500">Email:</span> {patientInfo.email}</p>
                    <p><span className="text-stone-500">Phone:</span> {patientInfo.phone}</p>
                    {patientInfo.insurance && (
                      <p><span className="text-stone-500">Insurance:</span> {patientInfo.insurance}</p>
                    )}
                  </div>
                  {patientInfo.reason && (
                    <div className="mt-3 pt-3 border-t border-stone-200">
                      <p className="text-sm text-stone-500">Reason for Visit:</p>
                      <p className="text-sm text-stone-900">{patientInfo.reason}</p>
                    </div>
                  )}
                </div>
                
                {/* Cancellation policy */}
                <div className="p-4 bg-amber-50 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <p className="font-medium mb-1">Cancellation Policy</p>
                    <p>Free cancellation up to 24 hours before your appointment. Late cancellations may incur a fee.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="border-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {currentStep < STEPS.length ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-stone-900 hover:bg-stone-800"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleBookAppointment}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Booking...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}

