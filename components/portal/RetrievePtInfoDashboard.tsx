'use client'

import { useState } from 'react'
import { ClipboardList, Users, Settings, Hospital, Search, ShieldCheck, Database, FileText, FlaskConical, Syringe, FileHeart, FileScan, FileX, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Empty patient data - real data comes from authenticated sessions and EMR connections
interface PatientRecord {
  id: string
  name: string
  dob: string
  conditions: string[]
  medications: string[]
  labs: string[]
  allergies: string[]
  imaging: string[]
  progressNotes: string[]
  aiSummary: string
}

const navItems = [
  { label: 'Dashboard', icon: Database },
  { label: 'Retrieve Pt Info', icon: Hospital },
  { label: 'Patients', icon: Users },
  { label: 'Settings', icon: Settings },
]

// Default empty patient record
const emptyPatient: PatientRecord = {
  id: '',
  name: '',
  dob: '',
  conditions: [],
  medications: [],
  labs: [],
  allergies: [],
  imaging: [],
  progressNotes: [],
  aiSummary: '',
}

export default function RetrievePtInfoDashboard() {
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState<PatientRecord[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null)

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col py-6 px-4 min-h-screen">
        <div className="mb-8 flex items-center gap-2">
          <ShieldCheck className="text-blue-600 w-7 h-7" />
          <span className="font-bold text-xl tracking-tight">Health Portal</span>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-blue-50 cursor-pointer text-gray-700 font-medium">
              <item.icon className="w-5 h-5 text-blue-500" />
              {item.label}
            </div>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2 text-base flex items-center gap-2">
            <Hospital className="w-5 h-5" />
            Connect to All Hospitals/EMRs
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="px-8 py-6 border-b bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Retrieve Patient Info</h1>
            <p className="text-gray-500 mt-1">Universal medical record retrieval from all hospitals and EMRs</p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Search by name, DOB, NPI..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button variant="outline" className="rounded-lg border-blue-500 text-blue-600 hover:bg-blue-50">
              <Search className="w-4 h-4 mr-1" />
              Search
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex flex-1 flex-col md:flex-row gap-6 p-8">
          {/* Patient List */}
          <section className="w-full md:w-1/3 space-y-4">
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Patients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {patients.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">No patients found</p>
                    <p className="text-gray-400 text-xs mt-1">Connect to a hospital or EMR to retrieve patient records</p>
                  </div>
                ) : (
                  patients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-3 rounded-lg cursor-pointer flex flex-col border ${selectedPatient?.id === patient.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <span className="font-medium text-base">{patient.name}</span>
                      <span className="text-xs text-gray-500">DOB: {patient.dob}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>

          {/* Medical Record Viewer */}
          <section className="flex-1 space-y-6">
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Medical Record</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedPatient ? (
                  <div className="text-center py-12">
                    <Hospital className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Select a patient to view their medical record</p>
                    <p className="text-gray-400 text-sm mt-2">Or connect to a hospital/EMR to retrieve records</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* FHIR Data Cards */}
                      <FHIRCard title="Conditions" icon={FileHeart} items={selectedPatient.conditions} />
                      <FHIRCard title="Medications" icon={Syringe} items={selectedPatient.medications} />
                      <FHIRCard title="Labs" icon={FlaskConical} items={selectedPatient.labs} />
                      <FHIRCard title="Allergies" icon={FileX} items={selectedPatient.allergies} />
                      <FHIRCard title="Imaging" icon={FileScan} items={selectedPatient.imaging} />
                      <FHIRCard title="Progress Notes" icon={FileText} items={selectedPatient.progressNotes} />
                    </div>
                    {/* AI Summary */}
                    {selectedPatient.aiSummary && (
                      <div className="mt-6">
                        <Card className="bg-blue-50 border-blue-200 rounded-lg">
                          <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                              <ClipboardList className="w-5 h-5 text-blue-500" />
                              AI Medical Record Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-700 text-sm">{selectedPatient.aiSummary}</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Footer */}
        <footer className="w-full border-t bg-white py-4 px-8 flex flex-col md:flex-row items-center justify-between gap-2 mt-auto">
          <div className="flex gap-2 items-center">
            <Badge className="bg-green-100 text-green-700 border-green-200">HIPAA Compliant</Badge>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">SOC 2 Type II</Badge>
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">FHIR Native</Badge>
          </div>
          <span className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Health Portal. All rights reserved.</span>
        </footer>
      </main>
    </div>
  )
}

function FHIRCard({ title, icon: Icon, items }: { title: string, icon: any, items: string[] }) {
  return (
    <Card className="rounded-lg border-blue-100 bg-white">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Icon className="w-4 h-4 text-blue-500" />
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {items && items.length > 0 ? (
          <ul className="text-sm text-gray-700 space-y-1">
            {items.map((item, i) => (
              <li key={i} className="pl-2 list-disc">{item}</li>
            ))}
          </ul>
        ) : (
          <span className="text-xs text-gray-400">No data</span>
        )}
      </CardContent>
    </Card>
  )
} 