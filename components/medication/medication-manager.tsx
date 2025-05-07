"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Medication = {
  id: string
  name: string
  dosage: string
  frequency: string
  time: string
}

export function MedicationManager() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [newMed, setNewMed] = useState({
    name: "",
    dosage: "",
    frequency: "",
    time: "",
  })

  const handleAddMedication = () => {
    if (!newMed.name || !newMed.dosage || !newMed.frequency || !newMed.time) {
      return
    }

    const medication: Medication = {
      id: Date.now().toString(),
      ...newMed,
    }

    setMedications([...medications, medication])
    setNewMed({ name: "", dosage: "", frequency: "", time: "" })
  }

  const handleRemoveMedication = (id: string) => {
    setMedications(medications.filter((med) => med.id !== id))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Medication Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current">
          <TabsList className="mb-4">
            <TabsTrigger value="current">Current Medications</TabsTrigger>
            <TabsTrigger value="add">Add Medication</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            {medications.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No medications added yet.</p>
            ) : (
              <div className="space-y-4">
                {medications.map((med) => (
                  <div key={med.id} className="flex justify-between items-center p-4 border rounded">
                    <div>
                      <h3 className="font-medium">{med.name}</h3>
                      <p className="text-sm text-gray-500">
                        {med.dosage} • {med.frequency} • {med.time}
                      </p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveMedication(med.id)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Medication Name</Label>
                <Input
                  id="name"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  placeholder="Enter medication name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  placeholder="e.g., 10mg"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  value={newMed.frequency}
                  onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                  placeholder="e.g., Once daily"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value={newMed.time}
                  onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                  placeholder="e.g., Morning"
                />
              </div>

              <Button className="w-full" onClick={handleAddMedication}>
                Add Medication
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
