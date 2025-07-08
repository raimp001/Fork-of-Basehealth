import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, Database, User, Shield, Bell, Lock, CreditCard, Users, Mail, Phone, Globe, MapPin, Calendar, Activity } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Clean Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-slate-700" />
              </div>
              <Link href="/" className="text-2xl font-bold text-slate-900 hover:text-slate-700 transition-all duration-200">
                BaseHealth
              </Link>
            </div>

            <nav className="flex items-center gap-6">
              <Button 
                asChild 
                variant="ghost" 
                className="text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium px-4 py-2 rounded-lg transition-all duration-200"
              >
                <a href="https://healthdb.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  HealthDB.ai
                </a>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                <Link href="/patient-portal" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient Portal
                </Link>
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Settings</span>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="text-slate-500 hover:text-slate-700 transition-colors group">
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
            </Link>
            <h1 className="text-4xl font-bold text-slate-900">Settings</h1>
          </div>

          <div className="space-y-6">
            {/* Account Settings */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <User className="h-6 w-6 text-slate-700" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Account Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-slate-900"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-slate-900"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-slate-900"
                    placeholder="City, State or ZIP code"
                  />
                </div>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Bell className="h-6 w-6 text-slate-700" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="font-medium text-slate-900">Clinical Trial Alerts</h3>
                    <p className="text-sm text-slate-600">Get notified about new trials matching your conditions</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-slate-600 rounded focus:ring-slate-500" defaultChecked aria-label="Clinical trial alerts" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="font-medium text-slate-900">Appointment Reminders</h3>
                    <p className="text-sm text-slate-600">Receive reminders for upcoming appointments</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-slate-600 rounded focus:ring-slate-500" defaultChecked aria-label="Appointment reminders" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="font-medium text-slate-900">Health Insights</h3>
                    <p className="text-sm text-slate-600">Weekly health tips and insights</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-slate-600 rounded focus:ring-slate-500" aria-label="Health insights" />
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Shield className="h-6 w-6 text-slate-700" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Privacy & Security</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="font-medium text-slate-900">Share Data with healthdb.ai</h3>
                    <p className="text-sm text-slate-600">Contribute anonymized health data for research</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-slate-600 rounded focus:ring-slate-500" aria-label="Share data with healthdb.ai" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="font-medium text-slate-900">Location Services</h3>
                    <p className="text-sm text-slate-600">Allow location access for nearby clinical trials</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-slate-600 rounded focus:ring-slate-500" defaultChecked aria-label="Location services" />
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 px-6 py-2.5 rounded-lg font-medium transition-colors">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>

            {/* Language & Region */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Globe className="h-6 w-6 text-slate-700" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Language & Region</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                  <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-slate-900" aria-label="Language selection">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time Zone</label>
                  <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-slate-900" aria-label="Time zone selection">
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