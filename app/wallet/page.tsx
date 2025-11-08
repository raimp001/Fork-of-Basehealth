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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
          <Card className="text-center border-stone-200">
            <CardContent className="p-6">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-stone-900">--</p>
              <p className="text-sm text-stone-600">Balance</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-stone-200">
            <CardContent className="p-6">
              <FileText className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold text-stone-900">--</p>
              <p className="text-sm text-stone-600">Pending Bills</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-stone-200">
            <CardContent className="p-6">
              <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-stone-900">Active</p>
              <p className="text-sm text-stone-600">Insurance</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-stone-200">
            <CardContent className="p-6">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-stone-900">0</p>
              <p className="text-sm text-stone-600">Claims</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
          <Button 
            onClick={() => setActiveTab("insights")}
            variant="outline"
            className="h-20 flex-col gap-2 border-stone-300 text-stone-700 hover:bg-stone-50 hover:text-stone-900"
          >
            <BarChart3 className="h-6 w-6" />
            <span>View Spending Analytics</span>
          </Button>
          
          <Button 
            onClick={() => setActiveTab("wallet")}
            variant="outline"
            className="h-20 flex-col gap-2 border-stone-300 text-stone-700 hover:bg-stone-50 hover:text-stone-900"
          >
            <Wallet className="h-6 w-6" />
            <span>Connect Crypto Wallet</span>
          </Button>
          
          <Button 
            onClick={() => setActiveTab("compliance")}
            variant="outline"
            className="h-20 flex-col gap-2 border-stone-300 text-stone-700 hover:bg-stone-50 hover:text-stone-900"
          >
            <Gavel className="h-6 w-6" />
            <span>CMS Compliance</span>
          </Button>
        </div>

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
    </div>
  )
}
