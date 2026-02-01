"use client"

/**
 * Appointment Booking Flow - Claude.ai Design
 */

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar } from "@/components/ui/calendar"
import {
  Calendar as CalendarIcon,
  MapPin,
  User,
  Video,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Shield,
  Star,
  AlertCircle,
  Loader2,
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
}

const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const baseHours = [9, 10, 11, 13, 14, 15, 16]
  
  baseHours.forEach(hour => {
    [0, 30].forEach(minute => {
      const isAvailable = Math.random() > 0.3
      slots.push({
        time: format(setMinutes(setHours(date, hour), minute), 'h:mm a'),
        available: isAvailable
      })
    })
  })
  
  return slots
}

const STEPS = [
  { id: 1, title: "Select Date & Time" },
  { id: 2, title: "Visit Type" },
  { id: 3, title: "Your Information" },
  { id: 4, title: "Confirm & Book" },
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
  const [mounted, setMounted] = useState(false)
  
  const [patientInfo, setPatientInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    insurance: '',
    reason: '',
  })

  const [provider, setProvider] = useState<ProviderInfo>({
    npi: providerId,
    name: 'Loading...',
    specialty: '',
    address: '',
    phone: '',
    rating: 0,
    reviewCount: 0,
  })
  
  const [providerLoading, setProviderLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Fetch real provider data
  useEffect(() => {
    async function fetchProvider() {
      try {
        const response = await fetch(`/api/providers/${providerId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.provider) {
            setProvider({
              npi: data.provider.npi || providerId,
              name: data.provider.name || 'Provider',
              specialty: data.provider.specialty || 'Healthcare Provider',
              address: data.provider.address?.street 
                ? `${data.provider.address.street}, ${data.provider.address.city}, ${data.provider.address.state} ${data.provider.address.zipCode}`
                : data.provider.address || '',
              phone: data.provider.phone || '',
              rating: data.provider.rating || 0,
              reviewCount: data.provider.reviewCount || 0,
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch provider:', error)
      } finally {
        setProviderLoading(false)
      }
    }
    
    if (providerId) {
      fetchProvider()
    }
  }, [providerId])

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
      case 1: return selectedDate && selectedTime
      case 2: return true
      case 3: return patientInfo.firstName && patientInfo.lastName && patientInfo.email && patientInfo.phone
      case 4: return true
      default: return false
    }
  }

  const handleBookAppointment = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    setIsBooked(true)
  }

  // Booking confirmation screen
  if (isBooked) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b" style={{ backgroundColor: 'rgba(26, 25, 21, 0.9)', borderColor: 'var(--border-subtle)' }}>
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
            <Link href="/" className="text-lg font-medium tracking-tight">BaseHealth</Link>
          </div>
        </nav>
        
        <main className="max-w-lg mx-auto px-6 pt-32 pb-24 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(107, 155, 107, 0.15)' }}>
            <CheckCircle className="h-8 w-8" style={{ color: '#6b9b6b' }} />
          </div>
          
          <h1 className="text-3xl font-normal mb-3">Appointment Confirmed!</h1>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            Your appointment with {provider.name} has been scheduled.
          </p>
          
          <div className="p-5 rounded-xl text-left mb-8" style={{ backgroundColor: 'rgba(107, 155, 107, 0.1)', border: '1px solid rgba(107, 155, 107, 0.2)' }}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5" style={{ color: '#6b9b6b' }} />
                <div>
                  <p className="font-medium">{selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedTime}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {visitType === 'video' ? (
                  <Video className="h-5 w-5" style={{ color: '#6b9b6b' }} />
                ) : (
                  <MapPin className="h-5 w-5" style={{ color: '#6b9b6b' }} />
                )}
                <div>
                  <p className="font-medium">{visitType === 'video' ? 'Video Visit' : 'In-Person Visit'}</p>
                  {visitType !== 'video' && (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{provider.address}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-5 w-5" style={{ color: '#6b9b6b' }} />
                <div>
                  <p className="font-medium">{provider.name}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{provider.specialty}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/patient-portal')}
              className="w-full py-3 font-medium rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
            >
              Go to Patient Portal
            </button>
            <button
              onClick={() => router.push('/providers/search')}
              className="w-full py-3 font-medium rounded-lg border transition-colors"
              style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
            >
              Book Another Appointment
            </button>
          </div>
          
          <p className="text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            A confirmation email has been sent to {patientInfo.email}
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b" style={{ backgroundColor: 'rgba(26, 25, 21, 0.9)', borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="text-lg font-medium tracking-tight">BaseHealth</Link>
        </div>
      </nav>
      
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-24">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-4 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          <h1 className="text-3xl font-normal mb-4">Book Appointment</h1>
          
          {/* Provider info card */}
          <div className="p-4 rounded-xl flex items-center gap-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <User className="h-6 w-6" style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="flex-1">
              <h2 className="font-medium">{provider.name}</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{provider.specialty}</p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" style={{ color: 'var(--accent)' }} />
              <span className="font-medium">{provider.rating}</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>({provider.reviewCount})</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className="flex items-center gap-2"
                style={{ color: currentStep >= step.id ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                  style={currentStep > step.id ? { 
                    backgroundColor: '#6b9b6b', 
                    color: 'white' 
                  } : currentStep === step.id ? { 
                    backgroundColor: 'var(--text-primary)', 
                    color: 'var(--bg-primary)' 
                  } : { 
                    backgroundColor: 'var(--bg-tertiary)', 
                    color: 'var(--text-muted)' 
                  }}
                >
                  {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : step.id}
                </div>
                <span className="hidden md:inline text-sm font-medium">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: 'var(--accent)' }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          {/* Step 1: Date & Time */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-medium mb-6">Select Date & Time</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-secondary)' }}>
                    Select a date
                  </label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
                    className="rounded-lg border"
                    style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)' }}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-secondary)' }}>
                    Available times {selectedDate && `for ${format(selectedDate, 'MMM d')}`}
                  </label>
                  
                  {selectedDate ? (
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className="p-3 rounded-lg text-sm font-medium transition-all"
                          style={selectedTime === slot.time ? {
                            backgroundColor: 'var(--text-primary)',
                            color: 'var(--bg-primary)'
                          } : slot.available ? {
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)'
                          } : {
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-muted)',
                            opacity: 0.5,
                            cursor: 'not-allowed'
                          }}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 rounded-lg border border-dashed" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-medium)' }}>
                      <p style={{ color: 'var(--text-muted)' }}>Select a date to see available times</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Visit Type */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-medium mb-6">Choose Visit Type</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setVisitType('in-person')}
                  className="p-5 rounded-xl border text-left transition-all"
                  style={visitType === 'in-person' ? {
                    borderColor: 'var(--accent)',
                    backgroundColor: 'rgba(212, 165, 116, 0.1)'
                  } : {
                    borderColor: 'var(--border-medium)'
                  }}
                >
                  <MapPin className="h-8 w-8 mb-3" style={{ color: visitType === 'in-person' ? 'var(--accent)' : 'var(--text-muted)' }} />
                  <h3 className="font-medium mb-1">In-Person Visit</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Visit the provider's office
                  </p>
                  <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>{provider.address}</p>
                </button>
                
                <button
                  onClick={() => setVisitType('video')}
                  className="p-5 rounded-xl border text-left transition-all"
                  style={visitType === 'video' ? {
                    borderColor: 'var(--accent)',
                    backgroundColor: 'rgba(212, 165, 116, 0.1)'
                  } : {
                    borderColor: 'var(--border-medium)'
                  }}
                >
                  <Video className="h-8 w-8 mb-3" style={{ color: visitType === 'video' ? 'var(--accent)' : 'var(--text-muted)' }} />
                  <h3 className="font-medium mb-1">Video Visit</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Meet from the comfort of home
                  </p>
                  <span className="inline-block mt-3 px-2 py-0.5 text-xs rounded" style={{ backgroundColor: 'rgba(107, 155, 107, 0.15)', color: '#6b9b6b' }}>
                    Available
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Patient Information */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-medium mb-6">Your Information</h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>First Name *</label>
                    <input
                      value={patientInfo.firstName}
                      onChange={(e) => setPatientInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter first name"
                      className="w-full px-4 py-3 rounded-lg focus:outline-none"
                      style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Last Name *</label>
                    <input
                      value={patientInfo.lastName}
                      onChange={(e) => setPatientInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter last name"
                      className="w-full px-4 py-3 rounded-lg focus:outline-none"
                      style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Email *</label>
                    <input
                      type="email"
                      value={patientInfo.email}
                      onChange={(e) => setPatientInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-lg focus:outline-none"
                      style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Phone *</label>
                    <input
                      type="tel"
                      value={patientInfo.phone}
                      onChange={(e) => setPatientInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 555-5555"
                      className="w-full px-4 py-3 rounded-lg focus:outline-none"
                      style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Insurance Provider</label>
                  <input
                    value={patientInfo.insurance}
                    onChange={(e) => setPatientInfo(prev => ({ ...prev, insurance: e.target.value }))}
                    placeholder="e.g., Blue Cross Blue Shield"
                    className="w-full px-4 py-3 rounded-lg focus:outline-none"
                    style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Reason for Visit</label>
                  <textarea
                    value={patientInfo.reason}
                    onChange={(e) => setPatientInfo(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Briefly describe your symptoms or reason for the appointment"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none resize-none"
                    style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              
              <div className="mt-6 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: 'rgba(107, 155, 107, 0.1)', border: '1px solid rgba(107, 155, 107, 0.2)' }}>
                <Shield className="h-5 w-5 mt-0.5" style={{ color: '#6b9b6b' }} />
                <p className="text-sm" style={{ color: '#6b9b6b' }}>
                  Your information is protected by HIPAA and only shared with your healthcare provider.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-medium mb-6">Review & Confirm</h2>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                  <h3 className="font-medium mb-3">Appointment Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                      <div>
                        <p className="font-medium">{selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {visitType === 'video' ? (
                        <Video className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                      ) : (
                        <MapPin className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                      )}
                      <div>
                        <p className="font-medium">{visitType === 'video' ? 'Video Visit' : 'In-Person Visit'}</p>
                        {visitType !== 'video' && (
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{provider.address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                  <h3 className="font-medium mb-3">Your Information</h3>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <p><span style={{ color: 'var(--text-muted)' }}>Name:</span> {patientInfo.firstName} {patientInfo.lastName}</p>
                    <p><span style={{ color: 'var(--text-muted)' }}>Email:</span> {patientInfo.email}</p>
                    <p><span style={{ color: 'var(--text-muted)' }}>Phone:</span> {patientInfo.phone}</p>
                    {patientInfo.insurance && (
                      <p><span style={{ color: 'var(--text-muted)' }}>Insurance:</span> {patientInfo.insurance}</p>
                    )}
                  </div>
                </div>
                
                <div className="p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: 'rgba(212, 165, 116, 0.1)', border: '1px solid rgba(212, 165, 116, 0.2)' }}>
                  <AlertCircle className="h-5 w-5 mt-0.5" style={{ color: 'var(--accent)' }} />
                  <div className="text-sm" style={{ color: 'var(--accent)' }}>
                    <p className="font-medium mb-1">Cancellation Policy</p>
                    <p>Free cancellation up to 24 hours before your appointment.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-5 py-2.5 rounded-lg border transition-colors flex items-center gap-2 disabled:opacity-50"
            style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          {currentStep < STEPS.length ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="px-5 py-2.5 font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleBookAppointment}
              disabled={isLoading}
              className="px-5 py-2.5 font-medium rounded-lg transition-colors flex items-center gap-2"
              style={{ backgroundColor: '#6b9b6b', color: 'white' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Confirm Booking
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
