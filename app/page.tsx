"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity, Users, Wallet, UserPlus, Database, Search, Shield, User, Settings, Heart } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { getBlockchainService } from "@/services/blockchain-service"

export default function HomePage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const blockchainService = getBlockchainService()

  useEffect(() => {
    // Check if wallet is already connected
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (blockchainService.isWalletConnected()) {
      const address = await blockchainService.getWalletAddress()
      setWalletAddress(address)
      setIsWalletConnected(true)
    }
  }

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    try {
      const connected = await blockchainService.connect()
      if (connected) {
        const address = await blockchainService.getWalletAddress()
        setWalletAddress(address)
        setIsWalletConnected(true)
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      alert("Failed to connect wallet. Please make sure you have a Web3 wallet installed.")
    } finally {
      setIsConnecting(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-healthcare-hero">
      {/* Header Navigation */}
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-cyan-100 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-gradient hover:scale-105 transition-all duration-200">
            BaseHealth
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <Button 
              asChild 
              variant="ghost" 
              className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
            >
              <a href="https://healthdb.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                HealthDB.ai
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Link href="/patient-portal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient Portal
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-slate-700 hover:text-violet-600 hover:bg-violet-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>
          </nav>
          
          {/* Wallet and Auth Section */}
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                isWalletConnected 
                  ? 'text-emerald-600 border-emerald-500 hover:bg-emerald-50 bg-emerald-50/50' 
                  : 'text-indigo-600 border-indigo-500 hover:bg-indigo-50 bg-indigo-50/30'
              }`}
              onClick={handleConnectWallet}
              disabled={isConnecting}
            >
              <Wallet className="h-4 w-4" /> 
              {isConnecting ? "Connecting..." : 
               isWalletConnected ? formatAddress(walletAddress!) : "Connect Wallet"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-purple-500 text-purple-600 hover:bg-purple-50 bg-purple-50/30 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/providers/signup" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Provider Sign Up
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/providers/caregiver-signup" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Caregiver Sign Up
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Portal
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative flex flex-col items-center justify-center px-4 py-24 min-h-[calc(100vh-80px)]">
          <div className="text-center max-w-5xl mx-auto">
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border-2 border-sky-200 text-sky-700 text-sm font-medium mb-8 shadow-lg">
              <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
              Advanced Healthcare Platform
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-slate-900">
              Welcome to{" "}
              <span className="text-gradient">
                BaseHealth
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-700 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              Personalized health starts here. Evidence-based screenings, clinical trials, 
              caregiver matching, and expert consultations—all in one seamless platform.
            </p>

            {/* Action Buttons - Minimalistic Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-center items-center max-w-5xl mx-auto mb-16">
              <Button 
                asChild 
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 text-base rounded-lg font-medium transition-all duration-200 w-full h-16 flex items-center justify-center group border-0 shadow-sm hover:shadow-md"
              >
                <Link href="/screening" className="flex items-center gap-2 text-white">
                  <Activity className="h-5 w-5" />
                  <span>AI Screening</span>
                </Link>
              </Button>

              <Button 
                asChild 
                variant="outline" 
                className="border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 px-6 py-4 text-base rounded-lg font-medium transition-all duration-200 w-full h-16 flex items-center justify-center group bg-white shadow-sm hover:shadow-md"
              >
                <Link href="/clinical-trials" className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  <span>Clinical Trials</span>
                </Link>
              </Button>

              <Button 
                asChild 
                variant="outline" 
                className="border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 px-6 py-4 text-base rounded-lg font-medium transition-all duration-200 w-full h-16 flex items-center justify-center group bg-white shadow-sm hover:shadow-md"
              >
                <Link href="/caregivers" className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  <span>Find Caregivers</span>
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                className="border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 px-6 py-4 text-base rounded-lg font-medium transition-all duration-200 w-full h-16 flex items-center justify-center group bg-white shadow-sm hover:shadow-md opacity-75"
              >
                <Link href="/second-opinion" className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Raise Bounty</span>
                </Link>
              </Button>
            </div>

            {/* Features Grid - Clean & Minimal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-5xl mx-auto">
              <div className="bg-white border border-slate-100 rounded-lg p-6 hover:border-slate-200 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Health Screening</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Personalized health recommendations based on evidence-based guidelines and your medical history.
                </p>
              </div>
              
              <div className="bg-white border border-slate-100 rounded-lg p-6 hover:border-slate-200 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Clinical Trial Matching</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Discover clinical trials that match your profile and medical needs using AI-powered search.
                </p>
              </div>

              <div className="bg-white border border-slate-100 rounded-lg p-6 hover:border-slate-200 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Find Caregivers</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Connect with qualified caregivers and schedule compassionate, personalized care that fits your family's needs.
                </p>
              </div>
              
              <div className="bg-white border border-slate-100 rounded-lg p-6 hover:border-slate-200 transition-all duration-200 shadow-sm hover:shadow-md opacity-75">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Raise Medical Bounties</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Post bounties to connect with specialist physicians for expert medical opinions and second opinions.
                </p>
              </div>
            </div>

            {/* healthdb.ai Integration Section */}
            <div className="bg-gradient-to-r from-cyan-50 via-sky-50 to-emerald-50 rounded-3xl p-8 border border-cyan-200 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Contribute to Healthcare Research
              </h2>
              <p className="text-slate-600 mb-6 max-w-2xl mx-auto text-lg">
                Join HealthDB.ai to participate as a patient and contribute your health data to advance medical research and improve healthcare for everyone.
              </p>
              <Button 
                asChild 
                variant="outline" 
                className="border-2 border-sky-500 text-sky-600 hover:bg-sky-600 hover:text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
              >
                <a href="https://healthdb.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Join HealthDB.ai as Patient
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Add custom CSS for grid pattern */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  )
}
