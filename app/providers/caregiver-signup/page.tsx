"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Heart, Upload, FileText, Award, User, MapPin, Calendar, Clock, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

export default function CaregiverSignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    specialty: '',
    yearsExperience: '',
    education: '',
    certifications: '',
    workLocations: '',
    languages: '',
    about: '',
    acceptsInsurance: false,
    willingToTravel: false,
    acceptsEmergency: false,
    walletAddress: '',
    governmentId: null,
    professionalLicense: null,
    additionalCertifications: null,
    backgroundCheck: null,
    // Availability/Request scheduling
    availableDays: [] as string[],
    preferredHours: '',
    minimumNotice: '',
    requestHourlyRate: '',
    emergencyRate: ''
  })

  const [showRequestForm, setShowRequestForm] = useState(false)

  const [uploadedFiles, setUploadedFiles] = useState({
    governmentId: null as File | null,
    professionalLicense: null as File | null,
    additionalCertifications: null as File | null,
    backgroundCheck: null as File | null
  })

  const specialties = [
    'Primary Care',
    'Nursing (RN/LPN)',
    'Home Health Aide',
    'Physical Therapy',
    'Occupational Therapy',
    'Speech Therapy',
    'Mental Health Counseling',
    'Nutrition/Dietitian',
    'Pharmacy Services',
    'Medical Equipment Specialist',
    'Eldercare Specialist',
    'Pediatric Care',
    'Chronic Disease Management',
    'Palliative Care',
    'Other'
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field: string, file: File | null) => {
    setUploadedFiles(prev => ({ ...prev, [field]: file }))
    
    if (file) {
      // Convert file to base64 for storage/transmission
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ 
          ...prev, 
          [field]: {
            name: file.name,
            size: file.size,
            type: file.type,
            data: reader.result
          }
        }))
      }
      reader.readAsDataURL(file)
    } else {
      setFormData(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'licenseNumber', 'specialty', 'about']
      const missingFields = requiredFields.filter(field => !formData[field])
      
      if (missingFields.length > 0) {
        toast.error(`Please fill in required fields: ${missingFields.join(', ')}`)
        return
      }

      // Validate required documents
      if (!formData.governmentId || !formData.professionalLicense) {
        toast.error('Please upload required documents: Government ID and Professional License')
        return
      }

      // Submit to API
      const response = await fetch('/api/admin/caregiver-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          applicationDate: new Date().toISOString(),
          status: 'pending'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit application')
      }

      toast.success('Application submitted successfully! You will receive an email once reviewed.')
      router.push('/providers/caregiver-signup/success')

    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Failed to submit application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-healthcare-gradient">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-rose-100 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Join Our Caregiving Community</h1>
          </div>
                      <p className="text-slate-600 max-w-2xl">
              Join our trusted network of professional caregivers and connect with families who need compassionate, skilled care.
            </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Benefits Section */}
          <Card className="mb-8 bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-rose-800 mb-4">Why Join Our Professional Care Network?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-rose-600" />
                  <span>Competitive compensation & flexible scheduling</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-rose-600" />
                  <span>Work in your preferred locations</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-rose-600" />
                  <span>Trusted professional community</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Care Request Services Section */}
          <Card className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-emerald-800 mb-2">Connect with Professional Caregivers</h2>
                  <p className="text-emerald-700 text-sm">Schedule compassionate, personalized care that fits your family's needs</p>
                </div>
                <Button 
                  onClick={() => setShowRequestForm(!showRequestForm)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {showRequestForm ? 'Close Care Planner' : 'Plan Care Schedule'}
                </Button>
              </div>

              {showRequestForm && (
                <div className="mt-6 p-6 bg-white rounded-xl border border-emerald-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Care Planning Assistant</h3>
                      <p className="text-sm text-gray-600">Help caregivers understand your specific needs and schedule</p>
                    </div>
                  </div>

                  {/* Care Schedule Planning */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        When do you need care?
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="startDate">Care Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            className="mt-1"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <Label htmlFor="careFrequency">Frequency of Care</Label>
                          <Select>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="How often?" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-slate-200 shadow-lg rounded-lg max-h-64 overflow-y-auto z-50">
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekdays">Weekdays only</SelectItem>
                              <SelectItem value="weekends">Weekends only</SelectItem>
                              <SelectItem value="specific-days">Specific days</SelectItem>
                              <SelectItem value="as-needed">As needed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="careDuration">Duration of Care</Label>
                          <Select>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="How long?" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-slate-200 shadow-lg rounded-lg max-h-64 overflow-y-auto z-50">
                              <SelectItem value="few-hours">A few hours</SelectItem>
                              <SelectItem value="half-day">Half day (4 hours)</SelectItem>
                              <SelectItem value="full-day">Full day (8+ hours)</SelectItem>
                              <SelectItem value="overnight">Overnight care</SelectItem>
                              <SelectItem value="live-in">Live-in care</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Preferred Care Hours
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { value: 'morning-early', label: 'Early Morning', time: '6-9 AM' },
                          { value: 'morning', label: 'Morning', time: '9 AM-12 PM' },
                          { value: 'afternoon', label: 'Afternoon', time: '12-5 PM' },
                          { value: 'evening', label: 'Evening', time: '5-9 PM' },
                          { value: 'night', label: 'Night', time: '9 PM-12 AM' },
                          { value: 'overnight', label: 'Overnight', time: '12-6 AM' },
                          { value: 'flexible', label: 'Flexible', time: 'Any time' },
                          { value: 'custom', label: 'Custom Hours', time: 'Specify below' }
                        ].map((timeSlot) => (
                          <div key={timeSlot.value} className="flex items-center space-x-2">
                            <Checkbox id={timeSlot.value} />
                            <div>
                              <Label htmlFor={timeSlot.value} className="text-sm font-medium cursor-pointer">
                                {timeSlot.label}
                              </Label>
                              <p className="text-xs text-gray-500">{timeSlot.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-rose-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Heart className="h-4 w-4 text-rose-600" />
                        Type of Care Needed
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="primaryCareType">Primary Care Type</Label>
                          <Select>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="What kind of care?" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-slate-200 shadow-lg rounded-lg max-h-64 overflow-y-auto z-50">
                              {specialties.map(specialty => (
                                <SelectItem key={specialty} value={specialty.toLowerCase().replace(/\s+/g, '-')}>
                                  {specialty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="patientCondition">Patient Condition/Needs</Label>
                          <Select>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Condition level" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-slate-200 shadow-lg rounded-lg max-h-64 overflow-y-auto z-50">
                              <SelectItem value="independent">Mostly independent</SelectItem>
                              <SelectItem value="assistance">Needs some assistance</SelectItem>
                              <SelectItem value="supervised">Requires supervision</SelectItem>
                              <SelectItem value="full-care">Needs full-time care</SelectItem>
                              <SelectItem value="specialized">Specialized medical needs</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                        Care Investment & Preferences
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hourlyBudget">Hourly Care Investment (USD)</Label>
                          <Input
                            id="hourlyBudget"
                            type="number"
                            min="0"
                            placeholder="e.g., 25"
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">Market range: $15-50+ depending on specialty</p>
                        </div>
                        <div>
                          <Label htmlFor="careUrgency">Timeline</Label>
                          <Select>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="When do you need to start?" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-slate-200 shadow-lg rounded-lg max-h-64 overflow-y-auto z-50">
                              <SelectItem value="planning">Planning ahead (2+ weeks)</SelectItem>
                              <SelectItem value="soon">Needed soon (1-2 weeks)</SelectItem>
                              <SelectItem value="urgent">Urgent need (2-7 days)</SelectItem>
                              <SelectItem value="immediate">Immediate (within 48 hours)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="careDescription">Tell us about your care needs</Label>
                      <Textarea
                        id="careDescription"
                        placeholder="Share details about the person receiving care, their personality, preferences, daily routine, any special requirements, and what would make them most comfortable..."
                        className="mt-1"
                        rows={4}
                      />
                      <p className="text-xs text-gray-500 mt-1">This helps caregivers understand how to provide the best possible care</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowRequestForm(false)}
                      >
                        Save for Later
                      </Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Heart className="h-4 w-4 mr-2" />
                        Connect with Caregivers
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-rose-600" />
                Caregiver Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-800">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-800">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="licenseNumber">License/Certification Number *</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialty">Primary Specialty *</Label>
                      <Select value={formData.specialty} onValueChange={(value) => handleInputChange('specialty', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select your specialty" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-slate-200 shadow-lg rounded-lg max-h-64 overflow-y-auto z-50">
                          {specialties.map(specialty => (
                            <SelectItem key={specialty} value={specialty} className="hover:bg-slate-50 focus:bg-slate-50 cursor-pointer">
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="yearsExperience">Years of Experience</Label>
                      <Input
                        id="yearsExperience"
                        type="number"
                        value={formData.yearsExperience}
                        onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="education">Education/Degree</Label>
                      <Input
                        id="education"
                        value={formData.education}
                        onChange={(e) => handleInputChange('education', e.target.value)}
                        className="mt-1"
                        placeholder="e.g., BSN, RN, CNA"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor="certifications">Additional Certifications</Label>
                    <Textarea
                      id="certifications"
                      value={formData.certifications}
                      onChange={(e) => handleInputChange('certifications', e.target.value)}
                      className="mt-1"
                      placeholder="List any additional certifications, training, or specializations"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Service Areas & Preferences */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-800">Service Areas & Preferences</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="workLocations">Service Areas (Cities/ZIP codes)</Label>
                      <Input
                        id="workLocations"
                        value={formData.workLocations}
                        onChange={(e) => handleInputChange('workLocations', e.target.value)}
                        className="mt-1"
                        placeholder="e.g., Miami FL, 33101, Orlando FL"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="languages">Languages Spoken</Label>
                      <Input
                        id="languages"
                        value={formData.languages}
                        onChange={(e) => handleInputChange('languages', e.target.value)}
                        className="mt-1"
                        placeholder="e.g., English, Spanish, French"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="acceptsInsurance"
                          checked={formData.acceptsInsurance}
                          onCheckedChange={(checked) => handleInputChange('acceptsInsurance', checked as boolean)}
                        />
                        <Label htmlFor="acceptsInsurance">I accept insurance payments</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="willingToTravel"
                          checked={formData.willingToTravel}
                          onCheckedChange={(checked) => handleInputChange('willingToTravel', checked as boolean)}
                        />
                        <Label htmlFor="willingToTravel">I'm willing to travel for high-priority cases</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="acceptsEmergency"
                          checked={formData.acceptsEmergency}
                          onCheckedChange={(checked) => handleInputChange('acceptsEmergency', checked as boolean)}
                        />
                        <Label htmlFor="acceptsEmergency">I'm available for urgent care situations</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Uploads */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-800">Required Documents</h3>
                  <div className="space-y-6">
                    {/* Government ID */}
                    <div>
                      <Label htmlFor="governmentId" className="text-sm font-semibold text-slate-800">
                        Government Issued ID * (Driver's License, Passport, State ID)
                      </Label>
                      <div className="mt-2 flex items-center justify-center border-2 border-dashed border-rose-300 rounded-lg p-6 hover:border-rose-400 transition-colors">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-slate-400" />
                          <div className="mt-4">
                            <label htmlFor="governmentId" className="cursor-pointer">
                              <span className="text-rose-600 font-medium hover:text-rose-500">
                                Upload a file
                              </span>
                              <input
                                id="governmentId"
                                type="file"
                                className="sr-only"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null
                                  handleFileUpload('governmentId', file)
                                }}
                              />
                            </label>
                            <p className="text-slate-500 text-sm">or drag and drop</p>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">PDF, PNG, JPG up to 10MB</p>
                          {uploadedFiles.governmentId && (
                            <p className="text-sm text-green-600 mt-2 font-medium">
                              ✓ {uploadedFiles.governmentId.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Professional License */}
                    <div>
                      <Label htmlFor="professionalLicense" className="text-sm font-semibold text-slate-800">
                        Professional License/Certification * (RN, LPN, CNA, etc.)
                      </Label>
                      <div className="mt-2 flex items-center justify-center border-2 border-dashed border-rose-300 rounded-lg p-6 hover:border-rose-400 transition-colors">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-slate-400" />
                          <div className="mt-4">
                            <label htmlFor="professionalLicense" className="cursor-pointer">
                              <span className="text-rose-600 font-medium hover:text-rose-500">
                                Upload a file
                              </span>
                              <input
                                id="professionalLicense"
                                type="file"
                                className="sr-only"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null
                                  handleFileUpload('professionalLicense', file)
                                }}
                              />
                            </label>
                            <p className="text-slate-500 text-sm">or drag and drop</p>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">PDF, PNG, JPG up to 10MB</p>
                          {uploadedFiles.professionalLicense && (
                            <p className="text-sm text-green-600 mt-2 font-medium">
                              ✓ {uploadedFiles.professionalLicense.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Certifications */}
                    <div>
                      <Label htmlFor="additionalCertifications" className="text-sm font-semibold text-slate-800">
                        Additional Certifications (CPR, First Aid, Specialized Training)
                      </Label>
                      <div className="mt-2 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-slate-400 transition-colors">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-slate-400" />
                          <div className="mt-4">
                            <label htmlFor="additionalCertifications" className="cursor-pointer">
                              <span className="text-slate-600 font-medium hover:text-slate-500">
                                Upload a file
                              </span>
                              <input
                                id="additionalCertifications"
                                type="file"
                                className="sr-only"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null
                                  handleFileUpload('additionalCertifications', file)
                                }}
                              />
                            </label>
                            <p className="text-slate-500 text-sm">or drag and drop</p>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">PDF, PNG, JPG up to 10MB (Optional)</p>
                          {uploadedFiles.additionalCertifications && (
                            <p className="text-sm text-green-600 mt-2 font-medium">
                              ✓ {uploadedFiles.additionalCertifications.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Background Check */}
                    <div>
                      <Label htmlFor="backgroundCheck" className="text-sm font-semibold text-slate-800">
                        Background Check Report
                      </Label>
                      <div className="mt-2 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-slate-400 transition-colors">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-slate-400" />
                          <div className="mt-4">
                            <label htmlFor="backgroundCheck" className="cursor-pointer">
                              <span className="text-slate-600 font-medium hover:text-slate-500">
                                Upload a file
                              </span>
                              <input
                                id="backgroundCheck"
                                type="file"
                                className="sr-only"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null
                                  handleFileUpload('backgroundCheck', file)
                                }}
                              />
                            </label>
                            <p className="text-slate-500 text-sm">or drag and drop</p>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">PDF, PNG, JPG up to 10MB (Optional)</p>
                          {uploadedFiles.backgroundCheck && (
                            <p className="text-sm text-green-600 mt-2 font-medium">
                              ✓ {uploadedFiles.backgroundCheck.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About & Wallet */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-800">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="about">Your Care Philosophy & Experience *</Label>
                      <Textarea
                        id="about"
                        value={formData.about}
                        onChange={(e) => handleInputChange('about', e.target.value)}
                        className="mt-1"
                        placeholder="Share your passion for caregiving, your approach to patient care, relevant experience, and what families can expect when working with you. What makes you a compassionate and skilled caregiver?"
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="walletAddress">Digital Wallet Address (Optional)</Label>
                      <Input
                        id="walletAddress"
                        value={formData.walletAddress}
                        onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                        className="mt-1"
                        placeholder="For receiving payments in cryptocurrency (Bitcoin, Ethereum, etc.)"
                      />
                    </div>
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
                        <Upload className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-5 w-5" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 