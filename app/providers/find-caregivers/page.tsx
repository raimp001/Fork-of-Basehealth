"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Heart, Clock, MapPin, DollarSign, Calendar as CalendarIcon, Users, Star, CheckCircle, Search } from 'lucide-react'
import { toast } from 'sonner'

export default function FindCaregiversPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [location, setLocation] = useState('')
  const [careType, setCareType] = useState('')
  const [careDescription, setCareDescription] = useState('')
  const [patientCondition, setPatientCondition] = useState('')
  const [startDate, setStartDate] = useState<Date>()
  const [duration, setDuration] = useState('')
  const [frequency, setFrequency] = useState('')
  const [preferredHours, setPreferredHours] = useState('')
  const [budgetType, setBudgetType] = useState('daily')
  const [budgetAmount, setBudgetAmount] = useState('')
  const [urgency, setUrgency] = useState('normal')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [specialRequirements, setSpecialRequirements] = useState<string[]>([])

  const careTypes = [
    'Senior Care',
    'Disability Support', 
    'Post-Surgery Recovery',
    'Chronic Illness Management',
    'Dementia/Alzheimer\'s Care',
    'Physical Therapy Support',
    'Companionship',
    'Personal Care',
    'Medical Care',
    'Respite Care'
  ]

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  const requirements = [
    'Licensed Nurse (RN/LPN)',
    'CPR Certified',
    'First Aid Certified',
    'Background Check Required',
    'Experience with Medical Equipment',
    'Bilingual Required',
    'Pet Friendly',
    'Non-Smoker',
    'Own Transportation'
  ]

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const handleRequirementToggle = (requirement: string) => {
    setSpecialRequirements(prev =>
      prev.includes(requirement)
        ? prev.filter(r => r !== requirement)
        : [...prev, requirement]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!location.trim()) {
      toast.error('Please enter your location')
      return
    }
    
    if (!careType) {
      toast.error('Please select the type of care needed')
      return
    }
    
    if (!careDescription.trim()) {
      toast.error('Please describe your care needs')
      return
    }
    
    if (!budgetAmount.trim()) {
      toast.error('Please enter your budget')
      return
    }

    setLoading(true)
    
    try {
      const careRequest = {
        location,
        careType,
        careDescription,
        patientCondition,
        startDate: startDate?.toISOString(),
        duration,
        frequency,
        preferredHours,
        budgetType,
        budgetAmount: parseFloat(budgetAmount),
        urgency,
        selectedDays,
        specialRequirements,
        createdAt: new Date().toISOString(),
        status: 'active'
      }

      // Simulate API call
      console.log('Care request submitted:', careRequest)
      
      toast.success('Care request posted successfully! Caregivers in your area will be notified.')
      
      // Redirect to results or dashboard
      setTimeout(() => {
        router.push('/care-requests/dashboard')
      }, 2000)
      
    } catch (error) {
      console.error('Error submitting care request:', error)
      toast.error('Failed to submit care request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-rose-100 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Find Professional Caregivers</h1>
          </div>
          <p className="text-slate-600 max-w-2xl">
            Connect with qualified, compassionate caregivers in your area. Describe your needs and we'll match you with the right professionals.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Benefits Banner */}
          <Card className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-emerald-800 mb-4">Why Choose Our Caregiver Network?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>All caregivers are background checked & licensed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-emerald-600" />
                  <span>Rated & reviewed by families like yours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-emerald-600" />
                  <span>Compassionate, professional care you can trust</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Main Form */}
          <Card>
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
                <Search className="h-5 w-5 text-rose-600" />
                Find Your Perfect Caregiver
              </div>
            </div>
            <div className="p-6 pt-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Location & Care Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium leading-none text-slate-800">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Your Location *
                    </label>
                    <Input
                      id="location"
                      placeholder="e.g., Miami FL, 33101, or Seattle WA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-slate-800">
                      <Heart className="h-4 w-4 inline mr-1" />
                      Type of Care Needed *
                    </label>
                    <Select value={careType} onValueChange={setCareType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select care type" />
                      </SelectTrigger>
                      <SelectContent>
                        {careTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Care Description */}
                <div className="space-y-2">
                  <label htmlFor="careDescription" className="text-sm font-medium leading-none text-slate-800">
                    Describe Your Care Needs *
                  </label>
                  <Textarea
                    id="careDescription"
                    placeholder="Please describe the specific care needed, daily activities, mobility requirements, medical needs, etc."
                    value={careDescription}
                    onChange={(e) => setCareDescription(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>

                {/* Patient Condition */}
                <div className="space-y-2">
                  <label htmlFor="patientCondition" className="text-sm font-medium leading-none text-slate-800">
                    Patient Condition/Diagnosis (Optional)
                  </label>
                  <Input
                    id="patientCondition"
                    placeholder="e.g., Alzheimer's, post-stroke recovery, diabetes management"
                    value={patientCondition}
                    onChange={(e) => setPatientCondition(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Schedule Section */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold mb-4 text-blue-800">
                    <CalendarIcon className="h-5 w-5 inline mr-2" />
                    Care Schedule
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none text-slate-800">
                        Preferred Start Date
                      </label>
                      <Input
                        type="date"
                        value={startDate ? startDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none text-slate-800">
                        Duration Needed
                      </label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-week">1 Week</SelectItem>
                          <SelectItem value="2-weeks">2 Weeks</SelectItem>
                          <SelectItem value="1-month">1 Month</SelectItem>
                          <SelectItem value="3-months">3 Months</SelectItem>
                          <SelectItem value="6-months">6 Months</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none text-slate-800">
                        Frequency
                      </label>
                      <Select value={frequency} onValueChange={setFrequency}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekdays">Weekdays Only</SelectItem>
                          <SelectItem value="weekends">Weekends Only</SelectItem>
                          <SelectItem value="few-times-week">Few Times a Week</SelectItem>
                          <SelectItem value="as-needed">As Needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none text-slate-800">
                        Preferred Hours
                      </label>
                      <Select value={preferredHours} onValueChange={setPreferredHours}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning (6 AM - 12 PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12 PM - 6 PM)</SelectItem>
                          <SelectItem value="evening">Evening (6 PM - 10 PM)</SelectItem>
                          <SelectItem value="overnight">Overnight (10 PM - 6 AM)</SelectItem>
                          <SelectItem value="24-hour">24-Hour Care</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Days of Week */}
                  <div className="mt-4">
                    <label className="text-sm font-medium leading-none text-slate-800 mb-2 block">
                      Preferred Days (Select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => (
                        <Badge
                          key={day}
                          variant={selectedDays.includes(day) ? "default" : "outline"}
                          className={`cursor-pointer transition-colors ${
                            selectedDays.includes(day) 
                              ? 'bg-blue-600 text-white' 
                              : 'hover:bg-blue-100'
                          }`}
                          onClick={() => handleDayToggle(day)}
                        >
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Budget Section */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold mb-4 text-green-800">
                    <DollarSign className="h-5 w-5 inline mr-2" />
                    Budget & Investment
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none text-slate-800">
                        Budget Period
                      </label>
                      <Select value={budgetType} onValueChange={setBudgetType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Per Hour</SelectItem>
                          <SelectItem value="daily">Per Day</SelectItem>
                          <SelectItem value="weekly">Per Week</SelectItem>
                          <SelectItem value="monthly">Per Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="budgetAmount" className="text-sm font-medium leading-none text-slate-800">
                        Amount ($) *
                      </label>
                      <Input
                        id="budgetAmount"
                        type="number"
                        placeholder="Enter amount"
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none text-slate-800">
                        Urgency Level
                      </label>
                      <Select value={urgency} onValueChange={setUrgency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">Urgent (Within 24-48 hours)</SelectItem>
                          <SelectItem value="normal">Normal (Within 1 week)</SelectItem>
                          <SelectItem value="flexible">Flexible (Within 2-4 weeks)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="space-y-3">
                  <label className="text-sm font-medium leading-none text-slate-800">
                    Special Requirements (Optional)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {requirements.map((requirement) => (
                      <div key={requirement} className="flex items-center space-x-2">
                        <Checkbox
                          id={requirement}
                          checked={specialRequirements.includes(requirement)}
                          onCheckedChange={() => handleRequirementToggle(requirement)}
                        />
                        <label htmlFor={requirement} className="text-sm text-slate-700">
                          {requirement}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 text-lg font-semibold"
                  >
                    {loading ? (
                      <>
                        <Clock className="mr-2 h-5 w-5 animate-spin" />
                        Posting Request...
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-5 w-5" />
                        Find Caregivers
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 