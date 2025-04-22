"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Appointment, Patient, Provider } from "@/types/user"
import { PhoneOff, Mic, MicOff, Video, VideoOff, FileText, Clipboard, Send } from "lucide-react"

interface VideoConsultationProps {
  appointment: Appointment
  patient: Patient
  provider: Provider
}

export function VideoConsultation({ appointment, patient, provider }: VideoConsultationProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [chatMessages, setChatMessages] = useState<{ sender: string; message: string; time: string }[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [notes, setNotes] = useState("")
  const [diagnosis, setDiagnosis] = useState<string[]>([])
  const [diagnosisInput, setDiagnosisInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Prescription state
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false)
  const [prescriptionData, setPrescriptionData] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    refillsAllowed: "0",
    pharmacyName: "",
    pharmacyAddress: "",
  })

  // Lab order state
  const [showLabOrderDialog, setShowLabOrderDialog] = useState(false)
  const [labOrderData, setLabOrderData] = useState({
    testName: "",
    testCode: "",
    instructions: "",
    labFacilityName: "",
    labFacilityAddress: "",
  })

  // Imaging order state
  const [showImagingOrderDialog, setShowImagingOrderDialog] = useState(false)
  const [imagingOrderData, setImagingOrderData] = useState({
    imagingType: "",
    bodyPart: "",
    instructions: "",
    imagingFacilityName: "",
    imagingFacilityAddress: "",
  })

  // Referral state
  const [showReferralDialog, setShowReferralDialog] = useState(false)
  const [referralData, setReferralData] = useState({
    referredToProviderId: "",
    reason: "",
    notes: "",
  })
  const [availableProviders, setAvailableProviders] = useState<Provider[]>([])

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  // Simulate connection to video call
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true)

      // Add a welcome message
      addChatMessage("System", "Connected to consultation. You can now communicate with each other.")
      addChatMessage("Provider", `Hello ${patient.name}, how are you feeling today?`)
    }, 2000)

    return () => clearTimeout(timer)
  }, [patient.name])

  // Fetch available providers for referrals
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch("/api/providers")
        if (!response.ok) throw new Error("Failed to fetch providers")

        const data = await response.json()
        setAvailableProviders(data.providers.filter((p: Provider) => p.id !== provider.id))
      } catch (err) {
        console.error("Error fetching providers:", err)
      }
    }

    fetchProviders()
  }, [provider.id])

  const addChatMessage = (sender: string, message: string) => {
    const now = new Date()
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    setChatMessages((prev) => [...prev, { sender, message, time }])
  }

  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    addChatMessage("You", messageInput)
    setMessageInput("")

    // Simulate provider response
    setTimeout(() => {
      addChatMessage("Provider", "I understand. Let me make a note of that.")
    }, 2000)
  }

  const handleAddDiagnosis = () => {
    if (!diagnosisInput.trim()) return

    setDiagnosis((prev) => [...prev, diagnosisInput])
    setDiagnosisInput("")
  }

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  const handleToggleVideo = () => {
    setIsVideoEnabled((prev) => !prev)
  }

  const handleEndCall = () => {
    setIsConnected(false)
    // In a real app, we would disconnect from the video call here
  }

  const handleCreatePrescription = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/medical/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: patient.id,
          providerId: provider.id,
          appointmentId: appointment.id,
          medication: prescriptionData.medication,
          dosage: prescriptionData.dosage,
          frequency: prescriptionData.frequency,
          duration: prescriptionData.duration,
          instructions: prescriptionData.instructions,
          issuedDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          status: "active",
          refillsAllowed: Number.parseInt(prescriptionData.refillsAllowed),
          refillsRemaining: Number.parseInt(prescriptionData.refillsAllowed),
          pharmacyName: prescriptionData.pharmacyName,
          pharmacyAddress: prescriptionData.pharmacyAddress,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create prescription")
      }

      // Reset form and close dialog
      setPrescriptionData({
        medication: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        refillsAllowed: "0",
        pharmacyName: "",
        pharmacyAddress: "",
      })
      setShowPrescriptionDialog(false)

      // Add a message to the chat
      addChatMessage("System", "Prescription has been created and sent to the pharmacy.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateLabOrder = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/medical/lab-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: patient.id,
          providerId: provider.id,
          appointmentId: appointment.id,
          testName: labOrderData.testName,
          testCode: labOrderData.testCode,
          instructions: labOrderData.instructions,
          issuedDate: new Date().toISOString(),
          status: "ordered",
          labFacilityName: labOrderData.labFacilityName,
          labFacilityAddress: labOrderData.labFacilityAddress,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create lab order")
      }

      // Reset form and close dialog
      setLabOrderData({
        testName: "",
        testCode: "",
        instructions: "",
        labFacilityName: "",
        labFacilityAddress: "",
      })
      setShowLabOrderDialog(false)

      // Add a message to the chat
      addChatMessage("System", "Lab order has been created and sent to the lab facility.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateImagingOrder = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/medical/imaging-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: patient.id,
          providerId: provider.id,
          appointmentId: appointment.id,
          imagingType: imagingOrderData.imagingType,
          bodyPart: imagingOrderData.bodyPart,
          instructions: imagingOrderData.instructions,
          issuedDate: new Date().toISOString(),
          status: "ordered",
          imagingFacilityName: imagingOrderData.imagingFacilityName,
          imagingFacilityAddress: imagingOrderData.imagingFacilityAddress,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create imaging order")
      }

      // Reset form and close dialog
      setImagingOrderData({
        imagingType: "",
        bodyPart: "",
        instructions: "",
        imagingFacilityName: "",
        imagingFacilityAddress: "",
      })
      setShowImagingOrderDialog(false)

      // Add a message to the chat
      addChatMessage("System", "Imaging order has been created and sent to the imaging facility.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateReferral = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/medical/referrals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: patient.id,
          referringProviderId: provider.id,
          referredToProviderId: referralData.referredToProviderId,
          appointmentId: appointment.id,
          reason: referralData.reason,
          notes: referralData.notes,
          status: "pending",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create referral")
      }

      // Reset form and close dialog
      setReferralData({
        referredToProviderId: "",
        reason: "",
        notes: "",
      })
      setShowReferralDialog(false)

      // Add a message to the chat
      addChatMessage("System", "Referral has been created and sent to the specialist.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndConsultation = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Update appointment status
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "completed",
          notes,
          diagnosis,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to end consultation")
      }

      // Redirect to payment page
      window.location.href = `/payment?appointmentId=${appointment.id}`
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      <div className="lg:col-span-2 space-y-4">
        <Card className="h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle>Video Consultation</CardTitle>
            <CardDescription>
              {isConnected ? "Connected with " : "Connecting to "}
              {provider.role === "provider" ? patient.name : provider.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center bg-muted rounded-md relative">
            {!isConnected && (
              <div className="animate-pulse text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Establishing secure connection...</p>
              </div>
            )}

            {isConnected && (
              <>
                <div className="w-full h-full relative">
                  <video ref={remoteVideoRef} className="w-full h-full object-cover rounded-md" autoPlay playsInline />

                  <div className="absolute bottom-4 right-4 w-32 h-24 bg-background rounded-md overflow-hidden border">
                    <video
                      ref={localVideoRef}
                      className={`w-full h-full object-cover ${!isVideoEnabled ? "hidden" : ""}`}
                      autoPlay
                      playsInline
                      muted
                    />
                    {!isVideoEnabled && (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <p className="text-xs text-muted-foreground">Video off</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleMute}
              className={isMuted ? "bg-red-100 text-red-500" : ""}
            >
              {isMuted ? <MicOff /> : <Mic />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleVideo}
              className={!isVideoEnabled ? "bg-red-100 text-red-500" : ""}
            >
              {isVideoEnabled ? <Video /> : <VideoOff />}
            </Button>
            <Button variant="destructive" size="icon" onClick={handleEndCall}>
              <PhoneOff />
            </Button>
          </CardFooter>
        </Card>

        {provider.role === "provider" && (
          <Card>
            <CardHeader>
              <CardTitle>Provider Actions</CardTitle>
              <CardDescription>Create prescriptions, lab orders, and referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button onClick={() => setShowPrescriptionDialog(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Prescription
                </Button>
                <Button onClick={() => setShowLabOrderDialog(true)}>
                  <Clipboard className="mr-2 h-4 w-4" />
                  Lab Order
                </Button>
                <Button onClick={() => setShowImagingOrderDialog(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Imaging
                </Button>
                <Button onClick={() => setShowReferralDialog(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Referral
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <Card className="h-[300px] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4 pb-0">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender === "You"
                      ? "bg-primary text-primary-foreground"
                      : msg.sender === "System"
                        ? "bg-muted italic"
                        : "bg-muted"
                  }`}
                >
                  {msg.sender !== "You" && msg.sender !== "System" && (
                    <p className="text-xs font-medium mb-1">{msg.sender}</p>
                  )}
                  <p>{msg.message}</p>
                  <p className="text-xs opacity-70 text-right mt-1">{msg.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="pt-2">
            <div className="flex w-full space-x-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>

        {provider.role === "provider" && (
          <Card>
            <CardHeader>
              <CardTitle>Consultation Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter consultation notes..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <div className="flex space-x-2">
                  <Input
                    id="diagnosis"
                    value={diagnosisInput}
                    onChange={(e) => setDiagnosisInput(e.target.value)}
                    placeholder="Enter diagnosis..."
                  />
                  <Button onClick={handleAddDiagnosis} type="button">
                    Add
                  </Button>
                </div>
                {diagnosis.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {diagnosis.map((item, index) => (
                      <div key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleEndConsultation} disabled={isLoading} className="w-full">
                {isLoading ? "Processing..." : "End Consultation & Process Payment"}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Prescription Dialog */}
      <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Prescription</DialogTitle>
            <DialogDescription>Enter prescription details for {patient.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medication">Medication</Label>
                <Input
                  id="medication"
                  value={prescriptionData.medication}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, medication: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={prescriptionData.dosage}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, dosage: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  value={prescriptionData.frequency}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, frequency: e.target.value })}
                  placeholder="e.g., Twice daily"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={prescriptionData.duration}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, duration: e.target.value })}
                  placeholder="e.g., 10 days"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={prescriptionData.instructions}
                onChange={(e) => setPrescriptionData({ ...prescriptionData, instructions: e.target.value })}
                placeholder="e.g., Take with food"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refills">Refills Allowed</Label>
              <Select
                value={prescriptionData.refillsAllowed}
                onValueChange={(value) => setPrescriptionData({ ...prescriptionData, refillsAllowed: value })}
              >
                <SelectTrigger id="refills">
                  <SelectValue placeholder="Select refills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pharmacyName">Pharmacy Name</Label>
              <Input
                id="pharmacyName"
                value={prescriptionData.pharmacyName}
                onChange={(e) => setPrescriptionData({ ...prescriptionData, pharmacyName: e.target.value })}
                placeholder="e.g., CVS Pharmacy"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pharmacyAddress">Pharmacy Address</Label>
              <Input
                id="pharmacyAddress"
                value={prescriptionData.pharmacyAddress}
                onChange={(e) => setPrescriptionData({ ...prescriptionData, pharmacyAddress: e.target.value })}
                placeholder="e.g., 123 Main St, City, State"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrescriptionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePrescription} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Prescription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lab Order Dialog */}
      <Dialog open={showLabOrderDialog} onOpenChange={setShowLabOrderDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Lab Order</DialogTitle>
            <DialogDescription>Enter lab test details for {patient.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testName">Test Name</Label>
                <Input
                  id="testName"
                  value={labOrderData.testName}
                  onChange={(e) => setLabOrderData({ ...labOrderData, testName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="testCode">Test Code</Label>
                <Input
                  id="testCode"
                  value={labOrderData.testCode}
                  onChange={(e) => setLabOrderData({ ...labOrderData, testCode: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="labInstructions">Instructions</Label>
              <Textarea
                id="labInstructions"
                value={labOrderData.instructions}
                onChange={(e) => setLabOrderData({ ...labOrderData, instructions: e.target.value })}
                placeholder="e.g., Fasting required"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="labFacilityName">Lab Facility Name</Label>
              <Input
                id="labFacilityName"
                value={labOrderData.labFacilityName}
                onChange={(e) => setLabOrderData({ ...labOrderData, labFacilityName: e.target.value })}
                placeholder="e.g., Quest Diagnostics"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="labFacilityAddress">Lab Facility Address</Label>
              <Input
                id="labFacilityAddress"
                value={labOrderData.labFacilityAddress}
                onChange={(e) => setLabOrderData({ ...labOrderData, labFacilityAddress: e.target.value })}
                placeholder="e.g., 123 Main St, City, State"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLabOrderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLabOrder} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Lab Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Imaging Order Dialog */}
      <Dialog open={showImagingOrderDialog} onOpenChange={setShowImagingOrderDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Imaging Order</DialogTitle>
            <DialogDescription>Enter imaging details for {patient.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imagingType">Imaging Type</Label>
                <Select
                  value={imagingOrderData.imagingType}
                  onValueChange={(value) => setImagingOrderData({ ...imagingOrderData, imagingType: value })}
                >
                  <SelectTrigger id="imagingType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="X-Ray">X-Ray</SelectItem>
                    <SelectItem value="MRI">MRI</SelectItem>
                    <SelectItem value="CT Scan">CT Scan</SelectItem>
                    <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                    <SelectItem value="Mammogram">Mammogram</SelectItem>
                    <SelectItem value="PET Scan">PET Scan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bodyPart">Body Part</Label>
                <Input
                  id="bodyPart"
                  value={imagingOrderData.bodyPart}
                  onChange={(e) => setImagingOrderData({ ...imagingOrderData, bodyPart: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagingInstructions">Instructions</Label>
              <Textarea
                id="imagingInstructions"
                value={imagingOrderData.instructions}
                onChange={(e) => setImagingOrderData({ ...imagingOrderData, instructions: e.target.value })}
                placeholder="e.g., With contrast"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagingFacilityName">Imaging Facility Name</Label>
              <Input
                id="imagingFacilityName"
                value={imagingOrderData.imagingFacilityName}
                onChange={(e) => setImagingOrderData({ ...imagingOrderData, imagingFacilityName: e.target.value })}
                placeholder="e.g., RadNet Imaging Center"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagingFacilityAddress">Imaging Facility Address</Label>
              <Input
                id="imagingFacilityAddress"
                value={imagingOrderData.imagingFacilityAddress}
                onChange={(e) => setImagingOrderData({ ...imagingOrderData, imagingFacilityAddress: e.target.value })}
                placeholder="e.g., 123 Main St, City, State"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImagingOrderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateImagingOrder} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Imaging Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Referral Dialog */}
      <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Referral</DialogTitle>
            <DialogDescription>Refer {patient.name} to a specialist</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="referredToProvider">Refer To</Label>
              <Select
                value={referralData.referredToProviderId}
                onValueChange={(value) => setReferralData({ ...referralData, referredToProviderId: value })}
              >
                <SelectTrigger id="referredToProvider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {availableProviders.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} - {p.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralReason">Reason for Referral</Label>
              <Input
                id="referralReason"
                value={referralData.reason}
                onChange={(e) => setReferralData({ ...referralData, reason: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralNotes">Notes</Label>
              <Textarea
                id="referralNotes"
                value={referralData.notes}
                onChange={(e) => setReferralData({ ...referralData, notes: e.target.value })}
                placeholder="Additional information for the specialist"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReferralDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReferral} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Referral"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
