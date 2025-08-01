export const uspstfGuidelines = [
  {
    screening: "Breast Cancer: Screening",
    gender: "female",
    minAge: 40,
    maxAge: 74,
    frequency: "Every 2 years",
    grade: "B",
    description: "Biennial screening mammography for women aged 40 to 74 years.",
    riskFactors: [], // Universal screening for all women in age range
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening"
  },
  {
    screening: "Breast Cancer: Enhanced Screening (High Risk)",
    gender: "female",
    minAge: 30,
    maxAge: 74,
    frequency: "Annually or as recommended by provider",
    grade: "B",
    description: "Enhanced screening for women at high risk for breast cancer, including those with personal/family history.",
    riskFactors: ["Family history of breast cancer", "Family history of ovarian cancer", "Personal history of cancer", "Previous abnormal mammogram", "Ashkenazi Jewish ancestry", "BRCA genetic mutation"],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening"
  },
  {
    screening: "Colorectal Cancer: Screening",
    gender: "all",
    minAge: 45,
    maxAge: 75,
    frequency: "Every 10 years (colonoscopy); other tests may be more frequent",
    grade: "A",
    description: "Screen adults aged 45 to 75 for colorectal cancer.",
    riskFactors: [], // Universal screening for all in age range
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening"
  },
  {
    screening: "Colorectal Cancer: High Risk Screening (Family History - Early Onset)",
    gender: "all",
    minAge: 40,
    maxAge: 75,
    frequency: "Every 10 years (colonoscopy), or 10 years before earliest family diagnosis",
    grade: "A",
    description: "High-risk screening for individuals with first-degree relatives diagnosed with colorectal cancer before age 50, or with multiple affected first-degree relatives.",
    riskFactors: ["family history colorectal cancer age < 50", "high risk colorectal cancer family history", "multiple first degree relatives colorectal cancer", "earliest family diagnosis age"],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening",
    specialtyNeeded: "Gastroenterology"
  },
  {
    screening: "Colorectal Cancer: Moderate Risk Screening (Family History 50-59)",
    gender: "all",
    minAge: 40,
    maxAge: 75,
    frequency: "Every 10 years (colonoscopy)",
    grade: "B",
    description: "Earlier screening for individuals with first-degree relatives diagnosed with colorectal cancer between ages 50-59.",
    riskFactors: ["family history colorectal cancer age 50-59", "moderate risk colorectal cancer family history"],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening",
    specialtyNeeded: "Gastroenterology"
  },
  {
    screening: "Colorectal Cancer: Lynch Syndrome Screening",
    gender: "all",
    minAge: 25,
    maxAge: 75,
    frequency: "Every 1-2 years (colonoscopy)",
    grade: "A",
    description: "Intensive screening for individuals with suspected Lynch syndrome or meeting Amsterdam criteria.",
    riskFactors: ["suspected lynch syndrome", "3+ relatives colorectal cancer", "family colorectal cancer age < 45", "family endometrial cancer age < 50"],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening",
    specialtyNeeded: "Gastroenterology, Genetic Counseling"
  },
  {
    screening: "Colorectal Cancer: Personal History Risk",
    gender: "all",
    minAge: 18,
    maxAge: 75,
    frequency: "As recommended by specialist",
    grade: "A",
    description: "Enhanced surveillance for individuals with personal history of polyps, IBD, or previous colorectal cancer.",
    riskFactors: ["Personal history of polyps or abnormal colonoscopy", "Inflammatory bowel disease", "Personal history of cancer"],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening",
    specialtyNeeded: "Gastroenterology"
  },
  {
    screening: "Cervical Cancer: Screening",
    gender: "female",
    minAge: 21,
    maxAge: 65,
    frequency: "Every 3 years (cytology alone, 21-29); Every 3 years (cytology alone), or every 5 years (hrHPV alone or cotesting, 30-65)",
    grade: "A",
    description: "Screen women aged 21 to 65 years for cervical cancer.",
    riskFactors: ["Sexually active", "Multiple sexual partners (>1 in past year)", "History of sexually transmitted infections", "Previous abnormal pap smear", "Never had a pap smear", "Pap smear overdue (>3 years)", "HIV positive"],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/cervical-cancer-screening"
  },
  {
    screening: "Hypertension: Screening",
    gender: "all",
    minAge: 18,
    maxAge: 120,
    frequency: "At each visit or at least annually",
    grade: "A",
    description: "Screen for high blood pressure in adults 18 years or older.",
    riskFactors: [], // Universal screening
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/high-blood-pressure-in-adults-screening"
  },
  {
    screening: "Lipid Disorders: Statin Use for Primary Prevention",
    gender: "all",
    minAge: 40,
    maxAge: 75,
    frequency: "Annually or as clinically indicated",
    grade: "B",
    description: "Prescribe a statin for the primary prevention of CVD for adults aged 40 to 75 years who have 1 or more CVD risk factors and an estimated 10-year CVD risk of 10% or greater.",
    riskFactors: ["High cholesterol (dyslipidemia)", "Diabetes or pre-diabetes", "High blood pressure (hypertension)", "Current smoker", "Former smoker", "Family history of heart disease", "Obesity (BMI ≥30)"],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/statin-use-in-adults-preventive-medication"
  },
  {
    screening: "Diabetes Mellitus (Type 2) and Prediabetes: Screening",
    gender: "all",
    minAge: 35,
    maxAge: 70,
    frequency: "Every 3 years",
    grade: "B",
    description: "Screen for prediabetes and type 2 diabetes in adults aged 35 to 70 years who are overweight or obese.",
    riskFactors: ["Overweight (BMI 25-29.9)", "Obesity (BMI ≥30)", "Family history of diabetes", "High blood pressure (hypertension)", "High cholesterol (dyslipidemia)", "Sedentary lifestyle"],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-for-prediabetes-and-type-2-diabetes"
  },
  {
    screening: "Osteoporosis: Screening (Women 50-64 with risk factors)",
    gender: "female",
    minAge: 50,
    maxAge: 64,
    frequency: "As clinically indicated",
    grade: "B",
    description: "Screen for osteoporosis in women aged 50 to 64 years whose risk of fracture is equal to or greater than that of a 65-year-old white woman who has no additional risk factors.",
    riskFactors: ["Family history of osteoporosis", "Low body weight (BMI <18.5)", "Current smoker", "Former smoker", "Excessive alcohol use (>7 drinks/week for women, >14 for men)", "Previous fracture after age 50", "Early menopause (before age 45)", "Long-term steroid use", "Sedentary lifestyle"],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/osteoporosis-screening"
  },
  {
    screening: "Osteoporosis: Screening (Women 65+)",
    gender: "female",
    minAge: 65,
    maxAge: 120,
    frequency: "As clinically indicated",
    grade: "B",
    description: "Screen for osteoporosis in women aged 65 years or older.",
    riskFactors: [],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/osteoporosis-screening"
  },
  {
    screening: "Lung Cancer: Screening",
    gender: "all",
    minAge: 50,
    maxAge: 80,
    frequency: "Annually (if risk factors present)",
    grade: "B",
    description: "Annual screening for lung cancer with low-dose CT in adults aged 50 to 80 years who have a 20 pack-year smoking history and currently smoke or have quit within the past 15 years.",
    riskFactors: ["Current smoker", "Former smoker", "20+ pack-year smoking history", "quit within past 15 years", "smoking"],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/lung-cancer-screening"
  },
  {
    screening: "Chlamydia and Gonorrhea: Screening (Women ≤24)",
    gender: "female",
    minAge: 16,
    maxAge: 24,
    frequency: "Annually or as clinically indicated",
    grade: "B",
    description: "Screen for chlamydia and gonorrhea in sexually active women aged 24 years or younger and in women 25 years or older who are at increased risk.",
    riskFactors: ["Sexually active", "Multiple sexual partners (>1 in past year)", "History of sexually transmitted infections"],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/chlamydia-and-gonorrhea-screening"
  },
  {
    screening: "Chlamydia and Gonorrhea: Screening (Women 25+ at risk)",
    gender: "female",
    minAge: 25,
    maxAge: 65,
    frequency: "Annually or as clinically indicated",
    grade: "B",
    description: "Screen for chlamydia and gonorrhea in women 25 years or older who are at increased risk.",
    riskFactors: ["Sexually active", "Multiple sexual partners (>1 in past year)", "History of sexually transmitted infections"],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/chlamydia-and-gonorrhea-screening"
  },
  {
    screening: "Abdominal Aortic Aneurysm: Screening (Men 65-75 who have ever smoked)",
    gender: "male",
    minAge: 65,
    maxAge: 75,
    frequency: "Once",
    grade: "B",
    description: "One-time screening for abdominal aortic aneurysm (AAA) with ultrasonography in men aged 65 to 75 years who have ever smoked.",
    riskFactors: ["Current smoker", "Former smoker", "smoking history"],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/abdominal-aortic-aneurysm-screening"
  },
  {
    screening: "Prostate Cancer: Shared Decision-Making (Men 55-69)",
    gender: "male",
    minAge: 55,
    maxAge: 69,
    frequency: "Discuss with provider",
    grade: "C",
    description: "The decision to undergo periodic prostate-specific antigen (PSA)–based screening for prostate cancer should be an individual one for men aged 55 to 69 years.",
    riskFactors: ["Family history of prostate cancer", "African American ethnicity (prostate cancer risk)", "Personal history of cancer"],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/prostate-cancer-screening"
  },
  {
    screening: "Obesity: Screening and Behavioral Interventions",
    gender: "all",
    minAge: 18,
    maxAge: 120,
    frequency: "Annually or as clinically indicated",
    grade: "B",
    description: "Offer or refer adults with a BMI of 30 or higher to intensive, multicomponent behavioral interventions.",
    riskFactors: ["BMI >= 30"],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/obesity-in-adults-interventions"
  },
  {
    screening: "Unhealthy Alcohol Use: Screening and Counseling",
    gender: "all",
    minAge: 18,
    maxAge: 120,
    frequency: "Annually or as clinically indicated",
    grade: "B",
    description: "Screen for unhealthy alcohol use in primary care settings in adults 18 years or older, including pregnant women, and provide persons engaged in risky or hazardous drinking with brief behavioral counseling interventions.",
    riskFactors: ["alcohol use"],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/unhealthy-alcohol-use-in-adolescents-and-adults-screening-and-behavioral-counseling-interventions"
  },
  {
    screening: "Tobacco Use: Counseling and Interventions",
    gender: "all",
    minAge: 18,
    maxAge: 120,
    frequency: "Annually or as clinically indicated",
    grade: "A",
    description: "Ask all adults about tobacco use, advise them to stop using tobacco, and provide behavioral interventions and FDA-approved pharmacotherapy for cessation to nonpregnant adults who use tobacco.",
    riskFactors: ["tobacco use", "smoking"],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/tobacco-use-in-adults-and-pregnant-women-counseling-and-interventions"
  },
  {
    screening: "Depression: Screening (Adults)",
    gender: "all",
    minAge: 18,
    maxAge: 120,
    frequency: "Annually or as clinically indicated",
    grade: "B",
    description: "Screen for depression in the general adult population, including pregnant and postpartum women.",
    riskFactors: [],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/depression-in-adults-screening"
  },
  {
    screening: "Anxiety: Screening (Adults ≤64)",
    gender: "all",
    minAge: 18,
    maxAge: 64,
    frequency: "Annually or as clinically indicated",
    grade: "B",
    description: "Screen for anxiety disorders in adults, including pregnant and postpartum persons.",
    riskFactors: [],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/anxiety-adults-screening"
  },
  // Add more as needed from the official USPSTF A & B recommendations page
];

export function getScreeningRecommendations(age: number, gender: string, riskFactors: string[] = []) {
  return uspstfGuidelines.filter(g =>
    (g.gender === gender || g.gender === "all") &&
    age >= g.minAge &&
    age <= g.maxAge &&
    (
      riskFactors.length === 0 ||
      g.riskFactors.length === 0 ||
      g.riskFactors.some(rf => riskFactors.some(f => f.toLowerCase().includes(rf.toLowerCase()) || rf.toLowerCase().includes(f.toLowerCase())))
    )
  )
} 