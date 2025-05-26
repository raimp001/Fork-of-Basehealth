import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Bell, Shield, Globe, Database } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="flex items-center justify-between px-8 py-6 border-b">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            basehealth.xyz
          </Link>
        </div>
        <nav className="flex items-center gap-8">
          <Button 
            asChild 
            variant="ghost" 
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium"
          >
            <a href="https://healthdb.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              healthdb.ai
            </a>
          </Button>
          <Link href="/patient-portal" className="text-gray-700 hover:text-indigo-600 transition-colors">
            Patient Portal
          </Link>
          <Link href="/settings" className="text-indigo-600 font-medium">
            Settings
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="text-gray-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
          </div>

          <div className="space-y-6">
            {/* Account Settings */}
            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold">Account Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="City, State or ZIP code"
                  />
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Bell className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold">Notifications</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Clinical Trial Alerts</h3>
                    <p className="text-sm text-gray-600">Get notified about new trials matching your conditions</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded" defaultChecked aria-label="Clinical trial alerts" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Appointment Reminders</h3>
                    <p className="text-sm text-gray-600">Receive reminders for upcoming appointments</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded" defaultChecked aria-label="Appointment reminders" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Health Insights</h3>
                    <p className="text-sm text-gray-600">Weekly health tips and insights</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded" aria-label="Health insights" />
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold">Privacy & Security</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Share Data with healthdb.ai</h3>
                    <p className="text-sm text-gray-600">Contribute anonymized health data for research</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded" aria-label="Share data with healthdb.ai" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Location Services</h3>
                    <p className="text-sm text-gray-600">Allow location access for nearby clinical trials</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded" defaultChecked aria-label="Location services" />
                </div>
                <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
                  Delete Account
                </Button>
              </div>
            </div>

            {/* Language & Region */}
            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Globe className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold">Language & Region</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" aria-label="Language selection">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" aria-label="Time zone selection">
                    <option>Pacific Time (PT)</option>
                    <option>Mountain Time (MT)</option>
                    <option>Central Time (CT)</option>
                    <option>Eastern Time (ET)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 