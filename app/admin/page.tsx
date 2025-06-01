"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Shield, 
  FileText, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Download,
  Eye,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Calendar,
  DollarSign,
  Activity,
  Mail,
  Phone,
  MapPin,
  Stethoscope,
  Award,
  Building,
  Camera,
  ExternalLink,
  Bell,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  BarChart3
} from "lucide-react"

interface ProviderApplication {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  specialty: string
  credentials: string
  npiNumber: string
  licenseNumber: string
  licenseState: string
  licenseExpiration: string
  practiceType: string
  practiceName: string
  practiceAddress: string
  consultationFee: number
  submittedDate: string
  status: "pending" | "under_review" | "approved" | "rejected"
  documents: {
    profilePhoto: boolean
    medicalLicense: boolean
    malpracticeInsurance: boolean
    cv: boolean
  }
  reviewNotes?: string
  reviewedBy?: string
  reviewedDate?: string
}

interface AdminStats {
  totalProviders: number
  pendingApplications: number
  approvedThisMonth: number
  rejectedThisMonth: number
  totalPatients: number
  totalAppointments: number
  monthlyRevenue: number
}

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState("applications")
  const [applications, setApplications] = useState<ProviderApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<ProviderApplication | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats>({
    totalProviders: 0,
    pendingApplications: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    totalPatients: 0,
    totalAppointments: 0,
    monthlyRevenue: 0
  })

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockApplications: ProviderApplication[] = [
      {
        id: "1",
        firstName: "Dr. Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@email.com",
        phone: "(555) 123-4567",
        specialty: "Family Medicine",
        credentials: "MD",
        npiNumber: "1234567890",
        licenseNumber: "MD123456",
        licenseState: "CA",
        licenseExpiration: "2025-12-31",
        practiceType: "Solo Practice",
        practiceName: "Johnson Family Medicine",
        practiceAddress: "123 Main St, Los Angeles, CA 90210",
        consultationFee: 150,
        submittedDate: "2024-01-15",
        status: "pending",
        documents: {
          profilePhoto: true,
          medicalLicense: true,
          malpracticeInsurance: true,
          cv: true
        }
      },
      {
        id: "2",
        firstName: "Dr. Michael",
        lastName: "Chen",
        email: "michael.chen@email.com",
        phone: "(555) 987-6543",
        specialty: "Cardiology",
        credentials: "MD",
        npiNumber: "0987654321",
        licenseNumber: "MD789012",
        licenseState: "NY",
        licenseExpiration: "2025-06-30",
        practiceType: "Group Practice",
        practiceName: "Heart Specialists of NYC",
        practiceAddress: "456 Park Ave, New York, NY 10001",
        consultationFee: 250,
        submittedDate: "2024-01-12",
        status: "under_review",
        documents: {
          profilePhoto: true,
          medicalLicense: true,
          malpracticeInsurance: false,
          cv: true
        },
        reviewNotes: "Missing malpractice insurance documentation"
      },
      {
        id: "3",
        firstName: "Dr. Emily",
        lastName: "Rodriguez",
        email: "emily.rodriguez@email.com",
        phone: "(555) 456-7890",
        specialty: "Pediatrics",
        credentials: "MD",
        npiNumber: "1122334455",
        licenseNumber: "MD345678",
        licenseState: "TX",
        licenseExpiration: "2025-09-15",
        practiceType: "Hospital Employed",
        practiceName: "Children's Hospital of Dallas",
        practiceAddress: "789 Medical Center Blvd, Dallas, TX 75201",
        consultationFee: 180,
        submittedDate: "2024-01-10",
        status: "approved",
        documents: {
          profilePhoto: true,
          medicalLicense: true,
          malpracticeInsurance: true,
          cv: true
        },
        reviewedBy: "Admin User",
        reviewedDate: "2024-01-14"
      }
    ]

    const mockStats: AdminStats = {
      totalProviders: 127,
      pendingApplications: 8,
      approvedThisMonth: 12,
      rejectedThisMonth: 3,
      totalPatients: 2549,
      totalAppointments: 1876,
      monthlyRevenue: 125000
    }

    setTimeout(() => {
      setApplications(mockApplications)
      setStats(mockStats)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800"
      case "rejected": return "bg-red-100 text-red-800"
      case "under_review": return "bg-blue-100 text-blue-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleApprove = async (applicationId: string) => {
    try {
      // In real app, make API call to approve provider
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: "approved", reviewedBy: "Admin User", reviewedDate: new Date().toISOString().split('T')[0], reviewNotes }
            : app
        )
      )
      setSelectedApplication(null)
      setReviewNotes("")
    } catch (error) {
      console.error('Failed to approve application:', error)
    }
  }

  const handleReject = async (applicationId: string) => {
    try {
      // In real app, make API call to reject provider
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: "rejected", reviewedBy: "Admin User", reviewedDate: new Date().toISOString().split('T')[0], reviewNotes }
            : app
        )
      )
      setSelectedApplication(null)
      setReviewNotes("")
    } catch (error) {
      console.error('Failed to reject application:', error)
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === "all" || app.status === filterStatus
    const matchesSearch = searchTerm === "" || 
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const renderApplicationDetails = (application: ProviderApplication) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Provider Application Details</DialogTitle>
          <DialogDescription>
            Review all information and documents for {application.firstName} {application.lastName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{application.firstName} {application.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{application.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm">{application.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Specialty</Label>
                  <p className="text-sm">{application.specialty}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Credentials</Label>
                  <p className="text-sm">{application.credentials}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">NPI Number</Label>
                  <p className="text-sm">{application.npiNumber}</p>
                </div>
              </CardContent>
            </Card>

            {/* License Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  License Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">License Number</Label>
                  <p className="text-sm">{application.licenseNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">License State</Label>
                  <p className="text-sm">{application.licenseState}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Expiration Date</Label>
                  <p className="text-sm">{application.licenseExpiration}</p>
                </div>
              </CardContent>
            </Card>

            {/* Practice Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Practice Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Practice Type</Label>
                  <p className="text-sm">{application.practiceType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Practice Name</Label>
                  <p className="text-sm">{application.practiceName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm">{application.practiceAddress}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Consultation Fee</Label>
                  <p className="text-sm">${application.consultationFee}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Uploaded Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span className="text-sm">Profile Photo</span>
                  {application.documents.profilePhoto ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Medical License</span>
                  {application.documents.medicalLicense ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Malpractice Insurance</span>
                  {application.documents.malpracticeInsurance ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span className="text-sm">CV/Resume</span>
                  {application.documents.cv ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Section */}
          {application.status !== "pending" && (
            <Card>
              <CardHeader>
                <CardTitle>Review Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.toUpperCase()}
                  </Badge>
                </div>
                {application.reviewedBy && (
                  <div>
                    <Label className="text-sm font-medium">Reviewed By</Label>
                    <p className="text-sm">{application.reviewedBy}</p>
                  </div>
                )}
                {application.reviewedDate && (
                  <div>
                    <Label className="text-sm font-medium">Reviewed Date</Label>
                    <p className="text-sm">{application.reviewedDate}</p>
                  </div>
                )}
                {application.reviewNotes && (
                  <div>
                    <Label className="text-sm font-medium">Review Notes</Label>
                    <p className="text-sm">{application.reviewNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Section for Pending Applications */}
          {application.status === "pending" && (
            <Card>
              <CardHeader>
                <CardTitle>Review Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reviewNotes">Review Notes</Label>
                  <Textarea
                    id="reviewNotes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about the review decision..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleApprove(application.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button 
                    onClick={() => handleReject(application.id)}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Portal
                </h1>
                <p className="text-sm text-gray-500">Provider Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">System Online</span>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProviders}</p>
              <p className="text-sm text-gray-600">Total Providers</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl p-6 border border-amber-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-6 border border-emerald-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedThisMonth}</p>
              <p className="text-sm text-gray-600">Approved This Month</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Enhanced Tab Header */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex space-x-8 px-6">
              <button
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === "applications"
                    ? "border-indigo-500 text-indigo-600 bg-white/50 rounded-t-lg"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("applications")}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Provider Applications
                  {stats.pendingApplications > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {stats.pendingApplications}
                    </span>
                  )}
                </div>
              </button>
              <button
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === "providers"
                    ? "border-indigo-500 text-indigo-600 bg-white/50 rounded-t-lg"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("providers")}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Active Providers
                </div>
              </button>
              <button
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === "analytics"
                    ? "border-indigo-500 text-indigo-600 bg-white/50 rounded-t-lg"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("analytics")}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </div>
              </button>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="applications">Provider Applications</TabsTrigger>
              <TabsTrigger value="providers">Active Providers</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Provider Applications Tab */}
            <TabsContent value="applications" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Provider Applications</CardTitle>
                      <CardDescription>
                        Review and manage provider applications
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                        <Input
                          placeholder="Search by name, email, or specialty..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Applications</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Applications Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Provider</TableHead>
                        <TableHead>Specialty</TableHead>
                        <TableHead>License</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{application.firstName} {application.lastName}</p>
                              <p className="text-sm text-muted-foreground">{application.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{application.specialty}</p>
                              <p className="text-sm text-muted-foreground">{application.credentials}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{application.licenseState}</p>
                              <p className="text-sm text-muted-foreground">{application.licenseNumber}</p>
                            </div>
                          </TableCell>
                          <TableCell>{application.submittedDate}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(application.status)}>
                              {application.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {Object.values(application.documents).filter(Boolean).length === 4 ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                              )}
                              <span className="text-sm">
                                {Object.values(application.documents).filter(Boolean).length}/4
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {renderApplicationDetails(application)}
                              {application.status === "pending" && (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleApprove(application.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleReject(application.id)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Active Providers Tab */}
            <TabsContent value="providers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Providers</CardTitle>
                  <CardDescription>Manage currently active providers on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Active provider management coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>Monitor platform performance and metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Analytics dashboard coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 