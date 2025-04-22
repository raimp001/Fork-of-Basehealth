"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, MessageSquare, Phone, Send } from "lucide-react"

export function SimplifiedTelemedicine() {
  const [activeView, setActiveView] = useState<"providers" | "consultation">("providers")
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)

  const providers = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialty: "Family Medicine",
      availability: "Available now",
      avatar: "/placeholder.svg?height=40&width=40",
      waitTime: "5 min",
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      specialty: "Internal Medicine",
      availability: "Available in 15 min",
      avatar: "/placeholder.svg?height=40&width=40",
      waitTime: "15 min",
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      specialty: "Pediatrics",
      availability: "Available now",
      avatar: "/placeholder.svg?height=40&width=40",
      waitTime: "10 min",
    },
  ]

  const handleStartConsultation = (providerId: string) => {
    setSelectedProvider(providerId)
    setActiveView("consultation")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Telemedicine</h1>

      {activeView === "providers" ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Providers</CardTitle>
              <CardDescription>Connect with a healthcare provider right now</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                <Button variant="outline" className="whitespace-nowrap">
                  All Providers
                </Button>
                <Button variant="outline" className="whitespace-nowrap">
                  Family Medicine
                </Button>
                <Button variant="outline" className="whitespace-nowrap">
                  Internal Medicine
                </Button>
                <Button variant="outline" className="whitespace-nowrap">
                  Pediatrics
                </Button>
                <Button variant="outline" className="whitespace-nowrap">
                  Mental Health
                </Button>
              </div>

              <div className="space-y-4">
                {providers.map((provider) => (
                  <Card key={provider.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={provider.avatar || "/placeholder.svg"} alt={provider.name} />
                          <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{provider.name}</h3>
                              <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Wait: {provider.waitTime}
                            </Badge>
                          </div>

                          <div className="flex items-center text-sm">
                            <Clock className="h-3.5 w-3.5 text-green-500 mr-1" />
                            <span className="text-green-600">{provider.availability}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button size="sm" onClick={() => handleStartConsultation(provider.id)}>
                          <Video className="h-4 w-4 mr-2" />
                          Start Video Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule for Later</CardTitle>
              <CardDescription>Book an appointment with a provider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Specialty</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family-medicine">Family Medicine</SelectItem>
                    <SelectItem value="internal-medicine">Internal Medicine</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="mental-health">Mental Health</SelectItem>
                    <SelectItem value="dermatology">Dermatology</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input type="date" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9-00">9:00 AM</SelectItem>
                    <SelectItem value="10-00">10:00 AM</SelectItem>
                    <SelectItem value="11-00">11:00 AM</SelectItem>
                    <SelectItem value="13-00">1:00 PM</SelectItem>
                    <SelectItem value="14-00">2:00 PM</SelectItem>
                    <SelectItem value="15-00">3:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setActiveView("providers")} className="h-8 w-8 p-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  <span className="sr-only">Back</span>
                </Button>
                <CardTitle className="text-center">Video Consultation</CardTitle>
                <div className="w-8"></div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-video bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Connecting to provider...</p>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 w-32 h-24 bg-background rounded-md overflow-hidden border">
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <p className="text-xs text-muted-foreground">Your camera</p>
                  </div>
                </div>
              </div>

              <div className="p-4 flex justify-center space-x-4">
                <Button variant="outline" size="icon" className="rounded-full">
                  <MessageSquare className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </Button>
                <Button variant="destructive" size="icon" className="rounded-full">
                  <Phone className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Chat</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px] overflow-y-auto space-y-4">
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                  <p>Hello! I'm Dr. Sarah Johnson. How can I help you today?</p>
                  <p className="text-xs opacity-70 text-right mt-1">10:30 AM</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="flex w-full space-x-2">
                <Input placeholder="Type a message..." />
                <Button size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Reason for Visit</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Briefly describe your symptoms or reason for the consultation..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
