"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Link2 } from "lucide-react"
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
    <div className="max-w-lg mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6 text-center">Second Opinion</h1>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full flex justify-between mb-6">
          <TabsTrigger value="upload" className="flex-1">1. Upload/Connect</TabsTrigger>
          <TabsTrigger value="case" className="flex-1">2. Case Details</TabsTrigger>
          <TabsTrigger value="responses" className="flex-1">3. Responses</TabsTrigger>
        </TabsList>
        {/* Step 1: Upload/Connect */}
        <TabsContent value="upload">
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center">
            {/* Upload Documents Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 border-blue-500 text-blue-700 font-semibold shadow-sm"><Upload className="h-5 w-5" /> Upload Documents</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Medical Documents</DialogTitle>
                  <DialogDescription>Attach files (PDF, images, etc.) for the provider to review.</DialogDescription>
                </DialogHeader>
                <label htmlFor="upload-documents" className="sr-only">Upload medical documents</label>
                <input id="upload-documents" type="file" multiple onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {uploadedFiles.length > 0 && (
                  <ul className="mt-3 text-sm text-gray-700">
                    {uploadedFiles.map((file, idx) => <li key={idx}>{file.name}</li>)}
                  </ul>
                )}
                <DialogClose asChild>
                  <Button className="mt-4 w-full" onClick={() => setTab("case")}>Done & Next</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
            {/* Connect EMR Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 border-blue-500 text-blue-700 font-semibold shadow-sm"><Link2 className="h-5 w-5" /> Connect EMR</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect Your EMR</DialogTitle>
                  <DialogDescription>Securely connect your electronic medical record for provider review. (Coming soon!)</DialogDescription>
                </DialogHeader>
                <div className="text-center text-gray-500 py-4">EMR integration coming soon. Please upload documents for now.</div>
                <DialogClose asChild>
                  <Button className="mt-4 w-full" onClick={() => { handleEMRConnect(); setTab("case") }}>Close & Next</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </div>
          {/* Privacy Note */}
          <div className="text-xs text-gray-500 mb-4 text-center">Your uploads and EMR data are private and securely shared only with your chosen provider.</div>
          <Button className="w-full" onClick={() => setTab("case")}>Skip & Next</Button>
        </TabsContent>
        {/* Step 2: Case Details */}
        <TabsContent value="case">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow-md">
              <div>
                <label className="block mb-1 font-medium">Case Description</label>
                <textarea name="description" required value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2 min-h-[100px]" placeholder="Describe your case or question" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Bounty (USD or Crypto)</label>
                <input name="bounty" type="number" min="0" required value={form.bounty} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter bounty amount" />
              </div>
              <Button type="submit" className="w-full">Post Case</Button>
            </form>
          ) : (
            <div className="bg-white p-6 rounded shadow-md text-center">
              <h2 className="text-xl font-semibold mb-4">Case Posted!</h2>
              <p className="mb-4">Your case is now live for providers to review and respond.</p>
              <Button className="w-full mt-4" onClick={() => setTab("responses")}>Go to Responses</Button>
            </div>
          )}
        </TabsContent>
        {/* Step 3: Provider Responses */}
        <TabsContent value="responses">
          <div className="bg-white p-6 rounded shadow-md text-center">
            <h2 className="text-xl font-semibold mb-4">Provider Responses</h2>
            <div className="text-muted-foreground mb-4">No responses yet. (Coming soon)</div>
            <Button className="w-full mt-4" onClick={() => setTab("case")}>Back to Case</Button>
          </div>
        </TabsContent>
      </Tabs>
      {/* Toasts */}
      {showUploadToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow z-50">Files uploaded!</div>
      )}
      {showEMRToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-800 px-4 py-2 rounded shadow z-50">EMR connection coming soon!</div>
      )}
    </div>
  )
} 