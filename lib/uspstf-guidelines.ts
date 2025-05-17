export const uspstfGuidelines = [
  {
    screening: "Breast Cancer: Screening",
    gender: "female",
    minAge: 40,
    maxAge: 74,
    frequency: "Every 2 years",
    grade: "B",
    description: "Biennial screening mammography for women aged 40 to 74 years.",
    riskFactors: [],
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
    riskFactors: [],
    link: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening"
  },
  {
    screening: "Cervical Cancer: Screening",
    gender: "female",
    minAge: 21,
    maxAge: 65,
    frequency: "Every 3 years (cytology alone, 21-29); Every 3 years (cytology alone), or every 5 years (hrHPV alone or cotesting, 30-65)",
    grade: "A",
    description: "Screen women aged 21 to 65 years for cervical cancer.",
    riskFactors: [],
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
    riskFactors: [],
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
    riskFactors: ["dyslipidemia", "diabetes", "hypertension", "smoking"],
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
    riskFactors: ["overweight", "obesity"],
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
    riskFactors: ["family history of osteoporosis", "low body weight", "smoking", "excessive alcohol"],
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
    riskFactors: ["smoking", "20 pack-year history"],
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
    riskFactors: ["sexually active", "multiple partners", "history of STIs"],
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
    riskFactors: ["sexually active", "multiple partners", "history of STIs"],
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
    riskFactors: ["smoking history"],
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
    riskFactors: ["family history of prostate cancer", "African American ethnicity"],
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