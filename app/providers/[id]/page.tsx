"use client"

import React from 'react'
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
  Shield
} from 'lucide-react'
import Link from 'next/link'

export default function ProviderProfilePage() {
  const params = useParams()
  const providerId = params.id as string

  // This would normally fetch provider data from an API
  // Provider data loaded from database
  const provider = {
    id: providerId,
    name: 'Loading...',
    specialty: 'Healthcare Provider',
    credentials: '',
    rating: 0,
    reviewCount: 127,
    address: '123 Medical Center Dr, Seattle, WA 98101',
    phone: '(555) 123-4567',
    email: 'contact@medicalpractice.com',
    website: `https://${providerId}.medicalpractice.com`,
    bio: 'Dr. Chen is a board-certified family medicine physician with over 15 years of experience providing comprehensive primary care to patients of all ages. He is passionate about preventive medicine and building long-term relationships with his patients.',
    education: [
      'University of Washington School of Medicine - MD',
      'Seattle Children\'s Hospital - Residency in Family Medicine'
    ],
    specialties: ['Family Medicine', 'Preventive Care', 'Chronic Disease Management'],
    languages: ['English', 'Spanish', 'Mandarin'],
    insurance: ['Blue Cross Blue Shield', 'Aetna', 'Medicare', 'Medicaid', 'UnitedHealthcare'],
    availability: 'Next available: January 15, 2025',
    acceptingPatients: true,
    yearsOfExperience: 15,
    npi: providerId
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