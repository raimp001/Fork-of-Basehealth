"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { CheckCircle, Mail, Clock, ArrowRight } from "lucide-react"

export default function OnboardingSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />

      <main className="pt-20 pb-12">
        <div className="max-w-lg mx-auto px-4">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Application Submitted!
              </h1>
              <p className="text-gray-600 mb-8">
                Thank you for applying to join BaseHealth. We've received your application and will review it shortly.
              </p>

              <div className="space-y-4 text-left bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Check Your Email</h3>
                    <p className="text-sm text-gray-600">
                      We've sent a confirmation email with your application details.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Review Time: 1-2 Business Days</h3>
                    <p className="text-sm text-gray-600">
                      Our team will verify your credentials and review your application.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Approval Notification</h3>
                    <p className="text-sm text-gray-600">
                      You'll receive an email once your application is approved.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/">
                    Return Home
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/login">
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
