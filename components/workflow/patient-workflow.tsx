"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ScreeningForm } from "@/components/workflow/screening-form"
import { ProviderSelection } from "@/components/workflow/provider-selection"
import { TestScheduling } from "@/components/workflow/test-scheduling"
import { AppointmentScheduling } from "@/components/workflow/appointment-scheduling"
import { WorkflowSummary } from "@/components/workflow/workflow-summary"

export type PatientData = {
  age?: number
  gender?: string
  medicalHistory?: string[]
  zipCode?: string
  selectedScreenings?: string[]
  selectedProvider?: any
  scheduledTests?: any[]
  appointmentDetails?: {
    date?: string
    time?: string
    isVirtual?: boolean
  }
}

export function PatientWorkflow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [patientData, setPatientData] = useState<PatientData>({})

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const updatePatientData = (data: Partial<PatientData>) => {
    setPatientData((prev) => ({ ...prev, ...data }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ScreeningForm patientData={patientData} updatePatientData={updatePatientData} onComplete={handleNext} />
      case 2:
        return (
          <ProviderSelection patientData={patientData} updatePatientData={updatePatientData} onComplete={handleNext} />
        )
      case 3:
        return (
          <TestScheduling patientData={patientData} updatePatientData={updatePatientData} onComplete={handleNext} />
        )
      case 4:
        return (
          <AppointmentScheduling
            patientData={patientData}
            updatePatientData={updatePatientData}
            onComplete={handleNext}
          />
        )
      case 5:
        return <WorkflowSummary patientData={patientData} />
      default:
        return null
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Healthcare Journey</CardTitle>
          <CardDescription>Complete your personalized healthcare journey in {totalSteps} simple steps</CardDescription>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>
                Step {currentStep} of {totalSteps}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Tabs value={`step-${currentStep}`} className="w-full">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger
                  value="step-1"
                  disabled={currentStep !== 1}
                  className={currentStep >= 1 ? "text-primary" : ""}
                >
                  {currentStep > 1 ? <CheckCircle className="h-4 w-4 mr-1" /> : "1."} Screening
                </TabsTrigger>
                <TabsTrigger
                  value="step-2"
                  disabled={currentStep !== 2}
                  className={currentStep >= 2 ? "text-primary" : ""}
                >
                  {currentStep > 2 ? <CheckCircle className="h-4 w-4 mr-1" /> : "2."} Provider
                </TabsTrigger>
                <TabsTrigger
                  value="step-3"
                  disabled={currentStep !== 3}
                  className={currentStep >= 3 ? "text-primary" : ""}
                >
                  {currentStep > 3 ? <CheckCircle className="h-4 w-4 mr-1" /> : "3."} Tests
                </TabsTrigger>
                <TabsTrigger
                  value="step-4"
                  disabled={currentStep !== 4}
                  className={currentStep >= 4 ? "text-primary" : ""}
                >
                  {currentStep > 4 ? <CheckCircle className="h-4 w-4 mr-1" /> : "4."} Appointment
                </TabsTrigger>
                <TabsTrigger
                  value="step-5"
                  disabled={currentStep !== 5}
                  className={currentStep >= 5 ? "text-primary" : ""}
                >
                  {currentStep > 5 ? <CheckCircle className="h-4 w-4 mr-1" /> : "5."} Summary
                </TabsTrigger>
              </TabsList>
              <TabsContent value={`step-${currentStep}`} className="mt-6">
                {renderStepContent()}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          {currentStep < totalSteps && (
            <Button onClick={handleNext}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {currentStep === totalSteps && (
            <Button onClick={() => (window.location.href = "/dashboard")}>Go to Dashboard</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
