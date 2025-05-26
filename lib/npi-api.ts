// NPI (National Provider Identifier) API integration for real provider data
export interface NPIProvider {
  number: string // NPI number
  enumeration_type: string
  created_epoch: string
  last_updated_epoch: string
  addresses: Array<{
    address_1: string
    address_2?: string
    city: string
    state: string
    postal_code: string
    country_code: string
    country_name: string
    address_type: string
    address_purpose: string
    telephone_number?: string
    fax_number?: string
  }>
  taxonomies: Array<{
    code: string
    taxonomy_group?: string
    desc: string
    primary: boolean
    state?: string
    license?: string
  }>
  identifiers?: Array<{
    code: string
    desc: string
    identifier: string
    state?: string
  }>
  endpoints?: Array<{
    endpoint: string
    endpointType: string
    endpointTypeDescription: string
    endpointDescription?: string
    affiliation?: string
    use?: string
    useDescription?: string
    contentType?: string
    contentTypeDescription?: string
    contentOtherDescription?: string
    country_code?: string
    country_name?: string
    address_type?: string
    address_1?: string
    city?: string
    state?: string
    postal_code?: string
  }>
  basic?: {
    status: string
    credential?: string
    first_name?: string
    last_name?: string
    middle_name?: string
    name?: string
    sex?: string // Changed from gender to sex
    enumeration_date?: string
    last_updated?: string
    certification_date?: string
    name_prefix?: string
    name_suffix?: string
    sole_proprietor?: string
    organization_name?: string
    organizational_subpart?: string
    authorized_official_credential?: string
    authorized_official_first_name?: string
    authorized_official_last_name?: string
    authorized_official_middle_name?: string
    authorized_official_name_prefix?: string
    authorized_official_name_suffix?: string
    authorized_official_telephone_number?: string
    authorized_official_title_or_position?: string
  }
  practiceLocations?: Array<{
    country_code: string
    country_name: string
    address_purpose: string
    address_type: string
    address_1: string
    address_2?: string
    city: string
    state: string
    postal_code: string
    telephone_number?: string
    fax_number?: string
  }>
  other_names?: Array<any>
}

export interface NPISearchParams {
  first_name?: string
  last_name?: string
  organization_name?: string
  address_purpose?: string
  city?: string
  state?: string
  postal_code?: string
  country_code?: string
  limit?: number
  skip?: number
  taxonomy_description?: string
  enumeration_type?: string
}

export interface NPISearchResponse {
  result_count: number
  results: NPIProvider[]
}

// Common medical specialties for search
export const medicalSpecialties = {
  'Primary Care': [
    'Family Medicine',
    'Internal Medicine', 
    'General Practice',
    'Pediatrics'
  ],
  'Cardiology': [
    'Cardiovascular Disease',
    'Interventional Cardiology',
    'Cardiac Electrophysiology'
  ],
  'Dermatology': [
    'Dermatology',
    'Dermatopathology',
    'Pediatric Dermatology'
  ],
  'Endocrinology': [
    'Endocrinology, Diabetes & Metabolism',
    'Pediatric Endocrinology'
  ],
  'Gastroenterology': [
    'Gastroenterology',
    'Pediatric Gastroenterology'
  ],
  'Neurology': [
    'Neurology',
    'Child Neurology',
    'Neuromuscular Medicine'
  ],
  'Oncology': [
    'Hematology & Oncology',
    'Medical Oncology',
    'Radiation Oncology'
  ],
  'Orthopedics': [
    'Orthopaedic Surgery',
    'Hand Surgery',
    'Sports Medicine'
  ],
  'Psychiatry': [
    'Psychiatry & Neurology',
    'Child & Adolescent Psychiatry',
    'Addiction Medicine'
  ],
  'Radiology': [
    'Diagnostic Radiology',
    'Nuclear Medicine',
    'Radiation Oncology'
  ],
  'Surgery': [
    'General Surgery',
    'Plastic Surgery',
    'Thoracic Surgery'
  ]
}

// Search providers using NPI Registry API
export async function searchProviders(params: NPISearchParams): Promise<NPISearchResponse> {
  const baseUrl = 'https://npiregistry.cms.hhs.gov/api/'
  const searchParams = new URLSearchParams()
  
  // Add required version parameter
  searchParams.append('version', '2.1')
  
  // Add search parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString())
    }
  })
  
  // Default parameters
  if (!params.limit) {
    searchParams.append('limit', '20')
  }
  if (!params.enumeration_type) {
    searchParams.append('enumeration_type', 'NPI-1') // Individual providers
  }
  
  const url = `${baseUrl}?${searchParams.toString()}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BaseHealth Provider Search'
      }
    })
    
    if (!response.ok) {
      throw new Error(`NPI API error: ${response.status}`)
    }
    
    const data = await response.json()
    return data
    
  } catch (error) {
    console.error('Error searching providers:', error)
    throw error
  }
}

// Search providers by specialty and location
export async function searchProvidersBySpecialty(
  specialty: string, 
  city?: string, 
  state?: string,
  limit: number = 20
): Promise<NPIProvider[]> {
  try {
    // Get taxonomy descriptions for the specialty
    const taxonomyDescriptions = medicalSpecialties[specialty as keyof typeof medicalSpecialties] || [specialty]
    
    // Search for each taxonomy description
    const allResults: NPIProvider[] = []
    
    for (const taxonomyDesc of taxonomyDescriptions) {
      const searchParams: NPISearchParams = {
        taxonomy_description: taxonomyDesc,
        enumeration_type: 'NPI-1',
        limit: Math.ceil(limit / taxonomyDescriptions.length),
        city,
        state
      }
      
      const response = await searchProviders(searchParams)
      allResults.push(...response.results)
      
      // Break if we have enough results
      if (allResults.length >= limit) {
        break
      }
    }
    
    // Remove duplicates and limit results
    const uniqueResults = allResults.filter((provider, index, self) => 
      index === self.findIndex(p => p.number === provider.number)
    )
    
    return uniqueResults.slice(0, limit)
    
  } catch (error) {
    console.error('Error searching providers by specialty:', error)
    return []
  }
}

// Format provider name for display
export function formatProviderName(provider: NPIProvider): string {
  if (provider.basic?.organization_name) {
    return provider.basic.organization_name
  }
  
  const parts = []
  if (provider.basic?.name_prefix) parts.push(provider.basic.name_prefix)
  if (provider.basic?.first_name) parts.push(provider.basic.first_name)
  if (provider.basic?.middle_name) parts.push(provider.basic.middle_name)
  if (provider.basic?.last_name) parts.push(provider.basic.last_name)
  if (provider.basic?.name_suffix) parts.push(provider.basic.name_suffix)
  if (provider.basic?.credential) parts.push(provider.basic.credential)
  
  return parts.join(' ') || 'Unknown Provider'
}

// Get primary address for provider
export function getProviderAddress(provider: NPIProvider): string {
  const primaryAddress = provider.addresses?.find(addr => 
    addr.address_purpose === 'LOCATION' || addr.address_purpose === 'MAILING'
  ) || provider.addresses?.[0]
  
  if (!primaryAddress) return 'Address not available'
  
  const parts = [
    primaryAddress.address_1,
    primaryAddress.city,
    primaryAddress.state,
    primaryAddress.postal_code
  ].filter(Boolean)
  
  return parts.join(', ')
}

// Get primary specialty for provider
export function getProviderSpecialty(provider: NPIProvider): string {
  const primaryTaxonomy = provider.taxonomies?.find(tax => tax.primary) || provider.taxonomies?.[0]
  return primaryTaxonomy?.desc || 'General Practice'
}

// Check if provider is accepting new patients (this would need additional data source)
export function isAcceptingPatients(provider: NPIProvider): boolean {
  // This is a placeholder - in reality, you'd need to integrate with additional APIs
  // or databases that track provider availability
  return Math.random() > 0.3 // 70% chance of accepting patients for demo
} 