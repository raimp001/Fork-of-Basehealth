"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heart, UserPlus, Search, Star, Users, Clock, Shield, CheckCircle } from 'lucide-react'

export default function CaregiversPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-rose-100 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Caregiver Services</h1>
          </div>
          <p className="text-slate-600 max-w-2xl">
            Connect with our trusted network of professional caregivers or join as a caregiver yourself.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Main Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Find Caregivers - For Families */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-rose-300 bg-gradient-to-br from-rose-50 to-pink-50">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Find Caregivers</h2>
                    <p className="text-slate-600">Looking for professional care for your family?</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-rose-600" />
                    <span className="text-slate-700">Describe your care needs & schedule</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-rose-600" />
                    <span className="text-slate-700">Set your budget and timeline</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-rose-600" />
                    <span className="text-slate-700">Connect with qualified caregivers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-rose-600" />
                    <span className="text-slate-700">All caregivers background checked</span>
                  </div>
                </div>

                <Button 
                  asChild 
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white py-6 text-lg font-semibold group-hover:shadow-lg transition-all"
                >
                  <Link href="/providers/find-caregivers" className="flex items-center justify-center gap-2">
                    <Search className="h-5 w-5" />
                    Find Caregivers
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Become a Caregiver - For Professionals */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                    <UserPlus className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Become a Caregiver</h2>
                    <p className="text-slate-600">Join our network of professional caregivers</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="text-slate-700">Flexible scheduling & competitive pay</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-emerald-600" />
                    <span className="text-slate-700">Work with families in your area</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <span className="text-slate-700">Join our trusted professional community</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    <span className="text-slate-700">Professional certification verification</span>
                  </div>
                </div>

                <Button 
                  asChild 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg font-semibold group-hover:shadow-lg transition-all"
                >
                  <Link href="/providers/caregiver-signup" className="flex items-center justify-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Join as Caregiver
                  </Link>
                </Button>
              </div>
            </Card>
          </div>

          {/* Features Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-center text-slate-900 mb-8">
                Why Choose Our Caregiver Platform?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">Verified Professionals</h4>
                  <p className="text-slate-600 text-sm">All caregivers undergo thorough background checks and credential verification</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Star className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">Quality Care</h4>
                  <p className="text-slate-600 text-sm">Highly rated caregivers with excellent reviews from families</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">Compassionate Support</h4>
                  <p className="text-slate-600 text-sm">Dedicated to providing personalized, compassionate care for your loved ones</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 