"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  Shield,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Camera,
  Scan,
  Download,
  Eye,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Send,
  Search,
  Filter,
  Calendar,
  Phone,
  Mail,
  User,
  CreditCard,
  Building,
  MapPin
} from "lucide-react"

interface InsuranceCard {
  id: string
  type: "primary" | "secondary"
  insurerName: string
  policyNumber: string
  groupNumber: string
  subscriberName: string
  subscriberId: string
  effectiveDate: string
  copay: number
  deductible: number
  outOfPocketMax: number
  coverageLevel: string
  frontImage?: string
  backImage?: string
  status: "active" | "pending" | "expired"
}

interface Claim {
  id: string
  claimNumber: string
  serviceDate: string
  provider: string
  serviceDescription: string
  billedAmount: number
  allowedAmount: number
  paidAmount: number
  patientResponsibility: number
  status: "submitted" | "processing" | "approved" | "denied" | "appealed"
  submittedDate: string
  processedDate?: string
  denialReason?: string
  notes?: string
  cptCodes: string[]
}

export function InsuranceManagement() {
  const [activeTab, setActiveTab] = useState("cards")
  const [isUploading, setIsUploading] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<string>("")
  const [newClaimOpen, setNewClaimOpen] = useState(false)

  // Mock data - in real app, this would come from API
  const mockInsuranceCards: InsuranceCard[] = [
    {
      id: "1",
      type: "primary",
      insurerName: "Blue Cross Blue Shield",
      policyNumber: "BC12345678",
      groupNumber: "GRP001",
      subscriberName: "John Doe",
      subscriberId: "DOE123456",
      effectiveDate: "2024-01-01",
      copay: 25,
      deductible: 1500,
      outOfPocketMax: 6000,
      coverageLevel: "Individual",
      status: "active"
    }
  ]

  const mockClaims: Claim[] = [
    {
      id: "1",
      claimNumber: "CLM20240115001",
      serviceDate: "2024-01-15",
      provider: "Dr. Smith - Cardiology",
      serviceDescription: "Office Visit - Consultation",
      billedAmount: 250.00,
      allowedAmount: 180.00,
      paidAmount: 155.00,
      patientResponsibility: 25.00,
      status: "approved",
      submittedDate: "2024-01-16",
      processedDate: "2024-01-18",
      cptCodes: ["99213"]
    },
    {
      id: "2",
      claimNumber: "CLM20240120001",
      serviceDate: "2024-01-20",
      provider: "Lab Services Inc",
      serviceDescription: "Blood Work Panel",
      billedAmount: 150.00,
      allowedAmount: 120.00,
      paidAmount: 0.00,
      patientResponsibility: 120.00,
      status: "denied",
      submittedDate: "2024-01-21",
      processedDate: "2024-01-23",
      denialReason: "Service not covered under current plan",
      cptCodes: ["80053", "85025"]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "approved": return "bg-green-100 text-green-800"
      case "pending":
      case "processing":
      case "submitted": return "bg-blue-100 text-blue-800"
      case "denied": return "bg-red-100 text-red-800"
      case "expired": return "bg-gray-100 text-gray-800"
      case "appealed": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleFileUpload = async (file: File, type: "front" | "back") => {
    setIsUploading(true)
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      // In real app, would upload to cloud storage and extract data using OCR
      console.log(`Uploaded ${type} image:`, file.name)
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const submitClaim = async (claimData: any) => {
    try {
      // Simulate claim submission
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log("Claim submitted:", claimData)
      setNewClaimOpen(false)
    } catch (error) {
      console.error("Claim submission failed:", error)
    }
  }

  const renderInsuranceCards = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Your Insurance Cards</h3>
          <p className="text-sm text-muted-foreground">
            Upload and manage your insurance information
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Insurance Card
        </Button>
      </div>

      {mockInsuranceCards.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="p-4 bg-muted rounded-full inline-block">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-medium">No Insurance Cards Added</h4>
                <p className="text-sm text-muted-foreground">
                  Upload your insurance cards to get started with claims management
                </p>
              </div>
              <div className="space-y-2">
                <Button className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo of Insurance Card
                </Button>
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload from Files
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockInsuranceCards.map((card) => (
            <Card key={card.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {card.insurerName}
                    </CardTitle>
                    <CardDescription>
                      {card.type === "primary" ? "Primary Insurance" : "Secondary Insurance"}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(card.status)}>
                    {card.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Policy Number</p>
                    <p className="font-medium">{card.policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Group Number</p>
                    <p className="font-medium">{card.groupNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Subscriber</p>
                    <p className="font-medium">{card.subscriberName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Effective Date</p>
                    <p className="font-medium">{card.effectiveDate}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Copay</p>
                    <p className="font-medium">${card.copay}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Deductible</p>
                    <p className="font-medium">${card.deductible}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Out-of-Pocket Max</p>
                    <p className="font-medium">${card.outOfPocketMax}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Card
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Insurance Card
          </CardTitle>
          <CardDescription>
            Take photos or upload images of both sides of your insurance card
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Scan className="h-4 w-4" />
            <AlertDescription>
              We'll automatically extract information from your card using secure OCR technology. 
              All images are encrypted and stored securely.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Front of Card</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload front of insurance card
                </p>
                <Button variant="outline" size="sm" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Front
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Back of Card</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload back of insurance card
                </p>
                <Button variant="outline" size="sm" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Back
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderClaimsManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Claims Management</h3>
          <p className="text-sm text-muted-foreground">
            Submit new claims and track existing ones
          </p>
        </div>
        <Button onClick={() => setNewClaimOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Submit New Claim
        </Button>
      </div>

      {/* Claims Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Claims</p>
                <p className="text-2xl font-bold">{mockClaims.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockClaims.filter(c => c.status === "approved").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mockClaims.filter(c => c.status === "processing" || c.status === "submitted").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Denied</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockClaims.filter(c => c.status === "denied").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Claims</CardTitle>
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
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockClaims.map((claim) => (
              <div key={claim.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{claim.provider}</p>
                      <Badge className={getStatusColor(claim.status)}>
                        {claim.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{claim.serviceDescription}</p>
                    <p className="text-xs text-muted-foreground">
                      Claim #{claim.claimNumber} • Service Date: {claim.serviceDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${claim.billedAmount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Billed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Allowed Amount</p>
                    <p className="font-medium">${claim.allowedAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Insurance Paid</p>
                    <p className="font-medium">${claim.paidAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Your Responsibility</p>
                    <p className="font-medium">${claim.patientResponsibility.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submitted</p>
                    <p className="font-medium">{claim.submittedDate}</p>
                  </div>
                </div>

                {claim.denialReason && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Denial Reason:</strong> {claim.denialReason}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {claim.status === "denied" && (
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      File Appeal
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download EOB
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Claim Modal */}
      {newClaimOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Submit New Claim</CardTitle>
            <CardDescription>
              Submit a claim for reimbursement from your insurance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-date">Service Date</Label>
                <Input id="service-date" type="date" />
              </div>
              <div>
                <Label htmlFor="provider">Provider</Label>
                <Input id="provider" placeholder="Dr. Smith - Cardiology" />
              </div>
            </div>

            <div>
              <Label htmlFor="service-description">Service Description</Label>
              <Input id="service-description" placeholder="Office consultation" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount Paid</Label>
                <Input id="amount" type="number" placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="cpt-codes">CPT Codes</Label>
                <Input id="cpt-codes" placeholder="99213, 99214" />
              </div>
            </div>

            <div>
              <Label htmlFor="receipts">Upload Receipts</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop receipts or click to upload
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" placeholder="Any additional information..." />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => submitClaim({})}>
                <Send className="h-4 w-4 mr-2" />
                Submit Claim
              </Button>
              <Button variant="outline" onClick={() => setNewClaimOpen(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderEligibilityVerification = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Insurance Verification</h3>
        <p className="text-sm text-muted-foreground">
          Verify your insurance coverage and benefits
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Verify Coverage
          </CardTitle>
          <CardDescription>
            Check your insurance eligibility and benefits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="insurance-plan">Insurance Plan</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select your insurance plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bcbs">Blue Cross Blue Shield</SelectItem>
                  <SelectItem value="aetna">Aetna</SelectItem>
                  <SelectItem value="uhc">United Healthcare</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="service-type">Service Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office-visit">Office Visit</SelectItem>
                  <SelectItem value="lab-work">Laboratory Work</SelectItem>
                  <SelectItem value="imaging">Imaging Studies</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full">
            <Search className="h-4 w-4 mr-2" />
            Verify Coverage
          </Button>

          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Enter your information to verify coverage</p>
            <p className="text-sm">Real-time eligibility verification available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Insurance Management</h1>
          <p className="text-muted-foreground">
            Manage your insurance cards, submit claims, and track coverage
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            HIPAA Secure
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cards">Insurance Cards</TabsTrigger>
          <TabsTrigger value="claims">Claims Management</TabsTrigger>
          <TabsTrigger value="verification">Coverage Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-6">
          {renderInsuranceCards()}
        </TabsContent>

        <TabsContent value="claims" className="space-y-6">
          {renderClaimsManagement()}
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          {renderEligibilityVerification()}
        </TabsContent>
      </Tabs>
    </div>
  )
} 