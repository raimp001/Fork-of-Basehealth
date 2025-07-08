"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Search, Filter, Clock, Users, Database, Info, Sparkles, User, Calendar, X, AlertCircle, CheckCircle, ExternalLink, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { calculateTrialDistance } from "@/lib/geocoding"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Lightbulb } from "lucide-react"

interface ClinicalTrial {
  id: string
  title: string
  condition: string
  phase: string
  location: string
  distance?: number
  locationRelevance?: number
  sponsor: string
  status: string
  description: string
  eligibility: string[]
  estimatedEnrollment: number
  studyType: string
  facilityName?: string
}

interface EligibilityForm {
  age: string
  gender: string
  medicalConditions: string[]
  currentMedications: string
  previousTreatments: string
  additionalInfo: string
}

interface EligibilityResult {
  isEligible: boolean
  score: number
  reasons: string[]
  recommendations: string[]
}

// Location relevance scoring function for sorting
function calculateLocationRelevance(userLocation: string, trialLocation: { city?: string, state?: string, country?: string }): number {
  if (!userLocation || !trialLocation.city) return 0
  
  const userLower = userLocation.toLowerCase()
  const trialCity = trialLocation.city?.toLowerCase() || ''
  const trialState = trialLocation.state?.toLowerCase() || ''
  const trialCountry = trialLocation.country?.toLowerCase() || ''
  
  // Exact city match - highest relevance
  if (trialCity.includes(userLower) || userLower.includes(trialCity)) {
    return 100
  }
  
  // Same state/region - high relevance
  if (trialState.includes(userLower) || userLower.includes(trialState)) {
    return 80
  }
  
  // Same country - medium relevance
  if (trialCountry.includes('united states') && (userLower.includes('usa') || userLower.includes('us') || userLower.includes('america'))) {
    return 60
  }
  
  // Different country - low relevance
  return 20
}

export default function ClinicalTrialsPage() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [trials, setTrials] = useState<ClinicalTrial[]>([])
  const [isLoadingTrials, setIsLoadingTrials] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedQuery, setParsedQuery] = useState<{
    conditions: string[]
    locations: string[]
    ages: string[]
    treatments: string[]
    other: string[]
  }>({
    conditions: [],
    locations: [],
    ages: [],
    treatments: [],
    other: []
  })

  // Eligibility check state
  const [selectedTrialForEligibility, setSelectedTrialForEligibility] = useState<ClinicalTrial | null>(null)
  const [isEligibilityDialogOpen, setIsEligibilityDialogOpen] = useState(false)
  const [eligibilityForm, setEligibilityForm] = useState<EligibilityForm>({
    age: "",
    gender: "",
    medicalConditions: [],
    currentMedications: "",
    previousTreatments: "",
    additionalInfo: ""
  })
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false)

  // Parse natural language query to extract search terms
  const parseQuery = (query: string) => {
    const lowerQuery = query.toLowerCase()
    
    // Common medical conditions (ordered by specificity - more specific first)
    const conditions = [
      'alzheimer disease', 'alzheimer\'s disease', 'alzheimer', 'parkinson disease', 'parkinson\'s disease', 'parkinson',
      'lung cancer', 'breast cancer', 'prostate cancer', 'colon cancer', 'brain cancer', 'pancreatic cancer',
      'heart disease', 'kidney disease', 'liver disease', 'multiple sclerosis', 'high blood pressure',
      'covid-19', 'covid', 'cancer', 'diabetes', 'stroke', 'leukemia', 'lymphoma', 'melanoma', 
      'asthma', 'copd', 'depression', 'anxiety', 'bipolar', 'schizophrenia', 'autism', 'adhd',
      'arthritis', 'osteoporosis', 'fibromyalgia', 'lupus', 'hypertension', 'obesity'
    ]
    
    // US states and major cities (ordered by specificity)
    const locations = [
      // Major cities first (more specific)
      'new york city', 'los angeles', 'san francisco', 'san diego', 'san antonio', 'san jose',
      'fort worth', 'jacksonville', 'new orleans', 'las vegas', 'kansas city', 'virginia beach',
      'boston', 'chicago', 'houston', 'phoenix', 'philadelphia', 'dallas', 'austin', 
      'columbus', 'charlotte', 'indianapolis', 'seattle', 'denver', 'washington', 'atlanta',
      'miami', 'detroit', 'nashville', 'baltimore', 'memphis', 'milwaukee', 'portland',
      'birmingham', 'orlando', 'tampa', 'jacksonville',
      // State abbreviations and full names
      'new york', 'california', 'texas', 'florida', 'illinois', 'pennsylvania', 'ohio', 
      'georgia', 'north carolina', 'michigan', 'new jersey', 'virginia', 'washington',
      'arizona', 'massachusetts', 'tennessee', 'indiana', 'missouri', 'maryland', 'wisconsin',
      'colorado', 'minnesota', 'south carolina', 'alabama', 'louisiana', 'kentucky', 'oregon',
      'oklahoma', 'connecticut', 'utah', 'iowa', 'nevada', 'arkansas', 'mississippi', 'kansas',
      'new mexico', 'nebraska', 'west virginia', 'idaho', 'hawaii', 'new hampshire', 'maine',
      'montana', 'rhode island', 'delaware', 'south dakota', 'north dakota', 'alaska', 'vermont', 'wyoming',
      'ny', 'ca', 'tx', 'fl', 'il', 'pa', 'oh', 'ga', 'nc', 'mi', 'nj', 'va', 'wa', 'az', 'ma'
    ]
    
    // Common treatments
    const treatments = [
      'chemotherapy', 'radiation', 'immunotherapy', 'surgery', 'transplant',
      'drug', 'medication', 'therapy', 'treatment', 'vaccine', 'clinical trial'
    ]
    
    const foundConditions: string[] = []
    const foundLocations: string[] = []
    const foundAges: string[] = []
    const foundTreatments: string[] = []
    const otherTerms: string[] = []
    
    // Extract conditions
    conditions.forEach(condition => {
      if (lowerQuery.includes(condition)) {
        foundConditions.push(condition)
      }
    })
    
    // Extract locations
    locations.forEach(location => {
      if (lowerQuery.includes(location)) {
        foundLocations.push(location)
      }
    })
    
    // Extract treatments
    treatments.forEach(treatment => {
      if (lowerQuery.includes(treatment)) {
        foundTreatments.push(treatment)
      }
    })
    
    // Extract age information
    const ageMatches = query.match(/(\d+)\s*(year|yr|age)/gi)
    if (ageMatches) {
      foundAges.push(...ageMatches)
    }
    
    // Extract other meaningful terms (remove common words)
    const commonWords = ['the', 'and', 'or', 'in', 'at', 'for', 'with', 'year', 'old', 'years']
    const words = query.toLowerCase().split(/\s+/)
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '')
      if (cleanWord.length > 2 && 
          !commonWords.includes(cleanWord) && 
          !foundConditions.some(c => c.includes(cleanWord)) &&
          !foundLocations.some(l => l.includes(cleanWord)) &&
          !foundTreatments.some(t => t.includes(cleanWord))) {
        otherTerms.push(cleanWord)
      }
    })
    
    return {
      conditions: foundConditions,
      locations: foundLocations,
      ages: foundAges,
      treatments: foundTreatments,
      other: otherTerms
    }
  }

  // Fetch trials from ClinicalTrials.gov API
  const fetchTrials = async (query: string) => {
    if (!query.trim()) {
      setTrials([])
      return
    }

    setIsLoadingTrials(true)
    setError(null)
    
    try {
      // Parse the query
      const parsed = parseQuery(query)
      setParsedQuery(parsed)
      
      // Build search query from parsed terms with better logic
      let searchTerms: string[] = []
      
      // Prioritize medical conditions - these should be the main search terms
      if (parsed.conditions.length > 0) {
        // Use the most specific condition found
        const primaryCondition = parsed.conditions.find(c => c.includes(' ')) || parsed.conditions[0]
        searchTerms.push(primaryCondition)
      } else if (parsed.other.length > 0) {
        // If no medical conditions found, use other meaningful terms
        searchTerms.push(...parsed.other.slice(0, 2))
      } else {
        // Fallback to the original query
        searchTerms.push(query.trim())
      }
      
      // Use our API route to avoid CORS issues
      const params = new URLSearchParams({
        'pageSize': '50',
        'query': searchTerms.join(' '),  // Use space for phrase search
        'userLocation': parsed.locations.length > 0 ? parsed.locations[0] : ''  // Pass user location for filtering
      })
      
      const response = await fetch(`/api/clinical-trials?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Transform API response to our interface
      const transformedTrials: ClinicalTrial[] = data.studies?.map((study: any) => {
        const protocolSection = study.protocolSection || {}
        const identificationModule = protocolSection.identificationModule || {}
        const statusModule = protocolSection.statusModule || {}
        const designModule = protocolSection.designModule || {}
        const conditionsModule = protocolSection.conditionsModule || {}
        const descriptionModule = protocolSection.descriptionModule || {}
        const eligibilityModule = protocolSection.eligibilityModule || {}
        const contactsLocationsModule = protocolSection.contactsLocationsModule || {}
        const sponsorCollaboratorsModule = protocolSection.sponsorCollaboratorsModule || {}

        // Get first location for display - handle different API response structures
        const locations = contactsLocationsModule.locations || []
        const firstLocation = locations[0] || {}
        
        // Handle different possible location field names from ClinicalTrials.gov API
        const locationCity = firstLocation.city || firstLocation.locationCity || firstLocation.City
        const locationState = firstLocation.state || firstLocation.locationState || firstLocation.State  
        const locationCountry = firstLocation.country || firstLocation.locationCountry || firstLocation.Country || 'United States'
        
        // Location structure parsed successfully
        
        const locationString = [locationCity, locationState, locationCountry]
          .filter(Boolean).join(', ')

        // Create normalized location object for distance calculation
        const normalizedLocation = {
          city: locationCity,
          state: locationState,
          country: locationCountry
        }

        // Calculate actual distance if location was mentioned in query
        const distance = parsed.locations.length > 0 ? 
          calculateTrialDistance(parsed.locations[0], normalizedLocation) : null
        
        // Distance calculation completed
        
        // Calculate location relevance for sorting
        const locationRelevance = parsed.locations.length > 0 ? 
          calculateLocationRelevance(parsed.locations[0], firstLocation) : 0

        return {
          id: identificationModule.nctId || 'Unknown',
          title: identificationModule.briefTitle || 'No title available',
          condition: conditionsModule.conditions?.[0] || 'Not specified',
          phase: designModule.phases?.[0] || 'Not specified',
          location: locationString || 'Location not specified',
          distance,
          locationRelevance,
          sponsor: sponsorCollaboratorsModule.leadSponsor?.name || 'Not specified',
          status: statusModule.overallStatus || 'Unknown',
          description: descriptionModule.briefSummary || 'No description available',
          eligibility: eligibilityModule.eligibilityCriteria ? 
            eligibilityModule.eligibilityCriteria.split('\n').filter(line => line.trim() !== '') : 
            ['Eligibility criteria not available'],
          estimatedEnrollment: statusModule.enrollmentInfo?.count || 0,
          studyType: designModule.studyType || 'Not specified',
          facilityName: firstLocation.facility || 'Not specified'
        }
      }) || []

      // Sort by location relevance if location was provided
      if (parsed.locations.length > 0) {
        transformedTrials.sort((a, b) => (b.locationRelevance || 0) - (a.locationRelevance || 0))
      }

      setTrials(transformedTrials)
    } catch (err) {
      console.error('Error fetching trials:', err)
      setError('Failed to fetch clinical trials. Please try again.')
      setTrials([])
    } finally {
      setIsLoadingTrials(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchTrials(searchQuery)
      } else {
        setTrials([])
        setParsedQuery({ conditions: [], locations: [], ages: [], treatments: [], other: [] })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchTrials(searchQuery)
    }
  }

  const handleEligibilityCheck = async (trial: ClinicalTrial) => {
    setSelectedTrialForEligibility(trial)
    setIsEligibilityDialogOpen(true)
    setEligibilityResult(null)
    setEligibilityForm({
      age: "",
      gender: "",
      medicalConditions: [],
      currentMedications: "",
      previousTreatments: "",
      additionalInfo: ""
    })
  }

  const checkEligibility = async () => {
    if (!selectedTrialForEligibility) return

    setIsCheckingEligibility(true)
    
    try {
      // Enhanced AI eligibility assessment based on real trial criteria
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const age = parseInt(eligibilityForm.age)
      const trial = selectedTrialForEligibility
      
      let score = 0
      const reasons: string[] = []
      const recommendations: string[] = []
      
      // Parse and analyze actual trial eligibility criteria
      const eligibilityCriteria = trial.eligibility
      const patientConditions = eligibilityForm.medicalConditions.map(c => c.toLowerCase())
      const patientMeds = eligibilityForm.currentMedications.toLowerCase()
      const patientTreatments = eligibilityForm.previousTreatments.toLowerCase()
      const additionalInfo = eligibilityForm.additionalInfo.toLowerCase()
      const patientGender = eligibilityForm.gender.toLowerCase()
      
      console.log('Analyzing eligibility for:', trial.title)
      console.log('Patient data:', { age, patientConditions, patientGender })
      console.log('Trial criteria:', eligibilityCriteria)
      
      // Enhanced Age Analysis
      const ageMatches = analyzeAgeCriteria(eligibilityCriteria, age)
      score += ageMatches.score
      reasons.push(...ageMatches.reasons)
      
      // Gender Analysis
      const genderMatches = analyzeGenderCriteria(eligibilityCriteria, patientGender)
      score += genderMatches.score
      reasons.push(...genderMatches.reasons)
      
      // Medical Condition Analysis
      const conditionMatches = analyzeConditionCriteria(eligibilityCriteria, patientConditions, trial.condition)
      score += conditionMatches.score
      reasons.push(...conditionMatches.reasons)
      
      // Medication Analysis
      const medicationMatches = analyzeMedicationCriteria(eligibilityCriteria, patientMeds)
      score += medicationMatches.score
      reasons.push(...medicationMatches.reasons)
      
      // Previous Treatment Analysis
      const treatmentMatches = analyzeTreatmentCriteria(eligibilityCriteria, patientTreatments)
      score += treatmentMatches.score
      reasons.push(...treatmentMatches.reasons)
      
      // Performance Status and Additional Criteria
      const additionalMatches = analyzeAdditionalCriteria(eligibilityCriteria, additionalInfo, age)
      score += additionalMatches.score
      reasons.push(...additionalMatches.reasons)
      
      // Location/Travel Analysis
      if (trial.distance !== null && trial.distance !== undefined) {
        if (trial.distance <= 50) {
          score += 5
          reasons.push("✓ Trial location is conveniently accessible")
        } else if (trial.distance <= 200) {
          score += 2
          reasons.push("? Trial location requires some travel")
          recommendations.push("Consider travel arrangements for study visits")
        } else {
          reasons.push("⚠ Trial location requires significant travel")
          recommendations.push("Evaluate feasibility of regular study visits")
        }
      }
      
      // Generate personalized recommendations
      if (score >= 80) {
        recommendations.push("🎯 You appear to be an excellent candidate for this trial")
        recommendations.push("📞 Contact the study coordinator immediately to discuss enrollment")
        recommendations.push("📋 Prepare your complete medical records for screening")
      } else if (score >= 60) {
        recommendations.push("✅ You may be eligible, but additional screening is required")
        recommendations.push("📞 Schedule a consultation to discuss your specific situation")
        recommendations.push("📋 Gather detailed medical history and current test results")
      } else if (score >= 40) {
        recommendations.push("⚠️ Eligibility is uncertain based on available information")
        recommendations.push("🩺 Consult with your healthcare provider about this trial")
        recommendations.push("📋 Additional medical evaluations may be needed")
      } else {
        recommendations.push("❌ This trial may not be suitable based on current criteria")
        recommendations.push("🔍 Consider exploring other available clinical trials")
        recommendations.push("👩‍⚕️ Discuss alternative treatment options with your healthcare team")
      }
      
      // Add trial-specific guidance
      if (trial.phase === "Phase I") {
        recommendations.push("ℹ️ This is an early-phase trial focused on safety and dosing")
      } else if (trial.phase === "Phase II") {
        recommendations.push("ℹ️ This trial is evaluating effectiveness while monitoring safety")
      } else if (trial.phase === "Phase III") {
        recommendations.push("ℹ️ This is a large-scale trial comparing new treatment to standard care")
      }
      
      setEligibilityResult({
        isEligible: score >= 40,
        score: Math.min(score, 100), // Cap at 100
        reasons,
        recommendations
      })
      
    } catch (err) {
      setError("Failed to check eligibility. Please try again.")
    } finally {
      setIsCheckingEligibility(false)
    }
  }

  // Enhanced eligibility analysis functions
  function analyzeAgeCriteria(criteria: string[], age: number) {
    let score = 0
    const reasons: string[] = []
    
    for (const criterion of criteria) {
      const lowerCriterion = criterion.toLowerCase()
      
      // Look for age-related criteria
      if (lowerCriterion.includes('age') || lowerCriterion.includes('years')) {
        // Extract age ranges
        const ageRangeMatch = lowerCriterion.match(/(\d+).*?(?:to|-).*?(\d+).*?years?/i) ||
                             lowerCriterion.match(/between.*?(\d+).*?and.*?(\d+).*?years?/i)
        
        if (ageRangeMatch) {
          const minAge = parseInt(ageRangeMatch[1])
          const maxAge = parseInt(ageRangeMatch[2])
          
          if (age >= minAge && age <= maxAge) {
            score += 25
            reasons.push(`✓ Meets age requirement (${minAge}-${maxAge} years)`)
          } else {
            reasons.push(`✗ Does not meet age requirement (must be ${minAge}-${maxAge} years)`)
          }
        } else {
          // Look for minimum age
          const minAgeMatch = lowerCriterion.match(/(\d+).*?years?.*?(?:or|and).*?older/i) ||
                             lowerCriterion.match(/(?:minimum|at least).*?(\d+).*?years?/i) ||
                             lowerCriterion.match(/(\d+).*?years?.*?of age.*?or.*?older/i)
          
          if (minAgeMatch) {
            const minAge = parseInt(minAgeMatch[1])
            if (age >= minAge) {
              score += 25
              reasons.push(`✓ Meets minimum age requirement (${minAge}+ years)`)
            } else {
              reasons.push(`✗ Does not meet minimum age requirement (must be ${minAge}+ years)`)
            }
          }
          
          // Look for maximum age
          const maxAgeMatch = lowerCriterion.match(/(?:under|younger than|less than).*?(\d+).*?years?/i) ||
                             lowerCriterion.match(/(?:maximum|no more than).*?(\d+).*?years?/i)
          
          if (maxAgeMatch) {
            const maxAge = parseInt(maxAgeMatch[1])
            if (age <= maxAge) {
              score += 15
              reasons.push(`✓ Meets maximum age requirement (under ${maxAge} years)`)
            } else {
              reasons.push(`✗ Exceeds maximum age requirement (must be under ${maxAge} years)`)
            }
          }
        }
      }
    }
    
    return { score, reasons }
  }

  function analyzeGenderCriteria(criteria: string[], patientGender: string) {
    let score = 0
    const reasons: string[] = []
    
    for (const criterion of criteria) {
      const lowerCriterion = criterion.toLowerCase()
      
      if (lowerCriterion.includes('male') && !lowerCriterion.includes('female')) {
        if (patientGender === 'male') {
          score += 20
          reasons.push("✓ Meets gender requirement (male)")
        } else if (patientGender === 'female') {
          reasons.push("✗ Does not meet gender requirement (male only)")
        }
      } else if (lowerCriterion.includes('female') && !lowerCriterion.includes('male')) {
        if (patientGender === 'female') {
          score += 20
          reasons.push("✓ Meets gender requirement (female)")
        } else if (patientGender === 'male') {
          reasons.push("✗ Does not meet gender requirement (female only)")
        }
      } else if (lowerCriterion.includes('both') || (lowerCriterion.includes('male') && lowerCriterion.includes('female'))) {
        score += 20
        reasons.push("✓ Trial accepts all genders")
      }
    }
    
    return { score, reasons }
  }

  function analyzeConditionCriteria(criteria: string[], patientConditions: string[], trialCondition: string) {
    let score = 0
    const reasons: string[] = []
    const trialConditionLower = trialCondition.toLowerCase()
    
    // Check if patient has the primary condition
    const hasMainCondition = patientConditions.some(condition => 
      trialConditionLower.includes(condition) || condition.includes(trialConditionLower.split(' ')[0])
    )
    
    if (hasMainCondition) {
      score += 30
      reasons.push(`✓ Has diagnosed ${trialCondition}`)
    } else {
      reasons.push(`✗ Must have confirmed ${trialCondition} diagnosis`)
    }
    
    // Analyze specific inclusion criteria
    for (const criterion of criteria) {
      const lowerCriterion = criterion.toLowerCase()
      
      // Look for stage/grade requirements
      if (lowerCriterion.includes('stage') || lowerCriterion.includes('grade')) {
        reasons.push("ℹ️ Specific disease stage/grade requirements apply")
      }
      
      // Look for metastatic requirements
      if (lowerCriterion.includes('metastatic') || lowerCriterion.includes('advanced')) {
        reasons.push("ℹ️ Advanced/metastatic disease may be required")
      }
      
      // Look for treatment-naive requirements
      if (lowerCriterion.includes('treatment-naive') || lowerCriterion.includes('untreated')) {
        reasons.push("ℹ️ May require no previous treatment")
      }
      
      // Look for recurrent disease
      if (lowerCriterion.includes('recurrent') || lowerCriterion.includes('relapsed')) {
        reasons.push("ℹ️ May require recurrent/relapsed disease")
      }
    }
    
    return { score, reasons }
  }

  function analyzeMedicationCriteria(criteria: string[], patientMeds: string) {
    let score = 0
    const reasons: string[] = []
    
    for (const criterion of criteria) {
      const lowerCriterion = criterion.toLowerCase()
      
      // Look for prohibited medications
      const prohibitedMeds = ['warfarin', 'immunosuppressive', 'chemotherapy', 'radiation']
      const hasProhibitedMed = prohibitedMeds.some(med => 
        lowerCriterion.includes(`no ${med}`) && patientMeds.includes(med)
      )
      
      if (hasProhibitedMed) {
        reasons.push("⚠️ Current medications may conflict with trial requirements")
      }
      
      // Look for required medications or treatments
      if (lowerCriterion.includes('must be on') || lowerCriterion.includes('requires')) {
        reasons.push("ℹ️ Specific medication requirements may apply")
      }
      
      // Washout period requirements
      if (lowerCriterion.includes('washout') || lowerCriterion.includes('days since')) {
        reasons.push("ℹ️ May require washout period from previous treatments")
      }
    }
    
    if (patientMeds.trim()) {
      score += 5
      reasons.push("✓ Current medications documented for review")
    }
    
    return { score, reasons }
  }

  function analyzeTreatmentCriteria(criteria: string[], patientTreatments: string) {
    let score = 0
    const reasons: string[] = []
    
    for (const criterion of criteria) {
      const lowerCriterion = criterion.toLowerCase()
      
      // Previous treatment requirements
      if (lowerCriterion.includes('previous') || lowerCriterion.includes('prior')) {
        if (lowerCriterion.includes('no previous') || lowerCriterion.includes('treatment-naive')) {
          if (!patientTreatments.trim()) {
            score += 15
            reasons.push("✓ Meets treatment-naive requirement")
          } else {
            reasons.push("✗ May not meet treatment-naive requirement")
          }
        } else {
          if (patientTreatments.trim()) {
            score += 15
            reasons.push("✓ Has previous treatment history as required")
          } else {
            reasons.push("? Previous treatment history may be required")
          }
        }
      }
      
      // Specific treatment types
      if (lowerCriterion.includes('surgery') || lowerCriterion.includes('surgical')) {
        reasons.push("ℹ️ Surgical history requirements may apply")
      }
      
      if (lowerCriterion.includes('radiation') || lowerCriterion.includes('radiotherapy')) {
        reasons.push("ℹ️ Radiation therapy history requirements may apply")
      }
      
      if (lowerCriterion.includes('chemotherapy') || lowerCriterion.includes('systemic therapy')) {
        reasons.push("ℹ️ Chemotherapy history requirements may apply")
      }
    }
    
    return { score, reasons }
  }

  function analyzeAdditionalCriteria(criteria: string[], additionalInfo: string, age: number) {
    let score = 0
    const reasons: string[] = []
    
    for (const criterion of criteria) {
      const lowerCriterion = criterion.toLowerCase()
      
      // Performance status
      if (lowerCriterion.includes('performance status') || lowerCriterion.includes('karnofsky') || lowerCriterion.includes('ecog')) {
        reasons.push("ℹ️ Performance status evaluation required")
        score += 5
      }
      
      // Life expectancy
      if (lowerCriterion.includes('life expectancy')) {
        reasons.push("ℹ️ Life expectancy requirements apply")
      }
      
      // Organ function
      if (lowerCriterion.includes('adequate') && (lowerCriterion.includes('liver') || lowerCriterion.includes('kidney') || lowerCriterion.includes('bone marrow'))) {
        reasons.push("ℹ️ Adequate organ function required (lab tests needed)")
      }
      
      // Pregnancy/contraception
      if (lowerCriterion.includes('pregnancy') || lowerCriterion.includes('contraception')) {
        reasons.push("ℹ️ Pregnancy testing and contraception requirements may apply")
      }
      
      // Mental capacity
      if (lowerCriterion.includes('able to provide informed consent') || lowerCriterion.includes('decision-making capacity')) {
        score += 10
        reasons.push("✓ Assumes ability to provide informed consent")
      }
      
      // Geographic restrictions
      if (lowerCriterion.includes('willing to travel') || lowerCriterion.includes('able to attend')) {
        reasons.push("ℹ️ Regular study visits required")
      }
    }
    
    return { score, reasons }
  }

  const handleMedicalConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      setEligibilityForm(prev => ({
        ...prev,
        medicalConditions: [...prev.medicalConditions, condition]
      }))
    } else {
      setEligibilityForm(prev => ({
        ...prev,
        medicalConditions: prev.medicalConditions.filter(c => c !== condition)
      }))
    }
  }

  const exampleQueries = [
    "lung cancer 45 year old in New York",
    "breast cancer treatment in California",
    "diabetes medication trial Boston",
    "heart disease surgery Texas",
    "alzheimer drug study 70 years old"
  ]

  const getRelevantMedicalConditions = (trialCondition: string, eligibilityCriteria: string[]) => {
    const condition = trialCondition.toLowerCase()
    const criteria = eligibilityCriteria.join(' ').toLowerCase()
    
    let conditions: string[] = []
    
    // Base conditions that are relevant to the trial condition
    if (condition.includes('cancer') || condition.includes('carcinoma') || condition.includes('tumor') || condition.includes('oncolog') || condition.includes('sarcoma')) {
      conditions.push('Cancer History')
      
      // Specific cancer types
      if (condition.includes('lung') || criteria.includes('lung')) {
        conditions.push('Lung Cancer')
      }
      if (condition.includes('breast') || criteria.includes('breast')) {
        conditions.push('Breast Cancer')
      }
      if (condition.includes('prostate') || criteria.includes('prostate')) {
        conditions.push('Prostate Cancer')
      }
      if (condition.includes('osteosarcoma') || criteria.includes('osteosarcoma') || condition.includes('bone') || criteria.includes('bone')) {
        conditions.push('Osteosarcoma')
        conditions.push('Bone Cancer')
        conditions.push('Bone Tumors')
      }
      if (condition.includes('metastatic') || criteria.includes('metastatic') || condition.includes('metastases') || criteria.includes('metastases')) {
        conditions.push('Metastatic Disease')
        conditions.push('Distant Metastases')
      }
      if (condition.includes('sarcoma') || criteria.includes('sarcoma')) {
        conditions.push('Soft Tissue Sarcoma')
        conditions.push('Bone Sarcoma')
      }
      
      // Cancer-related conditions
      conditions.push('Previous Chemotherapy')
      conditions.push('Previous Radiation')
      conditions.push('Previous Surgery')
      conditions.push('Recurrent Disease')
    }
    
    if (condition.includes('diabetes') || criteria.includes('diabetes')) {
      conditions.push('Type 1 Diabetes')
      conditions.push('Type 2 Diabetes')
    }
    
    if (condition.includes('heart') || condition.includes('cardiovascular') || criteria.includes('cardiac')) {
      conditions.push('Heart Disease')
      conditions.push('High Blood Pressure')
      conditions.push('Heart Attack History')
    }
    
    if (condition.includes('alzheimer') || condition.includes('dementia') || criteria.includes('cognitive')) {
      conditions.push('Alzheimer\'s Disease')
      conditions.push('Dementia')
      conditions.push('Memory Problems')
    }
    
    if (condition.includes('depression') || condition.includes('anxiety') || criteria.includes('mental')) {
      conditions.push('Depression')
      conditions.push('Anxiety')
    }
    
    // Only add generic conditions if we don't have specific ones yet
    if (conditions.length === 0) {
      // Common conditions that might be relevant exclusion criteria
      conditions.push('Kidney Disease')
      conditions.push('Liver Disease')
      conditions.push('Autoimmune Disease')
      conditions.push('Current Pregnancy')
    } else {
      // Add some common exclusion criteria for specific conditions
      conditions.push('Kidney Disease')
      conditions.push('Liver Disease')
      conditions.push('Autoimmune Disease')
      conditions.push('Current Pregnancy')
    }
    
    // Remove duplicates and add "Other" option
    conditions = [...new Set(conditions)]
    conditions.push('Other')
    
    return conditions
  }

  return (
    <div className="min-h-screen bg-healthcare-hero">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-cyan-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-slate-900 hover:text-slate-700 transition-colors">
              BaseHealth
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/screening" className="text-slate-700 hover:text-slate-900 transition-colors">
                Screening
              </Link>
              <Link href="/patient-portal" className="text-slate-700 hover:text-slate-900 transition-colors">
                Patient Portal
              </Link>
              <Link href="/second-opinion" className="text-slate-600 hover:text-slate-800 transition-colors opacity-75">
                Second Opinion  
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
            Clinical Trial Discovery
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">Clinical Trials</span> Made Simple
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Discover clinical trials that match your medical profile using AI-powered search. 
            Get personalized eligibility assessments and connect with cutting-edge research opportunities.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Enhanced Search Card */}
          <Card className="border-0 shadow-xl healthcare-card backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <Search className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Find Clinical Trials</h2>
                  <p className="text-slate-600">Search by condition, location, age, or treatment type</p>
                </div>
              </div>

              <div className="relative mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g., lung cancer, heart disease, diabetes in New York, breast cancer clinical trials for women over 50..."
                  className="w-full px-6 py-4 text-lg border-2 border-sky-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all duration-200 bg-white/90"
                />
                <Button 
                  onClick={handleSearch}
                  disabled={isLoadingTrials || !searchQuery.trim()}
                  className="absolute right-2 top-2 h-12 px-6 bg-healthcare-primary hover:scale-105 transition-all duration-200"
                >
                  {isLoadingTrials ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Example Queries */}
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-700 mb-3">Try these examples:</p>
                <div className="flex flex-wrap gap-2">
                  {exampleQueries.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(example)}
                      className="px-3 py-1 text-sm bg-white/80 border border-sky-200 text-sky-700 rounded-full hover:bg-sky-50 transition-all duration-200 hover:shadow-md"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parsed Query Display */}
              {(parsedQuery.conditions.length > 0 || parsedQuery.locations.length > 0 || parsedQuery.treatments.length > 0) && (
                <div className="bg-white/80 rounded-lg p-4 border border-sky-200 backdrop-blur-sm">
                  <p className="text-sm font-medium text-slate-700 mb-2">🤖 AI detected:</p>
                  <div className="flex flex-wrap gap-2">
                    {parsedQuery.conditions.map((condition, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded border border-red-200">
                        Condition: {condition}
                      </span>
                    ))}
                    {parsedQuery.treatments.map((treatment, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-sky-50 text-sky-700 rounded border border-sky-200">
                        Treatment: {treatment}
                      </span>
                    ))}
                    {parsedQuery.locations.map((location, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                        Location: {location}
                      </span>
                    ))}
                    {parsedQuery.ages.map((age, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-violet-50 text-violet-700 rounded border border-violet-200">
                        Age: {age}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm text-sky-700 mt-4 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Powered by ClinicalTrials.gov - Official U.S. database of clinical studies
              </p>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoadingTrials && (
            <Card className="border-0 shadow-xl healthcare-card backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Searching ClinicalTrials.gov database...</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Alert className="mb-8 border-red-200 bg-red-50/80 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Results Summary */}
          {!isLoadingTrials && !error && trials.length > 0 && (
            <Alert className="mb-6 border-emerald-200 bg-emerald-50/80 backdrop-blur-sm">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-emerald-800">
                Found <strong>{trials.length}</strong> clinical trials matching "{searchQuery}"
              </AlertDescription>
            </Alert>
          )}

          {/* Enhanced Clinical Trials List */}
          <div className="space-y-6">
            {!isLoadingTrials && !error && trials.map((trial) => (
              <Card key={trial.id} className="border-0 shadow-xl healthcare-card backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{trial.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                        <Badge className="bg-sky-100 text-sky-700 border-sky-200">{trial.phase}</Badge>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{trial.status}</Badge>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {trial.distance !== null && trial.distance !== undefined ? 
                            `${trial.distance} miles away` : 
                            trial.location
                          }
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {trial.estimatedEnrollment} participants
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Study ID</p>
                      <p className="font-mono text-sm font-medium bg-slate-100 px-2 py-1 rounded">{trial.id}</p>
                    </div>
                  </div>

                  <p className="text-slate-700 mb-4 line-clamp-3">{trial.description}</p>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Study Details</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li><strong>Condition:</strong> {trial.condition}</li>
                        <li><strong>Location:</strong> {trial.location}</li>
                        <li><strong>Facility:</strong> {trial.facilityName}</li>
                        <li><strong>Sponsor:</strong> {trial.sponsor}</li>
                        <li><strong>Enrollment:</strong> {trial.estimatedEnrollment} participants</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Eligibility Criteria</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {trial.eligibility.map((criteria, index) => (
                          <li key={index}>• {criteria}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      asChild
                      className="bg-healthcare-primary hover:scale-105 shadow-lg transition-all duration-200"
                    >
                      <a 
                        href={`https://clinicaltrials.gov/study/${trial.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        View on ClinicalTrials.gov
                      </a>
                    </Button>
                    <div>
                      <Button 
                        variant="outline" 
                        className="border-sky-600 text-sky-600 hover:bg-sky-50 shadow-lg"
                        onClick={() => handleEligibilityCheck(trial)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Check Eligibility
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!isLoadingTrials && !error && searchQuery && trials.length === 0 && (
            <Card className="border-0 shadow-xl healthcare-card backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <p className="text-slate-500 text-lg">No clinical trials found for "{searchQuery}"</p>
                <p className="text-slate-400 mt-2">Try different search terms or check the examples above.</p>
              </CardContent>
            </Card>
          )}

          {!searchQuery && !isLoadingTrials && (
            <Card className="border-0 shadow-xl healthcare-card backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <Sparkles className="h-16 w-16 text-sky-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Start Your Search</h3>
                  <p className="text-slate-600">
                    Enter your condition, age, location, or treatment preferences in the search box above to find relevant clinical trials.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Separate Controlled Eligibility Dialog */}
      <Dialog open={isEligibilityDialogOpen} onOpenChange={setIsEligibilityDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border-0 shadow-2xl">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <User className="h-5 w-5 text-indigo-600" />
              Eligibility Check: {selectedTrialForEligibility?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="pt-6">
            {!eligibilityResult ? (
              <div className="space-y-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Please provide your medical information to check eligibility for this clinical trial. This is a preliminary assessment only.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-gray-700 font-medium">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="120"
                      placeholder="Enter your age"
                      value={eligibilityForm.age}
                      onChange={(e) => setEligibilityForm(prev => ({ ...prev, age: e.target.value }))}
                      className="w-full bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-gray-700 font-medium">Gender *</Label>
                    <Select value={eligibilityForm.gender} onValueChange={(value) => setEligibilityForm(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger className="w-full bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="z-[99999] bg-white border border-gray-300 shadow-lg" position="popper" sideOffset={5}>
                        <SelectItem value="male" className="hover:bg-gray-100">Male</SelectItem>
                        <SelectItem value="female" className="hover:bg-gray-100">Female</SelectItem>
                        <SelectItem value="other" className="hover:bg-gray-100">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Medical Conditions (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg border">
                    {getRelevantMedicalConditions(
                      selectedTrialForEligibility?.condition || '',
                      selectedTrialForEligibility?.eligibility || []
                    ).map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={condition}
                          checked={eligibilityForm.medicalConditions.includes(condition.toLowerCase())}
                          onCheckedChange={(checked) => handleMedicalConditionChange(condition.toLowerCase(), checked as boolean)}
                          className="border-gray-400"
                        />
                        <Label htmlFor={condition} className="text-sm text-gray-700 cursor-pointer">{condition}</Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Conditions relevant to: {selectedTrialForEligibility?.condition}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications" className="text-gray-700 font-medium">Current Medications</Label>
                  <Textarea
                    id="medications"
                    placeholder={`List any current medications, especially those related to ${selectedTrialForEligibility?.condition || 'your condition'}...`}
                    value={eligibilityForm.currentMedications}
                    onChange={(e) => setEligibilityForm(prev => ({ ...prev, currentMedications: e.target.value }))}
                    className="min-h-[80px] bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatments" className="text-gray-700 font-medium">Previous Treatments</Label>
                  <Textarea
                    id="treatments"
                    placeholder={`Describe any previous treatments for ${selectedTrialForEligibility?.condition || 'your condition'} (surgery, chemotherapy, radiation, etc.)...`}
                    value={eligibilityForm.previousTreatments}
                    onChange={(e) => setEligibilityForm(prev => ({ ...prev, previousTreatments: e.target.value }))}
                    className="min-h-[80px] bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional" className="text-gray-700 font-medium">Additional Medical Information</Label>
                  <Textarea
                    id="additional"
                    placeholder="Any other relevant medical information, allergies, or health conditions that might be important for this clinical trial..."
                    value={eligibilityForm.additionalInfo}
                    onChange={(e) => setEligibilityForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    className="min-h-[80px] bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    onClick={checkEligibility}
                    disabled={!eligibilityForm.age || !eligibilityForm.gender || isCheckingEligibility}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 shadow-lg"
                  >
                    {isCheckingEligibility ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Checking Eligibility...
                      </div>
                    ) : (
                      "Check Eligibility"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Enhanced Eligibility Score Display */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Eligibility Assessment</h3>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">{eligibilityResult.score}%</div>
                        <div className="text-sm text-gray-600">Match Score</div>
                      </div>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        eligibilityResult.score >= 80 ? 'bg-green-100 text-green-600' :
                        eligibilityResult.score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                        eligibilityResult.score >= 40 ? 'bg-orange-100 text-orange-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {eligibilityResult.score >= 80 ? '🎯' :
                         eligibilityResult.score >= 60 ? '✅' :
                         eligibilityResult.score >= 40 ? '⚠️' : '❌'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        eligibilityResult.score >= 80 ? 'bg-green-500' :
                        eligibilityResult.score >= 60 ? 'bg-yellow-500' :
                        eligibilityResult.score >= 40 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(eligibilityResult.score, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-center">
                    <span className={`text-sm font-medium ${
                      eligibilityResult.score >= 80 ? 'text-green-700' :
                      eligibilityResult.score >= 60 ? 'text-yellow-700' :
                      eligibilityResult.score >= 40 ? 'text-orange-700' :
                      'text-red-700'
                    }`}>
                      {eligibilityResult.score >= 80 ? 'Excellent Candidate' :
                       eligibilityResult.score >= 60 ? 'Good Candidate' :
                       eligibilityResult.score >= 40 ? 'Possible Candidate' :
                       'Unlikely Candidate'}
                    </span>
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Search className="h-5 w-5 text-indigo-600" />
                    Detailed Analysis
                  </h4>
                  
                  <div className="space-y-3">
                    {eligibilityResult.reasons.map((reason, index) => {
                      const isPositive = reason.startsWith('✓')
                      const isNegative = reason.startsWith('✗')
                      const isInfo = reason.startsWith('ℹ️')
                      const isWarning = reason.startsWith('⚠')
                      const isQuestion = reason.startsWith('?')
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border-l-4 ${
                            isPositive ? 'bg-green-50 border-green-400 text-green-800' :
                            isNegative ? 'bg-red-50 border-red-400 text-red-800' :
                            isWarning ? 'bg-orange-50 border-orange-400 text-orange-800' :
                            isQuestion ? 'bg-yellow-50 border-yellow-400 text-yellow-800' :
                            'bg-blue-50 border-blue-400 text-blue-800'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg leading-none">
                              {isPositive ? '✅' :
                               isNegative ? '❌' :
                               isWarning ? '⚠️' :
                               isQuestion ? '❓' :
                               'ℹ️'}
                            </span>
                            <span className="text-sm font-medium">{reason.substring(2)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    Recommendations
                  </h4>
                  
                  <div className="space-y-3">
                    {eligibilityResult.recommendations.map((recommendation, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                        <div className="flex items-start gap-3">
                          <span className="text-lg leading-none">
                            {recommendation.includes('🎯') ? '🎯' :
                             recommendation.includes('📞') ? '📞' :
                             recommendation.includes('📋') ? '📋' :
                             recommendation.includes('🩺') ? '🩺' :
                             recommendation.includes('🔍') ? '🔍' :
                             recommendation.includes('👩‍⚕️') ? '👩‍⚕️' :
                             recommendation.includes('ℹ️') ? 'ℹ️' :
                             '💡'}
                          </span>
                          <span className="text-sm text-indigo-800 font-medium leading-relaxed">
                            {recommendation.replace(/^[🎯📞📋🩺🔍👩‍⚕️ℹ️💡]\s*/, '')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Important Disclaimer */}
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Important:</strong> This is a preliminary assessment only. Final eligibility must be determined by the study team through official screening procedures. Always consult with your healthcare provider before participating in any clinical trial.
                  </AlertDescription>
                </Alert>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button 
                    asChild
                    className="bg-healthcare-primary hover:scale-105 shadow-lg transition-all duration-200 flex-1"
                  >
                    <a 
                      href={`https://clinicaltrials.gov/study/${selectedTrialForEligibility?.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Full Study Details
                    </a>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEligibilityResult(null)
                      setEligibilityForm({
                        age: "",
                        gender: "",
                        medicalConditions: [],
                        currentMedications: "",
                        previousTreatments: "",
                        additionalInfo: ""
                      })
                    }}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Check Another Trial
                  </Button>
                </div>
              </div>
            )}

            {isCheckingEligibility && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Analyzing eligibility criteria...</p>
                  <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
                </div>
              </div>
            )}

            {!eligibilityResult && !isCheckingEligibility && (
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEligibilityDialogOpen(false)}
                  className="border-gray-300 hover:bg-gray-50 w-full"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}