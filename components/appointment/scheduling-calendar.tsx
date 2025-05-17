"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Video, CreditCard, Wallet } from "lucide-react"
import type { Provider } from "@/types/user"

interface SchedulingCalendarProps {
  provider: Provider
  onSchedule: (appointmentData: {
    date: Date
    time: string
    type: "virtual" | "in-person"
    paymentMethod: "stripe" | "crypto"
  }) => void
  onClose: () => void
}

export function SchedulingCalendar({ provider, onSchedule, onClose }: SchedulingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [selectedType, setSelectedType] = useState<"virtual" | "in-person">("virtual")
  const [selectedPayment, setSelectedPayment] = useState<"stripe" | "crypto">("stripe")
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  // Mock available time slots - in a real app, these would come from the provider's availability
  const availableTimeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
    "4:00 PM", "4:30 PM"
  ]

  const handleSchedule = () => {
    if (selectedDate && selectedTime) {
      setIsPaymentDialogOpen(true)
    }
  }

  const handlePayment = () => {
    if (selectedDate && selectedTime) {
      onSchedule({
        date: selectedDate,
        time: selectedTime,
        type: selectedType,
        paymentMethod: selectedPayment
      })
      setIsPaymentDialogOpen(false)
      onClose()
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Schedule Appointment with {provider.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Select Date</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Select Time</h3>
              <div className="grid grid-cols-2 gap-2">
                {availableTimeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className="w-full"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Visit Type</h3>
              <Select value={selectedType} onValueChange={(value: "virtual" | "in-person") => setSelectedType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="virtual">Virtual Visit</SelectItem>
                  <SelectItem value="in-person">In-Person Visit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSchedule} disabled={!selectedDate || !selectedTime}>
            Continue to Payment
          </Button>
        </div>
      </CardContent>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Appointment</DialogTitle>
            <DialogDescription>
              Please select your preferred payment method to confirm your appointment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Appointment Details</Label>
              <div className="text-sm text-muted-foreground">
                <p>Date: {selectedDate?.toLocaleDateString()}</p>
                <p>Time: {selectedTime}</p>
                <p>Type: {selectedType === "virtual" ? "Virtual Visit" : "In-Person Visit"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={selectedPayment === "stripe" ? "default" : "outline"}
                  onClick={() => setSelectedPayment("stripe")}
                  className="w-full"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Credit Card
                </Button>
                <Button
                  variant={selectedPayment === "crypto" ? "default" : "outline"}
                  onClick={() => setSelectedPayment("crypto")}
                  className="w-full"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Crypto Wallet
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayment}>
              Confirm & Pay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 