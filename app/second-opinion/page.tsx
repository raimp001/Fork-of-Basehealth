"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Upload, Link2, Users, Clock, Star, CheckCircle2, FileText, DollarSign, Brain, Heart, Stethoscope, MessageCircle, Award, Globe } from "lucide-react"
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

export default function SecondOpinionPage() {
  const [form, setForm] = useState({ description: '', bounty: '' })
  const [submitted, setSubmitted] = useState(false)
  const [showUploadToast, setShowUploadToast] = useState(false)
  const [showEMRToast, setShowEMRToast] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [tab, setTab] = useState("upload")

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
    }
  }

  const handleEMRConnect = () => {
    setShowEMRToast(true)
    setTimeout(() => setShowEMRToast(false), 2500)
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
                  Expert Medical Consultation
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Get a Second Opinion
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Connect with world-class specialists for expert medical opinions. Share your case securely and receive professional insights from verified healthcare providers.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Expert Network</h3>
                <p className="text-sm text-gray-600">Access to board-certified specialists worldwide</p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
                <p className="text-sm text-gray-600">HIPAA-compliant document sharing and consultation</p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Fast Response</h3>
                <p className="text-sm text-gray-600">Receive expert opinions within 24-48 hours</p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Fair Pricing</h3>
                <p className="text-sm text-gray-600">Set your own consultation fee with crypto payments</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/30 shadow-xl">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Share Your Case</h2>
                  </div>
                  <p className="text-gray-600">
                    Follow these simple steps to get expert medical opinions from qualified specialists.
                  </p>
                </div>

                <Tabs value={tab} onValueChange={setTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-3 mb-8 bg-gray-100 rounded-xl p-1">
                    <TabsTrigger value="upload" className="rounded-lg font-medium">
                      <FileText className="h-4 w-4 mr-2" />
                      Upload
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

                  {/* Upload Tab */}
                  <TabsContent value="upload" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                        <div className="text-center">
                          <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
                          <p className="text-sm text-gray-600 mb-4">Share lab results and medical records</p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="w-full">Choose Files</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Upload Medical Documents</DialogTitle>
                                <DialogDescription>Attach files for provider review</DialogDescription>
                              </DialogHeader>
                              <label htmlFor="upload-documents" className="sr-only">Upload medical documents</label>
                              <input 
                                id="upload-documents"
                                type="file" 
                                multiple 
                                onChange={handleFileUpload} 
                                className="w-full"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                title="Upload medical documents"
                              />
                              {uploadedFiles.length > 0 && (
                                <div className="mt-2">
                                  {uploadedFiles.map((file, idx) => (
                                    <p key={idx} className="text-sm">{file.name}</p>
                                  ))}
                                </div>
                              )}
                              <DialogClose asChild>
                                <Button className="w-full" onClick={() => setTab("case")}>Continue</Button>
                              </DialogClose>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
                        <div className="text-center">
                          <Link2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Connect EMR</h3>
                          <p className="text-sm text-gray-600 mb-4">Link your medical records</p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full">Connect EMR</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Connect EMR</DialogTitle>
                                <DialogDescription>Coming soon!</DialogDescription>
                              </DialogHeader>
                              <p className="text-center text-gray-500 py-4">EMR integration coming soon.</p>
                              <DialogClose asChild>
                                <Button onClick={() => { handleEMRConnect(); setTab("case") }}>Close</Button>
                              </DialogClose>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-amber-800">HIPAA-compliant and secure</span>
                      </div>
                    </div>
                    
                    <Button className="w-full" onClick={() => setTab("case")}>Continue</Button>
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
                            placeholder="Describe your condition..." 
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
                            placeholder="Enter fee" 
                          />
                        </div>
                        <Button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-amber-600">
                          Post Case
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center py-12">
                        <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-4">Case Posted!</h3>
                        <p className="mb-6">Your case is live for specialists to review.</p>
                        <Button onClick={() => setTab("responses")}>View Responses</Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* Responses Tab */}
                  <TabsContent value="responses">
                    <div className="text-center py-12">
                      <MessageCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-4">Expert Responses</h3>
                      <p className="mb-6">No responses yet. Check back in 24-48 hours.</p>
                      <Button variant="outline" onClick={() => setTab("case")}>Back to Case</Button>
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

      {/* Toasts */}
      {showUploadToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow z-50">
          Files uploaded!
        </div>
      )}
      {showEMRToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-800 px-4 py-2 rounded shadow z-50">
          EMR coming soon!
        </div>
      )}
    </div>
  )
} 