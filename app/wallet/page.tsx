"use client"

import { useState } from "react"
import { SimplifiedWalletConnect } from "@/components/blockchain/simplified-wallet-connect"
import { EnhancedBillingDashboard } from "@/components/billing/enhanced-billing-dashboard"
import { ImprovedPaymentFlow } from "@/components/billing/improved-payment-flow"
import { SmartBillingInsights } from "@/components/billing/smart-billing-insights"
import { CMSCompliantBilling } from "@/components/billing/cms-compliant-billing"
import { InsuranceManagement } from "@/components/billing/insurance-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Wallet,
  CreditCard,
  BarChart3,
  Shield,
  DollarSign,
  TrendingUp,
  Lightbulb,
  FileText,
  Gavel,
  ExternalLink,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  Camera,
  Upload,
  Star,
  Heart
} from "lucide-react"
import Link from "next/link"

export default function HealthWalletPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showPaymentFlow, setShowPaymentFlow] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50">
      <div className="container mx-auto p-4 space-y-6 pt-24">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-stone-800 text-white text-sm font-semibold shadow-md">
            Health Wallet
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-stone-900 tracking-tight">
            Your Complete Healthcare Financial Hub
          </h1>
          <p className="text-lg md:text-xl text-stone-600 max-w-3xl mx-auto">
            Manage payments, insurance, and get insights all in one secure place
          </p>
        </div>

        {/* Enhanced Action Cards with consistent styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
          <Card className="border-2 border-stone-300 bg-white p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer rounded-2xl">
            <CardHeader className="text-center space-y-6">
              <div className="mx-auto p-4 bg-stone-900 rounded-full w-16 h-16 flex items-center justify-center">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-stone-900">Add Insurance Card</CardTitle>
              <CardDescription className="text-stone-600 text-lg">
                Upload your insurance card and we'll automatically extract all your information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setActiveTab("insurance")}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-lg"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Upload Insurance Card
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-stone-300 bg-white p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer rounded-2xl">
            <CardHeader className="text-center space-y-6">
              <div className="mx-auto p-4 bg-stone-900 rounded-full w-16 h-16 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-stone-900">Make a Payment</CardTitle>
              <CardDescription className="text-stone-600 text-lg">
                Pay your medical bills with credit card or cryptocurrency and save money
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowPaymentFlow(true)}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-lg"
                size="lg"
              >
                <DollarSign className="h-5 w-5 mr-2" />
                Pay Bills Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="text-center border-stone-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <DollarSign className="h-10 w-10 mx-auto mb-3 text-green-500" />
              <p className="text-3xl font-bold text-stone-900">--</p>
              <p className="text-sm text-stone-600 font-medium">Balance</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-stone-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <FileText className="h-10 w-10 mx-auto mb-3 text-orange-500" />
              <p className="text-3xl font-bold text-stone-900">--</p>
              <p className="text-sm text-stone-600 font-medium">Pending Bills</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-stone-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <Shield className="h-10 w-10 mx-auto mb-3 text-blue-500" />
              <p className="text-3xl font-bold text-stone-900">Active</p>
              <p className="text-sm text-stone-600 font-medium">Insurance</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-stone-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-500" />
              <p className="text-3xl font-bold text-stone-900">0</p>
              <p className="text-sm text-stone-600 font-medium">Claims</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button 
            onClick={() => setActiveTab("insights")}
            variant="outline"
            className="h-24 flex-col gap-2 border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all duration-300"
          >
            <BarChart3 className="h-6 w-6 text-stone-600" />
            <span className="font-medium text-stone-700">View Spending Analytics</span>
          </Button>
          
          <Button 
            onClick={() => setActiveTab("wallet")}
            variant="outline"
            className="h-24 flex-col gap-2 border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all duration-300"
          >
            <Wallet className="h-6 w-6 text-stone-600" />
            <span className="font-medium text-stone-700">Connect Crypto Wallet</span>
          </Button>
          
          <Button 
            onClick={() => setActiveTab("compliance")}
            variant="outline"
            className="h-24 flex-col gap-2 border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all duration-300"
          >
            <Gavel className="h-6 w-6 text-stone-600" />
            <span className="font-medium text-stone-700">CMS Compliance</span>
          </Button>
        </div>

      {/* Payment Flow Modal */}
      {showPaymentFlow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ImprovedPaymentFlow
              amount={0}
              appointmentId=""
              patientId=""
              providerId=""
              cptCode=""
              isUninsured={false}
              onSuccess={(result) => {
                console.log('Payment successful:', result)
                setShowPaymentFlow(false)
              }}
              onCancel={() => setShowPaymentFlow(false)}
            />
          </div>
        </div>
      )}

      {/* Simplified Tabs - Only Show When Needed */}
      {activeTab !== "overview" && (
        <>
          <div className="flex items-center gap-4 border-b pb-4">
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab("overview")}
              className="flex items-center gap-2"
            >
              ← Back to Overview
            </Button>
            <div className="text-lg font-semibold">
              {activeTab === "insurance" && "Insurance & Claims Management"}
              {activeTab === "billing" && "Bills & Payments"}
              {activeTab === "wallet" && "Crypto Wallet"}
              {activeTab === "insights" && "Spending Analytics"}
              {activeTab === "compliance" && "CMS Compliance"}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "insurance" && (
            <div className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tip:</strong> Upload both sides of your insurance card for automatic information extraction and faster claims processing.
                </AlertDescription>
              </Alert>
              <InsuranceManagement />
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  <strong>Save Money:</strong> Pay with cryptocurrency and get 2.5% discount on all medical bills.
                </AlertDescription>
              </Alert>
              <EnhancedBillingDashboard />
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="space-y-6">
              <Alert>
                <Wallet className="h-4 w-4" />
                <AlertDescription>
                  <strong>Crypto Benefits:</strong> Lower fees, instant payments, and automatic discounts when you pay with cryptocurrency.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimplifiedWalletConnect />
                <Card>
                  <CardHeader>
                    <CardTitle>Why Use Crypto?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>2.5% automatic discount</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Instant payments</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Lower transaction fees</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Enhanced security</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "insights" && (
            <div className="space-y-6">
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>AI Insights:</strong> Get personalized recommendations to save money on your healthcare expenses.
                </AlertDescription>
              </Alert>
              <SmartBillingInsights />
            </div>
          )}

          {activeTab === "compliance" && (
            <div className="space-y-6">
              <Alert>
                <Gavel className="h-4 w-4" />
                <AlertDescription>
                  <strong>CMS Compliance:</strong> All billing practices meet Medicare & Medicaid Services guidelines for transparency and patient protection.
                </AlertDescription>
              </Alert>
              <CMSCompliantBilling />
            </div>
          )}
        </>
      )}

      {/* Overview Content - Show detailed dashboard when on overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest healthcare financial activity</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No recent activity</p>
                <p className="text-sm">Your payments and claims will appear here</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Billing Overview</CardTitle>
              <CardDescription>Your healthcare spending summary</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedBillingDashboard />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Footer */}
      <div className="text-center text-sm text-stone-500 border-t pt-8 space-y-4">
        <div className="flex justify-center gap-3">
          <Badge variant="outline" className="border-stone-300 text-stone-600">HIPAA Secure</Badge>
          <Badge variant="outline" className="border-stone-300 text-stone-600">PCI Compliant</Badge>
          <Badge variant="outline" className="border-stone-300 text-stone-600">CMS Certified</Badge>
        </div>
        <p className="text-stone-600">Your health data is protected with enterprise-grade encryption</p>
      </div>
    </div>
  )
}
