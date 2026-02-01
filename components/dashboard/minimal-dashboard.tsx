"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, MessageSquare, Search, Stethoscope, User } from "lucide-react"
import Link from "next/link"

export function MinimalDashboard() {
  // In production, these would come from the authenticated user's session
  const upcomingAppointments: {
    id: string
    providerName: string
    specialty: string
    dateTime: string
  }[] = []

  return (
    <div className="container px-4 py-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">BaseHealth</h1>
          <p className="text-sm text-muted-foreground">Your health, simplified</p>
        </div>
        <Avatar>
          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
          <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
        </Avatar>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button asChild variant="outline" className="h-20 flex flex-col justify-center">
          <Link href="/minimal-providers">
            <Search className="h-6 w-6 mb-1" />
            <span>Find Provider</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex flex-col justify-center">
          <Link href="/minimal-screening">
            <Stethoscope className="h-6 w-6 mb-1" />
            <span>Screenings</span>
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">No upcoming appointments</p>
              <Button asChild size="sm">
                <Link href="/minimal-providers">Book Appointment</Link>
              </Button>
            </div>
          ) : (
            upcomingAppointments.map((apt) => (
              <div key={apt.id} className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{apt.providerName}</h3>
                  <p className="text-sm text-muted-foreground">{apt.specialty}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <span>{apt.dateTime}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Health Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Stethoscope className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Complete your health profile to get personalized reminders
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
