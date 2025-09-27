"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle,
  Heart,
  Mail,
  Phone,
  Clock,
  Shield
} from "lucide-react"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import Link from "next/link"

export default function CaregiverSignupSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Application Submitted Successfully!
          </h1>
          <p className="text-gray-600">
            Thank you for applying to join our professional caregiver network. We've received your application and will review it within 2-3 business days.
          </p>
        </div>

        {/* Next Steps */}
        <Card className="p-6 border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What Happens Next?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Email Confirmation</h3>
                <p className="text-sm text-gray-600">You'll receive a confirmation email with your application details</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Background Verification</h3>
                <p className="text-sm text-gray-600">We'll verify your credentials and conduct background checks</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Interview Call</h3>
                <p className="text-sm text-gray-600">Our team will schedule a brief interview to discuss your experience</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Welcome to the Network</h3>
                <p className="text-sm text-gray-600">Once approved, you'll receive access to our caregiver portal</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-6 border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Timeline</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Application Submitted</h3>
                <p className="text-sm text-gray-600">Today</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                <Clock className="h-3 w-3 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Review & Verification</h3>
                <p className="text-sm text-gray-600">2-3 business days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                <Clock className="h-3 w-3 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Interview & Onboarding</h3>
                <p className="text-sm text-gray-600">1-2 business days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                <Clock className="h-3 w-3 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Portal Access</h3>
                <p className="text-sm text-gray-600">Within 1 week</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6 border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about your application or need to make changes, please contact our support team.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">caregivers@basehealth.xyz</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">1-800-CARE-HELP</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">
            <Link href="/">
              Return to Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 border-gray-200">
            <Link href="/providers/search?bounty=true">
              Browse Care Requests
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
} 