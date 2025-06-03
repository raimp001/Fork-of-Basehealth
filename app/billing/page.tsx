"use client"

import { EnhancedBillingDashboard } from "@/components/billing/enhanced-billing-dashboard"
import { SmartBillingInsights } from "@/components/billing/smart-billing-insights"
import { CMSCompliantBilling } from "@/components/billing/cms-compliant-billing"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { 
  DollarSign, 
  TrendingUp, 
  Lightbulb, 
  Shield, 
  Wallet,
  CreditCard,
  BarChart3,
  Target,
  ArrowRight,
  FileText,
  Gavel,
  ExternalLink,
  CheckCircle,
  Eye,
  ArrowLeft,
  Sparkles
} from "lucide-react"

export default function BillingPage() {
  // In a real app, this would come from user session/auth
  const patientId = "patient_123"
  const providerId = "provider_456"

  return (
    <div className="min-h-screen bg-healthcare-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative">
        {/* Enhanced Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-cyan-100 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-sky-600">
                  <Link href="/patient-portal">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Portal
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                    Healthcare Billing
                  </h1>
                  <p className="text-gray-600 mt-1">
                    CMS-compliant billing management with smart insights
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-sky-100 text-sky-700 border-sky-200">
                  <Shield className="h-3 w-3 mr-1" />
                  CMS Compliant
                </Badge>
                <Button variant="outline" className="border-sky-200 text-sky-600 hover:bg-sky-50">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Methods
                </Button>
                <Button className="bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 shadow-lg">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Make Payment
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-6 space-y-8">
          {/* Regulatory Alert */}
          <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50 shadow-lg backdrop-blur-sm">
            <Gavel className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>2024 CMS Updates:</strong> New billing requirements for telehealth services and updated fee schedules are now in effect.{" "}
              <a href="https://www.cms.gov" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1 hover:text-amber-900 transition-colors">
                View CMS Guidelines <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>

          {/* Enhanced Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-sky-100 to-cyan-100 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-sky-600" />
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">On Track</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Monthly Budget</p>
                  <p className="text-3xl font-bold text-gray-900">$750</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-emerald-100 to-green-100 w-12 h-12 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <Badge variant="secondary" className="bg-sky-100 text-sky-700 border-sky-200">62% used</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">This Month</p>
                  <p className="text-3xl font-bold text-gray-900">$285</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-violet-100 to-purple-100 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-violet-600" />
                  </div>
                  <Badge variant="secondary" className="bg-violet-100 text-violet-700 border-violet-200">2.5% discount</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Crypto Savings</p>
                  <p className="text-3xl font-bold text-gray-900">$47.50</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-emerald-100 to-teal-100 w-12 h-12 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">Approval Rate</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Claims Status</p>
                  <p className="text-3xl font-bold text-gray-900">98%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Main Content */}
          <Tabs defaultValue="dashboard" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 h-14 bg-white/60 backdrop-blur-sm p-1 shadow-lg border-0">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white h-12 font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Billing Dashboard
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white h-12 font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Smart Insights
              </TabsTrigger>
              <TabsTrigger value="compliance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white h-12 font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                CMS Compliance
              </TabsTrigger>
              <TabsTrigger value="documentation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white h-12 font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <EnhancedBillingDashboard patientId={patientId} />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <SmartBillingInsights patientId={patientId} />
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <CMSCompliantBilling patientId={patientId} providerId={providerId} />
            </TabsContent>

            <TabsContent value="documentation" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Good Faith Estimates */}
                <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-sky-100 to-cyan-100 w-10 h-10 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-sky-600" />
                      </div>
                      Good Faith Estimates
                    </CardTitle>
                    <CardDescription>
                      Required estimates for uninsured patients per No Surprise Billing Act
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-white/40 backdrop-blur-sm border border-white/20 rounded-lg">
                      <h4 className="font-medium mb-2 text-gray-900">Cardiology Consultation</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>CPT Code: 99213 - $112.00</p>
                        <p>Facility Fee: $85.00</p>
                        <p className="font-medium text-gray-900">Total Estimate: $197.00</p>
                      </div>
                      <Button size="sm" variant="outline" className="mt-3 border-sky-200 text-sky-600 hover:bg-sky-50">
                        Generate Estimate
                      </Button>
                    </div>
                    <div className="p-4 bg-white/40 backdrop-blur-sm border border-white/20 rounded-lg">
                      <h4 className="font-medium mb-2 text-gray-900">Lab Work Panel</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Multiple CPT Codes</p>
                        <p className="font-medium text-gray-900">Total Estimate: $125.00 - $185.00</p>
                      </div>
                      <Button size="sm" variant="outline" className="mt-3 border-sky-200 text-sky-600 hover:bg-sky-50">
                        Generate Estimate
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Prior Authorization */}
                <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-10 h-10 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-emerald-600" />
                      </div>
                      Prior Authorization Status
                    </CardTitle>
                    <CardDescription>
                      Track prior authorization requirements and approvals
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-white/40 backdrop-blur-sm border border-white/20 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">Chronic Care Management</h4>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Approved</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>CPT Code: 99490</p>
                        <p>Authorization #: PA-2024-001</p>
                        <p>Valid through: 12/31/2024</p>
                      </div>
                    </div>
                    <div className="p-4 bg-white/40 backdrop-blur-sm border border-white/20 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">Advanced Imaging</h4>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Request submitted: 01/15/2024</p>
                        <p>Expected response: 01/22/2024</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quality Measures */}
                <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-violet-100 to-purple-100 w-10 h-10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-violet-600" />
                      </div>
                      Quality Measure Tracking
                    </CardTitle>
                    <CardDescription>
                      CQM and MIPS quality measure compliance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white/40 backdrop-blur-sm border border-white/20 rounded-lg">
                        <span className="font-medium text-gray-900">CQM-68: Documentation of BP</span>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">95%</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/40 backdrop-blur-sm border border-white/20 rounded-lg">
                        <span className="font-medium text-gray-900">CQM-22: Preventive Care Screening</span>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">88%</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/40 backdrop-blur-sm border border-white/20 rounded-lg">
                        <span className="font-medium text-gray-900">CQM-90: Chronic Care Management</span>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">72%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Audit Preparation */}
                <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-orange-100 to-red-100 w-10 h-10 rounded-lg flex items-center justify-center">
                        <Eye className="h-5 w-5 text-orange-600" />
                      </div>
                      Audit Readiness
                    </CardTitle>
                    <CardDescription>
                      Documentation and compliance audit preparation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white/40 backdrop-blur-sm border border-white/20 rounded-lg">
                        <span className="font-medium text-gray-900">Medical Necessity Documentation</span>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Complete</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/40 backdrop-blur-sm border border-white/20 rounded-lg">
                        <span className="font-medium text-gray-900">Billing Code Accuracy</span>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Verified</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/40 backdrop-blur-sm border border-white/20 rounded-lg">
                        <span className="font-medium text-gray-900">Patient Consent Forms</span>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Review Needed</Badge>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full border-sky-200 text-sky-600 hover:bg-sky-50">
                      Generate Audit Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Enhanced Compliance Footer */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-sky-50/80 to-cyan-50/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-xl">
                    <Shield className="h-8 w-8 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">CMS Compliance & Security</h3>
                    <p className="text-gray-600">
                      Full compliance with Medicare & Medicaid billing requirements, HIPAA, and No Surprise Billing Act
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-sky-100 text-sky-700 border-sky-200">CMS Certified</Badge>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">HIPAA Compliant</Badge>
                  <Badge variant="secondary" className="bg-violet-100 text-violet-700 border-violet-200">No Surprise Billing</Badge>
                  <Badge variant="secondary" className="bg-sky-100 text-sky-700 border-sky-200">Quality Reporting</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 