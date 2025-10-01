"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import Link from "next/link"

interface Caregiver {
  id: string
  name: string
  specialty: string
  location: string
  hourlyRate: number
  rating: number
  reviewCount: number
}

export default function SimpleCaregiverSearch() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCaregivers() {
      try {
        const response = await fetch('/api/caregivers/search')
        const data = await response.json()
        
        if (data.success) {
          setCaregivers(data.results)
        } else {
          setError('Failed to load caregivers')
        }
      } catch (err) {
        setError('Network error')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCaregivers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Professional Caregivers
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with licensed, background-checked caregivers in your area
          </p>

          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading caregivers...</p>
            </div>
          )}

          {error && (
            <Card className="p-6 bg-red-50 border-red-200 mb-6">
              <p className="text-red-600">{error}</p>
            </Card>
          )}

          {!isLoading && !error && caregivers.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No caregivers found</p>
            </Card>
          )}

          {!isLoading && caregivers.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {caregivers.map((caregiver) => (
                <Card key={caregiver.id} className="p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {caregiver.name}
                  </h3>
                  <p className="text-gray-600 mb-2">{caregiver.specialty}</p>
                  <p className="text-sm text-gray-500 mb-4">{caregiver.location}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 font-medium">{caregiver.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">
                        ({caregiver.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      ${caregiver.hourlyRate}/hr
                    </div>
                  </div>

                  <Button className="w-full" asChild>
                    <Link href={`/providers/${caregiver.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </Card>
              ))}
            </div>
          )}

          <Card className="p-8 mt-12 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Are You a Professional Caregiver?
              </h2>
              <p className="text-gray-600 mb-6">
                Join our network of trusted caregivers and connect with families who need your help
              </p>
              <Button asChild size="lg">
                <Link href="/providers/caregiver-signup">
                  Apply to Join Our Network
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

