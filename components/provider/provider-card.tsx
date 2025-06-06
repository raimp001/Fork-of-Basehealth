"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Calendar } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { SchedulingCalendar } from "@/components/appointment/scheduling-calendar"
import type { Provider } from "@/types/user"

interface ProviderCardProps {
  provider: Provider
  isSelected?: boolean
  onClick?: () => void
}

export function ProviderCard({ provider, isSelected = false, onClick }: ProviderCardProps) {
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false)

  const handleSchedule = (appointmentData: {
    date: Date
    time: string
    type: "virtual" | "in-person"
    paymentMethod: "stripe" | "crypto"
  }) => {
    // Here you would typically:
    // 1. Create the appointment in your backend
    // 2. Process the payment
    // 3. Redirect to the virtual visit page if it's a virtual appointment
    console.log("Scheduling appointment:", appointmentData)
    
    if (appointmentData.type === "virtual") {
      // Redirect to virtual visit page
      window.location.href = `/appointment/virtual/${provider.id}?date=${appointmentData.date.toISOString()}&time=${appointmentData.time}`
    } else {
      // Show confirmation for in-person visit
      alert("In-person appointment scheduled! You will receive a confirmation email shortly.")
    }
  }

  return (
    <>
      <Card className={`overflow-hidden transition-all ${isSelected ? "ring-2 ring-primary" : ""}`} onClick={onClick}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder.svg?height=48&width=48" alt={provider.name} />
              <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{provider.name}</h3>
                  <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {provider.isVerified && (
                    <Badge variant="outline" className="text-xs">
                      Verified
                    </Badge>
                  )}
                  {provider.isNearby && (
                    <Badge variant="secondary" className="text-xs">
                      Nearby
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center text-sm">
                <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                <span>{provider.rating}</span>
                <span className="text-muted-foreground ml-1">({provider.reviewCount})</span>
                <div className="mx-2 h-1 w-1 rounded-full bg-muted-foreground"></div>
                <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                <span className="text-muted-foreground">
                  {provider.address.city}, {provider.address.state}
                </span>
              </div>

              {provider.distance && (
                <p className="text-sm text-primary font-medium">{provider.distance.toFixed(1)} miles away</p>
              )}

              {provider.distanceNote && !provider.distance && (
                <p className="text-xs text-muted-foreground">{provider.distanceNote}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 px-6 py-3">
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/providers/${provider.id}`}>View Profile</Link>
            </Button>
            <Button size="sm" onClick={() => setIsSchedulingOpen(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Visit
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isSchedulingOpen} onOpenChange={setIsSchedulingOpen}>
        <DialogContent className="max-w-4xl">
          <SchedulingCalendar
            provider={provider}
            onSchedule={handleSchedule}
            onClose={() => setIsSchedulingOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
