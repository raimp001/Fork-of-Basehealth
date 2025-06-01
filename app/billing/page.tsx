"use client"

import { EnhancedBillingDashboard } from "@/components/billing/enhanced-billing-dashboard"
import { SmartBillingInsights } from "@/components/billing/smart-billing-insights"
import { CMSCompliantBilling } from "@/components/billing/cms-compliant-billing"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Eye
} from "lucide-react"

export default function BillingPage() {
  // In a real app, this would come from user session/auth
  const patientId = "patient_123"
  const providerId = "provider_456"

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Healthcare Billing & Compliance</h1>
          <p className="text-xl text-muted-foreground">
            CMS-compliant billing management with smart insights and flexible payment options
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Shield className="h-3 w-3 mr-1" />
            CMS Compliant
          </Badge>
          <Button variant="outline">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment Methods
          </Button>
          <Button>
            <DollarSign className="h-4 w-4 mr-2" />
            Make Payment
          </Button>
        </div>
      </div>

      {/* Regulatory Alert */}
      <Alert className="bg-amber-50 border-amber-200">
        <Gavel className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>2024 CMS Updates:</strong> New billing requirements for telehealth services and updated fee schedules are now in effect.{" "}
          <a href="https://www.cms.gov" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
            View CMS Guidelines <ExternalLink className="h-3 w-3" />
          </a>
        </AlertDescription>
      </Alert>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Budget</p>
                <p className="text-2xl font-bold">$750</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-green-600">On Track</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">$285</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-blue-600">62% used</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Crypto Savings</p>
                <p className="text-2xl font-bold">$47.50</p>
              </div>
              <Wallet className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-purple-600">2.5% discount</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Claims Status</p>
                <p className="text-2xl font-bold">98%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-green-600">Approval Rate</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Billing Dashboard
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Smart Insights
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            CMS Compliance
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-2">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Good Faith Estimates
                </CardTitle>
                <CardDescription>
                  Required estimates for uninsured patients per No Surprise Billing Act
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Cardiology Consultation</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>CPT Code: 99213 - $112.00</p>
                    <p>Facility Fee: $85.00</p>
                    <p>Total Estimate: $197.00</p>
                  </div>
                  <Button size="sm" variant="outline" className="mt-2">
                    Generate Estimate
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Lab Work Panel</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Multiple CPT Codes</p>
                    <p>Total Estimate: $125.00 - $185.00</p>
                  </div>
                  <Button size="sm" variant="outline" className="mt-2">
                    Generate Estimate
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Prior Authorization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Prior Authorization Status
                </CardTitle>
                <CardDescription>
                  Track prior authorization requirements and approvals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Chronic Care Management</h4>
                    <Badge className="bg-green-100 text-green-800">Approved</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>CPT Code: 99490</p>
                    <p>Authorization #: PA-2024-001</p>
                    <p>Valid through: 12/31/2024</p>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Advanced Imaging</h4>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Request submitted: 01/15/2024</p>
                    <p>Expected response: 01/22/2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quality Measures */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quality Measure Tracking
                </CardTitle>
                <CardDescription>
                  CQM and MIPS quality measure compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>CQM-68: Documentation of BP</span>
                    <Badge className="bg-green-100 text-green-800">95%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>CQM-22: Preventive Care Screening</span>
                    <Badge className="bg-green-100 text-green-800">88%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>CQM-90: Chronic Care Management</span>
                    <Badge className="bg-yellow-100 text-yellow-800">72%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Preparation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Audit Readiness
                </CardTitle>
                <CardDescription>
                  Documentation and compliance audit preparation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>Medical Necessity Documentation</span>
                    <Badge className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>Billing Code Accuracy</span>
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>Patient Consent Forms</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Review Needed</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Generate Audit Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Compliance Footer */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">CMS Compliance & Security</h3>
                <p className="text-muted-foreground">
                  Full compliance with Medicare & Medicaid billing requirements, HIPAA, and No Surprise Billing Act
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">CMS Certified</Badge>
              <Badge variant="secondary">HIPAA Compliant</Badge>
              <Badge variant="secondary">No Surprise Billing</Badge>
              <Badge variant="secondary">Quality Reporting</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 