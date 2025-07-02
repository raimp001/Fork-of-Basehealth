"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Heart, Mail, Clock, Home } from 'lucide-react'

export default function CaregiverSignupSuccessPage() {
  return (
    <div className="min-h-screen bg-healthcare-gradient flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center shadow-xl">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                Application Submitted Successfully!
              </h1>
              
              <div className="flex items-center justify-center gap-2 mb-6">
                <Heart className="h-5 w-5 text-rose-500" />
                <span className="text-lg text-slate-600">Thank you for wanting to join our caregiver network</span>
              </div>

              <div className="bg-slate-50 rounded-lg p-6 mb-6 text-left">
                <h2 className="font-semibold text-slate-800 mb-4">What happens next?</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-700">Email Confirmation</p>
                      <p className="text-sm text-slate-600">You'll receive a confirmation email within the next few minutes.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-700">Application Review</p>
                      <p className="text-sm text-slate-600">Our admin team will review your application within 2-3 business days.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-700">Approval & Onboarding</p>
                      <p className="text-sm text-slate-600">Once approved, you'll receive login credentials and onboarding instructions.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-rose-800">
                  <strong>Application ID:</strong> CG-{Date.now()}<br/>
                  <strong>Submitted:</strong> {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link href="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Return Home
                  </Link>
                </Button>
                
                <Button asChild className="bg-rose-600 hover:bg-rose-700">
                  <Link href="/providers/search" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Browse Available Bounties
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 