"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, Building2, Calendar, Clock, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PatientData } from "./patient-workflow"

interface AppointmentSchedulingProps {
  patientData: PatientData
  updatePatientData: (data: Partial<PatientData>) => void
  onComplete: () => void
}

export function AppointmentScheduling({
  patientData,
  updatePatientData,
  onComplete,
}: AppointmentSchedulingProps) {
  const [selectedDate, setSelectedDate] = useState<string>(patientData.appointmentDetails?.date || "")
  const [selectedTime, setSelectedTime] = useState<string>(patientData.appointmentDetails?.time || "")
  const [appointmentType, setAppointmentType] = useState<"virtual" | "in-person">(
    patientData.appointmentDetails?.isVirtual ? "virtual" : "in-person",
  )
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const providerName =
    patientData.selectedProvider?.name || patientData.selectedProvider?.fullName || "Selected Provider"

  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimeSlots([])
      return
    }

    let isCancelled = false
    const loadSlots = async () => {
      setIsLoading(true)
      setError(null)
      try {
        await new Promise((resolve) => setTimeout(resolve, 300))

        const virtualSlots = [
          "09:00 AM",
          "09:30 AM",
          "10:00 AM",
          "10:30 AM",
          "01:00 PM",
          "01:30 PM",
          "02:00 PM",
          "02:30 PM",
          "03:00 PM",
        ]
        const inPersonSlots = ["08:00 AM", "08:30 AM", "11:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "04:00 PM"]
        const slots = appointmentType === "virtual" ? virtualSlots : inPersonSlots

        if (!isCancelled) {
          setAvailableTimeSlots(slots)
          if (selectedTime && !slots.includes(selectedTime)) {
            setSelectedTime("")
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Failed to load time slots")
          setAvailableTimeSlots([])
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadSlots()
    return () => {
      isCancelled = true
    }
  }, [selectedDate, appointmentType, selectedTime])

  const minDate = useMemo(() => new Date().toISOString().split("T")[0], [])

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      setError("Please select both a date and time to continue.")
      return
    }

    updatePatientData({
      appointmentDetails: {
        date: selectedDate,
        time: selectedTime,
        isVirtual: appointmentType === "virtual",
      },
    })

    onComplete()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-muted/20 p-4">
        <p className="text-sm text-muted-foreground">Booking with</p>
        <p className="font-semibold">{providerName}</p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Appointment type</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm ${
              appointmentType === "virtual" ? "border-primary bg-primary/10 text-primary" : "border-border"
            }`}
            onClick={() => setAppointmentType("virtual")}
          >
            <Video className="h-4 w-4" />
            Virtual
          </button>
          <button
            type="button"
            className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm ${
              appointmentType === "in-person" ? "border-primary bg-primary/10 text-primary" : "border-border"
            }`}
            onClick={() => setAppointmentType("in-person")}
          >
            <Building2 className="h-4 w-4" />
            In-person
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="appointment-date" className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Select date
        </label>
        <input
          id="appointment-date"
          type="date"
          min={minDate}
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Available times
        </p>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading available slots...</p>
        ) : null}
        {!isLoading && selectedDate && availableTimeSlots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No slots available for this date.</p>
        ) : null}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {availableTimeSlots.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setSelectedTime(slot)}
              className={`rounded-md border px-3 py-2 text-sm ${
                selectedTime === slot ? "border-primary bg-primary/10 text-primary" : "border-border"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button onClick={handleContinue}>Continue</Button>
      </div>
    </div>
  )
}
