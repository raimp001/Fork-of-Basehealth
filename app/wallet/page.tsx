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
    <div className="container mx-auto p-4 space-y-6">
      {/* Simplified Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Health Wallet</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your complete healthcare financial hub - manage payments, insurance, and get insights all in one place
        </p>
      </div>

      {/* Big Action Cards - Most Important Features First */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
          <CardHeader className="text-center">
            <div className="mx-auto p-4 bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl">Add Insurance Card</CardTitle>
            <CardDescription>
              Upload your insurance card and we'll automatically extract all your information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setActiveTab("insurance")}
              className="w-full"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Upload Insurance Card
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
          <CardHeader className="text-center">
            <div className="mx-auto p-4 bg-green-500 rounded-full w-16 h-16 flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl">Make a Payment</CardTitle>
            <CardDescription>
              Pay your medical bills with credit card or cryptocurrency and save money
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowPaymentFlow(true)}
              className="w-full"
              size="lg"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Pay Bills Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats in Simple Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">--</p>
            <p className="text-sm text-muted-foreground">Balance</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <FileText className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">--</p>
            <p className="text-sm text-muted-foreground">Pending Bills</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <Shield className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">Active</p>
            <p className="text-sm text-muted-foreground">Insurance</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Claims</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={() => setActiveTab("insights")}
          variant="outline"
          className="h-20 flex-col gap-2"
        >
          <BarChart3 className="h-6 w-6" />
          <span>View Spending Analytics</span>
        </Button>
        
        <Button 
          onClick={() => setActiveTab("wallet")}
          variant="outline"
          className="h-20 flex-col gap-2"
        >
          <Wallet className="h-6 w-6" />
          <span>Connect Crypto Wallet</span>
        </Button>
        
        <Button 
          onClick={() => setActiveTab("compliance")}
          variant="outline"
          className="h-20 flex-col gap-2"
        >
          <Gavel className="h-6 w-6" />
          <span>CMS Compliance</span>
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

      {/* Simple Footer */}
      <div className="text-center text-sm text-muted-foreground border-t pt-6 space-y-2">
        <div className="flex justify-center gap-2">
          <Badge variant="outline">HIPAA Secure</Badge>
          <Badge variant="outline">PCI Compliant</Badge>
          <Badge variant="outline">CMS Certified</Badge>
        </div>
        <p>Your health data is protected with enterprise-grade encryption</p>
      </div>
    </div>
  )
}
