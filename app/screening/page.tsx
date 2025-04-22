import { SimplifiedScreening } from "@/components/screening/simplified-screening"

export const metadata = {
  title: "Health Screenings | BaseHealth",
  description: "Get personalized health screening recommendations based on your profile",
}

export default function ScreeningPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Health Screening Recommendations</h1>
      <SimplifiedScreening />
    </div>
  )
}
