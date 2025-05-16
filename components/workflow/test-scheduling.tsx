"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, CalendarIcon, MapPin, Clock } from "lucide-react"
import { format } from "date-fns"
import type { PatientData } from "./patient-workflow"

interface TestSchedulingProps {
  patientData: PatientData
  updatePatientData: (data: Partial<PatientData>) => void
  onComplete: () => void
}

type TestFacility = {
  id: string
  name: string
  type: "lab" | "imaging"
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  distance?: number
  availableDates: Date[]
  availableTimeSlots: { [date: string]: string[] }
}

type ScheduledTest = {
  id: string
  name: string
  facilityId: string
  facilityName: string
  date: Date
  time: string
  requiresApproval: boolean
}

export function TestScheduling({ patientData, updatePatientData, onComplete }: TestSchedulingProps) {
  const [facilities, setFacilities] = useState<TestFacility[]>([])
  const [selectedTab, setSelectedTab] = useState<"lab" | "imaging">("lab")
  const [selectedFacility, setSelectedFacility] = useState<TestFacility | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
  const [scheduledTests, setScheduledTests] = useState<ScheduledTest[]>(patientData.scheduledTests || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get recommended tests from screening step
  const recommendedTests = getRecommendedTests(patientData.selectedScreenings || [])

  useEffect(() => {
    fetchFacilities()
  }, [selectedTab])

  function getRecommendedTests(screeningIds: string[]) {
    const testMap: { [key: string]: { name: string; type: "lab" | "imaging"; requiresApproval: boolean } } = {
      colorectal: { name: "Colorectal Cancer Screening", type: "lab", requiresApproval: false },
      breast: { name: "Mammography", type: "imaging", requiresApproval: true },
      cervical: { name: "Pap Smear", type: "lab", requiresApproval: false },
      lung: { name: "Low-Dose CT Scan", type: "imaging", requiresApproval: true },
      prostate: { name: "PSA Test", type: "lab", requiresApproval: false },
      diabetes: { name: "Blood Glucose Test", type: "lab", requiresApproval: false },
      hypertension: { name: "Blood Pressure Check", type: "lab", requiresApproval: false },
      cholesterol: { name: "Lipid Panel", type: "lab", requiresApproval: false },
      osteoporosis: { name: "Bone Density Test", type: "imaging", requiresApproval: true },
    }

    return screeningIds
      .map((id) => ({
        id,
        ...testMap[id],
      }))
      .filter((test) => !!test.name)
  }

  const fetchFacilities = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // In a real app, this would be an API call
      // For now, we'll simulate it with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate available dates (next 14 days)
      const generateDates = () => {
        const dates: Date[] = []
        const today = new Date()
        for (let i = 1; i <= 14; i++) {
          const date = new Date()
          date.setDate(today.getDate() + i)
          dates.push(date)
        }
        return dates
      }

      // Generate available time slots
      const generateTimeSlots = (dates: Date[]) => {
        const slots: { [date: string]: string[] } = {}
        dates.forEach((date) => {
          const dateStr = format(date, "yyyy-MM-dd")
          slots[dateStr] = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]
        })
        return slots
      }

      const availableDates = generateDates()
      const availableTimeSlots = generateTimeSlots(availableDates)

      if (selectedTab === "lab") {
        const labFacilities: TestFacility[] = [
          {
            id: "lab1",
            name: "Quest Diagnostics",
            type: "lab",
            address: {
              street: "123 Lab Ave",
              city: "Anytown",
              state: "CA",
              zipCode: patientData.zipCode || "90210",
            },
            distance: 2.1,
            availableDates,
            availableTimeSlots,
          },
          {
            id: "lab2",
            name: "LabCorp",
            type: "lab",
            address: {
              street: "456 Test Blvd",
              city: "Anytown",
              state: "CA",
              zipCode: patientData.zipCode || "90210",
            },
            distance: 3.4,
            availableDates,
            availableTimeSlots,
          },
          {
            id: "lab3",
            name: "City Clinical Labs",
            type: "lab",
            address: {
              street: "789 Medical Plaza",
              city: "Anytown",
              state: "CA",
              zipCode: patientData.zipCode || "90210",
            },
            distance: 1.8,
            availableDates,
            availableTimeSlots,
          },
        ]
        setFacilities(labFacilities)
      } else {
        const imagingFacilities: TestFacility[] = [
          {
            id: "img1",
            name: "RadNet Imaging Center",
            type: "imaging",
            address: {
              street: "123 Imaging Way",
              city: "Anytown",
              state: "CA",
              zipCode: patientData.zipCode || "90210",
            },
            distance: 2.5,
            availableDates,
            availableTimeSlots,
          },
          {
            id: "img2",
            name: "Advanced Medical Imaging",
            type: "imaging",
            address: {
              street: "456 Scan Street",
              city: "Anytown",
              state: "CA",
              zipCode: patientData.zipCode || "90210",
            },
            distance: 4.2,
            availableDates,
            availableTimeSlots,
          },
        ]
        setFacilities(imagingFacilities)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacilitySelect = (facility: TestFacility) => {
    setSelectedFacility(facility)
    setSelectedDate(undefined)
    setSelectedTime(undefined)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime(undefined)
  }

  const handleScheduleTest = (test: {
    id: string
    name: string
    type: "lab" | "imaging"
    requiresApproval: boolean
  }) => {
    if (!selectedFacility || !selectedDate || !selectedTime) return

    const newTest: ScheduledTest = {
      id: test.id,
      name: test.name,
      facilityId: selectedFacility.id,
      facilityName: selectedFacility.name,
      date: selectedDate,
      time: selectedTime,
      requiresApproval: test.requiresApproval,
    }

    setScheduledTests([...scheduledTests, newTest])

    // Reset selections
    setSelectedFacility(null)
    setSelectedDate(undefined)
    setSelectedTime(undefined)
  }

  const handleRemoveTest = (testId: string) => {
    setScheduledTests(scheduledTests.filter((test) => test.id !== testId))
  }

  const handleSaveAndContinue = () => {
    updatePatientData({
      scheduledTests,
    })
    onComplete()
  }

  const getFilteredTests = () => {
    return recommendedTests.filter((test) => test.type === selectedTab)
  }

  const getUnscheduledTests = () => {
    const scheduledIds = scheduledTests.map((test) => test.id)
    return getFilteredTests().filter((test) => !scheduledIds.includes(test.id))
  }

  const getAvailableTimeSlots = () => {
    if (!selectedFacility || !selectedDate) return []

    const dateStr = format(selectedDate, "yyyy-MM-dd")
    return selectedFacility.availableTimeSlots[dateStr] || []
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as "lab" | "imaging")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lab">Lab Tests</TabsTrigger>
            <TabsTrigger value="imaging">Imaging</TabsTrigger>
          </TabsList>
          <TabsContent value="lab" className="space-y-4 pt-4">
            <div className="text-sm text-muted-foreground">
              Lab tests typically don't require prior approval and can be scheduled directly.
            </div>
          </TabsContent>
          <TabsContent value="imaging" className="space-y-4 pt-4">
            <div className="text-sm text-muted-foreground">
              Imaging tests may require prior approval from your insurance or primary care provider.
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {getUnscheduledTests().length === 0 ? (
              <Alert>
                <AlertDescription>
                  {selectedTab === "lab"
                    ? "You don't have any recommended lab tests that need scheduling."
                    : "You don't have any recommended imaging tests that need scheduling."}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recommended {selectedTab === "lab" ? "Lab Tests" : "Imaging"}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getUnscheduledTests().map((test) => (
                    <Card key={test.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{test.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Select Facility</label>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                              {facilities.map((facility) => (
                                <div
                                  key={facility.id}
                                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                                    selectedFacility?.id === facility.id
                                      ? "border-primary bg-primary/5"
                                      : "hover:bg-muted"
                                  }`}
                                  onClick={() => handleFacilitySelect(facility)}
                                >
                                  <div className="font-medium">{facility.name}</div>
                                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                                    <MapPin className="h-3.5 w-3.5 mr-1" />
                                    {facility.distance?.toFixed(1)} miles away
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {selectedFacility && (
                            <div>
                              <label className="text-sm font-medium">Select Date</label>
                              <div className="mt-2">
                                <Calendar
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={handleDateSelect}
                                  disabled={(date) => {
                                    // Disable dates that aren't in the available dates
                                    return !selectedFacility.availableDates.some(
                                      (availableDate) =>
                                        availableDate.getDate() === date.getDate() &&
                                        availableDate.getMonth() === date.getMonth() &&
                                        availableDate.getFullYear() === date.getFullYear(),
                                    )
                                  }}
                                  className="border rounded-md p-2"
                                />
                              </div>
                            </div>
                          )}

                          {selectedDate && (
                            <div>
                              <label className="text-sm font-medium">Select Time</label>
                              <div className="mt-2">
                                <Select onValueChange={setSelectedTime}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select time slot" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getAvailableTimeSlots().map((time) => (
                                      <SelectItem key={time} value={time}>
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}

                          <Button
                            onClick={() => handleScheduleTest(test)}
                            disabled={!selectedFacility || !selectedDate || !selectedTime}
                            className="w-full"
                          >
                            Schedule {test.name}
                          </Button>

                          {test.requiresApproval && (
                            <div className="text-xs text-amber-600 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Requires approval from your provider
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {scheduledTests.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Scheduled Tests</h3>

          <div className="space-y-3">
            {scheduledTests.map((test) => (
              <Card key={test.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{test.name}</h4>
                      <p className="text-sm text-muted-foreground">{test.facilityName}</p>

                      <div className="flex items-center mt-2 text-sm">
                        <CalendarIcon className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <span>{format(test.date, "MMMM d, yyyy")}</span>
                        <span className="mx-1">•</span>
                        <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <span>{test.time}</span>
                      </div>

                      {test.requiresApproval && (
                        <Badge variant="outline" className="mt-2 text-amber-600 border-amber-200 bg-amber-50">
                          Requires approval
                        </Badge>
                      )}
                    </div>

                    <Button variant="ghost" size="sm" onClick={() => handleRemoveTest(test.id)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4">
        <div>
          {scheduledTests.length > 0 && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              {scheduledTests.length} test{scheduledTests.length !== 1 ? "s" : ""} scheduled
            </div>
          )}
        </div>
        <Button onClick={handleSaveAndContinue}>
          {scheduledTests.length > 0 ? "Save and Continue" : "Skip and Continue"}
        </Button>
      </div>
    </div>
  )
}
