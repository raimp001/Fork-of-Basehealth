import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Bell, Shield, Globe, Database, Heart } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-healthcare-hero">
      {/* Header Navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-cyan-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent hover:from-sky-700 hover:to-cyan-700 transition-all duration-200">
                  BaseHealth
                </Link>
                <span className="text-sm text-gray-500 font-medium">Settings</span>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <Button 
                asChild 
                variant="ghost" 
                className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 font-medium"
              >
                <a href="https://healthdb.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  healthdb.ai
                </a>
              </Button>
              <Link 
                href="/patient-portal" 
                className="text-gray-700 hover:text-sky-600 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Patient Portal
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-lg">
                <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                <span className="text-sm font-medium text-sky-700">Settings</span>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="text-gray-500 hover:text-sky-600 transition-colors group">
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">Settings</h1>
          </div>

          <div className="space-y-6">
            {/* Account Settings */}
            <div className="healthcare-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-sky-100 rounded-lg">
                  <User className="h-6 w-6 text-sky-600" />
                </div>
                <h2 className="text-xl font-semibold">Account Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder="City, State or ZIP code"
                  />
                </div>
                <Button className="bg-healthcare-primary hover:bg-sky-700 text-white">
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="healthcare-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Bell className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold">Notifications</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Clinical Trial Alerts</h3>
                    <p className="text-sm text-gray-600">Get notified about new trials matching your conditions</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-sky-600 rounded focus:ring-sky-500" defaultChecked aria-label="Clinical trial alerts" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Appointment Reminders</h3>
                    <p className="text-sm text-gray-600">Receive reminders for upcoming appointments</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-sky-600 rounded focus:ring-sky-500" defaultChecked aria-label="Appointment reminders" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Health Insights</h3>
                    <p className="text-sm text-gray-600">Weekly health tips and insights</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-sky-600 rounded focus:ring-sky-500" aria-label="Health insights" />
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="healthcare-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Shield className="h-6 w-6 text-violet-600" />
                </div>
                <h2 className="text-xl font-semibold">Privacy & Security</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Share Data with healthdb.ai</h3>
                    <p className="text-sm text-gray-600">Contribute anonymized health data for research</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-sky-600 rounded focus:ring-sky-500" aria-label="Share data with healthdb.ai" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Location Services</h3>
                    <p className="text-sm text-gray-600">Allow location access for nearby clinical trials</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-sky-600 rounded focus:ring-sky-500" defaultChecked aria-label="Location services" />
                </div>
                <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
                  Delete Account
                </Button>
              </div>
            </div>

            {/* Language & Region */}
            <div className="healthcare-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Globe className="h-6 w-6 text-cyan-600" />
                </div>
                <h2 className="text-xl font-semibold">Language & Region</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors" aria-label="Language selection">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors" aria-label="Time zone selection">
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