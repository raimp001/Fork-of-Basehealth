"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Upload, 
  FileText, 
  Shield, 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  User,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Award,
  Building,
  Camera
} from "lucide-react"

interface ProviderFormData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  
  // Professional Information
  npiNumber: string
  specialty: string
  subSpecialty: string
  credentials: string
  yearsOfExperience: string
  
  // License Information
  licenseNumber: string
  licenseState: string
  licenseExpiration: string
  deaNumber: string
  
  // Practice Information
  practiceType: string
  practiceName: string
  practiceAddress: string
  practiceCity: string
  practiceState: string
  practiceZip: string
  
  // Services & Availability
  servicesOffered: string[]
  consultationFee: string
  acceptedInsurance: string[]
  availableDays: string[]
  timeSlots: { start: string, end: string }
  
  // Education & Training
  medicalSchool: string
  residency: string
  fellowship: string
  boardCertifications: string[]
  
  // Additional Information
  bio: string
  languages: string[]
  telemedicineExperience: boolean
  cryptoPayments: boolean
  
  // Documents
  profilePhoto: File | null
  medicalLicense: File | null
  deaCertificate: File | null
  boardCertifications: File | null
  malpracticeInsurance: File | null
  cv: File | null
}

export default function ProviderSignupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ProviderFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    npiNumber: '',
    specialty: '',
    subSpecialty: '',
    credentials: '',
    yearsOfExperience: '',
    licenseNumber: '',
    licenseState: '',
    licenseExpiration: '',
    deaNumber: '',
    practiceType: '',
    practiceName: '',
    practiceAddress: '',
    practiceCity: '',
    practiceState: '',
    practiceZip: '',
    servicesOffered: [],
    consultationFee: '',
    acceptedInsurance: [],
    availableDays: [],
    timeSlots: { start: '09:00', end: '17:00' },
    medicalSchool: '',
    residency: '',
    fellowship: '',
    boardCertifications: [],
    bio: '',
    languages: [],
    telemedicineExperience: false,
    cryptoPayments: false,
    profilePhoto: null,
    medicalLicense: null,
    deaCertificate: null,
    boardCertifications: null,
    malpracticeInsurance: null,
    cv: null
  })

  const specialties = [
    "Family Medicine", "Internal Medicine", "Pediatrics", "Cardiology", "Dermatology",
    "Neurology", "Orthopedics", "Psychiatry", "Radiology", "Emergency Medicine",
    "Anesthesiology", "Surgery", "Oncology", "Ophthalmology", "Urology",
    "Gynecology", "Endocrinology", "Gastroenterology", "Pulmonology", "Rheumatology"
  ]

  const insuranceProviders = [
    "Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Cigna", "Humana",
    "Medicare", "Medicaid", "Kaiser Permanente", "Anthem", "Molina Healthcare"
  ]

  const languages = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", 
    "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Russian"
  ]

  const services = [
    "Routine Check-ups", "Preventive Care", "Chronic Disease Management",
    "Acute Care", "Telemedicine", "Mental Health", "Pediatric Care",
    "Geriatric Care", "Women's Health", "Men's Health", "Vaccination",
    "Laboratory Services", "Diagnostic Imaging", "Minor Procedures"
  ]

  const handleInputChange = (field: keyof ProviderFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (field: keyof ProviderFormData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }))
  }

  const handleFileUpload = (field: keyof ProviderFormData, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }))
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSubmitted(true)
    } catch (error) {
      // Error handled by error state
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Personal Information</h2>
        <p className="text-muted-foreground">Let's start with your basic information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Enter your first name"
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Enter your last name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your.email@example.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
          required
        />
      </div>
    </div>
  )

  const renderProfessionalInfo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Professional Information</h2>
        <p className="text-muted-foreground">Tell us about your medical practice</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="npiNumber">NPI Number *</Label>
          <Input
            id="npiNumber"
            value={formData.npiNumber}
            onChange={(e) => handleInputChange('npiNumber', e.target.value)}
            placeholder="1234567890"
            maxLength={10}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">10-digit National Provider Identifier</p>
        </div>
        <div>
          <Label htmlFor="credentials">Credentials *</Label>
          <Input
            id="credentials"
            value={formData.credentials}
            onChange={(e) => handleInputChange('credentials', e.target.value)}
            placeholder="MD, DO, DDS, etc."
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="specialty">Primary Specialty *</Label>
          <Select onValueChange={(value) => handleInputChange('specialty', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your specialty" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map(specialty => (
                <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="subSpecialty">Sub-specialty</Label>
          <Input
            id="subSpecialty"
            value={formData.subSpecialty}
            onChange={(e) => handleInputChange('subSpecialty', e.target.value)}
            placeholder="e.g., Interventional Cardiology"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
        <Select onValueChange={(value) => handleInputChange('yearsOfExperience', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select years of experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-2">0-2 years</SelectItem>
            <SelectItem value="3-5">3-5 years</SelectItem>
            <SelectItem value="6-10">6-10 years</SelectItem>
            <SelectItem value="11-15">11-15 years</SelectItem>
            <SelectItem value="16-20">16-20 years</SelectItem>
            <SelectItem value="20+">20+ years</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderLicenseInfo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">License & Certification</h2>
        <p className="text-muted-foreground">Provide your licensing information</p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          All license information will be verified with state licensing boards. Please ensure accuracy.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="licenseNumber">Medical License Number *</Label>
          <Input
            id="licenseNumber"
            value={formData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            placeholder="Enter license number"
            required
          />
        </div>
        <div>
          <Label htmlFor="licenseState">License State *</Label>
          <Select onValueChange={(value) => handleInputChange('licenseState', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CA">California</SelectItem>
              <SelectItem value="NY">New York</SelectItem>
              <SelectItem value="TX">Texas</SelectItem>
              <SelectItem value="FL">Florida</SelectItem>
              <SelectItem value="IL">Illinois</SelectItem>
              <SelectItem value="PA">Pennsylvania</SelectItem>
              <SelectItem value="OH">Ohio</SelectItem>
              <SelectItem value="GA">Georgia</SelectItem>
              <SelectItem value="NC">North Carolina</SelectItem>
              <SelectItem value="MI">Michigan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="licenseExpiration">License Expiration Date *</Label>
          <Input
            id="licenseExpiration"
            type="date"
            value={formData.licenseExpiration}
            onChange={(e) => handleInputChange('licenseExpiration', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="deaNumber">DEA Number</Label>
          <Input
            id="deaNumber"
            value={formData.deaNumber}
            onChange={(e) => handleInputChange('deaNumber', e.target.value)}
            placeholder="Optional - for prescribing providers"
          />
        </div>
      </div>

      <div>
        <Label>Board Certifications</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {["ABIM", "ABFM", "ABP", "ACOG", "ABO", "ABR", "ABS", "ABU"].map(cert => (
            <div key={cert} className="flex items-center space-x-2">
              <Checkbox
                id={cert}
                checked={formData.boardCertifications.includes(cert)}
                onCheckedChange={(checked) => handleArrayChange('boardCertifications', cert, checked as boolean)}
              />
              <Label htmlFor={cert}>{cert}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPracticeInfo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Practice Information</h2>
        <p className="text-muted-foreground">Tell us about your practice</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="practiceType">Practice Type *</Label>
          <Select onValueChange={(value) => handleInputChange('practiceType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select practice type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solo">Solo Practice</SelectItem>
              <SelectItem value="group">Group Practice</SelectItem>
              <SelectItem value="hospital">Hospital Employed</SelectItem>
              <SelectItem value="clinic">Clinic</SelectItem>
              <SelectItem value="telehealth">Telehealth Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="practiceName">Practice/Clinic Name *</Label>
          <Input
            id="practiceName"
            value={formData.practiceName}
            onChange={(e) => handleInputChange('practiceName', e.target.value)}
            placeholder="Enter practice name"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="practiceAddress">Practice Address *</Label>
        <Input
          id="practiceAddress"
          value={formData.practiceAddress}
          onChange={(e) => handleInputChange('practiceAddress', e.target.value)}
          placeholder="Street address"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="practiceCity">City *</Label>
          <Input
            id="practiceCity"
            value={formData.practiceCity}
            onChange={(e) => handleInputChange('practiceCity', e.target.value)}
            placeholder="City"
            required
          />
        </div>
        <div>
          <Label htmlFor="practiceState">State *</Label>
          <Select onValueChange={(value) => handleInputChange('practiceState', value)}>
            <SelectTrigger>
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CA">California</SelectItem>
              <SelectItem value="NY">New York</SelectItem>
              <SelectItem value="TX">Texas</SelectItem>
              <SelectItem value="FL">Florida</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="practiceZip">ZIP Code *</Label>
          <Input
            id="practiceZip"
            value={formData.practiceZip}
            onChange={(e) => handleInputChange('practiceZip', e.target.value)}
            placeholder="12345"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="consultationFee">Consultation Fee (USD) *</Label>
        <Input
          id="consultationFee"
          type="number"
          value={formData.consultationFee}
          onChange={(e) => handleInputChange('consultationFee', e.target.value)}
          placeholder="150"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">Standard consultation fee for new patients</p>
      </div>

      <div>
        <Label>Services Offered</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {services.map(service => (
            <div key={service} className="flex items-center space-x-2">
              <Checkbox
                id={service}
                checked={formData.servicesOffered.includes(service)}
                onCheckedChange={(checked) => handleArrayChange('servicesOffered', service, checked as boolean)}
              />
              <Label htmlFor={service} className="text-sm">{service}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Accepted Insurance</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {insuranceProviders.map(insurance => (
            <div key={insurance} className="flex items-center space-x-2">
              <Checkbox
                id={insurance}
                checked={formData.acceptedInsurance.includes(insurance)}
                onCheckedChange={(checked) => handleArrayChange('acceptedInsurance', insurance, checked as boolean)}
              />
              <Label htmlFor={insurance} className="text-sm">{insurance}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderDocumentsAndAvailability = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Documents & Availability</h2>
        <p className="text-muted-foreground">Upload required documents and set your availability</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> We do not provide malpractice insurance. You must maintain your own malpractice coverage to practice on our platform.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Required Documents</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Camera className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Profile Photo</span>
                <Badge variant="secondary">Required</Badge>
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload('profilePhoto', e.target.files?.[0] || null)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-5 w-5 text-green-500" />
                <span className="font-medium">Medical License</span>
                <Badge variant="secondary">Required</Badge>
              </div>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('medicalLicense', e.target.files?.[0] || null)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Malpractice Insurance</span>
                <Badge variant="secondary">Required</Badge>
              </div>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('malpracticeInsurance', e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground mt-1">Current certificate of coverage</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Award className="h-5 w-5 text-purple-500" />
                <span className="font-medium">CV/Resume</span>
                <Badge variant="outline">Optional</Badge>
              </div>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileUpload('cv', e.target.files?.[0] || null)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Availability</h3>
        
        <div>
          <Label>Available Days</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={day}
                  checked={formData.availableDays.includes(day)}
                  onCheckedChange={(checked) => handleArrayChange('availableDays', day, checked as boolean)}
                />
                <Label htmlFor={day}>{day}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.timeSlots.start}
              onChange={(e) => handleInputChange('timeSlots', { ...formData.timeSlots, start: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={formData.timeSlots.end}
              onChange={(e) => handleInputChange('timeSlots', { ...formData.timeSlots, end: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Additional Information</h3>
        
        <div>
          <Label htmlFor="bio">Professional Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell patients about your background, experience, and approach to care..."
            rows={4}
          />
        </div>

        <div>
          <Label>Languages Spoken</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {languages.map(language => (
              <div key={language} className="flex items-center space-x-2">
                <Checkbox
                  id={language}
                  checked={formData.languages.includes(language)}
                  onCheckedChange={(checked) => handleArrayChange('languages', language, checked as boolean)}
                />
                <Label htmlFor={language} className="text-sm">{language}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="telemedicine"
              checked={formData.telemedicineExperience}
              onCheckedChange={(checked) => handleInputChange('telemedicineExperience', checked)}
            />
            <Label htmlFor="telemedicine">I have experience with telemedicine consultations</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="crypto"
              checked={formData.cryptoPayments}
              onCheckedChange={(checked) => handleInputChange('cryptoPayments', checked)}
            />
            <Label htmlFor="crypto">I accept cryptocurrency payments (2.5% bonus on crypto transactions)</Label>
          </div>
        </div>
      </div>
    </div>
  )

  if (submitted) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your interest in joining BaseHealth. Your application has been received and is under review.
            </p>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Application received</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Document verification (2-3 business days)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Background check (3-5 business days)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Final approval and account setup</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              We'll send you an email update within 24 hours with next steps.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">Join BaseHealth Provider Network</h1>
        <p className="text-xl text-muted-foreground">
          Connect with patients and grow your practice with our secure, modern platform
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              {step < 5 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-sky-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Personal Info</span>
          <span>Professional</span>
          <span>License</span>
          <span>Practice</span>
          <span>Documents</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          {currentStep === 1 && renderPersonalInfo()}
          {currentStep === 2 && renderProfessionalInfo()}
          {currentStep === 3 && renderLicenseInfo()}
          {currentStep === 4 && renderPracticeInfo()}
          {currentStep === 5 && renderDocumentsAndAvailability()}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < 5 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 