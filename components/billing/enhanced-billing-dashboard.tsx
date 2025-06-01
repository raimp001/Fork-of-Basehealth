"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CreditCard, 
  Wallet, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Download,
  Filter,
  Search,
  Plus,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  FileText,
  BarChart3
} from "lucide-react"
import { useCachedData } from "@/hooks/use-cached-data"

interface Bill {
  id: string
  type: "appointment" | "prescription" | "lab_test" | "insurance_premium"
  description: string
  amount: number
  dueDate: string
  status: "pending" | "paid" | "overdue" | "cancelled"
  paymentMethod?: "card" | "crypto" | "insurance"
  transactionHash?: string
  appointmentId?: string
}

interface PaymentMethod {
  id: string
  type: "card" | "crypto" | "bank"
  name: string
  last4?: string
  network?: string
  address?: string
  isDefault: boolean
}

interface BillingStats {
  totalSpent: number
  pendingAmount: number
  savedWithCrypto: number
  monthlyAverage: number
  upcomingBills: number
}

export function EnhancedBillingDashboard({ patientId }: { patientId: string }) {
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [hideAmounts, setHideAmounts] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data - in real app, this would come from API
  const mockStats: BillingStats = {
    totalSpent: 2450.75,
    pendingAmount: 180.00,
    savedWithCrypto: 47.50,
    monthlyAverage: 287.50,
    upcomingBills: 3
  }

  const mockBills: Bill[] = [
    {
      id: "1",
      type: "appointment",
      description: "Dr. Smith - Cardiology Consultation",
      amount: 180.00,
      dueDate: "2024-01-15",
      status: "pending",
      appointmentId: "apt_123"
    },
    {
      id: "2", 
      type: "prescription",
      description: "Monthly Medication Refill",
      amount: 45.99,
      dueDate: "2024-01-20",
      status: "pending"
    },
    {
      id: "3",
      type: "lab_test",
      description: "Blood Work Analysis",
      amount: 125.00,
      dueDate: "2024-01-10",
      status: "paid",
      paymentMethod: "crypto",
      transactionHash: "0x1234...5678"
    },
    {
      id: "4",
      type: "appointment",
      description: "Dr. Johnson - Follow-up Visit",
      amount: 150.00,
      dueDate: "2024-01-05",
      status: "paid",
      paymentMethod: "card"
    }
  ]

  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: "1",
      type: "card",
      name: "Visa ending in 4242",
      last4: "4242",
      isDefault: true
    },
    {
      id: "2",
      type: "crypto",
      name: "Base Wallet",
      network: "Base",
      address: "0x1234...5678",
      isDefault: false
    }
  ]

  const formatAmount = (amount: number) => {
    if (hideAmounts) return "****"
    return `$${amount.toFixed(2)}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "overdue": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "appointment": return <Calendar className="h-4 w-4" />
      case "prescription": return <Plus className="h-4 w-4" />
      case "lab_test": return <TrendingUp className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  const filteredBills = mockBills.filter(bill => {
    const matchesSearch = bill.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || bill.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing & Payments</h1>
          <p className="text-muted-foreground">Manage your healthcare expenses and payment methods</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setHideAmounts(!hideAmounts)}
          >
            {hideAmounts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">--</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Progress value={0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">-- of annual budget</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Bills</p>
                <p className="text-2xl font-bold">--</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              No bills due
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Crypto Savings</p>
                <p className="text-2xl font-bold">--</p>
              </div>
              <ArrowDownRight className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              -- discount vs traditional
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Average</p>
                <p className="text-2xl font-bold">--</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 inline mr-1" />
              No data available
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bills">Bills & Transactions</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-16 flex-col gap-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Pay Bills</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-2">
                  <Wallet className="h-5 w-5" />
                  <span>Connect Wallet</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-2">
                  <Plus className="h-5 w-5" />
                  <span>Add Payment Method</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions yet</p>
                <p className="text-sm">Your billing activity will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Bills & Transactions</h3>
              <p className="text-sm text-muted-foreground">
                View and manage your healthcare bills
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No bills or transactions</p>
                <p className="text-sm">Your healthcare bills will appear here when available</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Payment Methods</h3>
              <p className="text-sm text-muted-foreground">
                Manage your payment options
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payment methods added</p>
                <p className="text-sm">Add a payment method to get started</p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending Insights</CardTitle>
              <CardDescription>
                Get insights into your healthcare spending patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No data available</p>
                <p className="text-sm">Insights will appear as you use the platform</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 