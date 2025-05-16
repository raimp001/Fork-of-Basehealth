"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Search, Calendar, MessageSquare, Stethoscope, Shield, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomeClient() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Healthcare AI Assistant</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Your personal healthcare companion powered by AI and blockchain technology
          </p>
          <div className="flex gap-4 mt-6">
            <Button asChild>
              <Link href="/chat">Get Started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/screening">Take Health Assessment</Link>
            </Button>
          </div>
        </div>
      </section>

      <Tabs defaultValue="overview" className="mb-12" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Health Monitoring</CardTitle>
                <CardDescription>Track your health metrics and receive personalized insights</CardDescription>
              </CardHeader>
              <CardContent>
                Monitor vital signs, medication adherence, and health goals with our AI-powered dashboard.
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <Link href="/health/dashboard">
                    View Dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Provider Search</CardTitle>
                <CardDescription>Find healthcare providers that meet your specific needs</CardDescription>
              </CardHeader>
              <CardContent>
                Search for providers by specialty, location, and availability with our enhanced search tools.
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <Link href="/providers/search">
                    Find Providers <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Appointments</CardTitle>
                <CardDescription>Schedule and manage your healthcare appointments</CardDescription>
              </CardHeader>
              <CardContent>
                Book appointments, receive reminders, and manage your healthcare schedule in one place.
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <Link href="/appointment/request">
                    Request Appointment <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Health Assistant</CardTitle>
                <CardDescription>Get answers to your health questions from our AI assistant</CardDescription>
              </CardHeader>
              <CardContent>
                Our AI assistant can answer questions, provide health information, and guide you to appropriate
                resources.
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <Link href="/chat">
                    Chat Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Health Screening</CardTitle>
                <CardDescription>Take assessments to identify potential health concerns</CardDescription>
              </CardHeader>
              <CardContent>
                Complete health screenings and receive personalized recommendations based on your results.
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <Link href="/screening">
                    Start Screening <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure Health Records</CardTitle>
                <CardDescription>Access and manage your health records securely</CardDescription>
              </CardHeader>
              <CardContent>
                View, share, and manage your health records with blockchain-secured privacy and control.
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <Link href="/health/records">
                    View Records <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blockchain">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Integration</CardTitle>
                <CardDescription>Secure, transparent healthcare powered by blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Our platform leverages blockchain technology to provide:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Secure and private health data storage</li>
                  <li>Transparent payment processing</li>
                  <li>Verifiable provider credentials</li>
                  <li>Immutable health records</li>
                  <li>Patient-controlled data sharing</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <Link href="/wallet">
                    Connect Wallet <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Blockchain Provider Network</CardTitle>
                <CardDescription>Find providers in our blockchain-verified network</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Benefits of our blockchain provider network:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Verified provider credentials</li>
                  <li>Transparent pricing</li>
                  <li>Secure payment options</li>
                  <li>Smart contract appointments</li>
                  <li>Decentralized provider reviews</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <Link href="/providers/blockchain-search">
                    Find Blockchain Providers <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <section className="mb-12">
        <div className="bg-muted p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Get Started Today</h2>
          <p className="mb-6">Take control of your healthcare journey with our AI-powered platform.</p>
          <Button asChild>
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
