import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Search, Stethoscope, Video, Wallet, MessageSquare } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4">BaseHealth</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-8">
          Connect with healthcare providers, schedule telemedicine appointments, and manage prescriptions securely with
          cryptocurrency payments on Base.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <Link href="/screening">
            <Button className="px-6">
              Get Started <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/providers/search">
            <Button variant="outline" className="px-6">
              Find Providers <Search className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Personalized Screening */}
          <div className="border rounded-md p-8 flex flex-col items-center text-center">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Personalized Screening</h2>
            <p className="text-sm text-muted-foreground mb-2">
              Get health screening recommendations based on your profile
            </p>
            <p className="text-sm mb-6">
              Receive personalized screening recommendations based on your age, gender, and risk factors to stay
              proactive about your health.
            </p>
            <Link href="/screening">
              <Button variant="outline" size="sm">
                Get Recommendations
              </Button>
            </Link>
          </div>

          {/* Telemedicine */}
          <div className="border rounded-md p-8 flex flex-col items-center text-center">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Telemedicine</h2>
            <p className="text-sm text-muted-foreground mb-2">Virtual consultations with healthcare providers</p>
            <p className="text-sm mb-6">
              Connect with healthcare providers from the comfort of your home through secure video consultations and
              receive prescriptions digitally.
            </p>
            <Link href="/providers/search">
              <Button variant="outline" size="sm">
                Find Providers
              </Button>
            </Link>
          </div>

          {/* Crypto Payments */}
          <div className="border rounded-md p-8 flex flex-col items-center text-center">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Crypto Payments</h2>
            <p className="text-sm text-muted-foreground mb-2">Pay for healthcare services with cryptocurrency</p>
            <p className="text-sm mb-6">
              Pay for healthcare services using your preferred cryptocurrency on Base, providing security, privacy, and
              convenience.
            </p>
            <Link href="/wallet">
              <Button variant="outline" size="sm">
                Connect Wallet
              </Button>
            </Link>
          </div>

          {/* AI Health Assistant */}
          <div className="border rounded-md p-8 flex flex-col items-center text-center">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">AI Health Assistant</h2>
            <p className="text-sm text-muted-foreground mb-2">Get personalized health guidance from our AI</p>
            <p className="text-sm mb-6">
              Ask health questions, analyze symptoms, get recommendations, and connect with the right healthcare
              providers.
            </p>
            <Link href="/chat">
              <Button variant="outline" size="sm">
                Chat Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
