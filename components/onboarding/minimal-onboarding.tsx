"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, Check } from "lucide-react"

export function MinimalOnboarding() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    conditions: [] as string[],
    medications: [] as string[],
    allergies: [] as string[],
  })

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleConditionToggle = (condition: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, conditions: [...formData.conditions, condition] })
    } else {
      setFormData({ ...formData, conditions: formData.conditions.filter((c) => c !== condition) })
    }
  }

  const handleNext = () => {
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = () => {
    console.log("Form submitted:", formData)
    // In a real app, we would send this data to the server
    setStep(4) // Success step
  }

  const commonConditions = [
    "Hypertension (High Blood Pressure)",
    "Diabetes",
    "Asthma",
    "Heart Disease",
    "Arthritis",
    "Depression/Anxiety",
    "Cancer",
    "None of the above",
  ]

  return (
    <div className="container px-4 py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">Health Profile Setup</h1>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Let's start with some basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleNext} className="w-full">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Medical History</CardTitle>
            <CardDescription>Help us understand your health background</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Do you have any of these conditions?</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {commonConditions.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={`condition-${condition}`}
                      checked={formData.conditions.includes(condition)}
                      onCheckedChange={(checked) => handleConditionToggle(condition, checked === true)}
                    />
                    <Label htmlFor={`condition-${condition}`} className="font-normal">
                      {condition}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={handleNext}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Almost done! Just a few more details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="medications">Current Medications</Label>
              <Input
                id="medications"
                placeholder="Enter medications separated by commas"
                onChange={(e) => setFormData({ ...formData, medications: e.target.value.split(",") })}
              />
              <p className="text-xs text-muted-foreground">Leave blank if none</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                placeholder="Enter allergies separated by commas"
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value.split(",") })}
              />
              <p className="text-xs text-muted-foreground">Leave blank if none</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={handleSubmit}>Complete Setup</Button>
          </CardFooter>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <Check className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center">Profile Complete!</CardTitle>
            <CardDescription className="text-center">Your health profile has been set up successfully</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              You can now access all features of the BaseHealth platform. Your information will help us provide
              personalized health recommendations.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <a href="/minimal">Go to Dashboard</a>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
