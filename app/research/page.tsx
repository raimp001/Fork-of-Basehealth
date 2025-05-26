import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FlaskConical, BarChart3, Users } from "lucide-react"

export default function ResearchPage() {
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
          <Link href="/research" className="text-indigo-600 font-medium">
            Research
          </Link>
          <Link href="/patient-portal" className="text-gray-700 hover:text-indigo-600 transition-colors">
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
            <h1 className="text-4xl font-bold text-gray-900">Research Portal</h1>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Research Analytics */}
            <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Access comprehensive health data analytics and research insights.
              </p>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                View Analytics
              </Button>
            </div>

            {/* Clinical Studies */}
            <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FlaskConical className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold">Clinical Studies</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Participate in or manage ongoing clinical research studies.
              </p>
              <Button variant="outline" className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                Browse Studies
              </Button>
            </div>

            {/* Researcher Network */}
            <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold">Researcher Network</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Connect with other researchers and collaborate on projects.
              </p>
              <Button variant="outline" className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                Join Network
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 