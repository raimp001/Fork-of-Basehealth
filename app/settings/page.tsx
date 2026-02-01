"use client"

import { useState } from "react"
import Link from "next/link"
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
  Clock
} from "lucide-react"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    appointments: true,
    trials: true,
    insights: false
  })

  const [privacy, setPrivacy] = useState({
    shareData: false,
    location: true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 tracking-tight">Settings</h1>
          <p className="text-lg text-gray-600 leading-relaxed">Manage your account and preferences</p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="account" className="space-y-6">
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
                <div>
                  <Label htmlFor="name" className="text-sm text-gray-700">Full Name</Label>
                  <Input 
                    id="name"
                    placeholder="John Doe"
                    className="mt-1 border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm text-gray-700">Email Address</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="mt-1 border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm text-gray-700">Phone Number</Label>
                  <Input 
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="mt-1 border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-sm text-gray-700">Location</Label>
                  <Input 
                    id="location"
                    placeholder="City, State"
                    className="mt-1 border-gray-200 focus:border-gray-400 focus:ring-gray-100"
                  />
                </div>
                <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                  Save Changes
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
              <div className="space-y-4">
                {/* Empty state */}
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-medium text-gray-900 mb-1">No payments yet</h3>
                  <p className="text-sm text-gray-600">
                    Your payment history will appear here after you book and pay for services.
                  </p>
                </div>
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