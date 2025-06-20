import { Star, MapPin, Phone, Globe, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Provider {
  id: string
  name: string
  specialty: string
  address: string
  distance?: number
  rating: number
  reviewCount: number
  acceptingPatients: boolean
  phone: string
  npi: string
  credentials: string
  gender: string
  availability: string
  insurance: string[]
  languages: string[]
}

interface ProviderCardProps {
  provider: Provider
}

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-6">
        {/* Provider Image/Initials */}
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-indigo-600">
            {provider.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>

        {/* Provider Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{provider.name}</h3>
              <p className="text-indigo-600 font-medium">{provider.specialty}</p>
              <p className="text-gray-600">{provider.address}</p>
              <p className="text-sm text-gray-500">NPI: {provider.npi}</p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-medium">{provider.rating}</span>
                <span className="text-gray-500">({provider.reviewCount} reviews)</span>
              </div>
              {provider.distance !== null && provider.distance !== undefined && (
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{provider.distance} miles away</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Availability</p>
              <p className="font-medium text-sm">{provider.availability}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Languages</p>
              <p className="font-medium text-sm">{provider.languages.join(', ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Insurance</p>
              <p className="font-medium text-sm">{provider.insurance.slice(0, 2).join(', ')}{provider.insurance.length > 2 ? '...' : ''}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                provider.acceptingPatients 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {provider.acceptingPatients ? 'Accepting Patients' : 'Not Accepting'}
              </span>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{provider.phone}</span>
              </div>
              {provider.credentials && (
                <span className="text-sm text-gray-600">{provider.credentials}</span>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                <Globe className="h-4 w-4 mr-2" />
                View Profile
              </Button>
              <Button 
                asChild
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={!provider.acceptingPatients}
              >
                <Link 
                  href={`/appointment/book?name=${encodeURIComponent(provider.name)}&specialty=${encodeURIComponent(provider.specialty)}&address=${encodeURIComponent(provider.address)}&phone=${encodeURIComponent(provider.phone)}&npi=${encodeURIComponent(provider.npi)}&rating=${provider.rating}&accepting=${provider.acceptingPatients}`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 