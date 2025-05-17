import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wallet, UserPlus, ShieldCheck } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header: Logo and Connect Wallet */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Basehealth Logo"
            className="h-12 w-12 drop-shadow-md"
          />
          <span className="text-2xl md:text-3xl font-bold text-blue-700 tracking-tight">Basehealth</span>
        </div>
        <Button variant="outline" className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition px-5 py-2 rounded-lg">
          <Wallet className="h-5 w-5" /> Connect Wallet
        </Button>
      </header>

      <main className="flex flex-col items-center flex-1 justify-center px-4 w-full">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-4 text-center leading-tight">
          Personalized Health Starts Here
        </h1>
        <p className="text-base md:text-lg text-gray-600 mb-8 text-center max-w-2xl">
          Get evidence-based screening recommendations, find trusted providers, and manage your care—all in one place.
        </p>
        <Button asChild size="lg" className="px-8 py-3 text-base md:text-lg font-semibold mb-8 shadow-lg hover:scale-105 transition-transform rounded-xl">
          <Link href="/screening">Start AI Screening</Link>
        </Button>

        <div className="w-full max-w-2xl bg-blue-100/60 rounded-xl shadow p-6 mb-8 text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-blue-700 mb-2">Second Opinion</h2>
          <p className="text-gray-700 mb-4">
            Get expert second opinions from verified providers. Post your case, set a bounty, and receive trusted advice.
          </p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition">
            <Link href="/second-opinion">Get a Second Opinion</Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl mb-10">
          <div className="flex-1 bg-white rounded-xl shadow p-6 text-center hover:shadow-xl transition border border-gray-100">
            <UserPlus className="h-7 w-7 text-blue-600 mb-2 mx-auto" />
            <h3 className="text-lg font-semibold mb-2">Provider Sign Up</h3>
            <p className="text-gray-600 mb-4 text-sm">Apply to give second opinions or see patients. Admin will verify your credentials.</p>
            <Button asChild variant="outline" className="border-blue-500 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition w-full">
              <Link href="/providers/signup">Sign Up</Link>
            </Button>
          </div>
          <div className="flex-1 bg-white rounded-xl shadow p-6 text-center hover:shadow-xl transition border border-gray-100">
            <ShieldCheck className="h-7 w-7 text-blue-600 mb-2 mx-auto" />
            <h3 className="text-lg font-semibold mb-2">Admin Portal</h3>
            <p className="text-gray-600 mb-4 text-sm">Verify provider credentials and manage applications.</p>
            <Button asChild variant="outline" className="border-blue-500 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition w-full">
              <Link href="/admin">Go to Admin</Link>
            </Button>
          </div>
        </div>

        <div className="w-full max-w-2xl mt-6 mb-10">
          <ol className="list-decimal list-inside text-gray-500 space-y-3 text-base">
            <li>
              <span className="font-medium text-gray-700">Start with AI Screening:</span> Enter your age, gender, and risk factors to get USPSTF-based recommendations.
            </li>
            <li>
              <span className="font-medium text-gray-700">Second Opinion:</span> Post a case and set a bounty for expert review. Providers are verified and rated by patients.
            </li>
            <li>
              <span className="font-medium text-gray-700">Find a Provider:</span> Search by city, area, or ZIP code. Book a virtual or in-person appointment.
            </li>
            <li>
              <span className="font-medium text-gray-700">Virtual Visits & Scripts:</span> Meet with providers, get prescriptions, labs, or referrals.
            </li>
            <li>
              <span className="font-medium text-gray-700">Pay Securely:</span> Use crypto or card via wallet connection.
            </li>
          </ol>
        </div>
      </main>
    </div>
  )
}
