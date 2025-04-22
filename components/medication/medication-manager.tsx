"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import {
  Bell,
  CalendarIcon,
  Clock,
  Edit,
  MoreVertical,
  Pill,
  Plus,
  RefreshCw,
  Trash,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  instructions: string
  startDate: Date
  endDate?: Date
  timeOfDay: string[]
  refillReminder: boolean
  refillDate?: Date
  photo?: string
  adherence: number
}

export function MedicationManager() {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Daily",
      instructions: "Take with food",
      startDate: new Date("2023-01-01"),
      timeOfDay: ["Morning"],
      refillReminder: true,
      refillDate: new Date("2023-04-01"),
      adherence: 92,
    },
    {
      id: "2",
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      instructions: "Take with meals",
      startDate: new Date("2023-01-15"),
      timeOfDay: ["Morning", "Evening"],
      refillReminder: true,
      refillDate: new Date("2023-03-25"),
      adherence: 85,
    },
    {
      id: "3",
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Daily",
      instructions: "Take at bedtime",
      startDate: new Date("2023-02-01"),
      timeOfDay: ["Evening"],
      refillReminder: false,
      adherence: 98,
    },
  ])

  const [isAddingMedication, setIsAddingMedication] = useState(false)
  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    timeOfDay: [],
    refillReminder: false,
    startDate: new Date(),
  })

  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage || !newMedication.frequency) {
      return
    }

    const medication: Medication = {
      id: `med-${Date.now()}`,
      name: newMedication.name || "",
      dosage: newMedication.dosage || "",
      frequency: newMedication.frequency || "Daily",
      instructions: newMedication.instructions || "",
      startDate: newMedication.startDate || new Date(),
      endDate: newMedication.endDate,
      timeOfDay: newMedication.timeOfDay || [],
      refillReminder: newMedication.refillReminder || false,
      refillDate: newMedication.refillDate,
      adherence: 100, // Start with perfect adherence
    }

    setMedications([...medications, medication])
    setNewMedication({
      timeOfDay: [],
      refillReminder: false,
      startDate: new Date(),
    })
    setIsAddingMedication(false)
  }

  const handleTimeOfDayChange = (time: string, checked: boolean) => {
    setNewMedication((prev) => {
      const timeOfDay = prev.timeOfDay || []
      if (checked) {
        return { ...prev, timeOfDay: [...timeOfDay, time] }
      } else {
        return { ...prev, timeOfDay: timeOfDay.filter((t) => t !== time) }
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Medication Management</h2>
        <Button onClick={() => setIsAddingMedication(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Medication
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Medications</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Doses</TabsTrigger>
          <TabsTrigger value="adherence">Adherence</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {isAddingMedication ? (
            <Card>
              <CardHeader>
                <CardTitle>Add New Medication</CardTitle>
                <CardDescription>Enter details about your medication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medication-name">Medication Name</Label>
                    <Input
                      id="medication-name"
                      placeholder="Enter medication name"
                      value={newMedication.name || ""}
                      onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medication-dosage">Dosage</Label>
                    <Input
                      id="medication-dosage"
                      placeholder="e.g., 10mg, 500mg"
                      value={newMedication.dosage || ""}
                      onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medication-frequency">Frequency</Label>
                    <Select
                      value={newMedication.frequency || ""}
                      onValueChange={(value) => setNewMedication({ ...newMedication, frequency: value })}
                    >
                      <SelectTrigger id="medication-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                        <SelectItem value="Three times daily">Three times daily</SelectItem>
                        <SelectItem value="Every other day">Every other day</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="As needed">As needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Time of Day</Label>
                    <div className="flex flex-wrap gap-4">
                      {["Morning", "Afternoon", "Evening", "Bedtime"].map((time) => (
                        <div key={time} className="flex items-center space-x-2">
                          <Checkbox
                            id={`time-${time}`}
                            checked={newMedication.timeOfDay?.includes(time) || false}
                            onCheckedChange={(checked) => handleTimeOfDayChange(time, checked === true)}
                          />
                          <Label htmlFor={`time-${time}`} className="font-normal">
                            {time}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <div className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !newMedication.startDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newMedication.startDate ? format(newMedication.startDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newMedication.startDate}
                            onSelect={(date) => setNewMedication({ ...newMedication, startDate: date })}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date (Optional)</Label>
                    <div className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !newMedication.endDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newMedication.endDate ? format(newMedication.endDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newMedication.endDate}
                            onSelect={(date) => setNewMedication({ ...newMedication, endDate: date })}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medication-instructions">Special Instructions</Label>
                  <Input
                    id="medication-instructions"
                    placeholder="e.g., Take with food, avoid alcohol"
                    value={newMedication.instructions || ""}
                    onChange={(e) => setNewMedication({ ...newMedication, instructions: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="medication-refill"
                    checked={newMedication.refillReminder || false}
                    onCheckedChange={(checked) =>
                      setNewMedication({ ...newMedication, refillReminder: checked === true })
                    }
                  />
                  <Label htmlFor="medication-refill" className="font-normal">
                    Enable refill reminders
                  </Label>
                </div>

                {newMedication.refillReminder && (
                  <div className="space-y-2">
                    <Label>Next Refill Date</Label>
                    <div className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !newMedication.refillDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newMedication.refillDate ? format(newMedication.refillDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newMedication.refillDate}
                            onSelect={(date) => setNewMedication({ ...newMedication, refillDate: date })}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setIsAddingMedication(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMedication}>Add Medication</Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medications.map((medication) => (
                <Card key={medication.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-start gap-2">
                        <div className="mt-1">
                          <Pill className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{medication.name}</CardTitle>
                          <CardDescription>
                            {medication.dosage} · {medication.frequency}
                          </CardDescription>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Instructions:</span>
                        <span>{medication.instructions}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time of day:</span>
                        <span>{medication.timeOfDay.join(", ")}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Started:</span>
                        <span>{format(medication.startDate, "PP")}</span>
                      </div>

                      {medication.refillReminder && medication.refillDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Next refill:</span>
                          <span className="flex items-center">
                            {format(medication.refillDate, "PP")}
                            <Bell className="ml-1 h-3 w-3 text-primary" />
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-sm pt-2">
                        <span className="text-muted-foreground">Adherence:</span>
                        <div className="flex items-center gap-2">
                          <Progress value={medication.adherence} className="w-[80px] h-2" />
                          <span>{medication.adherence}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t bg-muted/50 px-4 py-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="mr-1 h-4 w-4" />
                      Refill
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash className="mr-1 h-4 w-4" />
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Medication Schedule</CardTitle>
              <CardDescription>Keep track of your medication doses for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Morning", "Afternoon", "Evening", "Bedtime"].map((timeOfDay) => {
                  const medsForTime = medications.filter((med) => med.timeOfDay.includes(timeOfDay))
                  if (medsForTime.length === 0) return null

                  return (
                    <div key={timeOfDay} className="space-y-2">
                      <h3 className="font-medium flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {timeOfDay} (
                        {timeOfDay === "Morning"
                          ? "8:00 AM"
                          : timeOfDay === "Afternoon"
                            ? "1:00 PM"
                            : timeOfDay === "Evening"
                              ? "6:00 PM"
                              : "10:00 PM"}
                        )
                      </h3>
                      <div className="border rounded-md divide-y">
                        {medsForTime.map((med) => (
                          <div key={med.id} className="p-3 flex justify-between items-center">
                            <div className="flex items-center">
                              <Pill className="h-4 w-4 mr-2 text-primary" />
                              <div>
                                <div className="font-medium">{med.name}</div>
                                <div className="text-sm text-muted-foreground">{med.dosage}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={timeOfDay === "Morning" ? "success" : "outline"}>
                                {timeOfDay === "Morning" ? (
                                  <span className="flex items-center">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Taken
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <XCircle className="mr-1 h-3 w-3" />
                                    Not taken
                                  </span>
                                )}
                              </Badge>
                              <Button variant="outline" size="sm">
                                Mark as Taken
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adherence" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Medication Adherence</CardTitle>
              <CardDescription>Track how well you're following your medication schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full border-8 border-primary flex items-center justify-center mb-2">
                    <span className="text-3xl font-bold">
                      {Math.round(medications.reduce((sum, med) => sum + med.adherence, 0) / medications.length)}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Overall adherence rate</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Adherence by Medication</h3>
                  <div className="space-y-3">
                    {medications.map((med) => (
                      <div key={med.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {med.name} ({med.dosage})
                          </span>
                          <span>{med.adherence}%</span>
                        </div>
                        <Progress value={med.adherence} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-[200px] w-full flex items-center justify-center bg-muted/30 rounded-md">
                  <p className="text-muted-foreground">Weekly adherence chart would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Medication History</CardTitle>
              <CardDescription>View past medications and changes to your regimen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md divide-y">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="p-4 flex justify-between items-center">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {i % 3 === 0 ? (
                          <Plus className="h-4 w-4 text-green-600" />
                        ) : i % 3 === 1 ? (
                          <Edit className="h-4 w-4 text-amber-600" />
                        ) : (
                          <Trash className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {i % 3 === 0
                            ? `Added ${medications[i % medications.length].name}`
                            : i % 3 === 1
                              ? `Changed ${medications[i % medications.length].name} dosage`
                              : `Removed ${medications[i % medications.length].name}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {i % 3 === 0
                            ? `Started taking ${medications[i % medications.length].dosage} ${medications[i % medications.length].frequency.toLowerCase()}`
                            : i % 3 === 1
                              ? `Changed from 10mg to ${medications[i % medications.length].dosage}`
                              : `Completed medication course`}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(2023, 2 - i, 15).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
