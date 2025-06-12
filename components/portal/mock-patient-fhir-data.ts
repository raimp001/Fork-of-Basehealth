const mockPatientData = [
  {
    id: '1',
    name: 'Jane Doe',
    dob: '1980-04-12',
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    medications: ['Metformin', 'Lisinopril'],
    labs: ['HbA1c: 7.2%', 'Cholesterol: 210 mg/dL'],
    allergies: ['Penicillin'],
    imaging: ['Chest X-ray (2023-01-10): Normal'],
    progressNotes: ['2024-05-01: Stable, continue current meds.'],
    aiSummary: 'Patient with well-controlled diabetes and hypertension. No acute issues. Continue current management.'
  },
  {
    id: '2',
    name: 'John Smith',
    dob: '1972-09-30',
    conditions: ['Coronary Artery Disease'],
    medications: ['Aspirin', 'Atorvastatin'],
    labs: ['LDL: 130 mg/dL', 'EKG: Normal'],
    allergies: ['None'],
    imaging: ['Echocardiogram (2023-03-15): Mild LVH'],
    progressNotes: ['2024-04-20: Doing well, follow up in 6 months.'],
    aiSummary: 'History of CAD, on appropriate secondary prevention. No new symptoms.'
  },
  {
    id: '3',
    name: 'Emily Lee',
    dob: '1990-11-05',
    conditions: ['Asthma'],
    medications: ['Albuterol inhaler'],
    labs: ['Spirometry: Mild obstruction'],
    allergies: ['Sulfa drugs'],
    imaging: ['Chest CT (2022-12-01): No acute findings'],
    progressNotes: ['2024-03-10: Asthma well controlled.'],
    aiSummary: 'Asthma, well controlled on current regimen. No recent exacerbations.'
  }
]

export default mockPatientData 