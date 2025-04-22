"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, MessageSquare, Search, Stethoscope } from "lucide-react"
import Link from "next/link"

export function MinimalDashboard() {
  return (
    <div className="container px-4 py-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">BaseHealth</h1>
          <p className="text-sm text-muted-foreground">Your health, simplified</p>
        </div>
        <Avatar>
          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
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
          <CardTitle className="text-lg">Upcoming Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Dr. Sarah Johnson</h3>
              <p className="text-sm text-muted-foreground">Family Medicine</p>
              <div className="flex items-center mt-2 text-sm">
                <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span>Tomorrow, 10:00 AM</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" size="sm">
              Reschedule
            </Button>
            <Button size="sm">Join Call</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Health Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-yellow-100 p-1.5 rounded-full">
                <Stethoscope className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Annual Physical Due</h3>
                <p className="text-xs text-muted-foreground">Last check-up was 11 months ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-1.5 rounded-full">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">New message from Dr. Johnson</h3>
                <p className="text-xs text-muted-foreground">Regarding your recent lab results</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
