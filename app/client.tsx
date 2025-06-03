"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Activity, Search, Calendar, MessageSquare, Stethoscope, Shield, ArrowRight, Heart, Users, Zap, Star, CheckCircle, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomeClient() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative">
        {/* Enhanced Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-indigo-200/50 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  BaseHealth
                </h1>
                <Badge variant="secondary" className="ml-3 bg-indigo-100 text-indigo-700 border-indigo-200">
                  AI-Powered Healthcare
                </Badge>
              </div>
              <nav className="flex items-center gap-6">
                <Button variant="ghost" asChild className="text-gray-700 hover:text-indigo-600">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                  <Link href="/register">Get Started</Link>
                </Button>
              </nav>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <section className="mb-16">
            <div className="flex flex-col items-center text-center mb-12">
              <div className="mb-6">
                <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Next-Generation Healthcare
                </Badge>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
                  Healthcare AI Assistant
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                  Your personal healthcare companion powered by AI and blockchain technology. 
                  Experience the future of healthcare with personalized insights, secure data, and 
                  seamless provider connections.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" asChild className="h-14 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl text-lg">
                  <Link href="/chat" className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Start AI Consultation
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="h-14 px-8 border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 shadow-lg text-lg">
                  <Link href="/screening" className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Take Health Assessment
                  </Link>
                </Button>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
                <div className="text-center p-4 bg-white/40 backdrop-blur-sm rounded-lg border border-white/20">
                  <div className="text-2xl font-bold text-indigo-600">10K+</div>
                  <div className="text-sm text-gray-600">Patients Served</div>
                </div>
                <div className="text-center p-4 bg-white/40 backdrop-blur-sm rounded-lg border border-white/20">
                  <div className="text-2xl font-bold text-green-600">500+</div>
                  <div className="text-sm text-gray-600">Verified Providers</div>
                </div>
                <div className="text-center p-4 bg-white/40 backdrop-blur-sm rounded-lg border border-white/20">
                  <div className="text-2xl font-bold text-purple-600">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
              </div>
            </div>
          </section>

          {/* Enhanced Tabs Section */}
          <Tabs defaultValue="overview" className="mb-16" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-8 h-14 bg-white/60 backdrop-blur-sm p-1 shadow-lg border-0">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white h-12 font-medium text-lg">
                Overview
              </TabsTrigger>
              <TabsTrigger value="features" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white h-12 font-medium text-lg">
                Features
              </TabsTrigger>
              <TabsTrigger value="blockchain" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white h-12 font-medium text-lg">
                Blockchain
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <CardHeader className="pb-4">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                      <Activity className="h-8 w-8 text-indigo-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">Health Monitoring</CardTitle>
                    <CardDescription className="text-gray-600">
                      Track your health metrics and receive personalized insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Monitor vital signs, medication adherence, and health goals with our AI-powered dashboard 
                      that provides real-time insights and recommendations.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-0" asChild>
                      <Link href="/health/dashboard">
                        View Dashboard <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <CardHeader className="pb-4">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-emerald-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">Provider Search</CardTitle>
                    <CardDescription className="text-gray-600">
                      Find healthcare providers that meet your specific needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Search for providers by specialty, location, and availability with our enhanced AI-powered 
                      search tools and verified provider network.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-0" asChild>
                      <Link href="/providers/search">
                        Find Providers <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <CardHeader className="pb-4">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                      <Calendar className="h-8 w-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">Appointments</CardTitle>
                    <CardDescription className="text-gray-600">
                      Schedule and manage your healthcare appointments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Book appointments, receive reminders, and manage your healthcare schedule in one place 
                      with seamless integration and smart notifications.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-0" asChild>
                      <Link href="/appointment/request">
                        Request Appointment <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="features">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <CardHeader className="pb-4">
                    <div className="bg-gradient-to-br from-orange-100 to-red-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">AI Health Assistant</CardTitle>
                    <CardDescription className="text-gray-600">
                      Get answers to your health questions from our AI assistant
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Our advanced AI assistant can answer questions, provide health information, symptom analysis, 
                      and guide you to appropriate resources with medical accuracy.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-0" asChild>
                      <Link href="/chat">
                        Chat Now <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <CardHeader className="pb-4">
                    <div className="bg-gradient-to-br from-teal-100 to-cyan-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                      <Stethoscope className="h-8 w-8 text-teal-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">Health Screening</CardTitle>
                    <CardDescription className="text-gray-600">
                      Take assessments to identify potential health concerns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Complete comprehensive health screenings based on USPSTF guidelines and receive 
                      personalized recommendations based on your results and risk factors.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 p-0" asChild>
                      <Link href="/screening">
                        Start Screening <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <CardHeader className="pb-4">
                    <div className="bg-gradient-to-br from-rose-100 to-pink-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                      <Shield className="h-8 w-8 text-rose-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">Secure Health Records</CardTitle>
                    <CardDescription className="text-gray-600">
                      Access and manage your health records securely
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      View, share, and manage your health records with blockchain-secured privacy, 
                      HIPAA compliance, and complete control over your medical data.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-0" asChild>
                      <Link href="/medical-records">
                        View Records <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="blockchain">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-12 h-12 rounded-lg flex items-center justify-center">
                        <Zap className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Blockchain Integration</CardTitle>
                        <CardDescription className="text-gray-600">
                          Secure, transparent healthcare powered by blockchain
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-6 text-gray-700">Our platform leverages cutting-edge blockchain technology to provide:</p>
                    <ul className="space-y-3">
                      {[
                        "Secure and private health data storage",
                        "Transparent payment processing",
                        "Verifiable provider credentials",
                        "Immutable health records",
                        "Patient-controlled data sharing"
                      ].map((item, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-0" asChild>
                      <Link href="/wallet">
                        Connect Wallet <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-green-100 to-teal-100 w-12 h-12 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Blockchain Provider Network</CardTitle>
                        <CardDescription className="text-gray-600">
                          Find providers in our blockchain-verified network
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-6 text-gray-700">Benefits of our blockchain provider network:</p>
                    <ul className="space-y-3">
                      {[
                        "Verified credentials and licenses",
                        "Transparent payment options",
                        "Secure appointment booking",
                        "Cryptocurrency payment support",
                        "Real-time availability updates"
                      ].map((item, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <Star className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 p-0" asChild>
                      <Link href="/providers/blockchain-search">
                        Find Providers <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Trust Indicators */}
          <section className="text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Trusted by Healthcare Professionals</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">HIPAA Compliant</p>
                </div>
                <div className="text-center">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">SOC 2 Certified</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">FDA Cleared</p>
                </div>
                <div className="text-center">
                  <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">AI Powered</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
