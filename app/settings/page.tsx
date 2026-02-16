"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Bell, 
  Shield, 
  Globe,
  CreditCard,
  LogOut,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  Loader2,
  XCircle
} from "lucide-react"
import { FunctionAgentCTA } from "@/components/agents/function-agent-cta"

interface IntegrationCheck {
  id: string
  label: string
  env?: string
  required: boolean
  passed: boolean
  help: string
}

interface IntegrationSection {
  id: string
  title: string
  ready: boolean
  checks: IntegrationCheck[]
}

interface IntegrationStatusResponse {
  success: boolean
  overallReady: boolean
  sections: IntegrationSection[]
  missingRequired: Array<{
    sectionId: string
    sectionTitle: string
    checkId: string
    label: string
    env?: string
    help: string
  }>
}

interface BillingReceipt {
  receiptId: string
  bookingId: string
  amount: string
  currency: string
  network: string
  paymentStatus: string
  bookingStatus: string
  issuedAt: string
  paymentTxHash?: string
  paymentExplorerUrl?: string
  refundTxHash?: string
  refundExplorerUrl?: string
  refundAmount?: string
  refundReason?: string
}

export default function SettingsPage() {
  const { status: sessionStatus } = useSession()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("account")

  const [accountProfile, setAccountProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
  })
  const [accountLoading, setAccountLoading] = useState(false)
  const [accountSaving, setAccountSaving] = useState(false)
  const [accountMessage, setAccountMessage] = useState<string | null>(null)
  const [accountError, setAccountError] = useState<string | null>(null)

  const [notifications, setNotifications] = useState({
    appointments: true,
    trials: true,
    insights: false
  })

  const [privacy, setPrivacy] = useState({
    shareData: false,
    location: true
  })

  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatusResponse | null>(null)
  const [integrationLoading, setIntegrationLoading] = useState(true)
  const [integrationError, setIntegrationError] = useState<string | null>(null)

  const [receiptLookup, setReceiptLookup] = useState({
    email: "",
    walletAddress: "",
  })
  const [receipts, setReceipts] = useState<BillingReceipt[]>([])
  const [receiptsLoading, setReceiptsLoading] = useState(false)
  const [receiptsError, setReceiptsError] = useState<string | null>(null)

  useEffect(() => {
    const requested = (searchParams.get("tab") || "").trim().toLowerCase()
    const allowed = new Set(["account", "notifications", "privacy", "preferences", "payments"])
    if (allowed.has(requested)) {
      setActiveTab(requested)
    }
  }, [searchParams])

  useEffect(() => {
    const loadIntegrationStatus = async () => {
      setIntegrationLoading(true)
      setIntegrationError(null)

      try {
        const response = await fetch("/api/base/integration-status")
        const data = await response.json()

        if (!response.ok || !data?.success) {
          throw new Error(data?.error || "Failed to load integration status")
        }

        setIntegrationStatus(data)
      } catch (error) {
        setIntegrationError(error instanceof Error ? error.message : "Failed to load integration status")
      } finally {
        setIntegrationLoading(false)
      }
    }

    loadIntegrationStatus()
  }, [])

  useEffect(() => {
    if (sessionStatus !== "authenticated") return

    const loadAccountProfile = async () => {
      setAccountLoading(true)
      setAccountError(null)

      try {
        const response = await fetch("/api/account/profile", { cache: "no-store" })
        const data = await response.json()
        if (!response.ok || !data?.success) {
          throw new Error(data?.error || "Failed to load account profile")
        }

        setAccountProfile({
          fullName: data.profile?.fullName || "",
          email: data.profile?.email || "",
          phone: data.profile?.phone || "",
          location: data.profile?.location || "",
        })
      } catch (error) {
        setAccountError(error instanceof Error ? error.message : "Failed to load profile")
      } finally {
        setAccountLoading(false)
      }
    }

    loadAccountProfile()
  }, [sessionStatus])

  const saveAccountProfile = async () => {
    setAccountMessage(null)
    setAccountError(null)

    if (!accountProfile.fullName.trim()) {
      setAccountError("Full name is required.")
      return
    }

    setAccountSaving(true)
    try {
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountProfile),
      })
      const data = await response.json()
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Failed to save account profile")
      }
      setAccountMessage("Saved successfully.")
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : "Failed to save profile")
    } finally {
      setAccountSaving(false)
    }
  }

  const loadReceipts = async () => {
    setReceiptsError(null)
    setReceipts([])

    if (!receiptLookup.email && !receiptLookup.walletAddress) {
      setReceiptsError("Enter email or wallet address to load receipts.")
      return
    }

    setReceiptsLoading(true)
    try {
      const params = new URLSearchParams()
      if (receiptLookup.email) params.set("email", receiptLookup.email)
      if (receiptLookup.walletAddress) params.set("walletAddress", receiptLookup.walletAddress)
      params.set("limit", "20")

      const response = await fetch(`/api/billing/receipts?${params.toString()}`)
      const data = await response.json()

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Failed to load receipts")
      }

      setReceipts(data.receipts || [])
    } catch (error) {
      setReceiptsError(error instanceof Error ? error.message : "Failed to load receipts")
    } finally {
      setReceiptsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 tracking-tight">Settings</h1>
          <p className="text-lg text-gray-600 leading-relaxed">Manage your account and preferences</p>
        </div>

        <FunctionAgentCTA
          agentId="account-manager"
          title="Account Manager Agent"
          prompt="Help me with Base sign-in, account management, and wallet recognition."
          className="mb-6"
        />

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start bg-white border border-gray-200 p-1">
            <TabsTrigger value="account" className="data-[state=active]:bg-gray-100">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-gray-100">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-gray-100">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-gray-100">
              <Globe className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-gray-100">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card className="p-6 border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>
              <div className="space-y-4">
                {accountError ? <p className="text-sm text-red-600">{accountError}</p> : null}
                {accountMessage ? <p className="text-sm text-emerald-600">{accountMessage}</p> : null}
                <div>
                  <Label htmlFor="name" className="text-sm text-gray-700">Full Name</Label>
                  <Input 
                    id="name"
                    placeholder="John Doe"
                    value={accountProfile.fullName}
                    onChange={(event) => {
                      setAccountMessage(null)
                      setAccountError(null)
                      setAccountProfile((prev) => ({ ...prev, fullName: event.target.value }))
                    }}
                    className="mt-1 border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                    disabled={accountLoading || sessionStatus !== "authenticated"}
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm text-gray-700">Email Address</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={accountProfile.email}
                    onChange={(event) => {
                      setAccountMessage(null)
                      setAccountError(null)
                      setAccountProfile((prev) => ({ ...prev, email: event.target.value }))
                    }}
                    className="mt-1 border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                    disabled={accountLoading || sessionStatus !== "authenticated"}
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm text-gray-700">Phone Number</Label>
                  <Input 
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={accountProfile.phone}
                    onChange={(event) => {
                      setAccountMessage(null)
                      setAccountError(null)
                      setAccountProfile((prev) => ({ ...prev, phone: event.target.value }))
                    }}
                    className="mt-1 border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                    disabled={accountLoading || sessionStatus !== "authenticated"}
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-sm text-gray-700">Location</Label>
                  <Input 
                    id="location"
                    placeholder="City, State"
                    value={accountProfile.location}
                    onChange={(event) => {
                      setAccountMessage(null)
                      setAccountError(null)
                      setAccountProfile((prev) => ({ ...prev, location: event.target.value }))
                    }}
                    className="mt-1 border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                    disabled={accountLoading || sessionStatus !== "authenticated"}
                  />
                </div>
                <Button
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={saveAccountProfile}
                  disabled={accountLoading || accountSaving || sessionStatus !== "authenticated"}
                >
                  {accountSaving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </Card>

            {/* Password Change */}
            <Card className="p-6 border-gray-100 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-password" className="text-sm text-gray-700">Current Password</Label>
                  <Input 
                    id="current-password"
                    type="password"
                    className="mt-1 border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="new-password" className="text-sm text-gray-700">New Password</Label>
                  <Input 
                    id="new-password"
                    type="password"
                    className="mt-1 border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password" className="text-sm text-gray-700">Confirm New Password</Label>
                  <Input 
                    id="confirm-password"
                    type="password"
                    className="mt-1 border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                  />
                </div>
                <Button variant="outline" className="border-gray-200">
                  Update Password
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="p-6 border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Appointment Reminders</h3>
                    <p className="text-sm text-gray-600 mt-1">Get notified about upcoming appointments</p>
                  </div>
                  <Switch 
                    checked={notifications.appointments}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, appointments: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Clinical Trial Updates</h3>
                    <p className="text-sm text-gray-600 mt-1">New trials matching your health profile</p>
                  </div>
                  <Switch 
                    checked={notifications.trials}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, trials: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Health Insights</h3>
                    <p className="text-sm text-gray-600 mt-1">Weekly health tips and recommendations</p>
                  </div>
                  <Switch 
                    checked={notifications.insights}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, insights: checked }))}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card className="p-6 border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Share Health Data</h3>
                    <p className="text-sm text-gray-600 mt-1">Contribute anonymized data for medical research</p>
                  </div>
                  <Switch 
                    checked={privacy.shareData}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, shareData: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Location Services</h3>
                    <p className="text-sm text-gray-600 mt-1">Find nearby providers and clinical trials</p>
                  </div>
                  <Switch 
                    checked={privacy.location}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, location: checked }))}
                  />
                </div>
              </div>
            </Card>

            {/* Data Management */}
            <Card className="p-6 border-gray-100 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Data Management</h2>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-between border-gray-200">
                  Download My Data
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between border-red-200 text-red-600 hover:bg-red-50">
                  Delete Account
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="p-6 border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Preferences</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="language" className="text-sm text-gray-700">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="language" className="mt-1 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone" className="text-sm text-gray-700">Time Zone</Label>
                  <Select defaultValue="pst">
                    <SelectTrigger id="timezone" className="mt-1 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                      <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                      <SelectItem value="cst">Central Time (CT)</SelectItem>
                      <SelectItem value="est">Eastern Time (ET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="units" className="text-sm text-gray-700">Measurement Units</Label>
                  <Select defaultValue="imperial">
                    <SelectTrigger id="units" className="mt-1 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imperial">Imperial (lb, ft)</SelectItem>
                      <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="p-6 border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment History</h2>
              <div className="space-y-5">
                <p className="text-sm text-gray-600">
                  Load Base receipts and refund status using the same email or wallet used for checkout.
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    placeholder="Email used for booking"
                    value={receiptLookup.email}
                    onChange={(event) => setReceiptLookup((prev) => ({ ...prev, email: event.target.value }))}
                    className="border-gray-200"
                  />
                  <Input
                    placeholder="Base wallet address (0x...)"
                    value={receiptLookup.walletAddress}
                    onChange={(event) => setReceiptLookup((prev) => ({ ...prev, walletAddress: event.target.value }))}
                    className="border-gray-200"
                  />
                </div>

                <Button
                  type="button"
                  onClick={loadReceipts}
                  disabled={receiptsLoading}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  {receiptsLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Load Receipts
                </Button>

                {receiptsError ? (
                  <p className="text-sm text-red-600">{receiptsError}</p>
                ) : null}

                {!receiptsLoading && receipts.length === 0 && !receiptsError ? (
                  <div className="text-center py-8 rounded-lg border border-dashed border-gray-200">
                    <CreditCard className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-600">No receipts found for the provided lookup.</p>
                  </div>
                ) : null}

                {receipts.length > 0 ? (
                  <div className="space-y-3">
                    {receipts.map((receipt) => (
                      <div key={receipt.receiptId} className="rounded-lg border border-gray-200 p-4 bg-white">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {receipt.amount} {receipt.currency}
                            </p>
                            <p className="text-xs text-gray-500">
                              Booking {receipt.bookingId} • {receipt.network}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                              {receipt.paymentStatus}
                            </span>
                            {receipt.refundTxHash ? (
                              <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                                REFUNDED
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-gray-600 space-y-1">
                          <p>Issued: {new Date(receipt.issuedAt).toLocaleString()}</p>
                          {receipt.paymentExplorerUrl ? (
                            <a
                              href={receipt.paymentExplorerUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              Payment tx
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : null}
                          {receipt.refundExplorerUrl ? (
                            <a
                              href={receipt.refundExplorerUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline ml-4"
                            >
                              Refund tx
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : null}
                          {receipt.refundReason ? (
                            <p className="text-red-600">
                              Refund reason: {receipt.refundReason}
                              {receipt.refundAmount ? ` (${receipt.refundAmount} ${receipt.currency})` : ""}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </Card>

            {/* Payment Methods */}
            <Card className="p-6 border-gray-100 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">$</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">USDC on Base</p>
                      <p className="text-sm text-gray-600">Pay with your crypto wallet</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">Active</span>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  All payments settle securely on Base blockchain
                </p>
              </div>
            </Card>

            <Card className="p-6 border-gray-100 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Base Integration Checklist</h2>
              <p className="text-sm text-gray-600 mb-4">
                Verifies sign-in, account management, billing, payment, and refund readiness.
              </p>

              {integrationLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking integration status...
                </div>
              ) : null}

              {integrationError ? (
                <p className="text-sm text-red-600">{integrationError}</p>
              ) : null}

              {!integrationLoading && integrationStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {integrationStatus.overallReady ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <p className="text-sm font-medium text-gray-900">
                      {integrationStatus.overallReady
                        ? "All required Base integration checks are complete."
                        : `${integrationStatus.missingRequired.length} required check(s) still missing.`}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {integrationStatus.sections.map((section) => (
                      <div key={section.id} className="rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          {section.ready ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <p className="text-sm font-semibold text-gray-900">{section.title}</p>
                        </div>
                        <div className="space-y-1">
                          {section.checks.map((check) => (
                            <div key={check.id} className="text-xs text-gray-600 flex items-start gap-2">
                              {check.passed ? (
                                <CheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 text-red-600 mt-0.5" />
                              )}
                              <span>
                                {check.label}
                                {check.env ? ` (${check.env})` : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sign Out */}
        <Card className="p-6 border-gray-100 mt-6">
          <Button variant="outline" className="w-full justify-center border-gray-200 text-gray-700 hover:bg-gray-50">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </Card>
      </main>
    </div>
  )
}
