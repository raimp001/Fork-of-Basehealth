import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wallet, UserPlus, ShieldCheck, Activity, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog"

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
        <div className="flex items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition px-5 py-2 rounded-lg">
            <Wallet className="h-5 w-5" /> Connect Wallet
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 border-blue-500 text-blue-700 hover:bg-blue-50 transition px-5 py-2 rounded-lg font-semibold">
                Sign Up / Admin
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/providers/signup">Provider Sign Up</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin">Admin Portal</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex flex-col items-center flex-1 justify-center px-4 w-full">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-2 text-center leading-tight">
          Personalized Health Starts Here
        </h1>
        <p className="text-sm md:text-base text-gray-500 mb-12 text-center">
          Evidence-based screenings. Expert second opinions.
        </p>
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl justify-center">
          {/* AI Screening Card */}
          <div className="flex-1 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col items-center justify-center min-w-[220px]">
            <Button asChild variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50 transition font-semibold py-4 px-8 rounded-lg text-lg w-full flex items-center gap-3">
              <Link href="/screening">
                <Activity className="h-5 w-5" />
                Start AI Screening
              </Link>
            </Button>
          </div>
          {/* Second Opinion Card */}
          <div className="flex-1 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col items-center justify-center min-w-[220px]">
            <Button asChild variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50 transition font-semibold py-4 px-8 rounded-lg text-lg w-full flex items-center gap-3">
              <Link href="/second-opinion">
                <Users className="h-5 w-5" />
                Get Second Opinion
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
