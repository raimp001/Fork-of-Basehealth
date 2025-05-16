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
          <Button asChild className="px-6">
            <Link href="/screening">
              Get Started <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="px-6">
            <Link href="/providers/search">
              Find Providers <Search className="h-4 w-4 ml-2" />
            </Link>
          </Button>
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
            <Button asChild variant="outline" size="sm">
              <Link href="/screening">Get Recommendations</Link>
            </Button>
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
            <Button asChild variant="outline" size="sm">
              <Link href="/providers/search">Find Providers</Link>
            </Button>
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
            <Button asChild variant="outline" size="sm">
              <Link href="/wallet">Connect Wallet</Link>
            </Button>
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
            <Button asChild variant="outline" size="sm">
              <Link href="/chat">Chat Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
