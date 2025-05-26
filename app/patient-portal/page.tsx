import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Activity, Calendar, FileText, Database } from "lucide-react"

export default function PatientPortalPage() {
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
          <Link href="/patient-portal" className="text-indigo-600 font-medium">
            Patient Portal
          </Link>
          <Link href="/settings" className="text-gray-700 hover:text-indigo-600 transition-colors">
            Settings
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="text-gray-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Patient Portal</h1>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Health Profile */}
            <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold">Health Profile</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Manage your personal health information and medical history.
              </p>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                View Profile
              </Button>
            </div>

            {/* AI Screening */}
            <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Activity className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold">AI Screening</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Get personalized health screenings powered by AI.
              </p>
              <Button asChild variant="outline" className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                <Link href="/screening">Start Screening</Link>
              </Button>
            </div>

            {/* Appointments */}
            <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold">Appointments</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Schedule and manage your healthcare appointments.
              </p>
              <Button variant="outline" className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                Book Appointment
              </Button>
            </div>

            {/* Medical Records */}
            <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold">Medical Records</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Access your complete medical records and test results.
              </p>
              <Button variant="outline" className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                View Records
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 bg-gray-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/second-opinion">Get Second Opinion</Link>
              </Button>
              <Button asChild variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                <Link href="/providers/signup">Find a Provider</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 