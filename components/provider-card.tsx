import { Star, MapPin, Phone, Globe, Calendar, Award, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  website?: string
}

interface ProviderCardProps {
  provider: Provider
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const initials = provider.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const getStatusColor = (accepting: boolean) => {
    return accepting ? 'status-online' : 'status-offline'
  }

  const getAvailabilityColor = (availability: string) => {
    if (availability.toLowerCase().includes('today') || availability.toLowerCase().includes('available')) {
      return 'text-emerald-800 bg-emerald-100 border border-emerald-200'
    }
    return 'text-amber-800 bg-amber-100 border border-amber-200'
  }

  return (
    <div className="provider-card p-6 group">
      {/* Header Section */}
      <div className="flex items-start gap-4 mb-6">
        {/* Provider Avatar */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-100 rounded-xl flex items-center justify-center shadow-healthcare">
            <span className="text-lg font-bold text-gradient">
              {initials}
            </span>
          </div>
          {/* Status Indicator */}
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${getStatusColor(provider.acceptingPatients)}`}></div>
        </div>

        {/* Provider Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 text-lg leading-tight mb-1 group-hover:text-sky-700 transition-colors">
                {provider.name}
              </h3>
              <p className="text-sky-600 font-medium text-sm mb-1">{provider.specialty}</p>
              {provider.credentials && (
                <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700 border border-slate-300 px-2 py-1 font-medium">
                  {provider.credentials}
                </Badge>
              )}
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
              <Star className="h-4 w-4 text-amber-500 fill-current" />
              <span className="font-semibold text-amber-700 text-sm">{provider.rating}</span>
              <span className="text-amber-600 text-xs">({provider.reviewCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location & Distance */}
      <div className="flex items-start gap-2 mb-4 text-slate-600">
        <MapPin className="h-4 w-4 mt-0.5 text-slate-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm leading-relaxed">{provider.address}</p>
          {provider.distance !== null && provider.distance !== undefined && (
            <p className="text-xs text-sky-600 font-medium mt-1">
              {provider.distance} miles away
            </p>
          )}
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {/* Availability */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Availability</span>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-md ${getAvailabilityColor(provider.availability)}`}>
            {provider.availability}
          </span>
        </div>

        {/* Languages */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Languages</span>
          </div>
          <span className="text-xs text-slate-600 text-right">
            {provider.languages.slice(0, 2).join(', ')}
            {provider.languages.length > 2 && '...'}
          </span>
        </div>

        {/* Insurance */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Insurance</span>
          </div>
          <span className="text-xs text-slate-600 text-right">
            {provider.insurance.slice(0, 2).join(', ')}
            {provider.insurance.length > 2 && '...'}
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-center mb-6">
        <Badge 
          variant={provider.acceptingPatients ? "default" : "secondary"}
          className={`
            px-4 py-2 text-sm font-semibold rounded-full border-2
            ${provider.acceptingPatients 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
              : 'bg-slate-50 text-slate-700 border-slate-300'
            }
          `}
        >
          <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(provider.acceptingPatients)}`}></div>
          {provider.acceptingPatients ? 'Accepting New Patients' : 'Not Accepting Patients'}
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          asChild
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          disabled={!provider.acceptingPatients}
        >
          <Link 
            href={`/appointment/book?name=${encodeURIComponent(provider.name)}&specialty=${encodeURIComponent(provider.specialty)}&address=${encodeURIComponent(provider.address)}&phone=${encodeURIComponent(provider.phone)}&npi=${encodeURIComponent(provider.npi)}&rating=${provider.rating}&accepting=${provider.acceptingPatients}`}
            className="flex items-center justify-center gap-2 text-white"
          >
            <Calendar className="h-4 w-4" />
            {provider.acceptingPatients ? 'Book Appointment' : 'Join Waitlist'}
          </Link>
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            asChild
            variant="outline" 
            className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-800 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
          >
            {provider.website ? (
              <a 
                href={provider.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            ) : (
              <Link 
                href={`/providers/${provider.id}`}
                className="flex items-center justify-center gap-1"
              >
                <Globe className="h-4 w-4" />
                Profile
              </Link>
            )}
          </Button>
          
          <Button 
            asChild
            variant="outline" 
            className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-800 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
          >
            <a 
              href={`tel:${provider.phone}`}
              className="flex items-center justify-center gap-1"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          </Button>
        </div>
      </div>

      {/* NPI Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">NPI: {provider.npi}</p>
      </div>
    </div>
  )
} 