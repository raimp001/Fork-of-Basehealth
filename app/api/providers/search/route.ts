// File: app/api/providers/search/route.ts

import { NextResponse } from "next/server"
import { Client, PlaceInputType } from "@googlemaps/google-maps-services-js"
import type { PlaceData } from "@googlemaps/google-maps-services-js/dist/common"
import { searchNPIProviders, mapNPITaxonomyToSpecialty, type NPIProvider } from "@/lib/npi-service"

// Provider interface
interface Provider {
  id: string;
  name: string;
  specialty: string;
  rating?: number;
  reviewCount?: number;
  address: {
    full?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  isVerified?: boolean;
  isNearby?: boolean;
  distanceNote?: string;
  website?: string;
  phone?: string;
  npiNumber?: string; // Added NPI number
  credentials?: string; // Added credentials
  acceptsInsurance?: boolean; // Added insurance info
}

const googleMapsClient = new Client({})
const API_KEY = process.env.Maps_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const zipCode = searchParams.get("zipCode")
  const specialty = searchParams.get("specialty") // e.g., "Cardiology"

  if (!API_KEY) {
    console.error("Google Maps API key is missing from environment variables.")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  if (!zipCode) {
    return NextResponse.json({ error: "ZIP code is required" }, { status: 400 })
  }

  try {
    // Step 1: Find providers using Google Maps API
    let googleProviders: Provider[] = [];
    
    // Construct search query for Google Places API
    let query = `healthcare provider in ${zipCode}`
    if (specialty && specialty !== "all") {
      query = `${specialty} ${query}`
    }
    
    // Call Google Places API
    const searchResponse = await googleMapsClient.textSearch({
      params: {
        query: query,
        key: API_KEY,
        type: "doctor,hospital,clinic",
      },
    })

    if (searchResponse.data.status !== "OK" && searchResponse.data.status !== "ZERO_RESULTS") {
      console.error("Google Places Text Search Error:", searchResponse.data.status, searchResponse.data.error_message)
      throw new Error(`Failed to search places: ${searchResponse.data.status}`)
    }

    const searchResults = searchResponse.data.results || []
    
    // Step 2: Get details for each place found
    const googleProviderPromises = searchResults.map(async (place): Promise<Provider | null> => {
      if (!place.place_id) return null
      
      try {
        const detailsResponse = await googleMapsClient.placeDetails({
          params: {
            place_id: place.place_id,
            key: API_KEY,
            fields: [
              "name", "formatted_address", "rating", "user_ratings_total", 
              "website", "formatted_phone_number", "type", "place_id",
            ],
          },
        })

        if (detailsResponse.data.status !== "OK") {
          console.error(`Google Place Details Error for ${place.place_id}:`, detailsResponse.data.status, detailsResponse.data.error_message)
          return null
        }

        const details = detailsResponse.data.result as PlaceData & { types?: string[] }
        
        // Extract city, state, and zip from formatted address
        const addressComponents = {
          city: '',
          state: '',
          zipCode: ''
        };
        
        if (details.formatted_address) {
          const addressParts = details.formatted_address.split(',');
          if (addressParts.length >= 2) {
            // Try to extract ZIP code and state from the last part
            const lastPart = addressParts[addressParts.length - 1].trim();
            const stateZipMatch = lastPart.match(/([A-Z]{2})\s+(\d{5}(-\d{4})?)/);
            
            if (stateZipMatch) {
              addressComponents.state = stateZipMatch[1];
              addressComponents.zipCode = stateZipMatch[2];
            }
            
            // City is typically the second-to-last part
            if (addressParts.length >= 3) {
              addressComponents.city = addressParts[addressParts.length - 2].trim();
            }
          }
        }

        // Map Google Place data to Provider structure
        const provider: Provider = {
          id: details.place_id ?? `google-${Date.now()}`,
          name: details.name ?? "N/A",
          specialty: details.types?.[0]?.replace(/_/g, " ") ?? "Healthcare Provider",
          rating: details.rating,
          reviewCount: details.user_ratings_total,
          address: {
            full: details.formatted_address,
            city: addressComponents.city,
            state: addressComponents.state,
            zipCode: addressComponents.zipCode,
          },
          website: details.website,
          phone: details.formatted_phone_number,
          isVerified: false,
        }
        return provider
      } catch (detailsError) {
        console.error(`Error fetching details for place ${place.place_id}:`, detailsError)
        return null
      }
    })
    
    // Wait for all details requests and filter out nulls
    googleProviders = (await Promise.all(googleProviderPromises)).filter((p): p is Provider => p !== null)

    // Step 3: Search for providers in the NPI registry using the ZIP code
    let npiProviders: NPIProvider[] = [];
    
    try {
      const npiResponse = await searchNPIProviders({
        zip: zipCode,
        taxonomy_description: specialty || undefined,
        limit: 50,
      });
      
      npiProviders = npiResponse.results;
    } catch (npiError) {
      console.error("Error searching NPI providers:", npiError);
      // Continue with Google providers only
    }
    
    // Step 4: Merge the Google and NPI provider data
    const mergedProviders: Provider[] = [];
    
    // First, add all Google providers
    for (const googleProvider of googleProviders) {
      // Try to find a matching NPI provider
      const matchingNpiProvider = npiProviders.find(npiProvider => {
        // Check if names are similar (fuzzy match)
        const googleName = googleProvider.name.toLowerCase();
        const npiFullName = `${npiProvider.basic.first_name} ${npiProvider.basic.last_name}`.toLowerCase();
        
        return googleName.includes(npiFullName) || 
               npiFullName.includes(googleName) ||
               // Also check if addresses are similar
               (googleProvider.address.zipCode && 
                npiProvider.addresses.some(addr => addr.postal_code.startsWith(googleProvider.address.zipCode!)));
      });
      
      if (matchingNpiProvider) {
        // Enhance the Google provider with NPI data
        const primaryTaxonomy = matchingNpiProvider.taxonomies.find(t => t.primary) || matchingNpiProvider.taxonomies[0];
        
        googleProvider.npiNumber = matchingNpiProvider.number;
        googleProvider.isVerified = true;
        googleProvider.credentials = matchingNpiProvider.basic.credential;
        
        // Update the specialty if we have a better one from NPI
        if (primaryTaxonomy) {
          googleProvider.specialty = mapNPITaxonomyToSpecialty(primaryTaxonomy.desc);
        }
        
        mergedProviders.push(googleProvider);
      } else {
        // Keep the original Google provider
        mergedProviders.push(googleProvider);
      }
    }
    
    // Add NPI providers that weren't matched with any Google provider
    for (const npiProvider of npiProviders) {
      const alreadyAdded = mergedProviders.some(p => p.npiNumber === npiProvider.number);
      
      if (!alreadyAdded) {
        // Create a new provider from NPI data
        const primaryAddress = npiProvider.addresses.find(a => a.address_purpose === "LOCATION") || npiProvider.addresses[0];
        const primaryTaxonomy = npiProvider.taxonomies.find(t => t.primary) || npiProvider.taxonomies[0];
        
        const provider: Provider = {
          id: `npi-${npiProvider.number}`,
          name: `${npiProvider.basic.first_name} ${npiProvider.basic.middle_name ? npiProvider.basic.middle_name + ' ' : ''}${npiProvider.basic.last_name}${npiProvider.basic.credential ? ', ' + npiProvider.basic.credential : ''}`,
          specialty: primaryTaxonomy ? mapNPITaxonomyToSpecialty(primaryTaxonomy.desc) : "Healthcare Provider",
          address: {
            full: `${primaryAddress.address_1}${primaryAddress.address_2 ? ', ' + primaryAddress.address_2 : ''}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.postal_code}`,
            city: primaryAddress.city,
            state: primaryAddress.state,
            zipCode: primaryAddress.postal_code,
          },
          phone: primaryAddress.telephone_number,
          npiNumber: npiProvider.number,
          credentials: npiProvider.basic.credential,
          isVerified: true,
        };
        
        mergedProviders.push(provider);
      }
    }
    
    // Sort providers: verified first, then by name
    mergedProviders.sort((a, b) => {
      if (a.isVerified && !b.isVerified) return -1;
      if (!a.isVerified && b.isVerified) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ providers: mergedProviders })
  } catch (error) {
    console.error("Error searching providers:", error)
    return NextResponse.json({ error: "Failed to search providers. Please try again later." }, { status: 500 })
  }
}
