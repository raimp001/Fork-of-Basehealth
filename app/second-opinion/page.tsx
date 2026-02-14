"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Brain,
  Shield,
  Database,
  Zap,
  Lock,
  Network,
  Upload,
  FileText,
  ArrowRight,
  CheckCircle
} from "lucide-react"

const emrSystems = [
  { name: "Epic MyChart", features: ["Patient Summary", "Lab Results", "Medications", "Imaging", "Notes"] },
  { name: "Cerner PowerChart", features: ["Clinical Data", "Lab Results", "Medications", "Orders"] },
  { name: "Allscripts", features: ["Medical History", "Prescriptions", "Lab Results"] },
  { name: "athenahealth", features: ["Patient Data", "Clinical Notes", "Lab Results", "Billing"] },
  { name: "NextGen", features: ["Patient Records", "Prescriptions", "Lab Results"] },
  { name: "Kaiser Permanente", features: ["Health Summary", "Test Results", "Medications", "Appointments"] }
]

const documentTypes = [
  "PDF, DOC",
  "Images", 
  "Lab Reports",
  "DICOM"
]

const processingSteps = [
  "Optical Character Recognition (OCR)",
  "Natural Language Processing (NLP)",
  "Medical Entity Extraction",
  "Data Validation & Structuring",
  "HIPAA-compliant processing with end-to-end encryption"
]

export default function SecondOpinionPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    diagnosis: '',
    symptoms: '',
    budget: '',
    urgency: '',
    documents: [] as File[],
    selectedEmr: '',
    processingOptions: {
      ocr: true,
      nlp: true,
      validation: true,
      hipaa: true
    }
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Redirect to results
    window.location.href = '/second-opinion/results'
  }

  const steps = [
    { id: 1, title: "Data Sources" },
    { id: 2, title: "Processing" },
    { id: 3, title: "Case Details" },
    { id: 4, title: "Responses" }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 tracking-tight">
            Get a Specialist Second Opinion
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Connect securely with board-certified specialists for expert review. Share records via EMR or upload directly.
          </p>
        </div>

        {/* Features */}
        <Card className="p-6 border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Why Choose Our Expert Network?</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">EMR Integration</h3>
                <p className="text-sm text-gray-600">Connect to Epic, Cerner, and other major EMR systems</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">AI Processing</h3>
                <p className="text-sm text-gray-600">OCR and NLP pipeline for document analysis</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">HIPAA Compliant</h3>
                <p className="text-sm text-gray-600">Secure data processing and transmission</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Network className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Expert Network</h3>
                <p className="text-sm text-gray-600">Board-certified specialists worldwide</p>
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

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - EMR Integration */}
          <div className="lg:col-span-2">
            <Card className="p-6 border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Share Your Case with AI-Enhanced EMR Integration
              </h2>
              <p className="text-gray-600 mb-6">
                Connect your EMR or upload documents. Our AI pipeline will process your medical data using OCR and NLP for expert review.
              </p>

              {/* EMR Integration Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect Your EMR</h3>
                <p className="text-sm text-gray-600 mb-4">We'll access your patient summary, labs, medications, and imaging—you control what's shared.</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {emrSystems.map((emr) => (
                    <Card key={emr.name} className="p-4 border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Database className="h-4 w-4 text-blue-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">{emr.name}</h4>
                      </div>
                      <div className="space-y-1 mb-3">
                        {emr.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                      <Button 
                        type="button"
                        variant="outline" 
                        className="w-full border-gray-200 hover:border-gray-300"
                        onClick={() => setFormData(prev => ({ ...prev, selectedEmr: emr.name }))}
                      >
                        Connect
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 text-gray-500">
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                  <span className="text-sm">OR</span>
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                </div>
              </div>

              {/* Document Upload Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h3>
                <p className="text-sm text-gray-600 mb-4">Upload medical records, lab results, imaging reports</p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Upload Medical Documents</p>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {documentTypes.map((type, index) => (
                      <span key={index} className="text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                        {type}
                      </span>
                    ))}
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dicom"
                    onChange={(e) => {
                      if (e.target.files) {
                        setFormData(prev => ({
                          ...prev,
                          documents: [...prev.documents, ...Array.from(e.target.files!)]
                        }))
                      }
                    }}
                    className="hidden"
                    id="documentUpload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-200 hover:border-gray-300"
                    onClick={() => document.getElementById('documentUpload')?.click()}
                  >
                    Choose Files
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - AI Processing Pipeline */}
          <div>
            <Card className="p-6 border-gray-100 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Processing Pipeline</h3>
              <p className="text-sm text-gray-600 mb-6">Our AI extracts and structures your data for expert review—fully HIPAA-compliant.</p>
              
              <div className="space-y-4">
                {processingSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      index < 4 ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {index < 4 ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Shield className="h-3 w-3 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{step}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button 
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Continue to Processing
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Case Details Form (Step 3) */}
        {currentStep >= 3 && (
          <Card className="p-6 border-gray-100 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Case Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Patient Name *
                  </Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                    placeholder="Enter patient name"
                    className="border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age" className="text-sm font-medium text-gray-700 mb-2 block">
                    Age *
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Enter age"
                    className="border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="diagnosis" className="text-sm font-medium text-gray-700 mb-2 block">
                  Primary Diagnosis *
                </Label>
                <Input
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Enter primary diagnosis"
                  className="border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                  required
                />
              </div>

              <div>
                <Label htmlFor="symptoms" className="text-sm font-medium text-gray-700 mb-2 block">
                  Current Symptoms
                </Label>
                <Textarea
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                  placeholder="Describe current symptoms..."
                  className="min-h-[100px] border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget" className="text-sm font-medium text-gray-700 mb-2 block">
                    Budget Range ($)
                  </Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="e.g., $500-1000"
                    className="border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="urgency" className="text-sm font-medium text-gray-700 mb-2 block">
                    Urgency Level
                  </Label>
                  <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine (1-2 weeks)</SelectItem>
                      <SelectItem value="standard">Standard (3-5 days)</SelectItem>
                      <SelectItem value="urgent">Urgent (24-48 hours)</SelectItem>
                      <SelectItem value="emergency">Emergency (Same day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  "Submit for Review"
                )}
              </Button>
            </form>
          </Card>
        )}
      </main>
    </div>
  )
} 
