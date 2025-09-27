"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Check, AlertCircle } from "lucide-react"

const steps = [
  { id: 'age-gender', title: 'Basic Information', description: 'Age and biological sex' },
  { id: 'risk-factors', title: 'Risk Factors', description: 'Family history and lifestyle' },
  { id: 'results', title: 'Your Recommendations', description: 'Personalized screening plan' }
]

export default function MinimalScreeningPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    familyHistory: '',
    smoking: '',
  })

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.age && formData.gender
      case 1:
        return formData.familyHistory && formData.smoking
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </Link>
            
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gray-900 transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Title */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h1>
          <p className="text-gray-600">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Form Content */}
        <Card className="p-6 sm:p-8 border-gray-100 shadow-sm">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="age" className="text-sm font-medium text-gray-700 mb-3 block">
                  What is your age?
                </Label>
                <RadioGroup 
                  value={formData.age} 
                  onValueChange={(value) => setFormData(prev => ({...prev, age: value}))}
                >
                  <div className="space-y-3">
                    {['18-29', '30-39', '40-49', '50-59', '60-69', '70+'].map(range => (
                      <label 
                        key={range} 
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <RadioGroupItem value={range} className="text-gray-900" />
                        <span className="text-gray-700">{range} years</span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="gender" className="text-sm font-medium text-gray-700 mb-3 block">
                  What is your biological sex?
                </Label>
                <RadioGroup 
                  value={formData.gender} 
                  onValueChange={(value) => setFormData(prev => ({...prev, gender: value}))}
                >
                  <div className="space-y-3">
                    {['male', 'female'].map(option => (
                      <label 
                        key={option} 
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <RadioGroupItem value={option} className="text-gray-900" />
                        <span className="text-gray-700 capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="familyHistory" className="text-sm font-medium text-gray-700 mb-3 block">
                  Do you have a family history of cancer, heart disease, or diabetes?
                </Label>
                <RadioGroup 
                  value={formData.familyHistory} 
                  onValueChange={(value) => setFormData(prev => ({...prev, familyHistory: value}))}
                >
                  <div className="space-y-3">
                    {['yes', 'no', 'not-sure'].map(option => (
                      <label 
                        key={option} 
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <RadioGroupItem value={option} className="text-gray-900" />
                        <span className="text-gray-700">
                          {option === 'yes' && 'Yes'}
                          {option === 'no' && 'No'}
                          {option === 'not-sure' && 'Not sure'}
                        </span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="smoking" className="text-sm font-medium text-gray-700 mb-3 block">
                  Do you currently smoke or have you smoked in the past?
                </Label>
                <RadioGroup 
                  value={formData.smoking} 
                  onValueChange={(value) => setFormData(prev => ({...prev, smoking: value}))}
                >
                  <div className="space-y-3">
                    {['never', 'former', 'current'].map(option => (
                      <label 
                        key={option} 
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <RadioGroupItem value={option} className="text-gray-900" />
                        <span className="text-gray-700">
                          {option === 'never' && 'Never smoked'}
                          {option === 'former' && 'Former smoker'}
                          {option === 'current' && 'Current smoker'}
                        </span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Your personalized screening plan is ready
                </h2>
                <p className="text-gray-600">
                  Based on your responses, here are your recommended health screenings:
                </p>
              </div>

              <div className="space-y-4">
                {/* Example recommendations - would be dynamic based on form data */}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Blood Pressure Screening</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Annual screening recommended for adults 40+ or those with risk factors
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Cholesterol Screening</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Every 4-6 years for adults without risk factors
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Diabetes Screening</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Consider screening based on your risk factors
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                  <Link href="/providers/search">
                    Find a provider to schedule screenings
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button asChild variant="outline" className="border-gray-200">
              <Link href="/patient-portal">
                Go to dashboard
              </Link>
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
