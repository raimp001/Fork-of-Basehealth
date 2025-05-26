"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Search, Filter, Clock, Users, Database } from "lucide-react"
import { useState, useEffect } from "react"

interface ClinicalTrial {
  id: string
  title: string
  condition: string
  phase: string
  location: string
  distance: number
  sponsor: string
  status: string
  description: string
  eligibility: string[]
  estimatedEnrollment: number
  studyType: string
}

export default function ClinicalTrialsPage() {
  const [location, setLocation] = useState<string>("")
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [trials, setTrials] = useState<ClinicalTrial[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCondition, setSelectedCondition] = useState("")

  // Mock clinical trials data - in real app, this would come from ClinicalTrials.gov API
  const mockTrials: ClinicalTrial[] = [
    {
      id: "NCT05123456",
      title: "AI-Powered Diabetes Management Study",
      condition: "Type 2 Diabetes",
      phase: "Phase III",
      location: "Stanford Medical Center, CA",
      distance: 2.3,
      sponsor: "Stanford University",
      status: "Recruiting",
      description: "Evaluating the effectiveness of AI-powered glucose monitoring and management system.",
      eligibility: ["Age 18-65", "Type 2 Diabetes diagnosis", "HbA1c 7-10%"],
      estimatedEnrollment: 200,
      studyType: "Interventional"
    },
    {
      id: "NCT05234567",
      title: "Cardiovascular Health Monitoring with Wearables",
      condition: "Cardiovascular Disease",
      phase: "Phase II",
      location: "UCSF Medical Center, CA",
      distance: 5.7,
      sponsor: "University of California",
      status: "Recruiting",
      description: "Testing continuous heart monitoring using advanced wearable technology.",
      eligibility: ["Age 40-75", "History of heart disease", "Able to wear devices"],
      estimatedEnrollment: 150,
      studyType: "Observational"
    },
    {
      id: "NCT05345678",
      title: "Mental Health AI Screening Platform",
      condition: "Depression",
      phase: "Phase I",
      location: "Kaiser Permanente, CA",
      distance: 8.1,
      sponsor: "Kaiser Foundation",
      status: "Not yet recruiting",
      description: "Developing AI-based screening tools for early detection of depression.",
      eligibility: ["Age 21-60", "No current antidepressants", "Smartphone access"],
      estimatedEnrollment: 100,
      studyType: "Interventional"
    }
  ]

  useEffect(() => {
    setTrials(mockTrials)
  }, [])

  const getLocation = async () => {
    setIsLoadingLocation(true)
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            // In real app, use reverse geocoding API
            setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`)
            setIsLoadingLocation(false)
          },
          (error) => {
            console.error("Error getting location:", error)
            setLocation("Location access denied")
            setIsLoadingLocation(false)
          }
        )
      } else {
        setLocation("Geolocation not supported")
        setIsLoadingLocation(false)
      }
    } catch (error) {
      console.error("Location error:", error)
      setIsLoadingLocation(false)
    }
  }

  const filteredTrials = trials.filter(trial => {
    const matchesSearch = trial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trial.condition.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCondition = selectedCondition === "" || trial.condition === selectedCondition
    return matchesSearch && matchesCondition
  })

  const conditions = [...new Set(trials.map(trial => trial.condition))]

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
          <Link href="/settings" className="text-gray-700 hover:text-indigo-600 transition-colors">
            Settings
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/patient-portal" className="text-gray-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Clinical Trials Near You</h1>
          </div>

          {/* Location and Search Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-600" />
                <span className="text-gray-700">Location:</span>
                <span className="font-medium text-gray-900">
                  {location || "Not detected"}
                </span>
              </div>
              <Button 
                onClick={getLocation}
                disabled={isLoadingLocation}
                variant="outline"
                className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
              >
                {isLoadingLocation ? "Detecting..." : "Detect Location"}
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search trials by condition or keyword..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                aria-label="Filter by medical condition"
              >
                <option value="">All Conditions</option>
                {conditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clinical Trials List */}
          <div className="space-y-6">
            {filteredTrials.map((trial) => (
              <div key={trial.id} className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{trial.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{trial.phase}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">{trial.status}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {trial.distance} miles away
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Study ID</p>
                    <p className="font-mono text-sm">{trial.id}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{trial.description}</p>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Key Details</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Condition:</strong> {trial.condition}</li>
                      <li><strong>Location:</strong> {trial.location}</li>
                      <li><strong>Sponsor:</strong> {trial.sponsor}</li>
                      <li><strong>Enrollment:</strong> {trial.estimatedEnrollment} participants</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Eligibility Criteria</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {trial.eligibility.map((criteria, index) => (
                        <li key={index}>• {criteria}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Learn More
                  </Button>
                  <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                    Check Eligibility
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredTrials.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No clinical trials found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your search terms or location.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 