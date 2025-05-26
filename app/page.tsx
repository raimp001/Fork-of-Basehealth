import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            basehealth.xyz
          </Link>
        </div>
        <nav className="flex items-center gap-8">
          <Link href="/research" className="text-gray-700 hover:text-indigo-600 transition-colors">
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
      <main className="flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to{" "}
            <span className="text-indigo-600">basehealth.xyz</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Personalized health starts here. Evidence-based screenings. Expert second opinions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg rounded-lg font-medium transition-colors"
            >
              <Link href="/screening" className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Start AI Screening
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg rounded-lg font-medium transition-colors"
            >
              <Link href="/second-opinion" className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Get Second Opinion
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
