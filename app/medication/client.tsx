"use client"

import { useState, useEffect } from "react"
import { MedicationManager } from "@/components/medication/medication-manager"

export default function MedicationClient() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return null
  }

  return <MedicationManager />
}
