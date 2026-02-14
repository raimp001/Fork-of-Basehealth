import { NextResponse } from "next/server"

// USPSTF Grade A and B Recommendations with Provider Suggestions


type CdcRecommendation = {
  id: string
  name: string
  minAge: number
  maxAge: number
  notes: string
}

const CDC_GUIDELINES: CdcRecommendation[] = [
  { id: 'flu', name: 'Influenza vaccine', minAge: 6, maxAge: 120, notes: 'CDC recommends annual influenza vaccination for everyone 6 months and older.' },
  { id: 'covid', name: 'COVID-19 vaccine', minAge: 6, maxAge: 120, notes: 'CDC recommends staying up to date with age-appropriate COVID-19 vaccination.' },
  { id: 'tdap', name: 'Td/Tdap booster', minAge: 18, maxAge: 120, notes: 'CDC recommends Td or Tdap booster every 10 years for adults.' },
  { id: 'shingles', name: 'Shingles (Shingrix)', minAge: 50, maxAge: 120, notes: 'CDC recommends 2-dose Shingrix for adults 50+.' },
  { id: 'pneumococcal', name: 'Pneumococcal vaccine', minAge: 65, maxAge: 120, notes: 'CDC recommends pneumococcal vaccination for adults 65+ and younger adults with certain risks.' },
]

function getCdcRecommendations(age: number) {
  return CDC_GUIDELINES.filter((g) => age >= g.minAge && age <= g.maxAge)
}

const USPSTF_GUIDELINES = [
  // Grade A - Strongly Recommended
  { 
    id: 'bp-screening', 
    name: 'Blood Pressure Screening', 
    grade: 'A', 
    minAge: 18, 
    maxAge: 120, 
    gender: 'all', 
    frequency: 'Annually', 
    description: 'Screen for high blood pressure in adults 18 years or older. Early detection prevents heart disease and stroke.',
    primaryProvider: 'Primary Care Physician',
    alternativeProviders: ['Internal Medicine', 'Family Medicine'],
    canBeDoneBy: 'primary',
    riskFactors: [] 
  },
  { 
    id: 'colorectal-cancer', 
    name: 'Colorectal Cancer Screening', 
    grade: 'A', 
    minAge: 45, 
    maxAge: 75, 
    gender: 'all', 
    frequency: 'Every 10 years (colonoscopy) or annually (stool test)', 
    description: 'Colonoscopy or stool-based tests to detect colorectal cancer early when treatment is most effective.',
    primaryProvider: 'Gastroenterologist',
    alternativeProviders: ['Colorectal Surgeon'],
    canBeDoneBy: 'specialist',
    riskFactors: ['family history of colorectal cancer'] 
  },
  { 
    id: 'cervical-cancer', 
    name: 'Cervical Cancer Screening', 
    grade: 'A', 
    minAge: 21, 
    maxAge: 65, 
    gender: 'female', 
    frequency: 'Every 3 years (Pap) or 5 years (HPV co-test)', 
    description: 'Pap smear and/or HPV testing to detect cervical cancer and precancerous changes.',
    primaryProvider: 'OB/GYN',
    alternativeProviders: ['Primary Care Physician', 'Family Medicine'],
    canBeDoneBy: 'either',
    riskFactors: [] 
  },
  { 
    id: 'hiv-screening', 
    name: 'HIV Screening', 
    grade: 'A', 
    minAge: 15, 
    maxAge: 65, 
    gender: 'all', 
    frequency: 'At least once; more often if at risk', 
    description: 'One-time HIV test for all adults. Early detection allows for effective treatment.',
    primaryProvider: 'Primary Care Physician',
    alternativeProviders: ['Infectious Disease Specialist', 'Family Medicine'],
    canBeDoneBy: 'primary',
    riskFactors: [] 
  },
  { 
    id: 'lung-cancer', 
    name: 'Lung Cancer Screening', 
    grade: 'A', 
    minAge: 50, 
    maxAge: 80, 
    gender: 'all', 
    frequency: 'Annually', 
    description: 'Annual low-dose CT scan for adults with significant smoking history (20+ pack-years).',
    primaryProvider: 'Pulmonologist',
    alternativeProviders: ['Radiologist', 'Thoracic Surgeon'],
    canBeDoneBy: 'specialist',
    riskFactors: ['smoking', 'current smoker', 'former smoker', 'tobacco use'] 
  },
  { 
    id: 'preeclampsia', 
    name: 'Preeclampsia Prevention', 
    grade: 'A', 
    minAge: 18, 
    maxAge: 50, 
    gender: 'female', 
    frequency: 'During pregnancy', 
    description: 'Low-dose aspirin starting at 12 weeks for pregnant women at high risk of preeclampsia.',
    primaryProvider: 'OB/GYN',
    alternativeProviders: ['Maternal-Fetal Medicine Specialist'],
    canBeDoneBy: 'specialist',
    riskFactors: ['pregnant', 'high blood pressure'] 
  },

  // Grade B - Recommended
  { 
    id: 'breast-cancer', 
    name: 'Breast Cancer Screening (Mammogram)', 
    grade: 'B', 
    minAge: 50, 
    maxAge: 74, 
    gender: 'female', 
    frequency: 'Every 2 years', 
    description: 'Biennial screening mammography to detect breast cancer early.',
    primaryProvider: 'Radiologist',
    alternativeProviders: ['Breast Surgeon', 'OB/GYN (referral)'],
    canBeDoneBy: 'specialist',
    riskFactors: [] 
  },
  { 
    id: 'diabetes-screening', 
    name: 'Diabetes Screening', 
    grade: 'B', 
    minAge: 35, 
    maxAge: 70, 
    gender: 'all', 
    frequency: 'Every 3 years', 
    description: 'Blood glucose or HbA1c test to screen for prediabetes and type 2 diabetes in overweight adults.',
    primaryProvider: 'Primary Care Physician',
    alternativeProviders: ['Endocrinologist', 'Internal Medicine'],
    canBeDoneBy: 'primary',
    riskFactors: ['overweight', 'obese', 'family history of diabetes'] 
  },
  { 
    id: 'depression-screening', 
    name: 'Depression Screening', 
    grade: 'B', 
    minAge: 12, 
    maxAge: 120, 
    gender: 'all', 
    frequency: 'Annually', 
    description: 'Questionnaire-based screening for major depressive disorder (PHQ-9).',
    primaryProvider: 'Primary Care Physician',
    alternativeProviders: ['Psychiatrist', 'Psychologist'],
    canBeDoneBy: 'primary',
    riskFactors: [] 
  },
  { 
    id: 'statin-prevention', 
    name: 'Statin for Heart Disease Prevention', 
    grade: 'B', 
    minAge: 40, 
    maxAge: 75, 
    gender: 'all', 
    frequency: 'Discuss with provider', 
    description: 'Statin medication for adults with cardiovascular risk factors to prevent heart attacks and strokes.',
    primaryProvider: 'Primary Care Physician',
    alternativeProviders: ['Cardiologist', 'Internal Medicine'],
    canBeDoneBy: 'primary',
    riskFactors: ['high cholesterol', 'high blood pressure', 'diabetes', 'smoking'] 
  },
  { 
    id: 'osteoporosis', 
    name: 'Osteoporosis Screening (Bone Density)', 
    grade: 'B', 
    minAge: 65, 
    maxAge: 120, 
    gender: 'female', 
    frequency: 'As recommended by provider', 
    description: 'DEXA bone density scan to screen for osteoporosis and fracture risk.',
    primaryProvider: 'Primary Care Physician',
    alternativeProviders: ['Endocrinologist', 'Rheumatologist'],
    canBeDoneBy: 'primary',
    riskFactors: [] 
  },
  { 
    id: 'abdominal-aortic', 
    name: 'Abdominal Aortic Aneurysm Screening', 
    grade: 'B', 
    minAge: 65, 
    maxAge: 75, 
    gender: 'male', 
    frequency: 'One-time', 
    description: 'One-time ultrasound screening for men 65-75 who have ever smoked.',
    primaryProvider: 'Vascular Surgeon',
    alternativeProviders: ['Primary Care (referral)', 'Radiologist'],
    canBeDoneBy: 'specialist',
    riskFactors: ['smoking', 'former smoker'] 
  },
  { 
    id: 'hep-c', 
    name: 'Hepatitis C Screening', 
    grade: 'B', 
    minAge: 18, 
    maxAge: 79, 
    gender: 'all', 
    frequency: 'One-time (more if at risk)', 
    description: 'Blood test to screen for hepatitis C virus infection.',
    primaryProvider: 'Primary Care Physician',
    alternativeProviders: ['Gastroenterologist', 'Infectious Disease'],
    canBeDoneBy: 'primary',
    riskFactors: [] 
  },
  { 
    id: 'anxiety-screening', 
    name: 'Anxiety Screening', 
    grade: 'B', 
    minAge: 8, 
    maxAge: 64, 
    gender: 'all', 
    frequency: 'Annually', 
    description: 'Questionnaire-based screening for anxiety disorders (GAD-7).',
    primaryProvider: 'Primary Care Physician',
    alternativeProviders: ['Psychiatrist', 'Psychologist'],
    canBeDoneBy: 'primary',
    riskFactors: [] 
  },
  { 
    id: 'sti-screening', 
    name: 'STI Screening (Chlamydia/Gonorrhea)', 
    grade: 'B', 
    minAge: 15, 
    maxAge: 24, 
    gender: 'female', 
    frequency: 'Annually if sexually active', 
    description: 'Annual screening for chlamydia and gonorrhea in sexually active young women.',
    primaryProvider: 'Primary Care Physician',
    alternativeProviders: ['OB/GYN', 'Urgent Care'],
    canBeDoneBy: 'primary',
    riskFactors: ['sexually active'] 
  },
  { 
    id: 'obesity-counseling', 
    name: 'Weight Management Counseling', 
    grade: 'B', 
    minAge: 18, 
    maxAge: 120, 
    gender: 'all', 
    frequency: 'Ongoing', 
    description: 'Intensive behavioral interventions for adults with obesity to promote weight loss.',
    primaryProvider: 'Primary Care Physician',
    alternativeProviders: ['Registered Dietitian', 'Endocrinologist'],
    canBeDoneBy: 'primary',
    riskFactors: ['overweight', 'obese', 'high bmi'] 
  },
  { 
    id: 'lipid-screening', 
    name: 'Cholesterol Screening', 
    grade: 'B', 
    minAge: 40, 
    maxAge: 75, 
    gender: 'all', 
    frequency: 'Every 5 years', 
    description: 'Lipid panel blood test to measure cholesterol levels and assess cardiovascular risk.',
    primaryProvider: 'Primary Care Physician',
    alternativeProviders: ['Cardiologist', 'Internal Medicine'],
    canBeDoneBy: 'primary',
    riskFactors: [] 
  },
]

function getRecommendations(age: number, gender: string, riskFactors: string[]) {
  const normalizedGender = gender.toLowerCase()
  const normalizedRisks = riskFactors.map(r => r.toLowerCase())
  
  return USPSTF_GUIDELINES.filter(g => {
    // Age check
    if (age < g.minAge || age > g.maxAge) return false
    
    // Gender check
    if (g.gender !== 'all' && g.gender !== normalizedGender) return false
    
    // If guideline has specific risk factors, check if patient has any
    if (g.riskFactors.length > 0) {
      const hasRiskFactor = g.riskFactors.some(rf => 
        normalizedRisks.some(nr => nr.includes(rf) || rf.includes(nr))
      )
      if (!hasRiskFactor) return false
    }
    
    return true
  }).map(g => ({
    id: g.id,
    name: g.name,
    description: g.description,
    frequency: g.frequency,
    grade: g.grade,
    importance: g.grade === 'A' ? 'essential' : 'recommended',
    // Provider information
    primaryProvider: g.primaryProvider,
    alternativeProviders: g.alternativeProviders,
    canBeDoneBy: g.canBeDoneBy,
    providerNote: g.canBeDoneBy === 'primary' 
      ? `Your Primary Care Physician can perform this screening during a regular visit.`
      : g.canBeDoneBy === 'specialist'
      ? `This requires a specialist. Ask your PCP for a referral to a ${g.primaryProvider}.`
      : `This can be done by your Primary Care Physician or a ${g.primaryProvider}.`
  }))
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ageParam = searchParams.get("age")
    const gender = searchParams.get("gender") || "all"
    const riskFactorsParam = searchParams.get("riskFactors")
    const riskFactors = riskFactorsParam ? riskFactorsParam.split(",").filter(Boolean) : []

    if (!ageParam) {
      return NextResponse.json({ error: "Age parameter is required" }, { status: 400 })
    }

    const age = Number.parseInt(ageParam)
    if (isNaN(age)) {
      return NextResponse.json({ error: "Age must be a number" }, { status: 400 })
    }

    const recommendations = getRecommendations(age, gender, riskFactors)
    
    // Sort by grade (A first, then B)
    recommendations.sort((a, b) => a.grade.localeCompare(b.grade))

    const cdcRecommendations = getCdcRecommendations(age)

    return NextResponse.json({ 
      success: true,
      recommendations,
      cdcRecommendations,
      count: recommendations.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error fetching screening recommendations:", error)
    return NextResponse.json({ 
      success: false,
      error: "An error occurred while fetching screening recommendations" 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      age, 
      gender, 
      smokingStatus, 
      medicalHistory = [], 
      familyHistory = [], 
      bmiCategory,
      isPregnant,
      sexuallyActive
    } = body

    if (!age || !gender) {
      return NextResponse.json({ 
        success: false,
        error: "Age and gender are required" 
      }, { status: 400 })
    }

    // Build comprehensive risk factors list
    const riskFactors: string[] = []
    
    // Smoking
    if (smokingStatus === 'current') riskFactors.push('smoking', 'current smoker', 'tobacco use')
    if (smokingStatus === 'former') riskFactors.push('former smoker')
    
    // BMI
    if (bmiCategory === 'overweight') riskFactors.push('overweight')
    if (bmiCategory === 'obese') riskFactors.push('obese', 'high bmi')
    
    // Pregnancy
    if (isPregnant) riskFactors.push('pregnant')
    
    // Sexual activity
    if (sexuallyActive) riskFactors.push('sexually active')
    
    // Medical history
    if (medicalHistory.includes('hypertension')) riskFactors.push('high blood pressure')
    if (medicalHistory.includes('diabetes')) riskFactors.push('diabetes')
    if (medicalHistory.includes('high-cholesterol')) riskFactors.push('high cholesterol')
    
    // Family history
    if (familyHistory.includes('cancer')) riskFactors.push('family history of colorectal cancer')
    if (familyHistory.includes('diabetes')) riskFactors.push('family history of diabetes')
    if (familyHistory.includes('heart-disease')) riskFactors.push('cardiovascular disease')

    const recommendations = getRecommendations(Number(age), gender, riskFactors)
    const cdcRecommendations = getCdcRecommendations(Number(age))
    
    // Sort by grade
    recommendations.sort((a, b) => a.grade.localeCompare(b.grade))

    // Summarize provider types needed
    const specialistNeeded = recommendations.filter(r => r.canBeDoneBy === 'specialist')
    const primaryCareCanDo = recommendations.filter(r => r.canBeDoneBy === 'primary')

    return NextResponse.json({ 
      success: true,
      recommendations,
      cdcRecommendations,
      count: recommendations.length,
      summary: {
        totalScreenings: recommendations.length,
        gradeACount: recommendations.filter(r => r.grade === 'A').length,
        gradeBCount: recommendations.filter(r => r.grade === 'B').length,
        primaryCareScreenings: primaryCareCanDo.length,
        specialistReferralsNeeded: specialistNeeded.length,
        specialistsNeeded: [...new Set(specialistNeeded.map(r => r.primaryProvider))]
      },
      riskProfile: {
        factors: riskFactors,
        level: riskFactors.length > 3 ? 'elevated' : riskFactors.length > 0 ? 'moderate' : 'low'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Error processing screening assessment:", error)
    return NextResponse.json({ 
      success: false,
      error: "An error occurred while processing your assessment" 
    }, { status: 500 })
  }
}
