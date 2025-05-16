"use client"

import { useState, useEffect } from "react"
import type { PatientData } from "./patient-workflow"

interface AppointmentSchedulingProps {
  patientData: PatientData
  updatePatientData: (data: Partial<PatientData>) => void
  onComplete: () => void
}

export function AppointmentScheduling({ patientData, updatePatientData, onComplete }: AppointmentSchedulingProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    patientData.appointmentDetails?.date ? new Date(patientData.appointmentDetails.date) : undefined
  )
  const [selectedTime, setSelectedTime] = useState<string | undefined>(patientData.appointmentDetails?.time)
  const [appointmentType, setAppointmentType] = useState<"virtual" | "in-person">(
    patientData.appointmentDetails?.isVirtual ? "virtual" : "in-person"
  )
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const provider = patientData.selectedProvider
  
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimeSlots(selectedDate)
    }
  }, [selectedDate, appointmentType])
  
  const fetchAvailableTimeSlots = async (date: Date) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate it with mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Generate different time slots based on appointment type
      const slots = appointmentType === "virtual" 
        ? ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM"]
        : ["8:00 AM", "8:30 AM", "11:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"]

      setAvailableTimeSlots(slots)
    } catch (err) {\
      setError(err instanceof Error ? err.message
