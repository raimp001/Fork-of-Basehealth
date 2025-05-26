"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search, MapPin, Star, Calendar, Phone, Globe, Filter } from "lucide-react"
import { useState } from "react"

export default function ProviderSearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")

  const specialties = [
    "Primary Care",
    "Cardiology", 
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Oncology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Surgery"
  ]

  const providers = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      rating: 4.9,
      reviews: 127,
      location: "San Francisco, CA",
      distance: "2.3 miles",
      hospital: "UCSF Medical Center",
      acceptingPatients: true,
      nextAvailable: "Tomorrow",
      image: "/api/placeholder/80/80",
      phone: "(415) 555-0123",
      languages: ["English", "Spanish"]
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Primary Care",
      rating: 4.8,
      reviews: 89,
      location: "San Francisco, CA", 
      distance: "1.8 miles",
      hospital: "Kaiser Permanente",
      acceptingPatients: true,
      nextAvailable: "Next week",
      image: "/api/placeholder/80/80",
      phone: "(415) 555-0124",
      languages: ["English", "Mandarin"]
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialty: "Dermatology",
      rating: 4.7,
      reviews: 156,
      location: "Palo Alto, CA",
      distance: "12.5 miles", 
      hospital: "Stanford Health Care",
      acceptingPatients: false,
      nextAvailable: "2 weeks",
      image: "/api/placeholder/80/80",
      phone: "(650) 555-0125",
      languages: ["English", "Spanish"]
    },
    {
      id: 4,
      name: "Dr. David Kim",
      specialty: "Orthopedics",
      rating: 4.9,
      reviews: 203,
      location: "San Jose, CA",
      distance: "25.1 miles",
      hospital: "Santa Clara Valley Medical Center",
      acceptingPatients: true,
      nextAvailable: "This week",
      image: "/api/placeholder/80/80",
      phone: "(408) 555-0126",
      languages: ["English", "Korean"]
    }
  ]

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = searchQuery === "" || 
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.hospital.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSpecialty = selectedSpecialty === "" || provider.specialty === selectedSpecialty
    const matchesLocation = selectedLocation === "" || provider.location.includes(selectedLocation)
    
    return matchesSearch && matchesSpecialty && matchesLocation
  })

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
            <h1 className="text-4xl font-bold text-gray-900">Find a Provider</h1>
          </div>

          {/* Search and Filters */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search providers, specialties..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Specialty Filter */}
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                aria-label="Select specialty"
              >
                <option value="">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>

              {/* Location Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="City, State"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                />
              </div>

              {/* Search Button */}
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Found <strong>{filteredProviders.length}</strong> providers
              {selectedSpecialty && ` in ${selectedSpecialty}`}
              {selectedLocation && ` near ${selectedLocation}`}
            </p>
            <Button variant="outline" className="border-gray-300">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Provider Cards */}
          <div className="space-y-6">
            {filteredProviders.map((provider) => (
              <div key={provider.id} className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-6">
                  {/* Provider Image */}
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">
                      {provider.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>

                  {/* Provider Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{provider.name}</h3>
                        <p className="text-indigo-600 font-medium">{provider.specialty}</p>
                        <p className="text-gray-600">{provider.hospital}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{provider.rating}</span>
                          <span className="text-gray-500">({provider.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{provider.distance}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">{provider.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Next Available</p>
                        <p className="font-medium">{provider.nextAvailable}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Languages</p>
                        <p className="font-medium">{provider.languages.join(', ')}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          provider.acceptingPatients 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {provider.acceptingPatients ? 'Accepting Patients' : 'Not Accepting'}
                        </span>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{provider.phone}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                          <Globe className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                        <Button 
                          className="bg-indigo-600 hover:bg-indigo-700"
                          disabled={!provider.acceptingPatients}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Appointment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProviders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No providers found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your search filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
