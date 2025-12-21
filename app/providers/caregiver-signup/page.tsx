"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Heart,
  Shield,
  Users,
  DollarSign,
  MapPin,
  Upload,
  FileText,
  Star,
  Calendar,
  Phone,
  Mail,
  User,
  GraduationCap,
  Award,
  Globe,
  Car,
  Clock
} from "lucide-react"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import Link from "next/link"

const specialties = [
  "Elder Care",
  "Post-Surgery Care", 
  "Pediatric Care",
  "Dementia Care",
  "Hospice Care",
  "Companion Care",
  "Medical Equipment Support",
  "Medication Management",
  "Physical Therapy Support",
  "Occupational Therapy Support"
]

const languages = [
  "English",
  "Spanish",
  "Mandarin",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi"
]

export default function CaregiverSignupPage() {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Professional Information
    licenseNumber: '',
    primarySpecialty: '',
    yearsExperience: '',
    education: '',
    additionalCertifications: '',
    
    // Service Areas & Preferences
    serviceAreas: '',
    languagesSpoken: [] as string[],
    acceptInsurance: false,
    willingToTravel: false,
    availableForUrgent: false,
    
    // Additional Information
    carePhilosophy: '',
    digitalWalletAddress: ''
  })

  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedFiles, setUploadedFiles] = useState({
    governmentId: null as File | null,
    professionalLicense: null as File | null,
    additionalCertifications: null as File | null,
    backgroundCheck: null as File | null
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Create FormData for file upload
      const submitData = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          submitData.append(key, value.join(','))
        } else {
          submitData.append(key, value.toString())
        }
      })
      
      // Add uploaded files
      if (uploadedFiles.governmentId) {
        submitData.append('governmentId', uploadedFiles.governmentId)
      }
      if (uploadedFiles.professionalLicense) {
        submitData.append('professionalLicense', uploadedFiles.professionalLicense)
      }
      if (uploadedFiles.additionalCertifications) {
        submitData.append('additionalCertifications', uploadedFiles.additionalCertifications)
      }
      if (uploadedFiles.backgroundCheck) {
        submitData.append('backgroundCheck', uploadedFiles.backgroundCheck)
      }
      
      // Submit to API
      const response = await fetch('/api/caregivers/signup', {
        method: 'POST',
        body: submitData
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Redirect to success page with application ID
        window.location.href = `/providers/caregiver-signup/success?id=${result.applicationId}`
      } else {
        alert(`Error: ${result.error}`)
        setLoading(false)
      }
    } catch (error) {
      // Error handled by error state
      alert('Failed to submit application. Please try again.')
      setLoading(false)
    }
  }

  const handleFileUpload = (field: keyof typeof uploadedFiles, file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [field]: file
    }))
  }

  const toggleLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languagesSpoken: prev.languagesSpoken.includes(language)
        ? prev.languagesSpoken.filter(l => l !== language)
        : [...prev.languagesSpoken, language]
    }))
  }

  const steps = [
    { id: 1, title: "Personal Information" },
    { id: 2, title: "Professional Information" },
    { id: 3, title: "Service Areas & Preferences" },
    { id: 4, title: "Required Documents" },
    { id: 5, title: "Additional Information" }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mb-4">
            <Heart className="h-4 w-4" />
            Join Our Network
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Join Our Caregiving Community
          </h1>
          <p className="text-gray-600">
            Join our trusted network of professional caregivers and connect with families who need compassionate, skilled care.
          </p>
        </div>

        {/* Why Join Section */}
        <Card className="p-6 border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Why Join Our Professional Care Network?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Competitive Compensation</h3>
                <p className="text-sm text-gray-600">Competitive compensation & flexible scheduling</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Work Where You Want</h3>
                <p className="text-sm text-gray-600">Work in your preferred locations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Trusted Community</h3>
                <p className="text-sm text-gray-600">Trusted professional community</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-gray-900' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-gray-900">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </p>
          </div>
        </div>

        {/* Application Form */}
        <Card className="p-6 border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2 block">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter your first name"
                      className="border-2 border-gray-400 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2 block">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter your last name"
                      className="border-2 border-gray-400 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email address"
                      className="border-2 border-gray-400 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                      className="border-2 border-gray-400 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licenseNumber" className="text-sm font-medium text-gray-700 mb-2 block">
                      License/Certification Number *
                    </Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                      placeholder="Enter your license number"
                      className="border-2 border-gray-400 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="primarySpecialty" className="text-sm font-medium text-gray-700 mb-2 block">
                      Primary Specialty *
                    </Label>
                    <Select value={formData.primarySpecialty} onValueChange={(value) => setFormData(prev => ({ ...prev, primarySpecialty: value }))}>
                      <SelectTrigger className="border-2 border-gray-400 bg-white text-gray-900 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                        <SelectValue placeholder="Select your specialty" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-300 shadow-lg max-h-60 overflow-y-auto">
                        {specialties.map(specialty => (
                          <SelectItem key={specialty} value={specialty} className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">{specialty}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="yearsExperience" className="text-sm font-medium text-gray-700 mb-2 block">
                      Years of Experience
                    </Label>
                    <Input
                      id="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: e.target.value }))}
                      placeholder="e.g., 5 years"
                      className="border-2 border-gray-400 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="education" className="text-sm font-medium text-gray-700 mb-2 block">
                      Education/Degree
                    </Label>
                    <Input
                      id="education"
                      value={formData.education}
                      onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                      placeholder="e.g., RN, LPN, CNA"
                      className="border-2 border-gray-400 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="additionalCertifications" className="text-sm font-medium text-gray-700 mb-2 block">
                    Additional Certifications
                  </Label>
                  <Input
                    id="additionalCertifications"
                    value={formData.additionalCertifications}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalCertifications: e.target.value }))}
                    placeholder="e.g., CPR, First Aid, Specialized Training"
                    className="border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Service Areas & Preferences */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Service Areas & Preferences</h3>
                
                <div>
                  <Label htmlFor="serviceAreas" className="text-sm font-medium text-gray-700 mb-2 block">
                    Service Areas (Cities/ZIP codes)
                  </Label>
                  <Input
                    id="serviceAreas"
                    value={formData.serviceAreas}
                    onChange={(e) => setFormData(prev => ({ ...prev, serviceAreas: e.target.value }))}
                    placeholder="e.g., San Francisco, CA; 94102, 94103"
                    className="border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Languages Spoken
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {languages.map(language => (
                      <label key={language} className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.languagesSpoken.includes(language)}
                          onCheckedChange={() => toggleLanguage(language)}
                        />
                        <span className="text-sm text-gray-700">{language}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <Checkbox
                      checked={formData.acceptInsurance}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptInsurance: checked as boolean }))}
                    />
                    <span className="text-sm text-gray-700">I accept insurance payments</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <Checkbox
                      checked={formData.willingToTravel}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, willingToTravel: checked as boolean }))}
                    />
                    <span className="text-sm text-gray-700">I'm willing to travel for high-priority cases</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <Checkbox
                      checked={formData.availableForUrgent}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, availableForUrgent: checked as boolean }))}
                    />
                    <span className="text-sm text-gray-700">I'm available for urgent care situations</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Required Documents */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Government Issued ID * (Driver's License, Passport, State ID)
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {uploadedFiles.governmentId ? uploadedFiles.governmentId.name : "Upload a file or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG up to 10MB</p>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('governmentId', e.target.files[0])}
                        className="hidden"
                        id="governmentId"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 border-gray-200"
                        onClick={() => document.getElementById('governmentId')?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Professional License/Certification * (RN, LPN, CNA, etc.)
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {uploadedFiles.professionalLicense ? uploadedFiles.professionalLicense.name : "Upload a file or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG up to 10MB</p>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('professionalLicense', e.target.files[0])}
                        className="hidden"
                        id="professionalLicense"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 border-gray-200"
                        onClick={() => document.getElementById('professionalLicense')?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Additional Certifications (CPR, First Aid, Specialized Training)
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {uploadedFiles.additionalCertifications ? uploadedFiles.additionalCertifications.name : "Upload a file or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG up to 10MB (Optional)</p>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('additionalCertifications', e.target.files[0])}
                        className="hidden"
                        id="additionalCertifications"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 border-gray-200"
                        onClick={() => document.getElementById('additionalCertifications')?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Background Check Report
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {uploadedFiles.backgroundCheck ? uploadedFiles.backgroundCheck.name : "Upload a file or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG up to 10MB (Optional)</p>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('backgroundCheck', e.target.files[0])}
                        className="hidden"
                        id="backgroundCheck"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 border-gray-200"
                        onClick={() => document.getElementById('backgroundCheck')?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Additional Information */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                
                <div>
                  <Label htmlFor="carePhilosophy" className="text-sm font-medium text-gray-700 mb-2 block">
                    Your Care Philosophy & Experience *
                  </Label>
                  <Textarea
                    id="carePhilosophy"
                    value={formData.carePhilosophy}
                    onChange={(e) => setFormData(prev => ({ ...prev, carePhilosophy: e.target.value }))}
                    placeholder="Describe your approach to care, experience with different conditions, and what makes you a great caregiver..."
                    className="min-h-[120px] border-2 border-gray-400 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="digitalWalletAddress" className="text-sm font-medium text-gray-700 mb-2 block">
                    Digital Wallet Address (Optional)
                  </Label>
                  <Input
                    id="digitalWalletAddress"
                    value={formData.digitalWalletAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, digitalWalletAddress: e.target.value }))}
                    placeholder="Enter your digital wallet address for crypto payments"
                    className="border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="border-gray-200"
              >
                Previous
              </Button>
              
              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </div>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
} 