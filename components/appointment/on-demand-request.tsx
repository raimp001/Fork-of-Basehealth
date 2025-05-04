"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import type { Patient } from "@/types/user"

interface OnDemandRequestProps {
  patient: Patient
}

export function OnDemandRequest({ patient }: OnDemandRequestProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    symptoms: "",
    duration: "",
    urgency: "moderate",
    preferredSpecialty: "",
    additionalNotes: "",
    acceptTerms: false,
  })

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // In a real app, we would submit the form data to the server
      // For now, simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Move to the confirmation step
      setStep(3)
    } catch (err) {
      setError("An error occurred while submitting your request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Request On-Demand Healthcare</CardTitle>
        <CardDescription>
          Get connected with a healthcare provider quickly for urgent but non-emergency needs
        </CardDescription>
        {patient && <p className="text-sm text-muted-foreground mt-1">Patient: {patient.name}</p>}
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symptoms">What symptoms are you experiencing?</Label>
              <Textarea
                id="symptoms"
                placeholder="Describe your symptoms in detail"
                value={formData.symptoms}
                onChange={(e) => handleChange("symptoms", e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">How long have you been experiencing these symptoms?</Label>
              <Input
                id="duration"
                placeholder="e.g., 2 days, 1 week"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">How urgent is your condition?</Label>
              <Select value={formData.urgency} onValueChange={(value) => handleChange("urgency", value)}>
                <SelectTrigger id="urgency">
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Can wait a few days</SelectItem>
                  <SelectItem value="moderate">Moderate - Need help today</SelectItem>
                  <SelectItem value="high">High - Need help within hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                If you are experiencing a life-threatening emergency, please call 911 or go to your nearest emergency
                room immediately.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialty">Preferred Specialty (Optional)</Label>
              <Select
                value={formData.preferredSpecialty}
                onValueChange={(value) => handleChange("preferredSpecialty", value)}
              >
                <SelectTrigger id="specialty">
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-preference">No preference</SelectItem>
                  <SelectItem value="family-medicine">Family Medicine</SelectItem>
                  <SelectItem value="internal-medicine">Internal Medicine</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="mental-health">Mental Health</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any other information you'd like to share with the provider"
                value={formData.additionalNotes}
                onChange={(e) => handleChange("additionalNotes", e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2 pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleChange("acceptTerms", checked)}
                />
                <Label htmlFor="terms" className="text-sm">
                  I understand that this is not a replacement for emergency care and agree to the terms of service
                </Label>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">Request Submitted Successfully</h3>
              <p className="text-muted-foreground max-w-md">
                Your request has been received. A healthcare provider will connect with you shortly. Please keep your
                device nearby.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-md mt-6">
              <h4 className="font-medium mb-2">What happens next?</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>A provider will review your request (typically within 15-30 minutes)</li>
                <li>You'll receive a notification when a provider is ready to connect</li>
                <li>You'll be connected via video call for your consultation</li>
                <li>After the consultation, you'll receive a summary and any prescriptions if needed</li>
              </ol>
            </div>

            <div className="bg-blue-50 p-4 rounded-md mt-2">
              <p className="text-sm text-blue-800">
                <strong>Estimated wait time:</strong> 15-30 minutes
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {step === 1 && (
          <>
            <div></div>
            <Button onClick={() => setStep(2)} disabled={!formData.symptoms || !formData.duration}>
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.acceptTerms}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </>
        )}

        {step === 3 && (
          <Button className="w-full" asChild>
            <a href="/dashboard">Return to Dashboard</a>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
