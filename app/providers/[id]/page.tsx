"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Calendar, 
  Award, 
  Clock, 
  Users,
  ArrowLeft,
  Mail,
  Shield,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface ProviderData {
  id: string
  name: string
  specialty: string
  credentials: string
  rating: number
  reviewCount: number
  address: string
  phone: string
  email: string
  website: string
  bio: string
  education: string[]
  specialties: string[]
  languages: string[]
  insurance: string[]
  availability: string
  acceptingPatients: boolean
  yearsOfExperience: number
  npi: string
}

export default function ProviderProfilePage() {
  const params = useParams()
  const providerId = params.id as string
  
  const [provider, setProvider] = useState<ProviderData>({
    id: providerId,
    name: 'Loading...',
    specialty: '',
    credentials: '',
    rating: 0,
    reviewCount: 0,
    address: '',
    phone: '',
    email: '',
    website: '',
    bio: '',
    education: [],
    specialties: [],
    languages: ['English'],
    insurance: [],
    availability: '',
    acceptingPatients: true,
    yearsOfExperience: 0,
    npi: providerId
  })
  
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchProvider() {
      try {
        const response = await fetch(`/api/providers/${providerId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.provider) {
            const p = data.provider
            setProvider({
              id: p.id || providerId,
              name: p.name || 'Provider',
              specialty: p.specialty || 'Healthcare Provider',
              credentials: Array.isArray(p.credentials) ? p.credentials.join(', ') : (p.credentials || ''),
              rating: p.rating || 0,
              reviewCount: p.reviewCount || 0,
              address: typeof p.address === 'object' 
                ? `${p.address.street || ''}, ${p.address.city || ''}, ${p.address.state || ''} ${p.address.zipCode || ''}`.replace(/^, |, $/g, '')
                : (p.address || ''),
              phone: p.phone || '',
              email: p.email || '',
              website: p.website || '',
              bio: p.bio || '',
              education: p.education || [],
              specialties: p.services || p.specialties || [p.specialty].filter(Boolean),
              languages: p.languages || ['English'],
              insurance: p.acceptedInsurance || [],
              availability: p.availability?.days?.join(', ') || '',
              acceptingPatients: p.acceptingPatients !== false,
              yearsOfExperience: p.yearsOfExperience || 0,
              npi: p.npiNumber || providerId
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch provider:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProvider()
  }, [providerId])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading provider information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/providers/search" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Search
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Provider Profile</h1>
              <p className="text-slate-600">Complete information and contact details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Overview */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="w-24 h-24 bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-100 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-slate-700">
                      {provider.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>

                  {/* Provider Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">{provider.name}</h2>
                        <p className="text-xl text-sky-600 font-medium mb-2">{provider.specialty}</p>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 border border-slate-300">
                          {provider.credentials}
                        </Badge>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg">
                        <Star className="h-5 w-5 text-amber-500 fill-current" />
                        <span className="font-bold text-amber-700 text-lg">{provider.rating}</span>
                        <span className="text-amber-600">({provider.reviewCount} reviews)</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={provider.acceptingPatients ? "default" : "secondary"}
                        className={`px-4 py-2 text-sm font-semibold ${
                          provider.acceptingPatients 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' 
                            : 'bg-slate-50 text-slate-700 border border-slate-300'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full mr-2 ${provider.acceptingPatients ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                        {provider.acceptingPatients ? 'Accepting New Patients' : 'Not Accepting Patients'}
                      </Badge>
                      <span className="text-sm text-slate-600">{provider.yearsOfExperience} years of experience</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>About {provider.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">{provider.bio}</p>
              </CardContent>
            </Card>

            {/* Education & Training */}
            <Card>
              <CardHeader>
                <CardTitle>Education & Training</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {provider.education.map((edu, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-sky-500" />
                      <span className="text-slate-700">{edu}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Specialties & Services */}
            <Card>
              <CardHeader>
                <CardTitle>Specialties & Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {provider.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Details */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-slate-500" />
                  <span className="text-slate-700">{provider.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-slate-500" />
                  <a href={`tel:${provider.phone}`} className="text-sky-600 hover:text-sky-800">
                    {provider.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <a href={`mailto:${provider.email}`} className="text-sky-600 hover:text-sky-800">
                    {provider.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-slate-500" />
                  <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-800">
                    Visit Website
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-5 w-5 text-slate-500" />
                  <span className="text-slate-700">{provider.availability}</span>
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/appointment/book?providerId=${provider.id}`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Languages Spoken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {provider.languages.map((language, index) => (
                    <Badge key={index} variant="outline">
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Insurance */}
            <Card>
              <CardHeader>
                <CardTitle>Accepted Insurance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {provider.insurance.map((ins, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700 text-sm">{ins}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Provider ID */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  <p><strong>NPI Number:</strong> {provider.npi}</p>
                  <p><strong>Provider ID:</strong> {provider.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 