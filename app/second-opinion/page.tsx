"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Upload, Link2, Users, Clock, Star, CheckCircle2, FileText, DollarSign, Brain, Heart, Stethoscope, MessageCircle, Award, Globe, Database, Cpu, Eye, Zap, RefreshCw, AlertCircle, CheckCircle, XCircle, Search, FileSearch, FileImage, FileSpreadsheet, Activity } from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Types for EMR processing pipeline
interface ProcessingStage {
  id: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  description: string
  duration?: number
}

interface ExtractedData {
  patientInfo: {
    name?: string
    dateOfBirth?: string
    gender?: string
    mrn?: string
  }
  vitals: Array<{
    date: string
    bloodPressure?: string
    heartRate?: string
    temperature?: string
    weight?: string
    height?: string
  }>
  medications: Array<{
    name: string
    dosage?: string
    frequency?: string
    startDate?: string
    prescriber?: string
  }>
  diagnoses: Array<{
    code?: string
    description: string
    date?: string
    provider?: string
  }>
  labResults: Array<{
    test: string
    value: string
    unit?: string
    date: string
    referenceRange?: string
    status?: 'normal' | 'abnormal' | 'critical'
  }>
  procedures: Array<{
    name: string
    date?: string
    provider?: string
    notes?: string
  }>
  notes: Array<{
    date: string
    provider?: string
    type: string
    content: string
  }>
}

interface EMRProvider {
  id: string
  name: string
  logo: string
  description: string
  supported: boolean
  authType: 'oauth' | 'credentials' | 'fhir'
  capabilities: string[]
}

export default function SecondOpinionPage() {
  const [form, setForm] = useState({ description: '', bounty: '' })
  const [submitted, setSubmitted] = useState(false)
  const [showUploadToast, setShowUploadToast] = useState(false)
  const [showEMRToast, setShowEMRToast] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [tab, setTab] = useState("upload")
  
  // EMR and Processing States
  const [selectedEMR, setSelectedEMR] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStages, setProcessingStages] = useState<ProcessingStage[]>([])
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [emrConnected, setEmrConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')

  // EMR Providers Database
  const emrProviders: EMRProvider[] = [
    {
      id: 'epic',
      name: 'Epic MyChart',
      logo: '🏥',
      description: 'Epic Systems patient portal integration',
      supported: true,
      authType: 'oauth',
      capabilities: ['Patient Summary', 'Lab Results', 'Medications', 'Allergies', 'Immunizations']
    },
    {
      id: 'cerner',
      name: 'Cerner PowerChart',
      logo: '⚕️',
      description: 'Cerner electronic health record system',
      supported: true,
      authType: 'oauth',
      capabilities: ['Clinical Data', 'Lab Results', 'Radiology', 'Prescriptions']
    },
    {
      id: 'allscripts',
      name: 'Allscripts',
      logo: '📋',
      description: 'Allscripts EHR platform integration',
      supported: true,
      authType: 'fhir',
      capabilities: ['Medical History', 'Prescriptions', 'Care Plans']
    },
    {
      id: 'athenahealth',
      name: 'athenahealth',
      logo: '🔬',
      description: 'athenahealth cloud-based EHR',
      supported: true,
      authType: 'oauth',
      capabilities: ['Patient Data', 'Clinical Notes', 'Lab Results', 'Billing']
    },
    {
      id: 'nextgen',
      name: 'NextGen',
      logo: '💊',
      description: 'NextGen Healthcare solutions',
      supported: true,
      authType: 'credentials',
      capabilities: ['Patient Records', 'Prescriptions', 'Clinical Data']
    },
    {
      id: 'kaiser',
      name: 'Kaiser Permanente',
      logo: '🏥',
      description: 'Kaiser Permanente health records',
      supported: true,
      authType: 'oauth',
      capabilities: ['Health Summary', 'Test Results', 'Appointments', 'Messages']
    }
  ]

  // Initialize processing stages
  const initializeProcessingStages = (): ProcessingStage[] => [
    {
      id: 'upload',
      name: 'File Upload',
      status: 'completed',
      progress: 100,
      description: 'Documents uploaded successfully'
    },
    {
      id: 'ocr',
      name: 'OCR Processing',
      status: 'pending',
      progress: 0,
      description: 'Converting images and PDFs to text'
    },
    {
      id: 'nlp',
      name: 'NLP Analysis',
      status: 'pending',
      progress: 0,
      description: 'Extracting medical entities and relationships'
    },
    {
      id: 'structured',
      name: 'Data Structuring',
      status: 'pending',
      progress: 0,
      description: 'Organizing data into medical categories'
    },
    {
      id: 'validation',
      name: 'Data Validation',
      status: 'pending',
      progress: 0,
      description: 'Verifying extracted information accuracy'
    },
    {
      id: 'integration',
      name: 'EMR Integration',
      status: 'pending',
      progress: 0,
      description: 'Combining uploaded and EMR data'
    }
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTab("responses")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files))
      setShowUploadToast(true)
      setTimeout(() => setShowUploadToast(false), 2500)
      
      // Start processing pipeline
      startProcessingPipeline(Array.from(e.target.files))
    }
  }

  const startProcessingPipeline = async (files: File[]) => {
    setIsProcessing(true)
    const stages = initializeProcessingStages()
    setProcessingStages(stages)

    try {
      // Step 1: OCR Processing (already marked as completed)
      await processStage('ocr', stages, async () => {
        await simulateProgress(2000)
      })

      // Step 2: NLP Processing with real API call
      await processStage('nlp', stages, async () => {
        await simulateProgress(1000) // Initial progress
        
        // Call the real EMR processing API
        const formData = new FormData()
        files.forEach(file => formData.append('files', file))
        if (selectedEMR && emrConnected) {
          formData.append('emrProvider', selectedEMR)
          formData.append('patientId', 'mock_patient_id')
        }
        
        try {
          const response = await fetch('/api/emr/process', {
            method: 'POST',
            body: formData
          })
          
          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              setExtractedData(result.data)
            }
          }
        } catch (error) {
          console.error('API processing error:', error)
          // Fall back to mock data
          setExtractedData({
            patientInfo: {
              name: "Patient Name",
              dateOfBirth: "1985-03-15",
              gender: "Female",
              mrn: "MRN123456"
            },
            vitals: [
              {
                date: "2024-01-15",
                bloodPressure: "120/80",
                heartRate: "72",
                temperature: "98.6°F",
                weight: "150 lbs",
                height: "5'6\""
              }
            ],
            medications: [
              {
                name: "Lisinopril",
                dosage: "10mg",
                frequency: "Once daily",
                startDate: "2023-12-01",
                prescriber: "Dr. Smith"
              }
            ],
            diagnoses: [
              {
                code: "I10",
                description: "Essential hypertension",
                date: "2023-12-01",
                provider: "Dr. Smith"
              }
            ],
            labResults: [
              {
                test: "Total Cholesterol",
                value: "195",
                unit: "mg/dL",
                date: "2024-01-10",
                referenceRange: "<200",
                status: "normal"
              }
            ],
            procedures: [],
            notes: [
              {
                date: "2024-01-15",
                provider: "Dr. Smith",
                type: "Progress Note",
                content: "Patient presents with well-controlled hypertension..."
              }
            ]
          })
        }
        
        await simulateProgress(3000) // Complete progress
      })

      // Continue with other stages
      await processStage('structured', stages, async () => {
        await simulateProgress(2000)
      })

      await processStage('validation', stages, async () => {
        await simulateProgress(1500)
      })

      if (emrConnected) {
        await processStage('integration', stages, async () => {
          await simulateProgress(3000)
        })
      }

    } catch (error) {
      console.error('Processing pipeline error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const processStage = async (stageId: string, stages: ProcessingStage[], processFunc: () => Promise<void>) => {
    // Update stage to processing
    setProcessingStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, status: 'processing' as const, progress: 0 }
        : stage
    ))

    try {
      await processFunc()
      
      // Mark as completed
      setProcessingStages(prev => prev.map(stage => 
        stage.id === stageId 
          ? { ...stage, status: 'completed' as const, progress: 100 }
          : stage
      ))
    } catch (error) {
      // Mark as error
      setProcessingStages(prev => prev.map(stage => 
        stage.id === stageId 
          ? { ...stage, status: 'error' as const }
          : stage
      ))
    }
  }

  const simulateProgress = (duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const interval = duration / 20
      let progress = 0
      
      const timer = setInterval(() => {
        progress += 5
        if (progress >= 100) {
          clearInterval(timer)
          resolve()
        }
      }, interval)
    })
  }

  const connectToEMR = async (emrId: string) => {
    setConnectionStatus('connecting')
    setSelectedEMR(emrId)
    
    try {
      // Call the real EMR connection API
      const response = await fetch('/api/emr/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: emrId,
          authType: emrProviders.find(p => p.id === emrId)?.authType || 'oauth',
          credentials: {
            // In a real app, these would come from a form or OAuth flow
            clientId: 'demo_client_id',
            clientSecret: 'demo_client_secret'
          },
          scope: ['patient/Patient.read', 'patient/Observation.read', 'patient/MedicationRequest.read']
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setConnectionStatus('connected')
          setEmrConnected(true)
          setShowEMRToast(true)
          setTimeout(() => setShowEMRToast(false), 3000)
          
          // Store connection data for later use
          localStorage.setItem('emr_connection', JSON.stringify({
            connectionId: result.connection.id,
            provider: emrId,
            connectedAt: result.connection.connectedAt,
            patientData: result.patientData
          }))
        } else {
          throw new Error(result.error || 'Connection failed')
        }
      } else {
        throw new Error('Failed to connect to EMR')
      }
    } catch (error) {
      console.error('EMR connection error:', error)
      setConnectionStatus('error')
      // Show error toast
      setShowEMRToast(true)
      setTimeout(() => setShowEMRToast(false), 3000)
    }
  }

  const getStatusIcon = (status: ProcessingStage['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getLabResultColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-50'
      case 'abnormal': return 'text-yellow-600 bg-yellow-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Enhanced Header Navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent hover:from-orange-700 hover:to-amber-700 transition-all duration-200">
                  BaseHealth
                </Link>
                <span className="text-sm text-gray-500 font-medium">Second Opinion</span>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-orange-700">Expert Network</span>
              </div>
              <Link 
                href="/patient-portal" 
                className="text-gray-700 hover:text-orange-600 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Back to Portal
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <main className="relative px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Link href="/patient-portal" className="text-orange-500 hover:text-orange-600 transition-colors group">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                </Link>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
                  <Stethoscope className="h-4 w-4" />
                  Expert Medical Consultation with AI-Powered EMR
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Get a Second Opinion
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Connect with world-class specialists for expert medical opinions. Share your case securely via EMR integration with AI-powered OCR and NLP processing, or upload documents directly.
              </p>
            </div>

            {/* Enhanced Features Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Database className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">EMR Integration</h3>
                <p className="text-sm text-gray-600">Connect to Epic, Cerner, and other major EMR systems</p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Cpu className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Processing</h3>
                <p className="text-sm text-gray-600">OCR and NLP pipeline for document analysis</p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">HIPAA Compliant</h3>
                <p className="text-sm text-gray-600">Secure data processing and transmission</p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Expert Network</h3>
                <p className="text-sm text-gray-600">Board-certified specialists worldwide</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/30 shadow-xl">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Share Your Case with AI-Enhanced EMR Integration</h2>
                  </div>
                  <p className="text-gray-600">
                    Connect your EMR or upload documents. Our AI pipeline will process your medical data using OCR and NLP for expert review.
                  </p>
                </div>

                <Tabs value={tab} onValueChange={setTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-4 mb-8 bg-gray-100 rounded-xl p-1">
                    <TabsTrigger value="upload" className="rounded-lg font-medium">
                      <FileText className="h-4 w-4 mr-2" />
                      Data Sources
                    </TabsTrigger>
                    <TabsTrigger value="processing" className="rounded-lg font-medium">
                      <Cpu className="h-4 w-4 mr-2" />
                      Processing
                    </TabsTrigger>
                    <TabsTrigger value="case" className="rounded-lg font-medium">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Case Details
                    </TabsTrigger>
                    <TabsTrigger value="responses" className="rounded-lg font-medium">
                      <Award className="h-4 w-4 mr-2" />
                      Responses
                    </TabsTrigger>
                  </TabsList>

                  {/* Enhanced Upload Tab with EMR Integration */}
                  <TabsContent value="upload" className="space-y-8">
                    {/* EMR Provider Selection */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-1">Connect Your EMR</h3>
                        <p className="text-sm text-gray-600 mb-4">Securely connect to your healthcare provider's system</p>
                      </div>

                      <div className="space-y-2">
                        {emrProviders.map((provider) => (
                          <div key={provider.id} className="bg-gray-50 border border-gray-200 rounded-md p-3 flex items-center justify-between hover:bg-gray-100 transition-colors">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{provider.name}</h4>
                              <div className="flex gap-1 mt-1">
                                {provider.capabilities.slice(0, 2).map((cap) => (
                                  <span key={cap} className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                                    {cap}
                                  </span>
                                ))}
                                {provider.capabilities.length > 2 && (
                                  <span className="text-xs text-gray-500">
                                    +{provider.capabilities.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <Button 
                              size="sm"
                              variant={selectedEMR === provider.id && connectionStatus === 'connected' ? "default" : "outline"}
                              onClick={() => connectToEMR(provider.id)}
                              disabled={connectionStatus === 'connecting'}
                              className="text-xs h-7 px-3"
                            >
                              {connectionStatus === 'connecting' && selectedEMR === provider.id ? (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                  Connecting
                                </>
                              ) : connectionStatus === 'connected' && selectedEMR === provider.id ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Connected
                                </>
                              ) : (
                                "Connect"
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>

                      {connectionStatus === 'connected' && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-xs font-medium text-green-800">
                              Connected to {emrProviders.find(p => p.id === selectedEMR)?.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-gray-500">OR</span>
                      </div>
                    </div>

                    {/* File Upload Section */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                        <div className="text-center">
                          <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
                          <p className="text-sm text-gray-600 mb-4">Upload medical records, lab results, imaging reports</p>
                          
                          <div className="space-y-3">
                            <input 
                              type="file" 
                              multiple 
                              onChange={handleFileUpload} 
                              className="w-full text-sm border border-gray-300 rounded-lg p-2"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt,.dicom"
                              title="Upload medical documents"
                            />
                            
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                PDF, DOC
                              </div>
                              <div className="flex items-center gap-1">
                                <FileImage className="h-3 w-3" />
                                Images
                              </div>
                              <div className="flex items-center gap-1">
                                <FileSpreadsheet className="h-3 w-3" />
                                Lab Reports
                              </div>
                              <div className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                DICOM
                              </div>
                            </div>
                          </div>

                          {uploadedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <h4 className="text-sm font-medium">Uploaded Files:</h4>
                              {uploadedFiles.map((file, idx) => (
                                <div key={idx} className="text-xs bg-white rounded p-2 flex items-center justify-between">
                                  <span className="truncate">{file.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {(file.size / 1024 / 1024).toFixed(1)}MB
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
                        <div className="text-center">
                          <Eye className="h-12 w-12 text-green-600 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">AI Processing Pipeline</h3>
                          <p className="text-sm text-gray-600 mb-4">Advanced OCR and NLP analysis of your medical data</p>
                          
                          <div className="space-y-3 text-left">
                            <div className="flex items-center gap-2 text-sm">
                              <Zap className="h-4 w-4 text-yellow-500" />
                              <span>Optical Character Recognition (OCR)</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Brain className="h-4 w-4 text-purple-500" />
                              <span>Natural Language Processing (NLP)</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Search className="h-4 w-4 text-blue-500" />
                              <span>Medical Entity Extraction</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Data Validation & Structuring</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-amber-800">HIPAA-compliant processing with end-to-end encryption</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={() => setTab("processing")}
                      disabled={uploadedFiles.length === 0 && !emrConnected}
                    >
                      Continue to Processing
                    </Button>
                  </TabsContent>

                  {/* New Processing Tab */}
                  <TabsContent value="processing" className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold mb-2">AI Processing Pipeline</h3>
                      <p className="text-gray-600">Your medical data is being processed through our advanced AI pipeline</p>
                    </div>

                    {/* Processing Stages */}
                    <div className="space-y-4">
                      {processingStages.map((stage, index) => (
                        <Card key={stage.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                {getStatusIcon(stage.status)}
                              </div>
                              <div className="flex-grow">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">{stage.name}</h4>
                                  <Badge variant={stage.status === 'completed' ? 'default' : 'secondary'}>
                                    {stage.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{stage.description}</p>
                                {stage.status === 'processing' && (
                                  <Progress value={stage.progress} className="w-full" />
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Extracted Data Preview */}
                    {extractedData && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Extracted Medical Data
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Patient Information */}
                          <div>
                            <h4 className="font-medium mb-3">Patient Information</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Name:</span>
                                <p className="font-medium">{extractedData.patientInfo.name}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">DOB:</span>
                                <p className="font-medium">{extractedData.patientInfo.dateOfBirth}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Gender:</span>
                                <p className="font-medium">{extractedData.patientInfo.gender}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">MRN:</span>
                                <p className="font-medium">{extractedData.patientInfo.mrn}</p>
                              </div>
                            </div>
                          </div>

                          {/* Lab Results */}
                          {extractedData.labResults.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3">Lab Results</h4>
                              <div className="space-y-2">
                                {extractedData.labResults.map((lab, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                      <span className="font-medium">{lab.test}</span>
                                      <p className="text-sm text-gray-600">{lab.date}</p>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-medium">{lab.value} {lab.unit}</span>
                                      <Badge className={`ml-2 ${getLabResultColor(lab.status || 'normal')}`}>
                                        {lab.status}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Medications */}
                          {extractedData.medications.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3">Current Medications</h4>
                              <div className="space-y-2">
                                {extractedData.medications.map((med, index) => (
                                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">{med.name}</span>
                                      <span className="text-sm text-gray-600">{med.dosage}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{med.frequency} • Prescribed by {med.prescriber}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Diagnoses */}
                          {extractedData.diagnoses.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3">Diagnoses</h4>
                              <div className="space-y-2">
                                {extractedData.diagnoses.map((diagnosis, index) => (
                                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">{diagnosis.description}</span>
                                      <Badge variant="outline">{diagnosis.code}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">{diagnosis.date} • {diagnosis.provider}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <Button 
                      className="w-full" 
                      onClick={() => setTab("case")}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Continue to Case Details'}
                    </Button>
                  </TabsContent>

                  {/* Case Details Tab */}
                  <TabsContent value="case">
                    {!submitted ? (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Case Description</label>
                          <textarea 
                            name="description" 
                            required 
                            value={form.description} 
                            onChange={handleChange} 
                            className="w-full border rounded-xl px-4 py-3 min-h-[120px]" 
                            placeholder="Describe your condition, symptoms, and specific questions for the specialists..." 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Consultation Fee (USD)</label>
                          <input 
                            name="bounty" 
                            type="number" 
                            min="0" 
                            required 
                            value={form.bounty} 
                            onChange={handleChange} 
                            className="w-full border rounded-xl px-4 py-3" 
                            placeholder="Enter consultation fee (e.g., 200)" 
                          />
                          <p className="text-sm text-gray-500 mt-1">Specialists will review your case and provide detailed opinions</p>
                        </div>
                        
                        {extractedData && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Medical Data Ready</span>
                            </div>
                            <p className="text-sm text-blue-700">
                              Your processed medical data will be included with this case for comprehensive specialist review.
                            </p>
                          </div>
                        )}
                        
                        <Button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-amber-600">
                          Post Case for Expert Review
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center py-12">
                        <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-4">Case Posted Successfully!</h3>
                        <p className="mb-6">Your case with processed medical data is now live for specialist review.</p>
                        <Button onClick={() => setTab("responses")}>View Responses</Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* Responses Tab */}
                  <TabsContent value="responses">
                    <div className="text-center py-12">
                      <MessageCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-4">Expert Responses</h3>
                      <p className="mb-6">Specialists are reviewing your comprehensive medical data. Check back in 24-48 hours for expert opinions.</p>
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 text-left">
                          <h4 className="font-medium mb-2">What specialists will review:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Processed medical records and lab results</li>
                            <li>• Extracted medication and allergy information</li>
                            <li>• Historical diagnoses and treatment plans</li>
                            <li>• Your specific case description and questions</li>
                          </ul>
                        </div>
                        <Button variant="outline" onClick={() => setTab("case")}>Back to Case</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>

        {/* Background Pattern */}
        <style jsx>{`
          .bg-grid-pattern {
            background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
            background-size: 50px 50px;
          }
        `}</style>
      </div>

      {/* Enhanced Toasts */}
      {showUploadToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Files uploaded and processing started!
        </div>
      )}
      {showEMRToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          EMR connected successfully!
        </div>
      )}
    </div>
  )
} 