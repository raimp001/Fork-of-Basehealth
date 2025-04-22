import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Stethoscope, Search, MessageSquare, Calendar } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 relative inline-block">
          <span className="relative">
            BaseHealth
            <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/30 rounded-full"></span>
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          Connect with healthcare providers, schedule telemedicine appointments, and manage your health journey in one
          place.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/screening">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/providers/search">
            <Button size="lg" variant="outline" className="gap-2">
              Find Providers <Search className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-16">
          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle>Personalized Screening</CardTitle>
              <CardDescription>Get health screening recommendations based on your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center">
                Receive personalized screening recommendations based on your age, gender, and risk factors to stay
                proactive about your health.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link href="/screening">
                <Button variant="outline">Get Recommendations</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle>AI Health Assistant</CardTitle>
              <CardDescription>Get personalized health guidance from our AI</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center">
                Ask health questions, analyze symptoms, get recommendations, and connect with the right healthcare
                providers.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link href="/chat">
                <Button variant="outline">Chat Now</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle>Telemedicine</CardTitle>
              <CardDescription>Connect with healthcare providers virtually</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center">
                Schedule virtual appointments with healthcare providers from the comfort of your home for convenient and
                accessible care.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link href="/appointment/request">
                <Button variant="outline">Schedule Now</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8">How BaseHealth Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Get Screening Recommendations</h3>
              <p className="text-muted-foreground">
                Receive personalized health screening recommendations based on your profile.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Find Healthcare Providers</h3>
              <p className="text-muted-foreground">
                Search for qualified healthcare providers by specialty and location.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Virtual Consultations</h3>
              <p className="text-muted-foreground">
                Connect with providers through secure video consultations from anywhere.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-xl font-bold">4</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Manage Your Health</h3>
              <p className="text-muted-foreground">
                Keep track of appointments, prescriptions, and health records in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
