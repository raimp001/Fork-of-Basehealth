import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Download, Eye, Calendar, Activity, Heart, Beaker } from "lucide-react"

export default function MedicalRecordsPage() {
  const records = [
    {
      id: 1,
      type: "Lab Results",
      title: "Complete Blood Count (CBC)",
      date: "2024-01-15",
      provider: "Dr. Smith - Internal Medicine",
      status: "Normal",
      icon: Beaker,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: 2,
      type: "Imaging",
      title: "Chest X-Ray",
      date: "2024-01-10",
      provider: "City Medical Center",
      status: "Normal",
      icon: Activity,
      color: "bg-green-100 text-green-600"
    },
    {
      id: 3,
      type: "Lab Results",
      title: "Lipid Panel",
      date: "2024-01-08",
      provider: "Dr. Johnson - Cardiology",
      status: "Elevated",
      icon: Heart,
      color: "bg-red-100 text-red-600"
    },
    {
      id: 4,
      type: "Visit Summary",
      title: "Annual Physical Exam",
      date: "2024-01-05",
      provider: "Dr. Smith - Internal Medicine",
      status: "Complete",
      icon: FileText,
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      id: 5,
      type: "Lab Results",
      title: "Hemoglobin A1C",
      date: "2023-12-20",
      provider: "Dr. Wilson - Endocrinology",
      status: "Normal",
      icon: Beaker,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: 6,
      type: "Prescription",
      title: "Lisinopril 10mg",
      date: "2023-12-15",
      provider: "Dr. Smith - Internal Medicine",
      status: "Active",
      icon: FileText,
      color: "bg-purple-100 text-purple-600"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
      case 'complete':
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'elevated':
      case 'abnormal':
        return 'bg-red-100 text-red-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="flex items-center justify-between px-8 py-6 border-b">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            basehealth.xyz
          </Link>
        </div>
        <nav className="flex items-center gap-8">
          <Link href="/patient-portal" className="text-gray-700 hover:text-indigo-600 transition-colors">
            Patient Portal
          </Link>
          <Link href="/settings" className="text-gray-700 hover:text-indigo-600 transition-colors">
            Settings
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/patient-portal" className="text-gray-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Medical Records</h1>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Beaker className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lab Results</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Imaging</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Visit Notes</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Prescriptions</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
              </div>
            </div>
          </div>

          {/* Records List */}
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">Recent Records</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {records.map((record) => {
                const IconComponent = record.icon
                return (
                  <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${record.color}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                          <p className="text-sm text-gray-600">{record.type} • {record.provider}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-300">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upload Section */}
          <div className="mt-8 bg-gray-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Medical Records</h2>
            <p className="text-gray-600 mb-6">
              Upload your medical records, lab results, or other health documents to keep everything in one place.
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to upload</p>
              <p className="text-sm text-gray-500 mb-4">Supports PDF, JPG, PNG files up to 10MB</p>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Choose Files
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link href="/appointment/request">Request Medical Records</Link>
            </Button>
            <Button asChild variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
              <Link href="/providers/search">Find a Provider</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
} 